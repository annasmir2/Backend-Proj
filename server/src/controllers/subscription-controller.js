import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription-models.js";
import { User } from "../models/user-models.js";

const del = async (_id) => {
  try {
    const deleteSubscribe = await Subscription.deleteOne(_id);
    if (!deleteSubscribe)
      throw new ApiError(400, "Error while deleting the document");
    return deleteSubscribe;
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while deleting the Subscribe!"
    );
  }
};
//subscription
const subscribe = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) throw new ApiError(400, "User Id is missing!");
  const findUser = await User.findById(channelId);
  if (!findUser) throw new ApiError(404, "User not found!");
  const subscribeStatus = await Subscription.findOne({
    subscribers: req.user._id,
    channel: findUser._id,
  });
  if (subscribeStatus) {
    if (!subscribeStatus.subscribers.equals(req.user._id))
      throw new ApiError(401, "Unauthorized request!");
    const unSubscribe = await del(subscribeStatus._id);
    res
      .status(200)
      .json(new ApiResponse(200, unSubscribe, "UnSubscribe Successfully!"));
  } else {
    const findNewUser = await Subscription.findOne({
      channel: { $ne: findUser._id },
    });
    if (findNewUser) {
        if (findUser._id.equals(req.user._id))
            throw new ApiError(401, "Cant subscribe to your own channel!");
      const createSubscribe = await Subscription.create({
        subscribers: req.user._id,
        channel: findUser._id,
      });
      if (!createSubscribe) throw new ApiError(400, "Creation Failed!");
      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            createSubscribe,
            "Subscriber Added Successfully!"
          )
        );
    } else {
      if (findUser._id.equals(req.user._id))
        throw new ApiError(401, "Cant subscribe to your own channel!");
      const createSubscribe = await Subscription.create({
        subscribers: req.user._id,
        channel: findUser._id,
      });
      if (!createSubscribe) throw new ApiError(400, "Creation Failed!");
      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            createSubscribe,
            "New Subscriber created Successfully!"
          )
        );
    }
  }
});
export { subscribe };
