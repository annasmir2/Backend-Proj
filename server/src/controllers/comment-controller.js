import { Comment } from "../models/comments-models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video-models.js";
import mongoose from "mongoose";
//add comment
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Vide0 Id is missing!");
  const video = await Video.findById({ _id: videoId });
  if (!video) throw new ApiError(404, "Video not exist!");
  const { content } = req.body;
  if (!content) throw new ApiError(400, "Content Missing!");
  const comment = await Comment.create({
    content,
    video: video._id,
    user: req.user._id,
  });
  if (!comment) throw new ApiError(400, "Comment Creation failed!");
  res.status(201).json(new ApiResponse(200, comment, "Comment done!"));
});

//update comment
const updateComment = asyncHandler(async (req, res) => {
  try {
    const { videoId, commentId } = req.params;
    if (!videoId && !commentId)
      throw new ApiError(400, "Comment Id's is missing!");
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not exist!");
    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not exist!");
    if (!comment.user.equals(req.user._id))
      throw new ApiError(400, "Unauthorized request!");
    const { UpdateComment } = req.body;
    if (!UpdateComment) throw new ApiError("Updating Comment is Empty!");
    comment.content = UpdateComment;
    const newComment = await comment.save({ validateBeforeSave: true });
    res
      .status(200)
      .json(new ApiResponse(200, newComment, "Comment Updated Successfully!"));
  } catch (error) {
    console.log(error);
  }
});

//delete comment
const deleteComment = asyncHandler(async (req, res) => {
  const { videoId, commentId } = req.params;
  if (!videoId && !commentId)
    throw new ApiError(400, "Comment Id's is missing!");
  const video = await Video.findById({ _id: videoId });
  if (!video) throw new ApiError(404, "Video not exist!");
  const comment = await Comment.findById({ _id: commentId });
  if (!comment) throw new ApiError(404, "Comment not exist!");
  if (!comment.user.equals(req.user._id))
    throw new ApiError(400, "Unauthorized request!");
  const delComment = await Comment.deleteOne({ _id: comment._id });
  res
    .status(200)
    .json(new ApiResponse(200, delComment, "Comment Deleted Successfully!"));
});

//getAllComments of that video
const getAllComments = asyncHandler(async (req, res) => {
  const  {videoId}  = req.params;
  const getComments = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $addFields: {
        totalComments: {
          $size: "$comments",
          
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
        totalComments: 1,
        comments:1
      },
    },
  ]);

  if (!getComments || getComments.length === 0) {
    throw new ApiError(404, "No comments found!");

    
  }  return res
    .status(200)
    .json(new ApiResponse(200, getComments, "Commets found Successfully!"));
});
export { addComment, updateComment, deleteComment, getAllComments };
