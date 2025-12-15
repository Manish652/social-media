import express from "express";
import { createPost, deletePost, getAllPost, getSinglePost, updatePost } from "../controllers/Post.Controller.js";
import AuthProtection from "../middleware/AuthProtection.js";
import upload from "../middleware/multer.js";

const PostRouter = express.Router();

// Support both client-side and server-side uploads
PostRouter.post("/create", AuthProtection, upload.single("media"), createPost);
PostRouter.get("/", AuthProtection, getAllPost);
PostRouter.get("/:id", AuthProtection, getSinglePost);
PostRouter.put("/update/:id", AuthProtection, updatePost);
PostRouter.delete("/delete/:id", AuthProtection, deletePost);

export default PostRouter;


