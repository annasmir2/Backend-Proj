import {
  addVideoPlaylist,
  createPlaylist,
  deletePlayList,
  deleteVideoPlaylist,
  getPlaylistById,
  getUserPlaylists,
  updatePlaylist,
  updatePlaylistVideo,
} from "../controllers/playlist-controller.js";
import { verifyJwt } from "../middlewares/auth-middleware.js";
import { Router } from "express";

const router = Router();

router.route("/create-playlist").post(verifyJwt, createPlaylist);
router
  .route("/c/:playlistId/:videoId/add-playlist")
  .post(verifyJwt, addVideoPlaylist);
router.route("/c/:playlistId/edit-playlist").patch(verifyJwt, updatePlaylist);
router
  .route("/c/:playlistId/:videoId/edit-playlist-videos")
  .patch(verifyJwt, updatePlaylistVideo);
router
  .route("/c/:playlistId/:videoId/delete-playlist-video")
  .delete(verifyJwt, deleteVideoPlaylist);
router
  .route("/c/:playlistId/delete-playlist")
  .delete(verifyJwt, deletePlayList);
router.route("/total-playlists").get(verifyJwt, getUserPlaylists);
router.route("/c/:playlistId/get-playlist").get(verifyJwt, getPlaylistById);

export default router;
