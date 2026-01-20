import WorkModel from "../../workspace/model.js";
import Folder from "../../folder/model.js";
import Task from "../model.js";

export async function createTask(req, res) {
    try {
        const { userId } = req.user;
        const { workspaceId, folderId } = req.params;
        const taskData = req.body;

        const workspace = await WorkModel.findById(workspaceId);

        if (!workspace) {
            return res.status(200).json({
                message: "Workspace not found",
            });
        }

        let finalPath = `,${workspaceId}`;

        if (folderId) {
            const folder = await Folder.findById(folderId);

            if (!folder) {
                return res.status(400).json({
                    message: "Folder not found",
                });
            }

            if (folder.createdBy === userId && workspace.ownerId === userId) {
                return req.satus(400).json({
                    message: "Cannot create a note in someone else's folder",
                });
            }
            finalPath = folder.path;
        }

        const task = new Task({
            createdBy: userId,
            workspaceId: workspaceId,
            folderId: folderId || null,
            title: taskData.title || "Unknown",
            description: taskData.description || "",
            status: taskData.status || "To do",
            icon: taskData.icon || "",
            startAt: taskData.startAt || Date.now(),
            endAt: taskData.endAt || Date.now() + 1,
            noteIds: taskData.noteIds || [],
            taskIds: taskData.taskIds || [],
            order: taskData.order || 0,
        });

        task.path = `${finalPath},${task._id}`;

        await task.save();

        return res.status(200).json({
            data: task,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error creating note",
            error: error.message,
        });
    }
}
