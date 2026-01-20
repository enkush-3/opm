import WorkModel from "../../model.js";

export async function softDeleteWorkspace(req, res) {
    try {
        const userId = req.user.userId;
        const { workspaceId } = req.params;

        const workspace = await WorkModel.findOneAndUpdate(
            {
                _id: workspaceId,
                ownerId: userId,
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

export async function hardDeleteWorkspace(req, res) {
    try {
        const userId = req.user.userId;
        const { workspaceId } = req.params;

        const workspace = await WorkModel.findOneAndDelete({
            _id: workspaceId,
            ownerId: userId,
            isDeleted: true,
        });

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
