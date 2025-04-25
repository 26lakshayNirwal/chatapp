import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {v4 as uuid} from "uuid";
import {v2 as cloudinary} from "cloudinary";
//import { getBase64 } from "../lib/helper.js";
import { Readable } from "stream";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

 const cookieOption = {
  maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
  httpOnly: true,
    sameSite: "none",
    secure: true, // only true in production
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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
//console.log("Cloudinary Config", cloudinary.config());




// const getBase64 = (file) => {
//   const b64 = file.buffer.toString("base64");
//   return `data:${file.mimetype};base64,${b64}`;
// };

const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

const uploadFilesToCloudinary = async (files = []) => {
  try {
    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            public_id: uuid(),
            timeout: 180000, 
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Upload Error:", error);
              return reject(error);
            }
            resolve({
              public_id: result.public_id,
              secureUrl: result.secure_url,
            });
          }
        );
  
        // Pipe the buffer to Cloudinary
        bufferToStream(file.buffer).pipe(stream);
      });
    });
  
    return Promise.all(uploadPromises);
  } catch (error) {
      next (error);
  }
};

const deleteFilesFromCloudnary = async (public_Ids)=>{

}



export { connectDB, sendToken, cookieOption,emitEvent , deleteFilesFromCloudnary , uploadFilesToCloudinary};
