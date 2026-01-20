import { Router } from "express";
import {Login, Register} from "./service.js"

const auth = Router();

auth
    .post("/login", Login)
    .post("/register",Register)
export default auth;
