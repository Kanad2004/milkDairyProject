import mongoose from "mongoose"

const newOfferSchema = new mongoose.Schema(
  {
    link: {
      type: String,
      required: true,
    },
    title: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const NewOffer = mongoose.model("NewOffer", newOfferSchema);
