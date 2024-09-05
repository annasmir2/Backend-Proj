import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video-models.js";
import { Like } from "../models/likes-models.js";
import { Comment } from "../models/comments-models.js";

const del = async (_id) => {
  try {
    const deleteLike = await Like.deleteOne(_id);
    if (!deleteLike)
      throw new ApiError(400, "Error while deleting the document");
    return deleteLike;
  } catch (error) {
    throw new ApiError(500, "Something went wrong while deleting the like!");
  }
};
// Add Like
const toggleLikeVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Video Id is missing!");

  const findVideo = await Video.findById(videoId);
  if (!findVideo) throw new ApiError(404, "Video Not Exist!");

  let like = await Like.findOne({
    likedBy: req.user._id,
    video: findVideo._id,
  });
  if (like) {
    if (!like.likedBy.equals(req.user._id)) {
      throw new ApiError(401, "Unauthorized request!");
    }
    const delUnlike = await del(like._id);
    res
      .status(200)
      .json(new ApiResponse(200, delUnlike, "Unlike successfully!"));
  } else {
    const findNewVideo = await Like.findOne({
      video: { $ne: findVideo._id },
    });
    if (findNewVideo) {
      const createLike = await Like.create({
        video: findVideo._id,
        likedBy: req.user._id,
      });
      if (!createLike) throw new ApiError(400, "Creation Failed!");
      res
        .status(201)
        .json(new ApiResponse(201, createLike, "Like Added Successfully!"));
    } else {
      const createLike = await Like.create({
        video: findVideo._id,
        likedBy: req.user._id,
      });
      if (!createLike) throw new ApiError(400, "Creation Failed!");
      res
        .status(201)
        .json(
          new ApiResponse(201, createLike, "Like Added on Video Successfully!")
        );
    }
  }
});

//toggle comment like
const toggleComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) throw new ApiError(400, "Comment id is missing!");
  const findComment = await Comment.findById(commentId);
  if (!findComment) throw new ApiError(404, "Comment Not Exist!");
  let commentLike = await Like.findOne({
    likedBy: req.user._id,
    comment: findComment._id,
  });
  if (commentLike) {
    if (!commentLike.likedBy.equals(req.user._id)) {
      throw new ApiError(401, "Unauthorized request!");
    }
    const delUnlike = await del(commentLike._id);
    res
      .status(200)
      .json(new ApiResponse(200, delUnlike, "Unlike comment successfully!"));
  } else {
    const findNewComment = await Like.findOne({
      comment: { $ne: findComment._id },
    });
    if (findNewComment) {
      const createLike = await Like.create({
        comment: findComment._id,
        likedBy: req.user._id,
      });
      if (!createLike) throw new ApiError(400, "Creation Failed!");
      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            createLike,
            "Like Added on Comment Successfully!"
          )
        );
    } else {
      const createLike = await Like.create({
        comment: findComment._id,
        likedBy: req.user._id,
      });
      if (!createLike) throw new ApiError(400, "Creation Failed!");
      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            createLike,
            "Like Added on Comment Successfully!"
          )
        );
    }
  }
});

export { toggleLikeVideo, toggleComment };
