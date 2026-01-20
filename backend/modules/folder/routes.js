import { Router } from "express";
import { createFolder } from "./service/post/post.js"
import {
    getFolder,
    getLazyFolder,
} from "./service/get/get.js"
import { updateFolder } from "./service/patch/patch.js";
import { Auth } from "../auth/auth.js";

const folderRouter = Router();

folderRouter.post("/create", Auth, createFolder);

folderRouter.get("/:folderId", Auth, getFolder);
folderRouter.get("/getlazy/:folderId", Auth, getLazyFolder);


folderRouter.patch("/update/:folderId", Auth, updateFolder);

export default folderRouter;