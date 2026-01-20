import { Router } from "express";
import { createNote } from "./service/post/post.js";
import { getNote } from "./service/get/get.js";

import { Auth } from "../auth/auth.js";

const noteRouter = Router();

noteRouter.post("/create", Auth, createNote);
noteRouter.get("/get/:noteId", Auth, getNote);


export default noteRouter;
