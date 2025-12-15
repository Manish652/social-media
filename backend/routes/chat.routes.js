import express from "express";
import { accessChat,sendMessage,getMessages } from "../controllers/chat.controller.js";
import AuthProtection from "../middleware/AuthProtection.js";
import upload from "../middleware/multer.js";
const chatRouter = express.Router();

chatRouter.post("/aceess",AuthProtection,accessChat);
chatRouter.post("/message",AuthProtection,upload.single("media"),sendMessage);
chatRouter.get("/messages/:chatId",AuthProtection,getMessages);

export default chatRouter;
