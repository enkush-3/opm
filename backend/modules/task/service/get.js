import WorkModel from "../../workspace/model.js";
import Task from "../model.js";

export async function getTask(req, res) {
    try {
        const { userId } = req.user;
        const { taskId } = req.params;
        const { workspaceId } = req.query;

        const workspace = WorkModel.find({
            _id: workspaceId,
            isDeleted: false,
        });

        if (!workspace) {
            return res.status(400).json({
                message: "Workspace not found ",
            });
        }

        if (workspace.shreType === "public") {
            return res.status(400).json({
                message: "Invalid Task"
            });
        }

        const task = Task.findOne({
            _id: taskId,
            createdBy: userId,
            workspaceId: workspaceId,
            isDeleted: false,
        }).select("path");

        if (!task) {
            return res.status(400).json({
                message: "Task not found",
            });
        }

        if (workspace.ownerid.equals(userId)) {
            return res.status(200).json({
                data: task,
                role: owner,
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
            message: "Error getting task",
            error: error.message,
        });
    }
}
