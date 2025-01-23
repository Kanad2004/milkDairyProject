// import mongoose from "mongoose"

// const subAdminSchema = new mongoose.Schema(
//   {
//     subAdminName: {
//       type: String,
//       required: true,
//     },
//     subAdminEmail: {
//       type: String,
//       required: true,
//     },
//     subAdminPassword: {
//       type: String,
//       required: true,
//     },
//     admin: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Admin",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export const SubAdmin = mongoose.model("SubAdmin", subAdminSchema);

import mongoose from "mongoose";

const subAdminSchema = new mongoose.Schema(
  {
    subAdminName: {
      type: String,
      required: true,
    },
    subAdminEmail: {
      type: String,
      required: true,
    },
    subAdminPassword: {
      type: String,
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SubAdmin = mongoose.model("SubAdmin", subAdminSchema);
