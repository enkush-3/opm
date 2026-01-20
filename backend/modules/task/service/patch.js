import WorkModel from "../../workspace/model.js";
import Task from "../model.js";
import MemberModel from "../../members/model.js";

export async function updateTask(req, res) {
    try {
        const { userId } = req.user;
        const { wokrspaceid } = req.query;
        const { taskId } = req.params;
        const updateData = req.body;

        const workspace = await WorkModel.findOne({
            _id: wokrspaceid,
            isDeleted: false,
        });

        if (!workspace) {
            return res.status(400).json({
                message: "Workspace not found",
            });
        }

        if (!workspace.ownerId.equals(userId)) {
            const member = MemberModel.findOne({
                wokrspaceid: wokrspaceid,
                userId: userId,
            });

            if (!member) {
                return res.status(400).json({
                    message: "Member not found",
                });
            }

            if (member.permission !== "edit") {
                return res.status(400).json({
                    message: "Member can't edited",
                });
            }
        }

        const task = await Task.findOneAndUpdate(
            {
                _id: taskId,
                isDeleted: false,
            },
            {
                $set: { updateData },
                $inc: {
                    __v: 0.1,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        return res.status(200).json({
            data: task,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error getting note",
            error: error.message,
        });
    }
}
