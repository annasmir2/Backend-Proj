import { verifyJwt } from "../middlewares/auth-middleware.js";
import { getLikedVidoes, toggleComment, toggleLikeVideo } from "../controllers/like-controller.js";
import { Router } from "express";

const router = Router();
router.route("/c/:videoId/video-like-status").post(verifyJwt, toggleLikeVideo);
router.route("/c/:commentId/comment-like-status").post(verifyJwt, toggleComment);
router.route("/liked-videos").get(verifyJwt,getLikedVidoes);
export default router;
