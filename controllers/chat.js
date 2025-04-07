import { ALERT, NEW_ATTACHMENTS, NEW_MESSAGE, REFETCH_CHATS } from "../constants/events.js";
import { getOtherMember } from "../lib/helper.js";
import { Chat } from "../models/chat.js";
import { User } from "../models/user.js";
import { deleteFilesFromCloudnary, emitEvent } from "../utils/features.js";
import mongoose from "mongoose";
import {Message} from "../models/message.js";

const newGroupChat = async (req, res, next) => {
    try {
        const { name, members } = req.body;

        if (members.length < 2) {
            return next(new Error("At least 2 members required to create a group chat"));
        }

        const allMembers = [...members, req.user];

        await Chat.create({
            name,
            groupChat: true,
            creator: req.user,
            members: allMembers,
        });

        emitEvent(req, ALERT, allMembers, `Welcome to ${name} group`);
        emitEvent(req, REFETCH_CHATS, members);

        return res.status(201).json({
            success: true,
            message: `${name} group created`,
        });
    } catch (error) {
        next(error);
    }
};

const getMyChats = async (req, res, next) => {
    try {

        const chats = await Chat.find({members: req.user}).populate(
            "members", 
            "name avatar"
        );

        const transformedChats = chats.map(({_id,name,members,groupChat})=>{

            const otherMember = getOtherMember(members,req.user);

            return {
                _id,
                groupChat,
                name : groupChat? name : otherMember.name,
                avatar : groupChat?members.slice(0,3).map(({avatar})=>avatar.url): [otherMember.avatar.url],
                members :members.reduce((prev,curr)=>{
                    if(curr._id.toString()!==req.user.toString()){
                        prev.push(curr._id);
                    }
                    return prev;
                },[]),
            };
        })

        return res.status(200).json({
            success: true,
           chats : transformedChats,
        });
    } catch (error) {
        next(error);
    }
};

const getMyGroups = async (req,res,next)=>{

    try {
        const chats =await Chat.find({
            members: req.user,
            groupChat: true,
            creator : req.user,
        }).populate("members"," name avatar");
    
        const groups = chats.map(({members, _id, groupChat, name})=>({
            _id,
            groupChat,
            name,
            avatar : members.slice(0,3).map(({avatar})=>avatar.url),
        }))
    
        return res.status(200).json({
            success: true,
            groups,
        });
    } catch (error) {
        next(error);
    }


};

const addMembers = async (req,res,next)=>{

    try {
        const { chatId, members } = req.body;

        const chat = await Chat.findById(new mongoose.Types.ObjectId(chatId));
        if (!chat) {
            return next(new Error("Chat not found"));
        }

        

        if (!chat.groupChat)  return next(new Error("This is not a group chat")); 

        if (chat.creator.toString() !== req.user.toString()) return next(new Error("You are not allowed to add members"));

        const allNewMembersPromise = members.map((i) => User.findById(i,"name"));

        const allNewMembers = await Promise.all(allNewMembersPromise);

        const uniqueMembers = allNewMembers.filter((i) => !chat.members.includes(i._id.toString())).map((i) => i._id);

        chat.members.push(...allNewMembers.map((i)=>i._id));

        if(chat.members.length > 100)
            return next(new Error("Group members limit exceeded"));

        await chat.save();

        const allUsersName = allNewMembers.map((i)=>i.name).join(", ");

        emitEvent(
            req, 
            ALERT, 
            chat.members, 
            `${allUsersName} added to ${chat.name} group`
        );

        emitEvent(req, REFETCH_CHATS, chat.members);
        
    
        return res.status(200).json({
            success: true,
            message : "Members added successfully",
        });
    } catch (error) {
        next(error);
    }


};

const removeMembers = async (req,res,next)=>{
   
    const{chatId, userId}= req.body;

    const [chat, userremoved] = await Promise.all([
        Chat.findById(chatId),
        User.findById(userId,"name")
    ]);

    if(!chat) return next(new Error("Chat not found"));

    if(!userremoved) return next(new Error("User not found"));

    if(!chat.groupChat) return next(new Error("This is not a group chat"));

    if(chat.creator.toString() !== req.user.toString()) return next(new Error("You are not allowed to remove members"));

    if(chat.members.length<3)
        return next(new Error("Group must have at least 3 members"));

    chat.members= chat.members.filter(
        (member)=> member.toString()!==userId.toString()
    );

    await chat.save();

    emitEvent (
        req, 
        ALERT,
        chat.members,
        `${userremoved.name} has been removed from the group`
    );

    emitEvent(req, REFETCH_CHATS, chat.members);

    return res.status(200).json({
        success:true,
        message:"Member removed successfully",
    });


}

const leaveGroup = async (req,res,next)=>{
   
    const chatId= req.params.id;

    const chat = await Chat.findById(chatId);

    if(!chat) return next(new Error("Chat not found"));

    if(!chat.groupChat)
        return next(new Error("This is not a group chat"));

    chat.members= chat.members.filter(
        (member)=> member.toString()!==req.user.toString()
    );

    const remainingMember = chat.members= chat.members.filter(
        (member)=> member.toString()!==req.user.toString()
    );

    if(remainingMember.length<3)
        return next(new Error("Group must have at least 3 members"));

    const newCreator = remainingMember[0];

    chat.creator= newCreator;

    const [user] = await Promise.all([
        User.findById(req.user,"name"),
         chat.save()
    ])
    

    emitEvent (
        req, 
        ALERT,
        chat.members,
        `User ${user.name} has left  the group`
    );

    emitEvent(req, REFETCH_CHATS, chat.members);

    return res.status(200).json({
        success:true,
        message:"Member removed successfully",
    });


}

