import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import projectsRouter from "./projects";
import tasksRouter from "./tasks";
import conversationsRouter from "./conversations";
import pullRequestsRouter from "./pullRequests";
import auditRouter from "./audit";
import dashboardRouter from "./dashboard";
import devicesRouter from "./devices";
import agentsRouter from "./agents";
import memoryRouter from "./memory";
import constitutionRouter from "./constitution";
import integrationsRouter from "./integrations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use("/projects", projectsRouter);
router.use("/tasks", tasksRouter);
router.use("/conversations", conversationsRouter);
router.use("/pull-requests", pullRequestsRouter);
router.use("/audit", auditRouter);
router.use("/dashboard", dashboardRouter);
router.use("/devices", devicesRouter);
router.use("/agents", agentsRouter);
router.use("/memory", memoryRouter);
router.use("/constitution", constitutionRouter);
router.use("/integrations", integrationsRouter);

export default router;
