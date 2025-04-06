import {body, validationResult, check, param} from "express-validator"

const validateHandler =(req, res ,next)=>{
    const errors= validationResult(req);
 
    const errorMessages = errors.array().map((error)=>error.msg).join(", ");
 
    console.log(errorMessages)
 
    if(errors.isEmpty())return next();
    else next(new Error(errorMessages));
 }


const registerValidator =()=>[
    body("name", "Please Enter Name").notEmpty(),
    body("username", "Please Enter Username").notEmpty(),
    body("bio", "Please Enter Bio").notEmpty(),
    body("password", "Please Enter Password").notEmpty(),
    check("avatar","Please Provide Avatar").notEmpty(),
];

const loginValidator =()=>[
    
    body("username", "Please Enter Username").notEmpty(),
    body("password", "Please Enter Password").notEmpty(),

];

const newGroupChatValidator =()=>[
    
    body("name", "Please Enter Name").notEmpty(),
    body("members" )
    .notEmpty()
    .withMessage("Please Enter Member")
    .isArray({min:2,max:100})
    .withMessage("Members must be 2-100")

];

const addMemberValidator =()=>[
    
    body("chatId", "Please Enter Chat ID").notEmpty(),
    body("members" )
    .notEmpty()
    .withMessage("Please Enter Member")
    .isArray({min:1,max:97})
    .withMessage("Members must be 1-97")

];

const removeMemberValidator =()=>[
    
    body("chatId", "Please Enter Chat ID").notEmpty(),
    body("userId", "Please Enter User ID").notEmpty(),
    
];

const leaveGroupValidator =()=>[
    param("id", "Please Enter Chat ID").notEmpty(),
];

const sendAttachmentsValidator =()=>[
    body("chatId", "Please Enter Chat ID").notEmpty(),
    check("files").notEmpty().withMessage("Please Upload Attachments")
    .isArray({min:1,max:5})
    .withMessage("Members must be 1-5"),
];

const getMessagesValidator =()=>[
    param("id", "Please Enter Chat ID").notEmpty(),
];

const renameValidator =()=>[
    param("id", "Please Enter Chat ID").notEmpty(),
    body("name","Please enter New Name").notEmpty(),
];



export {
    registerValidator ,
     validateHandler, 
     loginValidator,
     newGroupChatValidator,
     addMemberValidator,
     removeMemberValidator,
     leaveGroupValidator,
     sendAttachmentsValidator,
     getMessagesValidator,
     renameValidator,
    };