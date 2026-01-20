import Note from "../../model.js";
import Folder from "../../../folder/model.js";
import WorkModel from "../../../workspace/model.js"

export async function createNote(req, res) {
    try {
        const userId = req.user.userId;
        const { workspaceId } = req.query;
        const { folderId, order, title } = req.body;

        const workspace = await WorkModel.findById(workspaceId);

        if(!workspace){
                return res.status(400).json({
                    message: "Workspace not found"
                });
            }

        let finalpath = `,${workspaceId}`;

        if (folderId) {
            const folder = Folder.findById(folderId);
            
            if(!folder){
                return res.status(400).json({
                    message: "Folder not found"
                });
            }

            if (folder.createdBy === userId && workspace.ownerId === userId) {
                return res.status(400).json({
                    message: "Cannot create a note in someone else's folder",
                });
            }
            finalpath = folder.path;
        }

        const note = await Note({
            createdBy: userId,
            workspaceId,
            folderId: folderId || null,
            title: title || "Unknown",
            order: order || 0,
        });

        note.path = `${finalpath}` + `,${note._id}`;
        await note.save();
        return res.status(200).json({
            data: note,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error creating note",
            error: error.message,
        });
    }
}

export async function duplicateNote(req, res) {
    try{
        const userId = req.user.userId;
        const { workspaceId, noteId} = req.query;

         const workspace = WorkModel.findById(workspaceId);

        if(!workspace){
            return res.status(400).json({
                message: "Workspace not found"
            });
        } 

        if(!workspace.ownerId.equals(userId)){
            const member = await MemberModel.finsOne({
                workspaceId: workspaceId,
                userId: userId,
                permission: "edit"
            });

            if(!member){
                return res.status(400).json({
                    message: "Member permission to edit is required."
                });
            }
        }

        const duplicate = await Note.findOne({
            _id: noteId,
            isDeleted: false,
            access: { $in: ["TEAM_EDIT", "MEMBER_EDIT"] }
        });

        duplicate.title = `${duplicate.title} copy`;
        duplicate.order = duplicate.order + 1;


    }catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error creating note",
            error: error.message,
        });
    }
}
