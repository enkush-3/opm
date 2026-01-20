import Note from "../../model.js";

export async function updateNote(req, res) {
    try {
        const { userId } = req.user;
        const { wokrspaceid } = req.query;
        const { noteId } = req.params;
        const { createdBy, access, extend } = req.body;

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

        const updateNote = await Note.findOneAndUpdate(
            {
                _id: noteId,
                isDeleted: false,
            },
            {
                $set: {
                    createdBy: createdBy,
                    access: access,
                    extend: extend,
                },
                $inc: { __v: 0.1 },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            data: updateNote,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error getting note",
            error: error.message,
        });
    }
}


export async function restoreNote(req, res) {
    try {
        const { userId } = req.user;
        const { wokrspaceid } = req.params;
        const { noteId } = req.params;

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

        const updateNote = await Note.findOneAndUpdate(
            {
                _id: noteId,
                isDeleted: true,
            },
            {
                $set: {
                    isDeleted: false
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            data: updateNote,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error getting note",
            error: error.message,
        });
    }
}
