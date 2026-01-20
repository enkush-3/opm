import WorkModel from "../../model.js";

export async function patchWorkspace(req, res) {
    try {
        const userId = req.user.userId;
        const { workspaceId } = req.params;
        const { title, icon, shareType } = req.body;

        const updateData = {
            title: title,
            icon: icon,
            shareType: shareType,
        };

        const workspace = await WorkModel.findOneAndUpdate(
            {
                _id: workspaceId,
                ownerId: userId,
                isDeleted: false,
            },
            {
                $set: updateData,
                $inc: {
                    __v: 0.1,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        ).select("-path");

        const io = req.app.get("io");

        if (io) {
            io.to(workspaceId.toString()).emit("workspace", {
                workspaceId,
                updateData: workspace,
            });
        }

        return res.status(200).json({
            success: true,
            data: workspace
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
}

export async function switchWorkspaceOwner(req, res) {
    try {
        const userId = req.user.userId;
        const { workspaceId } = req.params;

        const { memberId } = req.query;

        const member = await MemberModel.findOne({
            workspaceId: workspaceId,
            userId: memberId,
        });

        if (!member) {
            return res.staus(400).json({
                success: false,
                message: "Member is Not Found",
            });
        }

        const workspace = await WorkModel.findOneAndUpdate(
            {
                _id: workspaceId,
                ownerId: userId,
                isDeleted: false,
            },
            {
                $set: {
                    ownerId: member.userId,
                },
                $inc: {
                    __v: 0.1,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        ).select("-path");

        const io = req.app.get("io");

        if (io) {
            io.to(workspaceId.toString()).emit("workspace", {
                workspaceId,
                updateData: workspace,
            });
        }

        return res.status(200).json({
            success: true,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
}

export async function restoreWorkspace(req, res) {
    try {
        const userId = req.user.userId;
        const { workspaceId } = req.params;

        const workspace = await WorkModel.findOneAndUpdate(
            {
                _id: workspaceId,
                ownerId: userId,
                isDeleted: true,
            },
            {
                $set: {
                    isDelete: false,
                },
                $inc: {
                    __v: 1,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        const io = req.app.get("io");

        if (io) {
            io.to(workspaceId.toString()).emit("workspace", {
                workspaceId,
                updateData: workspace,
            });
        }

        return res.json({
            data: workspace,
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
