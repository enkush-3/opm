import Folder from "../../model.js"
import Note from "../../../note/model.js";
import Task from "../../../task/model.js";
import WorkModel from "../../../workspace/model.js";

export async function getFolder(req, res) {
    try {
        const userId = req.user.userId;
        const { folderId } = req.params;
        const { workspaceId } = req.query;

        const workspace = await WorkModel.findOne({
            _id: workspaceId,
            isDeleted: false,
        });

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        if (workspace.shareType !== "public") {
            return res.status(404).json({ message: "Invalid Workspace" });
        }

        const folder = await Folder.findOne({
            _id: folderId,
            workspaceId,
            isDeleted: false,
        }).select("-path");

        if (!folder) {
            return res.status(404).json({
                message: "Folder not found",
            });
        }

        if (workspace.ownerId.equals(userId)) {
            return res.json({
                data: folder,
                role: "owner",
            });
        }
        const member = await MemberModel.findOne({
            workspaceId,
            userId,
        });

        if (!member) {
            return res.status(403).json({
                message: "Access denied",
            });
        }

        return res.json({
            data: folder,
            role: member.permission,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}

export async function getLazyFolder(req, res) {
    try {
        const userId = req.user.userId;
        const { folderId } = req.params;
        const { workspaceId } = req.query;

        const workspace = await WorkModel.findOne({
            _id: workspaceId,
            isDeleted: false,
        });

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }
        if (workspace.shareType !== "public") {
            return res.status(404).json({ message: "Invalid Workspace" });
        }

        const folder = await Folder.findOne({
            _id: folderId,
            workspaceId,
            isDeleted: false,
        });

        if (!folder) {
            return res.status(404).json({
                message: "Folder not found",
            });
        }

        const [folders, notes, tasks] = await Promise.all([
            Folder.find({
                workspaceId: workspaceId,
                parentId: folderId,
                isDeleted: false,
            })
                .lean()
                .select("-path")
                .sort({ order: 1 }),
            Note.find({
                workspaceId: workspaceId,
                folderId: folderId,
                isDeleted: false,
            })
                .lean()
                .select("-path")
                .sort({ order: 1 }),
            Task.find({
                workspaceId: workspaceId,
                folderId: folderId,
                isDeleted: false,
            })
                .lean()
                .select("-path")
                .sort({ order: 1 }),
        ]);

        if (workspace.ownerId.equals(userId)) {
            return res.json({
                data: {
                    folder: folders,
                    note: notes,
                    task: tasks,
                },
                role: "owner",
            });
        }

        const member = await MemberModel.findOne({
            workspaceId,
            userId,
        });

        if (!member) {
            return res.status(403).json({
                message: "Access denied",
            });
        }

        return res.json({
            data: {
                folder: folders,
                note: notes,
                task: tasks,
            },
            role: member.permission,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}
