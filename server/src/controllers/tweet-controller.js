import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweets-models.js";
import { User } from "../models/user-models.js";
import mongoose from "mongoose";

//create tweet
const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) throw new ApiError(400, "Content is missing!");
  const create = await Tweet.create({
    content,
    owner: req.user._id,
  });
  const find = await Tweet.findById({ _id: create._id });
  if (!find) throw new ApiError(400, "Not Created the tweet!");
  res
    .status(200)
    .json(new ApiResponse(201, find, "Tweet created Successfully!"));
});

//update tweet
const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) throw new ApiError(400, "Tweet id is missing!");
  const findTweet = await Tweet.findById({ _id: tweetId });
  if (!findTweet) throw new ApiError(404, "Tweet Not exist!");
  if (!findTweet.owner.equals(req.user._id))
    throw new ApiError(401, "Unauthorized request!");
  const { newContent } = req.body;
  findTweet.content = newContent;
  const save = await findTweet.save({ validateBeforeSave: true });
  res
    .status(200)
    .json(new ApiResponse(200, save, "Update the Tweet Successfully!"));
});

//delete tweet
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) throw new ApiError(400, "Tweet id is missing!");
  const findTweet = await Tweet.findById({ _id: tweetId });
  if (!findTweet) throw new ApiError(404, "Tweet Not exist!");
  if (!findTweet.owner.equals(req.user._id))
    throw new ApiError(401, "Unauthorized request!");
  const delTweet = await Tweet.deleteOne({ _id: findTweet._id });
  res
    .status(200)
    .json(new ApiResponse(200, delTweet, "Delete the Tweet Successfully!"));
});

//get all tweets
const getAllTweets = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "tweets",
        localField: "_id",
        foreignField: "owner",
        as: "UserTweets",
      },
    },
    {
      $addFields: {
        totalTweets: {
          $size: "$UserTweets",
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
        UserTweets: 1,
        totalTweets: 1,
      },
    },
  ]);
  if (!user || user.length == 0) throw new ApiError(404, "No Tweet Found!");
  res.status(200).json(new ApiResponse(200, user, "Tweets gets Successfully!"));
});

export { createTweet, updateTweet, deleteTweet, getAllTweets };
