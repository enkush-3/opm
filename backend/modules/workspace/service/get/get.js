import WorkModel from "../../model.js";
import Folder from "../../../folder/model.js";
import Note from "../../../note/model.js";
import Task from "../../../task/model.js";
import MemberModel from "../../../members/model.js";

import mongoose from "mongoose";

// 1. GET all workspace
export async function getAllWorkspace(req, res) {
    try {
        const userId = req.user.userId;

        const allWorkspaces = await WorkModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                },
            },
            {
                $lookup: {
                    from: "members",
                    localField: "_id",
                    foreignField: "workspaceId",
                    as: "members",
                },
            },
            {
                $match: {
                    $or: [
                        { ownerId: new mongoose.Types.ObjectId(userId) },
                        {
                            "members.userId": new mongoose.Types.ObjectId(
                                userId
                            ),
                        },
                    ],
                },
            },
            {
                $project: {
                    path: 0,
                },
            },
        ]);

        return res.json({
            success: true,
            data: allWorkspaces,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            mesage: "Server error",
            error: error.message,
        });
    }
}

// 2. GET one workspace
export async function getWorkspace(req, res) {
    try {
        const userId = req.user.userId;
        const { workspaceId } = req.params;

        const workspace = await WorkModel.findOne({
            _id: workspaceId,
            isDeleted: false,
        }).select("-path");

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }
        if (workspace.shareType !== "public") {
            return res.status(404).json({message: "Invalid Workspace",});
        }

        if (workspace.ownerId.equals(userId)) {
            return res.json({
                success: true,
                data: workspace,
                role: "owner",
            });
        }

        const member = await MemberModel.findOne({
            workspaceId: workspaceId,
            userId: userId,
        });
        if (!member) {
            return res.json({
                success: false,
                message: "Access denied",
            });
        }

        return res.json({
            success: true,
            data: workspace,
            role: member.permission,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            mesage: "Server error",
            error: error.message,
        });
    }
}

// Get Lazy Workspace
export async function getLazyWorkspace(req, res) {
    try {
        const { workspaceId } = req.params;
        const userId = req.user.userId;

        const workspace = await WorkModel.findOne({
            _id: workspaceId,
            isDeleted: false,
        }).select("-path");

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        if (workspace.shareType !== "public") {
            return res.status(404).json({message: "Invalid Workspace",});
        }

        const [folder, note, task] = await Promise.all([
            Folder.find({
                workspaceId: workspaceId,
                parentId: null,
                isDeleted: false,
            })
                .lean()
                .select("-path -ownerId")
                .sort({ order: 1 }),
            Note.find({
                workspaceId: workspaceId,
                folderId: null,
                isDeleted: false,
            })
                .lean()
                .select("-path -ownerId")
                .sort({ order: 1 }),
            Task.find({
                workspaceId: workspaceId,
                folderId: null,
                isDeleted: false,
            })
                .lean()
                .select("-path -ownerId")
                .sort({ order: 1 }),
        ]);

        if (workspace.ownerId.equals(userId)) {
            return res.json({
                success: true,
                data: {
                    workspace: workspace,
                    folder: folder,
                    note: note,
                    task: task,
                },
                role: "owner",
            });
        }

        const member = await MemberModel.findOne({
            workspaceId: workspaceId,
            userId: userId,
        });
        if (!member) {
            return res.json({
                success: false,
                message: "Access denied",
            });
        }

        res.json({
            success: true,
            data: {
                workspace: workspace,
                folder: folder,
                note: note,
                task: task,
            },
            role: member.permission,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            mesage: "Server error",
            error: error.message,
        });
    }
}
