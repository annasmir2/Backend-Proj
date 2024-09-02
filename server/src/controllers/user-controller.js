import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user-models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
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
    { $unset: { refreshToken: 1 } },
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
    const refToken = req.cookies.refreshToken || req.body.refreshToken || req.headers.authorization?.split(" ")[1];
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
        new ApiResponse(
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

//update password
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword) throw new ApiError(400, "Old Password is required!");
  const _id = req.user._id;
  const user = await User.findById(_id);
  const chkOldPass = await user.isPasswordCorrect(oldPassword);
  if (!chkOldPass) throw new ApiError(400, "Old Password is incorrect!");
  if (confirmPassword !== newPassword)
    throw new ApiError(400, "New Password not matched! ");
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Passowrd changed Successfully!"));
});

//update userinfo
const updateUser = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName && !email) throw new ApiError(400, "All Fields are req!");
  const _id = req.user._id;
  const user = await User.findByIdAndUpdate(
    _id,
    { $set: { fullName, email } },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Updated the fileds Successfully!"));
});

//files update
//Avatar Update
const avatarUpdate = asyncHandler(async (req, res) => {
  const  avatar = req.file?.path;
  if (!avatar) throw new ApiError(400, "Avatar Image is required!");
  const uploadAvatar = await uploadOnCloudinary(avatar);
  if (!uploadAvatar.url) throw new ApiError(400, "Avatar Image is required!");
  const _id = req.user._id;
  const user = await User.findByIdAndUpdate(
    _id,
    { $set: { avatar: uploadAvatar.url } },
    { new: true }
  ).select("-password -refreshToken");
  res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar is Updated Successfully!"));
});

//CoverImage update
const coverImageUpdate = asyncHandler(async (req, res) => {
  const  coverImage  = req.file?.path;
  if (!coverImage) throw new ApiError(400, "Cover Image is required!");
  const uploadCoverImage = await uploadOnCloudinary(avatar);
  if (!uploadCoverImage.url)
    throw new ApiError(400, "Cover Image is required!");
  const _id = req.user._id;
  const user = await User.findByIdAndUpdate(
    _id,
    { $set: { coverImage: uploadCoverImage?.url || "" } },
    { new: true }
  ).select("-password -refreshToken");
  res
    .status(200)
    .json(
      new ApiResponse(200, user, "uploadCoverImage is Updated Successfully!")
    );
});
//get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
  // const _id = req.user._id;
  // const user = await User.findById(_id).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Successfully get the current user!"));
});

//get chnnel info
const getUserChannelProf = asyncHandler(async (req, res) => {
  const username  = req.param;
  if (!username) throw new ApiError(400, "Username is missing!");
  const channel = await User.aggregate([
    {
      $match: {
        username: username,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscribers",
        as: "subscriberdTo",
      },
    },
    {
      $addFields: {
        subscriberCounts: {
          $size: "$subscribers",
        },
        channelsSubsribedToCount: {
          $size: "$subscriberdTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribers.subscribers"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscriberCounts: 1,
        channelsSubsribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
  ]);
  if (!channel?.length) throw new ApiError(404, "Channel not exisit");
  console.log(channel);
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User Channel Fetched Successfully!")
    );
});

//get watch history
const getWatchHistory = asyncHandler(async (req, res) => {
  try {
    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "Videos",
          localField: "watchHistory",
          foreignField: "_id",
          as: "watchHistory",
          pipeline: [
            {
              $lookup: {
                from: "Users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      fullName: 1,
                      username: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                owner: { $arrayElemAt: ["$owner", 0] }, 
              },
            },
          ],
        },
      },
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "WatchHistory fetched Successfully!"
      )
    );
  } catch (error) {
    throw new ApiResponse(401, "Error", error);
  }
});

export {
  regUser,
  loginUser,
  logout,
  genRefTokens,
  changePassword,
  getCurrentUser,
  updateUser,
  avatarUpdate,
  coverImageUpdate,
  getUserChannelProf,
  getWatchHistory,
};
