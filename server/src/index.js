import dotenv from "dotenv";
import express from "express";
import connectionDB from "./db/connection.js"
const app = new express();
const port = process.env.PORT || 6000;

dotenv.config({
    path: './server/env'
})
connectionDB();
