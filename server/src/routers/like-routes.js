import { verifyJwt } from "../middlewares/auth-middleware.js";
import { toggleComment, toggleLikeVideo } from "../controllers/like-controller.js";
import { Router } from "express";

const router = Router();
router.route("/c/:videoId/video-like-status").post(verifyJwt, toggleLikeVideo);
router.route("/c/:commentId/comment-like-status").post(verifyJwt, toggleComment);

export default router;
