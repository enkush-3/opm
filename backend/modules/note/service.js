import { Router } from "express";
import { verifyJWT } from "../middleware.js";

import Note from "../../repository/model/note.js";
import Folder from "../../repository/model/folder.js";
import mongoose from "mongoose";
import pathController from "./patchcontroller.js";
import { checkWorkspacePermission } from "../workspace/permissions.js";

const noteRouter = Router({ mergeParams: true });

const prepareBlocks = (blocks) => {
    if (!blocks || !Array.isArray(blocks)) return [];

    return blocks.map((block) => {
        // Handle position - support both old nested structure and new flat structure
        let position = {
            row: block.position?.row ?? block.order ?? 0,
            col: 0
        };
        
        // Handle migration from old nested col structure
        if (block.position?.col) {
            if (typeof block.position.col === 'object' && block.position.col.col !== undefined) {
                // Old nested structure: col.row and col.col
                position.col = block.position.col.col ?? 0;
            } else if (typeof block.position.col === 'number') {
                // New flat structure
                position.col = block.position.col;
            }
        }

        // Validate and clean richText - ensure it's an array of text segments
        let richText = [];
        if (block.data?.richText) {
            if (Array.isArray(block.data.richText)) {
                richText = block.data.richText.map(segment => ({
                    text: segment.text || "",
                    bold: segment.bold || false,
                    italic: segment.italic || false,
                    underline: segment.underline || false,
                    color: segment.color || "inherit",
                    backgroundColor: segment.backgroundColor || "transparent",
                    href: segment.href || null,
                }));
            } else if (typeof block.data.richText === 'string') {
                // Convert HTML string to richText array (basic conversion)
                richText = [{ text: block.data.richText }];
            }
        }

        const cleanedBlock = {
            blockId: block.blockId || new mongoose.Types.ObjectId().toString(),
            type: block.type,
            position: position,
            style: {
                backgroundColor: block.style?.backgroundColor || "transparent",
                textAlign: block.style?.textAlign || "left",
                paddingLeft: block.style?.paddingLeft || 0,
            },
            data: {
                richText: richText,
                checked: block.data?.checked,
                language: block.data?.language,
                url: block.data?.url,
                caption: block.data?.caption ? (Array.isArray(block.data.caption) ? block.data.caption : []) : [],
            },
            children: block.children ? prepareBlocks(block.children) : [],
        };
        return cleanedBlock;
    });
};

noteRouter.patch("/update/:noteId", verifyJWT, async (req, res) => {
    try {
        const { content, title, ...otherData } = req.body;
        const { noteId } = req.params;
        const { workspaceId } = req.params; // This comes from parent route

        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid note ID format" });
        }

        const note = await Note.findOne({
            _id: noteId,
            workspaceId: workspaceId,
            isDeleted: false,
        });

        if (!note) {
            return res
                .status(404)
                .json({ success: false, message: "Note not found" });
        }

        // Check workspace permission - need edit access
        const permission = await checkWorkspacePermission(
            workspaceId,
            req.user.userId,
            "edit"
        );

        if (!permission.hasAccess) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to edit this note",
            });
        }

        if (title) note.title = title;

        if (content) {
            note.content = prepareBlocks(content);
        }

        Object.assign(note, otherData);

        await note.save();
        res.status(200).json({ success: true, data: note });
    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
});
noteRouter.post("/create", verifyJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { workspaceId } = req.params;

        // Check workspace permission - need edit access
        const permission = await checkWorkspacePermission(
            workspaceId,
            userId,
            "edit"
        );

        if (!permission.hasAccess) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to create notes in this workspace",
            });
        }

        const { folderId, title } = req.body;

        const newNoteId = new mongoose.Types.ObjectId();
        let finalPath = `,${workspaceId}`;

        if (folderId) {
            const folder = await Folder.findOne({ _id: folderId, workspaceId });
            if (folder) {
                finalPath = folder.path;
            }
        }

        finalPath = `${finalPath},${newNoteId}`;

        const note = new Note({
            userId,
            _id: newNoteId,
            workspaceId,
            folderId: folderId || null,
            path: finalPath,
            title: title || "Untitled",
        });

        await note.save();

        res.status(200).json({
            success: true,
            data: note,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error creating note",
            error: error.message,
        });
    }
});
noteRouter.get("/get/:noteId", verifyJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { workspaceId, noteId } = req.params;

        // Check workspace permission
        const permission = await checkWorkspacePermission(
            workspaceId,
            userId,
            "view"
        );

        if (!permission.hasAccess) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to view this note",
            });
        }

        const note = await Note.findOne({
            _id: noteId,
            workspaceId: workspaceId,
            isDeleted: false,
        }).select("-path");

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        res.status(200).json({
            success: true,
            data: note,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error fetching note",
            error: error.message,
        });
    }
});
noteRouter.get("/getall", verifyJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { workspaceId } = req.params;

        // Check workspace permission
        const permission = await checkWorkspacePermission(
            workspaceId,
            userId,
            "view"
        );

        if (!permission.hasAccess) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to view notes in this workspace",
            });
        }

        const notes = await Note.find({
            workspaceId: workspaceId,
            isDeleted: false,
        })
            .sort({ updatedAt: -1 })
            .select("-path");

        res.status(200).json({
            success: true,
            data: notes,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error fetching notes",
            error: error.message,
        });
    }
});

export default noteRouter;
