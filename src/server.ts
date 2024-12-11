import { Server } from "http";
import { app } from "./app";
import defaultSeeding from "./app/db/seed";

let server: Server;
const port = process.env.PORT || 5000;

async function connectServer() {
  try {
    defaultSeeding();
    server = app.listen(port, () =>
      console.log(`🔥 The server is running on ${port} port`)
    );
  } catch (error) {
    console.log(`🥴 Error found in server connection time`);
  }
}

connectServer();

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  if (server) {
    server.close(() => {
      console.error("Server closed due to unhandled rejection");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  if (server) {
    server.close(() => {
      console.log("Server closed due to SIGTERM");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on("SIGINT", () => {
  console.log("SIGINT received");
  if (server) {
    server.close(() => {
      console.log("Server closed due to SIGINT");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
