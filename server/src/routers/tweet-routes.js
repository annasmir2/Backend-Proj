import {
  createTweet,
  deleteTweet,
  getAllTweets,
  updateTweet,
} from "../controllers/tweet-controller.js";
import { verifyJwt } from "../middlewares/auth-middleware.js";
import { Router } from "express";

const router = Router();

router.route("/create-tweet").post(verifyJwt, createTweet);
router.route("/c/:tweetId/edit-tweet").patch(verifyJwt, updateTweet);
router.route("/c/:tweetId/delete-tweet").delete(verifyJwt, deleteTweet);
router.route("/get-all-tweets").get(verifyJwt, getAllTweets);

export default router;
