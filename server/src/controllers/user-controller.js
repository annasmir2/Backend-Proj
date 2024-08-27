import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user-models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

//Register User
const regUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;
  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Empty Fields.Fill the form properly!");
  }
  const userExist = await User.findOne({ $or: [{ email }, { username }] });
  if (userExist) throw new ApiError(409, "Username or Email already Exist!");
  const avatarPath = req.files?.avatar[0]?.path;
  let coverImagePath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImagePath = req.files.coverImage[0].path;
  }
  if (!avatarPath) throw new ApiError(400, "Avatar Image is Missing!");
  const uploadAvatar = await uploadOnCloudinary(avatarPath);
  const uploadCoverImage = await uploadOnCloudinary(coverImagePath);

  if (!uploadAvatar) throw new ApiError(400, "Avatar Image is required!");

  const register = await User.create({
    fullName,
    avatar: uploadAvatar.url,
    coverImage: uploadCoverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const user = await User.findById(register._id).select(
    "-password -refreshToken"
  );
  if (!user) throw new ApiError(500, "Something went wrong while reg user");
  return res
    .status(201)
    .json(new ApiResponse(200, user, "User has Been Created Successfully!"));
});

export { regUser };
