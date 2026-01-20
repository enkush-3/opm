import Router from "express"
import { Auth } from "../auth/auth.js";
import { getAllMembers, getMembers } from "./service/get.js"
import { updateMember } from "./service/patch.js";

const memberRouter = Router();

memberRouter.get("/:workspaceId", Auth, getAllMembers);
memberRouter.get("/get/:workspaceId", Auth, getMembers);
memberRouter.patch("/update/:workspaceId", Auth, updateMember);


export default memberRouter;