import multer from "multer";

 const multerUploaded=multer({
    limits:{
        fileSize:1024*1024*5, // 5mb
    },
});

const singleAvatar = multerUploaded.single("avatar");
const attachmentMulter = multerUploaded.array("files",5);

export {singleAvatar, attachmentMulter}