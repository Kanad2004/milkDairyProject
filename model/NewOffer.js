import mongoose from "mongoose"

const newOfferSchema = new mongoose.Schema(
  {
    link: {
      type: String,
      required: true,
    },
    title: {
      type: String,
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

