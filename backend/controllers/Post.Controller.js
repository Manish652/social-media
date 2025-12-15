import cloudinary from "../configs/cloudinary.js";
import PostModel from "../models/PostModel.js";
import UserModel from "../models/UserModel.js";
import { createNotification } from "./notification.controller.js";

/// create post

export const createPost = async (req, res) => {

    try {
        const { caption, mediaUrl, mediaType } = req.body;
        const userId = req.user._id;

        // Client-side upload: mediaUrl comes from frontend (bypasses server network)
        // Server-side upload: use req.file (fallback for backward compatibility)
        let finalMediaUrl = mediaUrl;

        if (!finalMediaUrl && req.file) {
            try {
                // Fallback: Server-side upload if client upload fails
                console.log("[Server Upload] Client upload not used, falling back to server upload");
                const b64 = Buffer.from(req.file.buffer).toString("base64");
                const dataURI = `data:${req.file.mimetype};base64,${b64}`;

                const result = await cloudinary.uploader.upload(dataURI, {
                    resource_type: "auto",
                    folder: "socal_media_uploads",
                    timeout: 300000,
                });

                finalMediaUrl = result.secure_url;
                console.log("[Server Upload] Success:", finalMediaUrl);
            } catch (uploadError) {
                console.error("[Server Upload] Failed:", uploadError);
                throw uploadError;
            }
        } else if (finalMediaUrl) {
            console.log("[Client Upload] Using client-uploaded URL:", finalMediaUrl);
        }

        const newpost = await PostModel.create({
            userId,
            caption,
            image: mediaType === "image" ? finalMediaUrl : null,
            video: mediaType === "video" ? finalMediaUrl : null,
        })

        // notify all followers about the new post (ignore failures)
        try {
            const author = await UserModel.findById(userId).select("followers");
            if (author?.followers?.length) {
                await Promise.all(
                    author.followers.map(fid => createNotification("post", userId, fid, newpost._id))
                );
            }
        } catch (e) {
            console.error("createPost notification error:", e.message);
        }

        return res.status(200).json({
            success: true,
            message: "Post created successfully",
            newpost
        })
    } catch (err) {
        console.error("Create post error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to create post",
            error: err.http_code || err.name || "Unknown error"
        })
    }

}

// get all post

export const getAllPost = async (req, res) => {
    try {
        const posts = await PostModel.find().populate("userId", "username profilePicture").sort({ createdAt: -1 });
        res.json({
            success: true,
            message: "Posts fetched successfully",
            posts
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch posts"
        })

    }

}



// get single Post By Id

export const getSinglePost = async (req, res) => {


}

// delete Post

export const deletePost = async (req, res) => {

    try {
        const { id } = req.params;
        const post = await PostModel.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }
        if (post.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
        await post.deleteOne();
        return res.status(200).json({
            success: true,
            message: "Post deleted successfully",
            id: id
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Failed to delete post"
        })
    }

}

// update Post

export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await PostModel.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }
        if (post.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
        const { caption } = req.body;
        await PostModel.findByIdAndUpdate(id, { caption });
        return res.status(200).json({
            success: true,
            message: "Post updated successfully"
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Failed to update post"
        })
    }
}
