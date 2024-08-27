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
app.use(express.urlencoded({ limit ,extended:true}));
app.use(express.static("public"));
app.use(cookieParser());

//Routers
import userRoutes from "./routers/user-routes.js";
app.use("/api/v1/users", userRoutes);
export { app };
