import { Server } from "socket.io";

export default async function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
        const message = { senderId, receiverId, content, status: "sent" };
        io.emit("message", message);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  }

  res.end();
}
