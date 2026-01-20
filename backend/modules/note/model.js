import mongoose from "mongoose";

const textSegmentSchema = new mongoose.Schema(
    {
        text: { type: String, default: "" },
        bold: { type: Boolean, default: false },
        italic: { type: Boolean, default: false },
        underline: { type: Boolean, default: false },
        color: { type: String, default: "inherit" },
        backgroundColor: { type: String, default: "transparent" },
        href: { type: String, default: null },
    },
    { _id: false }
);

const blockSchema = new mongoose.Schema(
    {
        blockId: { type: String, required: true },
        type: {
            type: String,
            enum: [
                "paragraph",
                "heading_1",
                "heading_2",
                "heading_3",
                "todo",
                "code",
                "quote",
                "line",
                "bulleted_list",
                "numbered_list",
                "toggle",
                "note_call",
                "task_call",
                "image",
            ],
            required: true,
        },
        style: {
            backgroundColor: { type: String, default: "transparent" },
            textAlign: {
                type: String,
                enum: ["left", "center", "right", "justify"],
                default: "left",
            },
        },
        data: {
            richText: [textSegmentSchema],
            checked: { type: Boolean },
            language: { type: String },
            url: { type: String },
            caption: [textSegmentSchema],
        },
    },
    { _id: false }
);

blockSchema.add({
    children: [blockSchema]
});

const noteSchema = new mongoose.Schema(
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
        icon: { type: String },
        cover: { type: String, default: null },
        order: { type: Number, default: 0 },
        access: {
            type: String,
            enum: ["OWNER_ONLY", "TEAM_EDIT", "MEMBER_EDIT"],
            default: null,
        },
        content: [blockSchema],
        isDeleted: { type: Boolean, default: false, index: true },
        path: { type: String, index: true },
    },
    { timestamps: true }
);

noteSchema.index({ title: "text", "content.data.richText.text": "text" });

export default mongoose.model("Note", noteSchema);
