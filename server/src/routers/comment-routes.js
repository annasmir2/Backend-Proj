import { verifyJwt } from "../middlewares/auth-middleware.js";
import { addComment, deleteComment, getAllComments, updateComment } from "../controllers/comment-controller.js";
import { Router } from "express";

const router=Router();

router.route("/c/:videoId/add-comment").post(verifyJwt,addComment);
router.route("/c/:videoId/:commentId/edit-comment").patch(verifyJwt,updateComment);
router.route("/c/:videoId/:commentId/delete-comment").delete(verifyJwt,deleteComment);
router.route("/c/:videoId/getComments").get(verifyJwt,getAllComments);

export default router;