import { Video } from "../models/video-models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
//Upload file
const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title && !description)
    throw new ApiError(400, "Title and Description is required!");
  const videoPath = req.files?.videoFile[0]?.path;
  if (!videoPath) throw new ApiError(404, "Video Path not found!");
  const thumbnailPath = req.files?.thumbnail[0]?.path;
  if (!thumbnailPath) throw new ApiError(404, "thumbnail Path not found!");

  const uploadVideoFile = await uploadOnCloudinary(videoPath);
  if (!uploadVideoFile) throw new ApiError(400, "Video Upload failed!");
  const uploadThumbnail = await uploadOnCloudinary(thumbnailPath);
  if (!uploadThumbnail) throw new ApiError(400, "Thumbnail Upload failed!");
  const upload = await Video.create({
    videoFile: uploadVideoFile?.url,
    thumbnail: uploadThumbnail?.url,
    title: title,
    description: description,
    duration: uploadVideoFile.duration,
    owner: req.user._id,
  });
  if (!upload) throw new ApiError(400, "Upload error!");
  const video = await Video.findById(upload._id);
  res.status(201).json(new ApiResponse(201, video, "Uploaded Successfully!"));
});

//Get Video By Id
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Video Id is missing!");
  const video = await Video.findById({ _id: videoId });
  if (!video) throw new ApiError(404, "Video Not Exist!");
  res
    .status(200)
    .json(new ApiResponse(200, video, "Video Found Successfully!"));
});

//Update Video
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Video Id is missing!");
  const video = await Video.findById({ _id: videoId });
  if (!video) throw new ApiError(404, "Video Not Exist!");
  if (!video.owner.equals(req.user._id))
    throw new ApiError(401, "Unauthorized request!");
  const { title, description, thumbnail } = req.body;
  if (!title && !description && !thumbnail)
    throw new ApiError(400, "Title,Description,Thumbnail missing!");
  const thumbnailPath = req.file?.path;
  if (!thumbnailPath) throw new ApiError(400, "Thumbnail missing!");
  const uploadThumbnail = await uploadOnCloudinary(thumbnailPath);
  if (!uploadThumbnail) throw new ApiError(400, "Edit Thumbnail Upload Error!");
  video.title = title;
  video.description = description;
  video.thumbnail = uploadThumbnail?.url;
  const updateVideo = await video.save({ validateBeforeSave: true });
  res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "Video Updated Successfully!"));
});

//update videoFile
const updateVideoFile = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Video Id is missing!");
  const video = await Video.findById({ _id: videoId });
  if (!video) throw new ApiError(404, "Video Not Exist!");
  if (!video.owner.equals(req.user._id))
    throw new ApiError(401, "Unauthorized request!");
  const UpdateVideoPath = req.file?.path;
  if (!UpdateVideoPath) throw new ApiError(400, "Update Video path missing!");
  const uploadUpdateVideo = await uploadOnCloudinary(UpdateVideoPath);
  if (!uploadUpdateVideo) throw new ApiError(400, "Update Video upload Error!");
  video.videoFile = uploadUpdateVideo.url;
  video.duration = uploadUpdateVideo.duration;
  const updateVideo = await video.save({ validateBeforeSave: true });
  res
    .status(200)
    .json(
      new ApiResponse(200, updateVideo, "Video File Updated Successfully!")
    );
});

//Delete Video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Video Id is missing!");
  const video = await Video.findById({ _id: videoId });
  if (!video) throw new ApiError(404, "Video Not Exist!");
  if (!video.owner.equals(req.user._id))
    throw new ApiError(401, "Unauthorized request!");
  const delVideo = await Video.deleteOne({ _id: video._id });
  res
    .status(200)
    .json(new ApiResponse(200, delVideo, "Video Deleted Successfully!"));
});

//toggle published
const togglePublishedVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Video Id is missing!");
  const video = await Video.findById({ _id: videoId });
  if (!video) throw new ApiError(404, "Video Not Exist!");
  if (!video.owner.equals(req.user._id))
    throw new ApiError(401, "Unauthorized request!");
  video.isPublished = video.isPublished ? false : true;
  const updateToggle = await video.save({ validateBeforeSave: true });
  res
    .status(200)
    .json(new ApiResponse(200, updateToggle, "Toggle the status!"));
});

 const getAllVideos = asyncHandler(async (req, res) => {
  const {
    query = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = req.query;
  const searchQuery = {
    isPublished: true,
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  };
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 },
  };

  const videos = await Video.aggregatePaginate(
    Video.aggregate([{ $match: searchQuery }]),
    options
  );

  res.status(200).json({
    success: true,
    data: videos.docs,
    totalVideos: videos.totalDocs,
    totalPages: videos.totalPages,
    currentPage: videos.page,
    hasNextPage: videos.hasNextPage,
    hasPrevPage: videos.hasPrevPage,
  });
  res.status(500).json({
    success: false,
    message: "Error fetching videos",
    error: error.message,
  });
});

export {
  uploadVideo,
  getVideoById,
  updateVideo,
  updateVideoFile,
  deleteVideo,
  togglePublishedVideo,
  getAllVideos
};
