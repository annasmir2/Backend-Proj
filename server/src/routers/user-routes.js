import { Router } from "express";
import { regUser } from "../controllers/user-controller.js";
import { loginUser } from "../controllers/user-controller.js";
import { logout } from "../controllers/user-controller.js";
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
export default router;
