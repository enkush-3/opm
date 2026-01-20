import FolderModel from "../../model.js";

export async function softDeleteFolder(req, res) {
    try {
        const userId = req.user.userId;
        const { folderId } = req.params;
        const { workspaceId } = req.query;

        const workspace = await WorkModel.findOne({
            _id: workspaceId,
            isDelete: false,
        });
        if (!workspace) {
            return res.status(400).json({
                message: "Worksapce not found",
            });
        }

        if (!workspace.ownerId.equals(userId)) {
            const member = await MemberModel.findOne({
                workspaceId,
                userId,
                permission: "edit",
            });
            if (!member) {
                return res.status(400).json({
                    message: "Member not found",
                });
            }
            const memberId = member.userId;
        }

        const folder = await FolderModel.findOneAndUpdate(
            {
                _id: folderId,
                createdBy: memberId,
                isDeleted: false,
            },
            {
                $set: {
                    isDelete: true,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );
        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }

        return res.json({
            data: workspace,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            mesage: "Server error",
            error: error.message,
        });
    }
}

export async function hardDeleteFolder(req, res) {
    try {
        const userId = req.user.userId;
        const { folderId } = req.params;
        const { workspaceId } = req.query;

        const workspace = await WorkModel.findOne({
            _id: workspaceId,
            isDelete: false,
        });
        if (!workspace) {
            return res.status(400).json({
                message: "Worksapce not found",
            });
        }

        if (!workspace.ownerId.equals(userId)) {
            return res.status(400).json({
                message: "Only the owner can delete the folder.",
            });
        }

        const folder = await FolderModel.findOneAndDelete({
            _id: folderId,
            isDeleted: true,
        });

        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }

        return res.status(200).json({
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
