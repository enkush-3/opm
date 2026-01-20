import MemberModel from "../model.js";
import WorkModel from "../../workspace/model.js";

export async function getAllMembers(req, res) {
    try {
        const userId = req.user.userId;
        const { workspaceId } = req.params;

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

        const members = await MemberModel.find({
            workspaceId,
        }).lean();

        return res.json({
            data: members,
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

export async function getMembers(req, res) {
    try {
        const userId = req.user.userId;
        const { workspaceId, memberId } = req.params;

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

        const member = await MemberModel.findOne({
            workspaceId,
            memberId,
        }).lean();

        return res.json({
            data: member,
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
