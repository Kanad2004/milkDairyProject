import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { NewOffer } from "../model/NewOffer.js";
import { uploadOnCloudinary } from "../utils/CloudinaryUtility.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

//This function is just for getting the public id from the url of the file . . .
const getPublicIdFromUrl = (url) => {
  const urlParts = url.split("/");
  const publicIdPart = urlParts[urlParts.length - 1]; // Get the last part of the URL
  const publicId = publicIdPart.split(".")[0]; // Remove the extension
  return publicId;
};

// Add a new offer -> testing is remaining
export const addNewOffer = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title?.trim() || !description?.trim()) {
      throw new ApiError(400, "All fields are required");
    }
    if (!req.file) {
      return res
        .status(400)
        .json(new ApiError(400, "", "No offer file uploaded"));
    }
    const localOfferPath = req?.file?.path;

    const offerUrl = await uploadOnCloudinary(localOfferPath);

    if (!offerUrl) {
      throw new ApiError(500, "Failed to upload the offer file to cloudinary");
    }

    const newOffer = new NewOffer({ link: offerUrl.url, title, description });
    await newOffer.save();

    const createdOffer = await NewOffer.findById(newOffer._id);

    if (!createdOffer) {
      throw new ApiError(500, "Failed to create the new Offer");
    }

    res
      .status(201)
      .send(new ApiResponse(201, newOffer, "Offer added successfully"));
  } catch (error) {
    res.status(500).send(new ApiError(500, "Failed to add offer"));
  }
});

// Edit an existing offer -> testing is remaining
export const editNewOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid offer ID format");
  }
  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;

  const updatedOffer = await NewOffer.findByIdAndUpdate(id, updateFields, {
    new: true,
    runValidators: true,
  });

  if (!updatedOffer) {
    throw new ApiError(404, "Offer is not updated");
  }

  if (req?.file?.path) {
    console.log("updating the image file ");
    await updateOfferImage(req, res);
  }

  const NewupdatedOffer = await NewOffer.findById(id);

  return res
    .status(200)
    .send(new ApiResponse(200, NewupdatedOffer, "Offer updated successfully"));
});

// Delete an offer -> testing is remaining
export const deleteNewOffer = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid offer ID format");
    }
    const offer = await NewOffer.findById(id);
    if (!offer) {
      throw new ApiError(404, "Offer not found");
    }
    const offerPublicId = getPublicIdFromUrl(offer.link);

    const deleteOfferPromise = cloudinary.uploader.destroy(offerPublicId, {
      resource_type: "image",
    });

    await Promise.all([deleteOfferPromise]);

    await NewOffer.findByIdAndDelete(id);

    res
      .status(200)
      .send(new ApiResponse(200, null, "Offer deleted successfully"));
  } catch (error) {
    console.log("error: ", error);
    return res.status(500).send(new ApiError(500, "Failed to delete offer"));
  }
});

//Update an offerImage -> testing is remaining
export const updateOfferImage = async (req, res) => {
  const offerImagePath = req.file?.path;
  const { id } = req.params;
  if (!offerImagePath) {
    throw new ApiError(400, "Offer file is missing");
  }

  const offerImg = await uploadOnCloudinary(offerImagePath);

  if (!offerImg.url) {
    throw new ApiError(400, "Error while uploading the file on the cloudinary");
  }

  fs.unlink(offerImagePath, (err) => {
    if (err) {
      console.error(`Failed to delete uploaded offerimg: ${err.message}`);
    } else {
      console.log("Uploaded offerImg deleted successfully from server");
    }
  });

  const updatedOffer = await NewOffer.findByIdAndUpdate(
    id,
    {
      $set: {
        link: offerImg.url,
      },
    },
    { new: true }
  );

  return updatedOffer;
};

//get all offers . . .
export const getAllOffers = asyncHandler(async (req, res) => {
  const offers = await NewOffer.find();

  if (!offers) {
    throw new ApiError(404, "offers are not available");
  }
  return res.status(200).send(new ApiResponse(200, offers, "Offers found"));
});
