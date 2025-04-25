import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import { errorMiddleware } from "./middlewares/error.js";
import { connectDB } from "./utils/features.js";
import adminRoute from './routes/admins.js';
import chatRoute from './routes/chat.js';
import userRoute from './routes/user.js';
import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors';
import { corsOptions } from "./constants/config.js";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "./constants/events.js";
import { getSockets } from "./lib/helper.js";
import { Message } from "./models/message.js";
import { socketAuthenticator } from "./middlewares/Auth.js";


dotenv.config({ path: "./.env" });

cloudinary.config({
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key : process.env.CLOUDINARY_API_KEY,
  api_secret : process.env.CLOUDINARY_API_SECRET,
})

const app = express();
const server = createServer(app);
const io = new Server(server,{
  cors:corsOptions,
});


const port = process.env.PORT || 3000;
 export const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";
const mongoURI = process.env.MONGO_URI;
 export const adminSecretKey = process.env.ADMIN_SECRET_KEY || "lakshay";
 export const userSocketIDs = new Map();

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/admin", adminRoute);

app.get("/", (req, res) => {
  res.send("hello world");
});

io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.request.res,
    async (err) => await socketAuthenticator(err, socket, next)
  );
});


io.on("connection",(socket)=>{
   const user = socket.user;
   userSocketIDs.set(user._id.toString(), socket.id);

   console.log(userSocketIDs);

   socket.on(NEW_MESSAGE_ALERT,async ({chatId,members,message})=>{

    const messageForRealTime = {
      content : message,
      _id : uuid(),
      sender : {
        _id : user._id,
        name : user.name,
      } ,
      chat :  chatId,
      createdAt : new Date().toISOString(),
    };

    const messageForDB = {
        content : message,
        sender : user._id,
        chat : chatId
    };

  

    const userSocket = getSockets(members);
    io.to(userSocket).emit(NEW_MESSAGE_ALERT,{
      chatId,
      message : messageForRealTime,
    });

    io.to(userSocket).emit(NEW_MESSAGE,{chatId});

     try {
      await Message.create(messageForDB);
     } catch (error) {
      console.log(error)
     }
   })

  socket.on("disconnect",()=>{
    console.log("user disconnected");
    userSocketIDs.delete(user._id.toString());
  })
})

app.use(errorMiddleware );



// ✅ CONNECT FIRST THEN START SERVER
connectDB(mongoURI)
  .then(async () => {
    console.log("✅ MongoDB connected");

    // Seed only after DB is connected
    // await createUser(10);
   // await createSingleChats(10);
  //  await createGroupChats(10);
    //  await createMessagesInAChat("67f0f39a0e5e39ac65bbe398",50)

      server.listen(port, () => {
        console.log(`🚀 Server is running on port ${port} in ${envMode} Mode`);
      });
     // deleteAllChats()
    
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
  });

  

  
