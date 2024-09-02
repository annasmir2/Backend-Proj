import { Router } from "express";
import {
  genRefTokens,
  regUser,
  loginUser,
  logout,
  changePassword,
  coverImageUpdate,
  avatarUpdate,
  updateUser,
  getUserChannelProf,
  getWatchHistory,
  getCurrentUser,
} from "../controllers/user-controller.js";
import { upload } from "../middlewares/multer-middleware.js";
import { verifyJwt } from "../middlewares/auth-middleware.js";
const router = Router();
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  regUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logout);
router.route("/refresh-token").post(genRefTokens);
router.route("/update-password").post(verifyJwt, changePassword);
router.route("/update-user").patch(verifyJwt, updateUser);
router
  .route("/update-avatar")
  .patch(
    verifyJwt,
    upload.single("avatar"),
    avatarUpdate
  );
router
  .route("/update-coverImage")
  .patch(
    verifyJwt,
    upload.single("coverImage"),
    coverImageUpdate
  );
router.route("/c/:username").get(verifyJwt, getUserChannelProf);
router.route("/history").get(verifyJwt, getWatchHistory);
router.route("/user").get(verifyJwt, getCurrentUser);

export default router;
