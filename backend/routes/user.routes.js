import express from "express";
import { registerUser, loginUser, getProfile, editProfile, getUserById } from "../controllers/UserAuth.Controller.js";
import upload from "../middleware/multer.js";
import AuthProtection from "../middleware/AuthProtection.js";

const userRouter = express.Router();

userRouter.post("/register", upload.single("profilePicture"), registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", AuthProtection, getProfile);
userRouter.get("/profile/:id", AuthProtection, getUserById);
userRouter.put("/editProfile", AuthProtection, upload.single("profilePicture"), editProfile);


export default userRouter;
