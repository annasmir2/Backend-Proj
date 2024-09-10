import { Router } from "express";
import {uploadVideo,getVideoById,updateVideo, updateVideoFile, deleteVideo,togglePublishedVideo,getAllVideos} from "../controllers/video-controller.js";
import {upload} from "../middlewares/multer-middleware.js";
import { verifyJwt } from "../middlewares/auth-middleware.js";

const router=Router();
router.route("/upload-video").post(verifyJwt,upload.fields([
    {name:"videoFile",maxCount:1},
    {name:"thumbnail",maxCount:1}
]),uploadVideo);
router.route("/c/:videoId").get(verifyJwt, getVideoById);
router.route("/c/:videoId/edit-video").patch(verifyJwt,upload.single("thumbnail"),updateVideo);
router.route("/c/:videoId/edit-videoFile").patch(verifyJwt,upload.single("videoFile"),updateVideoFile);
router.route("/c/:videoId/delete-video").delete(verifyJwt,deleteVideo);
router.route("/c/:videoId/toggle-video").patch(verifyJwt,togglePublishedVideo);
router.route("/getallvideos").get(verifyJwt,getAllVideos);

export default router;