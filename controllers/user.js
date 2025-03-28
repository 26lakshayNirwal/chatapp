import { json } from "express";
import {User} from "../models/user.js";

const newUser= async (req,res) => {

    const avatar={
        public_id:"sgggrg",
    };
    await User.create({
        name:"Aman",
        username:"aman",
        password:"1234",
        avatar,
    });
    res.status(201),json({message:"User Created Successfully"})
};

const login=(req,res)=>{
    res.send("hello world")
};

export {login,newUser};