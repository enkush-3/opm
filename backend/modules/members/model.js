import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
    {
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        permission: {
            type: String,
            enum: ["view", "edit"],
            default: "view",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Member", memberSchema);
