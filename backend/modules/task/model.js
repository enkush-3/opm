import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
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
        folderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Folder",
            default: null,
            index: true,
        },
        title: { type: String, required: true, trim: true },
        description: { type: String, default: "", trim: true },
        noteIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }],
        taskIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
        status: {
            type: String,
            enum: ["To do", "In process", "Done"],
            default: "To do",
            index: true,
        },
        icon: { type: String },
        startAt: { type: Date, default: Date.now() },
        endAt: { type: Date, default: Date.now() },
        order: { type: Number, default: 0 },
        access: {
            type: String,
            enum: ["OWNER_ONLY", "TEAM_EDIT", "MEMBER_EDIT"],
            default: null,
        },
        path: { type: String, index: true },
        isDeleted: { type: Boolean, default: false, index: true },
    },
    { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
