import Note from "../../model.js";
import WorkModel from "../../../workspace/model.js";

export async function getNote(req, res) {
    try {
        const { userId } = req.user;
        const { workspaceId } = req.query;
        const { noteId } = req.params;

        const workspace = await WorkModel.findById(workspaceId);

        if (!workspace) {
            return res.status(400).json({
                message: "Workspace Not Found",
            });
        }

        if (workspace.shareType === "public ") {
            return res.status(200).json({ message: "Invalid Workspace" });
        }

        const note = await Note.findOne({
            _id: noteId,
            workspaceId: workspaceId,
            isDeleted: false,
            access: { $in: ["TEAM_EDIT", "MEMBER_EDIT", "MEMBER_ONLY"] },
        }).select("-path");

        if (!note) {
            return res.status(400).json({
                message: "Note not found",
            });
        }

        if (workspace.ownerId.equals(userId)) {
            return res.status(200).json({
                data: note,
                role: "owner",
            });
        }

        const member = await MemberModel.findOne({
            workspaceId: workspaceId,
            userId: userId,
        });

        if (!member) {
            return res.status(400).json({
                message: "Access denied",
            });
        }

        res.status(200).json({
            data: note,
            role: member.permission,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error creating note",
            error: error.message,
        });
    }
}

export async function getWorkspaceNotes(req, res) {
    try {
        const { userId } = req.user;
        const { workspaceId } = req.params;

        const [workspace, members] = await Promise.all([
            WorkModel.findOne({
                _id: workspaceId,
                isDeleted: false,
            }),
            MemberModel.findOne({
                workspaceId: workspaceId,
                userId: userId,
            }),
        ]);

        if (!workspace) {
            return res.status(400).json({
                message: "Workspace not found",
            });
        }

        let isOwner = workspace.ownerId.toString() === userId.toString();

        if (!isOwner && !members) {
            return res.status(400).json({
                message: "You don't have view this tasks",
            });
        }

        const notes = await Note.find({
            workspaceId: workspaceId,
            isDeleted: false,
            access: { $in: ["TEAM_EDIT", "MEMBER_EDIT", "MEMBER_ONLY"] },
        }).select("-path");

        res.status(200).json({
            data: notes,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error getting note",
            error: error.message,
        });
    }
}
