import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user-models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import jwt from "jsonwebtoken";
//generate Tokens
const generateJWTTokenAndRefreshToken = async (userid) => {
  try {
    const user = await User.findById(userid);
    const genJwtToken = user.generateJWTToken();
    const genRefToken = user.generateRefToken();
    user.refreshToken = genRefToken;
    await user.save({ validateBeforeSave: false });
    return { genJwtToken, genRefToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens!");
  }
};

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

//Login user
const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or Email is required");
  }
  const chkUser = await User.findOne({ $or: [{ email }, { username }] });
  if (!chkUser) throw new ApiError(404, "User doesnot exist!");
  const getUser = await chkUser.isPasswordCorrect(password);
  if (!getUser) throw new ApiError(401, "Invalid Credentials!");
  const { genJwtToken, genRefToken } = await generateJWTTokenAndRefreshToken(
    chkUser._id
  );
  const loggedIn = await User.findById(chkUser._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("jwtToken", genJwtToken, options)
    .cookie("refToken", genRefToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedIn,
          genJwtToken,
          genRefToken,
        },
        "User Login Successfully!"
      )
    );
});

//logout
const logout = asyncHandler(async (req, res) => {
  const _id = req.user._id;
  const user = await User.findByIdAndUpdate(
    _id,
    { $set: { refreshToken: null } },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("jwtToken", options)
    .clearCookie("refToken", options)
    .json(new ApiResponse(200, user, "Logout Successfully!"));
});

//Refresh Token
const genRefTokens = asyncHandler(async (req, res) => {
  try {
    const refToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refToken) throw new ApiError(401, "Unauthorized request !");
    const user = jwt.verify(refToken, process.env.REFRESH_TOKEN);
    const userinfo = await User.findById(user._id);
    if (!userinfo) throw new ApiError(401, "Invalid Refresh Token!");
    if (refToken !== userinfo.refreshToken)
      throw new ApiError(401, "Token is not valid!");
    const { genJwtToken, genRefToken } = await generateJWTTokenAndRefreshToken(
      userinfo._id
    );
    const options = {
      httpOnly: true,
      server: true,
    };
    res
      .status(200)
      .cookie("jwtToken", genJwtToken, options)
      .cookie("refToken", genRefToken, options)
      .json(
        ApiResponse(
          200,
          userinfo,
          genJwtToken,
          genRefToken,
          "Refresh Token generated Successfully!"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message, "Invalid Refresh Token !");
  }
});
export { regUser, loginUser, logout, genRefTokens };
