import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {v4 as uuid} from "uuid";
import {v2 as cloudinary} from "cloudinary";
import { getBase64 } from "../lib/helper.js";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

 const cookieOption = {
  maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
  sameSite: isProduction ? "none" : "lax",
  httpOnly: true,
  secure: isProduction, // only true in production
};


const connectDB = async (uri) => {
  try {
    const data = await mongoose.connect(uri);
    console.log(`Connected to the database ${data.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); 
  }
};

const sendToken = (res, user, code, message) => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in .env");
    return res.status(500).json({ message: "Internal Server Error" });
  }

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

  return res
    .status(code)
    .cookie("chat-token", token, cookieOption)
    .json({ success: true, message });
};

const emitEvent =(req,event, users, data)=>{
  console.log("Emmiting event",event);
}

const uploadFilesToCloudinary = async (files = []) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        getBase64(file),
        {
          resource_type: "auto",
          public_id: uuid(),
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  });

  try {
    const results = await Promise.all(uploadPromises);

    const formattedResults = results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
    return formattedResults;
  } catch (err) {
    throw new Error("Error uploading files to cloudinary", err);
  }
};

const deleteFilesFromCloudnary = async (public_Ids)=>{

}



export { connectDB, sendToken, cookieOption,emitEvent , deleteFilesFromCloudnary , uploadFilesToCloudinary};
