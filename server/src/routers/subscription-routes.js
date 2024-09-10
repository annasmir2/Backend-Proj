import { verifyJwt } from "../middlewares/auth-middleware.js";
import { Router } from "express";
import { subscribe } from "../controllers/subscription-controller.js";
const router = Router();

router.route("/c/:channelId/subscribe").post(verifyJwt,subscribe);
export default router;