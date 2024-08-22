import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectionDB = async () => {
  try {
    const connect = await mongoose.connect(
      `${process.env.MONGO_DB_URL}/${DB_NAME}`
    );
    console.log(`Connection Successfull !! DB HOST ${connect.connection.host}`);
  } catch (error) {
    console.log("Connection Failed", error);
    process.exit(1);
  }
};

export default connectionDB;
