import express from "express";
import {acceptFriendRequest, getAllNotifications, getMyFriends, getMyProfile, login,logout,newUser ,searchUser, sendFriendRequest} from "../controllers/user.js";
import { singleAvatar } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/Auth.js";
import { acceptRequestValidator, loginValidator, registerValidator, sendRequestValidator, validateHandler } from "../lib/validators.js";
const app =express.Router();

app.post("/new",singleAvatar,registerValidator(),validateHandler,newUser);

app.post("/login",loginValidator(),validateHandler,login);

app.get("/me",isAuthenticated,getMyProfile);

app.get("/logout",logout);

app.get("/search",searchUser);

app.put("/sendrequest", isAuthenticated, sendRequestValidator(), validateHandler, sendFriendRequest);

app.put("/accept-request", isAuthenticated, acceptRequestValidator(), validateHandler, acceptFriendRequest);

app.get("/notifications",isAuthenticated,getAllNotifications);

app.get("/friends",isAuthenticated,getMyFriends);


    


export default app;