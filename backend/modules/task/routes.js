import Router from "express";
import { Auth } from "../auth/auth.js";

import { createTask } from "./service/post.js";
import { getTask } from "./service/get.js";
import { updateTask } from "./service/patch.js"

const taskRouter = Router();

taskRouter.use("/create", Auth, createTask);
taskRouter.use("get/:taskId", Auth, getTask);
taskRouter.use("update/:taskId", Auth, updateTask);

export default taskRouter;
