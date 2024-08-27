import { User } from "../models/user-models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.jwtToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new ApiError(401, "Unauthorized Request!");

    const userInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const getUser = await User.findById(userInfo?._id).select(
      "-password -refreshToken"
    );
    if (!getUser) throw new ApiError(401, "Invalid Token!");
    req.user = getUser;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Inavlid Token");
  }
});
