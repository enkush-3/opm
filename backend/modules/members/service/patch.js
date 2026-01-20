import WorkModel from "../../workspace/model.js";
import MemberModel from "../model.js";

export async function updateMember(req, res) {
    try {
        const userId = req.user.userId;
        const { workspaceId } = req.params;
        const { memberId } = req.query;
        const updatedData = req.body;

        const workspace = await WorkModel.findOne({
            _id: workspaceId,
            ownerId: userId,
            isDeleted: false,
        });

        if (!workspace) {
            return res.status(403).json({
                message: "Only owner can view members or workspace not found",
            });
        }

        const updated = await MemberModel.findOneAndUpdate(
            {
                workspaceId: workspaceId,
                userId: memberId,
            },
            {
                $set: {
                    updatedData,
                },
                $inc: {
                    __v: 0.1,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        ).lean();

        return res.json({
            data: updated,
            role: "owner",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}
