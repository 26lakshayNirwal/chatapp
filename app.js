import express from "express";
import userRoute from './routes/user.js'
import dotenv from "dotenv";
import  {connectDB}  from "./utils/features.js";

dotenv.config({
    path:"./.env",
});
const mongoURI=process.env.MONGO_URI;
console.log(mongoURI);
const port=process.env.PORT || 3000;
connectDB(mongoURI);

const app=express();


app.use("/user",userRoute);

app.get("/",(req,res)=>{
    res.send("hello world")
})

app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})