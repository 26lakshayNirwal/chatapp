import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";

import userRoute from './routes/user.js';
import chatRoute from './routes/chat.js';

import { createUser } from "./seeders/user.js";
import { createGroupChats, createMessagesInAChat, createSingleChats } from "./seeders/chats.js";

dotenv.config({ path: "./.env" });

const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;

app.use(express.json());
app.use(cookieParser());

app.use("/user", userRoute);
app.use("/chat", chatRoute);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use(errorMiddleware);



// ✅ CONNECT FIRST THEN START SERVER
connectDB(mongoURI)
  .then(async () => {
    console.log("✅ MongoDB connected");

    // Seed only after DB is connected
    // await createUser(10);
   // await createSingleChats(10);
  //  await createGroupChats(10);
    //  await createMessagesInAChat("67f0f39a0e5e39ac65bbe398",50)

      app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}`);
      });
    
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
  });
