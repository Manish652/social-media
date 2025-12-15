import express from "express";
import { createStory, getAllStories, getFollowingStories } from "../controllers/story.Controller.js";
import upload from "../middleware/multer.js";
import AuthProtection from "../middleware/AuthProtection.js";

const StoryRouter = express.Router();

StoryRouter.post("/create", AuthProtection, upload.single("media"), createStory);
StoryRouter.get("/all", getAllStories);
StoryRouter.get("/following", AuthProtection, getFollowingStories);

export default StoryRouter;
