import { verifyJwt } from "../middlewares/auth-middleware.js";
import { getLikedVidoes, toggleComment, toggleLikeVideo, toggleTweet } from "../controllers/like-controller.js";
import { Router } from "express";

const router = Router();
router.route("/c/:videoId/video-like-status").post(verifyJwt, toggleLikeVideo);
router.route("/c/:commentId/comment-like-status").post(verifyJwt, toggleComment);
router.route("/c/:tweetId/tweet-like-status").post(verifyJwt, toggleTweet);

router.route("/liked-videos").get(verifyJwt,getLikedVidoes);
export default router;
