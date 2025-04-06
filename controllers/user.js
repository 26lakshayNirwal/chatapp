import { User } from "../models/user.js";
import { sendToken } from "../utils/features.js";
import { compare } from "bcrypt";
import { cookieOption } from "../utils/features.js";
import {Chat} from "../models/chat.js";

const newUser = async (req, res) => {
  try {
    const { name, username, password, bio } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const avatar = {
      public_id: "sgggrg",
      url: "abcde",
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
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    sendToken(res, user, 200, `Welcome back ${user.username}`);
  } catch (error) {
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




export { login, newUser, getMyProfile, logout ,searchUser};
