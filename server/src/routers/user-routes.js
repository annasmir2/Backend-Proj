import { Router } from "express";
import {
  genRefTokens,
  regUser,
  loginUser,
  logout,
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
export default router;
