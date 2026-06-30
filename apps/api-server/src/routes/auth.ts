import { Router, type IRouter, type Request, type Response } from "express";
import {
  GetCurrentAuthUserResponse,
  ExchangeMobileAuthorizationCodeBody,
  ExchangeMobileAuthorizationCodeResponse,
  LogoutMobileSessionResponse,
} from "@workspace/api-zod";
import { query } from "../lib/db";

const router: IRouter = Router();

router.get("/auth/user", (req: Request, res: Response) => {
  res.json(
    GetCurrentAuthUserResponse.parse({
      user: (req.session as any)?.user || null,
    }),
  );
});

router.get("/login", (req: Request, res: Response): void => {
  if (!process.env.GITHUB_CLIENT_ID) {
    res.status(500).json({ error: "GitHub OAuth not configured" });
    return;
  }
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email,repo&redirect_uri=${encodeURIComponent(process.env.GITHUB_REDIRECT_URI || `${process.env.API_BASE_URL}/api/auth/callback`)}`;
  res.redirect(githubAuthUrl);
});

router.get("/callback", async (req: Request, res: Response): Promise<void> => {
  const { code } = req.query;
  if (!code || typeof code !== "string") {
    res.status(400).json({ error: "Authorization code required" });
    return;
  }

  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    res.status(500).json({ error: "GitHub OAuth not configured" });
    return;
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI || `${process.env.API_BASE_URL}/api/auth/callback`,
      }),
    });

    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };
    
    if (!tokenData.access_token) {
      res.status(400).json({ error: "Failed to obtain access token" });
      return;
    }

    // Get user info from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
        "User-Agent": "AcronIQ-Forge",
      },
    });

    const githubUser = await userResponse.json() as { id: number; login: string; name?: string; email?: string; avatar_url?: string };

    // Get user email
    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
        "User-Agent": "AcronIQ-Forge",
      },
    });

    const emails = await emailResponse.json() as Array<{ email: string; primary: boolean }>;
    const primaryEmail = emails.find((e: any) => e.primary)?.email || githubUser.email;

    // Store user in database
    const existingUser = await query("SELECT * FROM forge.users WHERE email = $1", [primaryEmail]);
    
    let userId;
    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
      await query(
        "UPDATE forge.users SET first_name = $1, last_name = $2, profile_image_url = $3, updated_at = NOW() WHERE id = $4",
        [githubUser.name?.split(" ")[0] || "", githubUser.name?.split(" ").slice(1).join(" ") || "", githubUser.avatar_url || "", userId]
      );
    } else {
      const newUser = await query(
        "INSERT INTO forge.users (email, first_name, last_name, profile_image_url) VALUES ($1, $2, $3, $4) RETURNING id",
        [primaryEmail, githubUser.name?.split(" ")[0] || "", githubUser.name?.split(" ").slice(1).join(" ") || "", githubUser.avatar_url || ""]
      );
      userId = newUser.rows[0].id;
    }

    // Store GitHub token in integrations table
    await query(
      `INSERT INTO forge.integrations (name, type, enabled, config) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (type) DO UPDATE SET config = $4, enabled = $3, updated_at = NOW()`,
      ["GitHub", "github", true, JSON.stringify({ access_token: tokenData.access_token, user_id: githubUser.id, login: githubUser.login })]
    );

    // Set session
    (req.session as any).user = {
      id: userId,
      email: primaryEmail,
      firstName: githubUser.name?.split(" ")[0] || "",
      lastName: githubUser.name?.split(" ").slice(1).join(" ") || "",
      profileImageUrl: githubUser.avatar_url || "",
    };

    res.redirect("/");
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.get("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
    }
  });
  res.redirect("/");
});

router.post(
  "/mobile-auth/token-exchange",
  async (req: Request, res: Response) => {
    // Mobile token exchange not implemented - authentication removed
    res.status(501).json({ error: "Authentication not configured" });
  },
);

router.post("/mobile-auth/logout", async (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
    }
  });
  res.json(LogoutMobileSessionResponse.parse({ success: true }));
});

export default router;
