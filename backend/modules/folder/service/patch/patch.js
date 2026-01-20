import Folder from "../../model.js";
import WorkModel from "../../../workspace/model.js";
import MemberModel from "../../../members/model.js";

export async function updateFolder(req, res) {
    try {
        const userId = req.user.userId;
        const { workspaceId } = req.query;
        const { folderId } = req.params;
        const { title, icon, order } = req.body;

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
        let canEdit = members && members.permission === "edit";

        if (!isOwner && !canEdit) {
            return res.status(400).json({
                message: "You don't have permission to update this folder",
            });
        }

        const updateFolder = await Folder.findOneAndUpdate(
            {
                _id: folderId,

                workspaceId: workspaceId,
                isDeleted: false,
            },
            {
                $set: {
                    title: title,
                    order: order,
                    icon: icon,
                },
                $inc: {
                    __v: 0.01,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            data: updateFolder,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}

export async function changeAccessFolder(req, res) {
    try {
        const { userId } = req.user;
        const { workspaceId } = req.query;
        const { folderId } = req.params;
        const { access, extend } = req.body;

        const worksapce = await WorkModel.findOne({
            _id: workspaceId,
            ownerId: userId,
            isDeleted: false,
        });

        if (!worksapce) {
            return res.status(400).json({
                message: "Worksapce not found",
            });
        }

        const updateFolder = await FolderModel.findOneAndUpdate(
            {
                _id: folderId,
                isDeleted: false,
            },
            {
                $set: {
                    access: access,
                    extend: extend && { extend: extend },
                },
                $inc: {
                    __v: 0.1,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            data: updateFolder,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}

export async function changeParenFolder(req, res) {
    try {
        const { userId } = req.user;
        const { workspaceId } = req.query;
        const { folderId } = req.params;
        const { parentId } = req.body;

        const worksapce = await WorkModel.findOne({
            _id: workspaceId,
            isDeleted: false,
        });

        if (!worksapce) {
            return res.status(400).json({
                message: "Worksapce not found",
            });
        }

        if (parentId === undefined) {
            if (!worksapce.ownerId.equals(userId)) {
                return res.status(400).json({
                    message: "Only the owner can edit the root folder.",
                });
            }
        }

        const updateFolder = await FolderModel.findOneAndUpdate(
            {
                _id: folderId,
                isDeleted: false,
            },
            {
                $set: {
                    parentId: parentId,
                },
                $inc: {
                    __v: 0.1,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            data: updateFolder,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}

export async function restoreFolder(req, res) {
    try {
        const userId = req.user.userId;
        const { folderId } = req.params;
        const { workspaceId } = req.query;

        const workspace = await WorkModel.findOne({
            _id: workspaceId,
            isDeleted: false,
        });
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        if (!workspace.ownerId.equals(userId)) {
            const member = await MemberModel.findOne({
                workspaceId: workspaceId,
                userId: userId,
            });
            if (!member) {
                return res.status(400).json({
                    message: "The workspace owner member has access.",
                });
            }
        }

        const folder = await Folder.findOneAndUpdate(
            {
                _id: folderId,
                isDeleted: true,
            },
            {
                $set: {
                    isDeleted: false,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        return res.json({
            data: folder,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            mesage: "Server error",
            error: error.message,
        });
    }
}
