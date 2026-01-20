import WorkModel from "../../model.js";

export async function createWorkspace(req, res) {
    try {
        const ownerId = req.user.userId;
        const { title, icon } = req.body;

        const workspace = WorkModel({
            ownerId: ownerId,
            title: title || "My Workspace",
            icon: icon,
        });

        workspace.path = `,${workspace._id}`;

        await workspace.save();

        res.status(200).json({
            success: true,
            message: "Workspace created successfully",
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

export async function leaveWorkspace(req, tes) {
    try {
        const userId = req.user.userId;
        const { workspaceId } = req.query;

        const workspace = await WorkModel.findOne({
            _id: workspaceId,
            isDeleted: false,
        });

        if (!workspace) {
            return res.status(400).json({
                success: false,
                message: "Workspace not found",
            });
        }

        const member = await MemberModel.findOneAndDelete({
            userId: userId,
            workspaceId: workspaceId,
        });

        if (!member) {
            return res.status(400).json({
                message: "Member not found",
            });
        }

        res.status(200).json({
            success: false,
            data: updateFolder,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
}
