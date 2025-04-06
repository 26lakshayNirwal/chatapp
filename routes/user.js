import express from "express";
import {getMyProfile, login,logout,newUser ,searchUser} from "../controllers/user.js";
import { singleAvatar } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/Auth.js";
import { loginValidator, registerValidator, validateHandler } from "../lib/validators.js";
const app =express.Router();

app.post("/new",singleAvatar,registerValidator(),validateHandler,newUser);

app.post("/login",loginValidator(),validateHandler,login);

app.get("/me",isAuthenticated,getMyProfile);

app.get("/logout",logout);

app.get("/search",searchUser);
    


export default app;