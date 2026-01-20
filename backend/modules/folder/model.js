import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
    {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true,
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Folder",
            default: null,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        icon: { type: String },
        access: {
            type: String,
            enum: ["TEAM_EDIT", "MEMBER_EDIT", "MEMBER_ONLY"],
            default: "MEMBER_EDIT",
        },
        extend: { type: Boolean, default: true },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        order: {
            type: Number,
            default: () => Date.now(),
            index: true,
        },
        path: { type: String, index: true },
    },
    { timestamps: true }
);

folderSchema.index({ title: "text" });

export default mongoose.model("Folder", folderSchema);

