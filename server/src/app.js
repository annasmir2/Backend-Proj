import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { limit } from "./constant";
const app = new express();

var corsOptions = {
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json({ limit }));
app.use(express.urlencoded({ limit }));
app.use(express.static("public"));
app.use(cookieParser());
export { app };
