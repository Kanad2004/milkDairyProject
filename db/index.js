// import mongoose from "mongoose";
// // import { DB_NAME } from "../constants.js";
// import dotenv from "dotenv";
// // import dotenv from "dotenv";
// dotenv.config();

// dotenv.config({ path: "../.env" });

// const connectDB = async () => {
//   try {

//     console.log(process.env.MONGODB_URI);
//     const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
//     console.log(`\n mongodb connected `);
//   } catch (err) {
//     console.log("MongoDB Connection Error . . . ");
//     console.log(err);
//     process.exit(1); // Exit process with failure
//   }
// };

// export default connectDB;
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

const connectDB = async () => {
  try {
    // Ensure the MongoDB URI is loaded
    const dbURI = process.env.MONGODB_URI;
    if (!dbURI) {
      throw new Error("MongoDB URI not found in environment variables.");
    }

    // Connect to MongoDB
    const connectionInstance = await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