const sendAttachments = async (req, res, next) => {
    try {
        const { chatId } = req.body;
        
        const files = req.files || [];

        if(files.length<1)
            return next(new Error("Please Upload Attachments", 400));

        if(files.length > 5)
            return next(new Error("Files can't be more than 5", 400));

        const [chat,me] = await Promise.all([
            Chat.findById(chatId),
            User.findById(req.user,"name"),
        ]);
        if (!chat) return next(new Error("Chat not found"));

        if ( files.length <1) {
            return next(new Error(" Attachments are required"));
        }

        const attachments = [];

       

        const messageForDB = {content : "",attachments, sender : me._id, chat: chatId};

        const messageForRealTime={
            ...messageForDB,
             sender :{
                _id : me._id,
                name : me.name,
             } ,
           
            };

        const message = await Message.create(messageForDB);

        emitEvent(req, NEW_ATTACHMENTS, chat.members, {
            message : messageForRealTime,
            chatId,
        });
        emitEvent(req, NEW_MESSAGE, chat.members, {chatId});

        return res.status(201).json({
            success: true,
            message: "Attachments sent successfully",
            data: message,
        });
    } catch (error) {
        next(error);
    }
};

const getChatDetails = async (req, res , next)=>{

try {
    if(req.query.populate==="true"){
        const chat = await Chat.findById(req.params.id).populate(
            "members",
            "name avatar"
        ).lean();
    
        if(!chat) return next(new Error("Chat not found"));
    
        chat.members = chat.members.map(({_id, name , avatar})=>({
            _id,
            name, 
            avatar : avatar.url,
        }));
    
        return res.status(200).json({
            success : true,
            chat,
        });
    
    
    }
    
    else {
        const chat = await Chat.findById(req.params.id);
    
        if(!chat) return next(new Error("Chat not found"));
    
        return res.status(200).json({
            success : true,
            chat,
        });
    
     
    }
} catch (error) {
    console.log(error)
}

}

const renameGroup = async (req,res, next) => {

    try {
        const chatId = req. params.id;
    const {name}=  req.body;

    const chat = await Chat.findById(chatId);

    if(!chat) return next (new Error("Chat not found"));

    if(!chat.groupChat) return next(new Error("This is not group chat"));

    if(chat.creator.toString()!==req.user.toString())
        return next( new Error("You are not allowed to rename the group"));

    chat.name = name;

    await chat.save();

    emitEvent(req, REFETCH_CHATS,chat.members);

    return res.status(200).json ({
        success : true,
        message : "Group renamed successfully",
        
    })
    } catch (error) {
        console.log(error)
    }


}

const deleteChat = async (req,res,next )=> {
try {
    const chatId = req. params.id;

    const chat = await Chat.findById(chatId);

    if(!chat) return next (new Error("Chat not found"));

    const members = chat.members;

    if(chat.groupChat && chat.creator.toString()!== req.user.toString())
        return next(new Error("You are not allowed to delete the group"));

    if(!chat.groupChat && !chat.members.includes(req.user.toString()))
        return next (new Error("You are not allowed to delete the chat"));

    const messageWithAttachments = await Message.find({
        chat: chatId ,
        attachments :{$exists : true , $ne : []},
    })

    const public_Ids = [];

    messageWithAttachments.forEach(({attachments})=>
        attachments.forEach(({public_Ids})=>
            public_Ids.push(public_Ids))
    );

    await Promise.all([
        deleteFilesFromCloudnary(public_Ids),
        chat.deleteOne(),
        Message.deleteMany({chat : chatId}),
    ])  

    emitEvent(req, REFETCH_CHATS,members);

    return res.status(200).json({
        success : true,
        message : "Chat deleted successfully",
    })



} catch (error) {
    console.log(error)
}
}


const getMessages = async (req, res, next) => {
    try {
        const { chatId } = req.params.id;

        const {page=1} = req.query;

        const limits =20;
        const skip = (page-1)*limits;

        const [messages,totalMessagesCount] = await Promise.all([
            Message.find({ chat: chatId })
            .sort({createdAt : -1})
            .skip(skip)
            .limit(limits)
            .populate("sender", "name")
            .lean(),Message.countDocuments({chat : chatId}),
        ]);

        const totalPages = Math.ceil(totalMessagesCount/limits)|| 0;

        return res.status(200).json({
            success: true,
            messages : messages.reverse(),
            totalPages,
        });
    } catch (error) {
        next(error);
    }
};

export { 
    newGroupChat ,
    getMyChats, 
    getMyGroups ,
     addMembers, 
     removeMembers ,
     leaveGroup, 
     sendAttachments,
     getChatDetails,
     renameGroup,
     deleteChat,
     getMessages,
    };