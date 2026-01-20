import mongoose from "mongoose";

const workSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ownerId",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            default: "My Workspace",
        },
        path: {
            type: String,
            index: true,
        },
        icon: { type: String },
        shareType: {
            type: String,
            enum: ["private", "public", "share_link"],
            default: "private",
            index: true,
        },
        shareLink: {
            type: String,
            unique: true,
            sparse: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

workSchema.index({ title: "text" });

export default mongoose.model("Workspace", workSchema);
