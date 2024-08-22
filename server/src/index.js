import dotenv from "dotenv";
import connectionDB from "./db/connection.js";
import { app } from "./app.js";
const port = process.env.PORT || 6000;

dotenv.config({
  path: "./server/env",
});
connectionDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Running in port ${port}`);
    });
  })
  .catch((error) => {
    console.log("Connection Failed !!", error);
  });
