import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { limit } from "./constant.js";
const app = new express();

var corsOptions = {
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json({ limit }));
app.use(express.urlencoded({ limit, extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

//Routers
import userRoutes from "./routers/user-routes.js";
app.use("/api/v1/users", userRoutes);
import videoRoutes from "./routers/video-routes.js";
app.use("/api/v1/videos", videoRoutes);
import commentRoutes from "./routers/comment-routes.js";
app.use("/api/v1/comments", commentRoutes);
import likeRoutes from "./routers/like-routes.js";
app.use("/api/v1/likes", likeRoutes);
import playlistRoute from "./routers/playlist-routes.js";
app.use("/api/v1/playlist", playlistRoute);
import tweetRoute from "./routers/tweet-routes.js";
app.use("/api/v1/tweet", tweetRoute);
export { app };
