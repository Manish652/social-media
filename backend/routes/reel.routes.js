import express from "express";
import {createReel,deleteReel,getAllReels,likeReel} from "../controllers/Reel.Controller.js";
import upload from "../middleware/multer.js";
import AuthProtection from "../middleware/AuthProtection.js";

const ReelRouter = express.Router();

ReelRouter.post("/create",AuthProtection,upload.single("video"),createReel);
ReelRouter.get("/all",getAllReels);
ReelRouter.put("/like/:id",AuthProtection,likeReel);
ReelRouter.delete("/delete/:id",AuthProtection,deleteReel);

export default ReelRouter;

