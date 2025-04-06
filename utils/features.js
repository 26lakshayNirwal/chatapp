import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const cookieOption = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
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
  console.log("Emmiting enent",event);
}

const deleteFilesFromCloudnary = async (public_Ids)=>{

}



export { connectDB, sendToken, cookieOption,emitEvent , deleteFilesFromCloudnary };
