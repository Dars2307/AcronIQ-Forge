import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import tasksRouter from "./tasks";
import conversationsRouter from "./conversations";
import pullRequestsRouter from "./pullRequests";
import auditRouter from "./audit";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/projects", projectsRouter);
router.use("/tasks", tasksRouter);
router.use("/conversations", conversationsRouter);
router.use("/pull-requests", pullRequestsRouter);
router.use("/audit", auditRouter);
router.use("/dashboard", dashboardRouter);

export default router;
