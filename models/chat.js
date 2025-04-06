import mongoose,{ Schema,Types,model } from "mongoose";

const schema=new Schema({
    name:{
        type:String,
        required : true,
    },
    groupChat:{
        type:Boolean,
        default:false,
    },
    creator:{
        type:Types.ObjectId,
        ref :"User",
    },
    members:[{
        type:Types.ObjectId,
        ref :"User",
    },
],
},
{
    timestamps: true,
});
// const Chat= mongoose.model("Chat",schema);
// export default Chat;
export const Chat = mongoose.models.Chat || model("Chat",schema);