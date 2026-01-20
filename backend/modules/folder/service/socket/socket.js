export const setupFolderSocket = (io) => {
    io.on("connection", (socket) => {
        socket.on("join-folder", ({ folderId }) => {
            if (!folderId) {
                return;
            }
            socket.join(folderId.toString());
            socket.emit("folder", {
                message: "Одоо та real-time мэдээлэл авна.",
            });
        });
    });
};
