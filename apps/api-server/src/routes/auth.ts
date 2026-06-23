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

router.get("/login", (req: Request, res: Response) => {
  // OIDC login not implemented - authentication removed
  res.status(501).json({ error: "Authentication not configured" });
});

router.get("/callback", (req: Request, res: Response) => {
  // OIDC callback not implemented - authentication removed
  res.status(501).json({ error: "Authentication not configured" });
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
