import { Router } from "express";
import auth from "./modules/auth/routes.js";
import workspace from "./modules/workspace/routes.js";
import memberRouter from "./modules/members/routes.js";
import folder from "./modules/folder/routes.js";
import note from "./modules/note/routes.js";

const router = Router();

router.use("/auth", auth);
router.use("/workspace", workspace);
router.use("/members", memberRouter)
router.use("/folder", folder);
router.use("/note", note);
// router.use("/task", task);

export default router;