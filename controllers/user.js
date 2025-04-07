import { User } from "../models/user.js";
import { sendToken, uploadFilesToCloudinary } from "../utils/features.js";
import { compare } from "bcrypt";
import { cookieOption } from "../utils/features.js";
import {Chat} from "../models/chat.js";
import {Request} from '../models/request.js';
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events.js";
import { emitEvent } from "../utils/features.js";
import { getOtherMember } from "../lib/helper.js";

const newUser = async (req, res) => {
  try {
    const { name, username, password, bio } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const file = req.file;

    if(!file) return next(new Error("Please upload avatar"))

      const result = await uploadFilesToCloudinary([file])

    const avatar = {
      public_id: result[0].public_id,
      url: result[0].secureUrl,
    };

    const user = await User.create({
      name,
      bio,
      username,
      password,
      avatar,
    });

    sendToken(res, user, 201, "User Created");
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res) => { 
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Please provide username and password" });
    }

    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" }); 
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    sendToken(res, user, 200, `Welcome back ${user.username}`);
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
    try {
        res
            .status(200)
            .cookie("chat-token", "", { ...cookieOption, maxAge: 0 })
            .json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const searchUser = async (req, res, next) => {
  try {
    const { name = "" } = req.query;
    
    const myChats = await Chat.find({ groupChat: false, members: req.user });

    const allUsersFromMyChats = myChats.flatMap((chat)=>chat.members);
      
    const usersExceptMeAndFriends = await User.find({
      _id: { $nin: allUsersFromMyChats },
         name: { $regex: name, $options: "i" } 
  
    });

    const users = usersExceptMeAndFriends.map(({_id, name , avatar})=>({
      _id,
      name,
     avatar: avatar.url,
    }));

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

const sendFriendRequest = async (req, res, next) => {
  try {
    const { userId } = req.body;
    // console.log("req.user =", req.user);

  const request = await Request.findOne({
    $or: [
      { sender: req.user, receiver: userId },
      { sender: userId, receiver: req.user },
    ],
  });

  if (request) return next(new Error("Request already sent", 400));

  await Request.create({
    sender: req.user,
    receiver: userId,
  });

  emitEvent(req, NEW_REQUEST, [userId]);

  return res.status(200).json({
    success: true,
    message: "Friend Request Sent",
  });
  } catch (error) {
    next(error);
  }
};

 const acceptFriendRequest = async (req, res, next) => {
  try {
    const { requestId , accept } = req.body;

    const request = await Request.findById(requestId).populate("sender","name").populate("receiver","name");

    if (!request) return next(new Error("Request not found", 404));

    if (request.receiver._id.toString() !== req.user.toString()) 
      return next(new Error("You are not authorized to accept this request", 403));

    if(!accept){
      return request.deleteOne();

      res.status(200).json({
        success: true,
        message: "Friend Request Rejected",
      });
    }

    const members = [request.sender._id, request.receiver._id];

    await Promise.all([
      Chat.create({
        members,
        name: `${request.sender.name} and ${request.receiver.name}`,
      }),
      request.deleteOne(),
    ]);

    emitEvent(req, REFETCH_CHATS, members);

    res.status(200).json({
      success: true,
      message: "Friend Request Accepted",
      senderId : request.sender._id,
    });
  } catch (error) {
    next(error);
  }
};

const getAllNotifications = async (req, res, next) => {
  try {
    const requests = await Request.find({
      receiver: req.user,
    })
      .populate("sender", "name avatar");

    const allRequests = requests.map(({ _id, sender }) => ({
      _id,
      name: sender.name,
      avatar: sender.avatar,
    }));  
      

    return res.status(200).json({
      success: true,
      allRequests,
    });
  } catch (error) {
    next(error);
  }
};

const getMyFriends = async (req, res) => {
  try {
    const chatId = req.query.chatId;

    const chats = await Chat.find({
      members: req.user,
      groupChat: false,
    }).populate("members", "name avatar");
  
    
  
    const friends = chats.map(({ members }) => {
      const otherUser = getOtherMember(members, req.user);
      
  
      return {
        _id: otherUser._id,
        name: otherUser.name,
        avatar: otherUser.avatar.url,
      };
    });
    
  
    if (chatId) {
      const chat = await Chat.findById(chatId);
  
      const availableFriends = friends.filter(
        (friend) => !chat.members.includes(friend._id)
      );
  
      return res.status(200).json({
        success: true,
        friends: availableFriends,
      });
    } else {
      return res.status(200).json({
        success: true,
        friends,
      });
    }
  }
   catch (error) {
     next(error)
  }
}




export { login,
         newUser,
          getMyProfile,
           logout ,searchUser,
            sendFriendRequest,
            acceptFriendRequest,
            getAllNotifications,
            getMyFriends,
          };
 