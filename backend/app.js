import express from "express";
import mongoose from "mongoose";
import router from "./routers.js";
import dotenv from "dotenv"
import cors from "cors"
import http from "http"

import { Server } from "socket.io";
// import { setupNoteSocket } from "./modules/note/service/socket.js";
// import { setupWorkspaceSocket } from "./modules/workspace/service/socket.js"
// import { setupFolderSocket} from "./modules/folder/service/socket.js"
import { socketAuth } from "./middleware/Authorization.js";

dotenv.config();
const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ["GET", "POST"],
        credentials: true
    }
});

const PORT = 3000;

app.set("io", io); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

io.use(socketAuth);
// setupNoteSocket(io);
// setupWorkspaceSocket(io);
// setupFolderSocket(io);


async function connectDB(){
    try{
        await mongoose.connect("mongodb://localhost:27017/onote")
        console.log("Mongodb connected")
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}

async function startServer() {
  await connectDB();
  
  app.use("/api", router);
  server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
