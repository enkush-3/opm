import Note from "../../model.js"

export async function softDeleteNote(req, res) {
    try {
        const userId = req.user.userId;
        const { noteId } = req.params;
        const { workspaceId } = req.query;

        const workspace = await WorkModel.findOne({
            _id: workspaceId,
            isDelete: false,
        }).select("ownerId isDeleted");
        
        if (!workspace) {
            return res.status(400).json({
                message: "Worksapce not found",
            });
        }

        const isOwner = workspace.ownerId.equals(userId);
        
        if (!isOwner) {
            const member = await MemberModel.findOne({
                workspaceId: workspaceId,
                userId: userId,
            });

            if (!member || member.permission === "edit") {
                return res.status(403).json({
                    message: "You don't have permission to edit/delete in this workspace",
                });
            }
        }

        const note = await Note.findOneAndUpdate(
            {
                _id: noteId,
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
        if (!note) {
            return res.status(404).json({ message: "Folder not found" });
        }

        return res.json({
            data: note,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            mesage: "Server error",
            error: error.message,
        });
    }
}

export async function hardDeleteNote(req, res) {
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
                message: "Only the owner can deleted the note."
            })
        }

        const folder = await FolderModel.findOneAndDelete({
            _id: folderId,
            isDeleted: true,
        });

        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }

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