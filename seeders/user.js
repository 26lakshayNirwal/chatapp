import { faker } from "@faker-js/faker";
import { User } from "../models/user.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import mongoose from "mongoose";

const createUser = async (numUsers) => { 
    try {
         
        const userPromise=[];

        for (let i = 0; i < numUsers; i++) {
            const tempUser= User.create({
                name : faker.person.fullName(),
                username : faker.internet.userName(),
                password : "password",
                bio : faker.lorem.sentence(10),
                avatar : {
                    public_id : faker.system.fileName(),
                    url : faker.image.avatar(),
                }
            });
            userPromise.push(tempUser);
            
        }

         await Promise.all(userPromise);

         console.log("User Created", numUsers);
         process.exit(1);


    } catch (error) {
        console.error("Error creating users:", error);
        process.exit(1);
    }
}




  export {
    createUser
  };