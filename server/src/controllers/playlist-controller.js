import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video-models.js";
import { PlayList } from "../models/playlist-models.js";
import { User } from "../models/user-models.js";
import mongoose from "mongoose";
//create playlist
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name && !description)
    throw new ApiError(400, "Name and Description are missing!");
  const find = await PlayList.findOne({ name, owner: req.user._id });
  if (find) throw new ApiError(400, "Playlist Already Exist!");
  const create = await PlayList.create({
    name,
    description,
    owner: req.user._id,
  });
  if (!create) throw new ApiError(400, "Internal server error!");
  const findPlaylist = await PlayList.findById({ _id: create._id });
  if (!findPlaylist) throw new ApiError(404, "No Playlist found!");
  res
    .status(201)
    .json(new ApiResponse(201, findPlaylist, "Playlist Created Successfully!"));
});

//add video in Playlist
const addVideoPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId && !videoId)
    throw new ApiError(400, "Playlist and Video are missing!");
  const findVideo = await Video.findById({ _id: videoId });
  if (!findVideo) throw new ApiError(404, "Video not found!");
  const findPlaylist = await PlayList.findById({ _id: playlistId });
  if (!findPlaylist) throw new ApiError(404, "Playlist not found!");
  if (findPlaylist.videos.includes(findVideo._id))
    throw new ApiError("Video Already Exisit!");
  findPlaylist.videos.push(findVideo._id);
  findPlaylist.owner = req.user._id;
  const savePlaylist = await findPlaylist.save({ validateBeforeSave: true });

  res
    .status(200)
    .json(new ApiResponse(200, savePlaylist, "Video Added Successfuly!"));
});

//update playlist
const updatePlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { playlistId } = req.params;
  const findPlaylist = await PlayList.findById({ _id: playlistId });
  if (!findPlaylist) throw new ApiError(404, "Playlist not found!");
  if (!findPlaylist.owner.equals(req.user._id))
    throw new ApiError(401, "Unauthorized request!");
  findPlaylist.name = name || findPlaylist.name;
  findPlaylist.description = description || findPlaylist.description;
  const saveUpdatePlaylist = await findPlaylist.save({
    validateBeforeSave: true,
  });
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        saveUpdatePlaylist,
        "Update the Playlist Succsessfuly!"
      )
    );
});

//update Video
const updatePlaylistVideo = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;
  if (!playlistId && !videoId)
    throw new ApiError(400, "Playlist and Video are missing!");
  const findVideo = await Video.findById({ _id: videoId });
  if (!findVideo) throw new ApiError(404, "Video not found!");
  const findPlaylist = await PlayList.findById({ _id: playlistId });
  if (!findPlaylist) throw new ApiError(404, "Playlist not found!");
  if (!findPlaylist.owner.equals(req.user._id))
    throw new ApiError(401, "Unauthorized request!");
  findPlaylist.videos = findVideo._id;
  const saveUpdatePlaylist = await findPlaylist.save({
    validateBeforeSave: true,
  });
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        saveUpdatePlaylist,
        "Update the Playlist Video Succsessfuly!"
      )
    );
});

//delete video from Playlist
const deleteVideoPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;
  if (!playlistId && !videoId)
    throw new ApiError(400, "Playlist and Video are missing!");
  const findVideo = await Video.findById({ _id: videoId });
  if (!findVideo) throw new ApiError(404, "Video not found!");
  const findPlaylist = await PlayList.findById({ _id: playlistId });
  if (!findPlaylist) throw new ApiError(404, "Playlist not found!");
  if (!findPlaylist.owner.equals(req.user._id))
    throw new ApiError(401, "Unauthorized request!");
  if (!findPlaylist.videos.includes(findVideo._id))
    throw new ApiError(404, "Video not exist in Playlist!");

  findPlaylist.videos = findPlaylist.videos.filter(
    (item) => !item.equals(findVideo._id)
  );

  const savePlaylist = await findPlaylist.save({ validateBeforeSave: true });
  res.status(200).json(200, savePlaylist, "Delete the video Successfully!");
});

//delete the entire playlist
const deletePlayList = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) throw new ApiError(400, "Playlist id missing!");
  const findPlaylist = await PlayList.findById({ _id: playlistId });
  if (!findPlaylist.owner.equals(req.user._id))
    throw new ApiError(401, "Unaithorized request!");
  if (!findPlaylist) throw new ApiError("No Playlist found!");
  const delPalylist = await PlayList.deleteOne(findPlaylist);
  res
    .status(200)
    .json(new ApiResponse(200, delPalylist, "Playlist removed Successfully!"));
});

//get users playlists
const getUserPlaylists = asyncHandler(async (req, res) => {
  const getPlaylists = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "playlists",
        localField: "_id",
        foreignField: "owner",
        as: "UsersPlayLists",
      },
    },
    {
      $addFields: {
        totalPlaylists: {
          $size: "$UsersPlayLists",
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
        totalPlaylists: 1,
        UsersPlayLists: 1,
      },
    },
  ]);
  if (!getPlaylists || getPlaylists.length == 0)
    throw new ApiError(400, "No Playlist found!");
  res
    .status(200)
    .json(
      new ApiResponse(200, getPlaylists, "User Playlists get Successfully!")
    );
});

//get Playlist by id
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) throw new ApiError(400, "Playlist id missing!");
  const findPlaylist = await PlayList.findById({ _id: playlistId });
  if (!findPlaylist.owner.equals(req.user._id))
    throw new ApiError(401, "Unauthorized request!");
  if (!findPlaylist) throw new ApiError(400, "No playlist exist!");
  res.status(200).json(new ApiResponse(200, findPlaylist, "Playlist found!"));
});
export {
  createPlaylist,
  addVideoPlaylist,
  updatePlaylist,
  updatePlaylistVideo,
  deleteVideoPlaylist,
  deletePlayList,
  getUserPlaylists,
  getPlaylistById,
};
