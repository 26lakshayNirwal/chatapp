import express from "express";
import {  getMyProfile, logout, searchUser } from "../controllers/user.js";
import { isAuthenticated } from "../middlewares/Auth.js";
import { addMembers, deleteChat, getChatDetails, getMessages, getMyChats, getMyGroups, leaveGroup, newGroupChat, removeMembers, renameGroup, sendAttachments } from "../controllers/chat.js";
import { attachmentMulter } from "../middlewares/multer.js";
import { addMemberValidator, getMessagesValidator, leaveGroupValidator, newGroupChatValidator, removeMemberValidator, renameValidator, sendAttachmentsValidator, validateHandler } from "../lib/validators.js";
const app =express.Router();

app.use(isAuthenticated);

app.post("/new",newGroupChatValidator(), validateHandler, newGroupChat); 

app.get("/my", getMyChats);

app.get("/my/groups",getMyGroups);

app.put("/addMembers",addMemberValidator(),validateHandler,addMembers);

app.delete("/removeMember",removeMemberValidator(),validateHandler,removeMembers);

app.delete("/leave/:id",leaveGroupValidator(),validateHandler, leaveGroup);

app.post("/message",attachmentMulter,sendAttachmentsValidator(),validateHandler, sendAttachments);

app.get("/message/:id",getMessagesValidator(),validateHandler, getMessages);

app.route("/:id").get(getMessagesValidator(),validateHandler, getChatDetails).put(renameValidator(),validateHandler, renameGroup).delete(getMessagesValidator(),validateHandler ,deleteChat);





export default app;