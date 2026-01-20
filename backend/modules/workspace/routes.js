import { Router } from "express";
import { Auth } from "../auth/auth.js";
import {
    getWorkspace,
    getAllWorkspace,
    getLazyWorkspace,
} from "./service/get/get.js";
import { createWorkspace, leaveWorkspace } from "./service/post/post.js";
import { patchWorkspace, restoreWorkspace } from "./service/patch/patch.js";
import {
    hardDeleteWorkspace,
    softDeleteWorkspace,
} from "./service/delete/delete.js";
const workspace = Router();

workspace.post("/create", Auth, createWorkspace);
workspace.post("/leave/:workspaceId", Auth, leaveWorkspace);

workspace.patch("/update/:workspaceId", Auth, patchWorkspace);
workspace.patch("/restore/:workspaceId", Auth, restoreWorkspace);

workspace.get("/getall", Auth, getAllWorkspace);
workspace.get("/getlazy/:workspaceId", Auth, getLazyWorkspace);
workspace.get("/:workspaceId", Auth, getWorkspace);

workspace.delete(":workspaceId", Auth, softDeleteWorkspace);
workspace.delete("/hard/:workspaceId", Auth, hardDeleteWorkspace);

export default workspace;
