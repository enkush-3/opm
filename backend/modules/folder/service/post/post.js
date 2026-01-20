import WorkModel from "../../../workspace/model.js";
import Folder from "../../model.js";

export async function createFolder(req, res) {
    try {
        const userId = req.user.userId;
        const { workspaceId } = req.query;
        const { parentId, order, title } = req.body;

        const workspace = await WorkModel.findOne({
            _id: workspaceId,
            isDeleted: false,
        });

        if (!workspace) {
            return res
                .status(404)
                .json({ succes: false, message: "Workspace not found" });
        }

        let canEdit = false;

        if (workspace.ownerId.equals(userId)) {
            canEdit = true;
        } else {
            const member = await MemberModel.findOne({
                workspaceId,
                userId,
                permission: "edit",
            });
            if (member) canEdit = true;
        }

        if (!canEdit) {
            return res.status(403).json({
                message: "Permission denied",
            });
        }

        const folder = new Folder({
            createdBy: userId,
            title: title || "Unknown",
            workspaceId,
            parentId: parentId || null,
            order,
        });

        if (parentId) {
            const parent = await Folder.findOne({
                _id: parentId,
                workspaceId,
                isDeleted: false,
            });

            if (!parent) {
                return res
                    .status(400)
                    .json({ message: "Invalid parent folder" });
            }

            folder.path = `${parent.path},${folder._id}`;
        } else {
            folder.path = `${workspace.path},${folder._id}`;
        }

        await folder.save();

        return res.status(200).json({
            message: "Folder created successfully",
            data: folder,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error creating folder",
            error: error.message,
        });
    }
}
