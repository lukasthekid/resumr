import "dotenv/config";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { Client } from "ssh2";

function stripQuotes(s) {
  if (!s) return s;
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function expandHome(p) {
  if (!p) return p;
  if (p.startsWith("~")) {
    const home = process.env.HOME || process.env.USERPROFILE || "";
    return path.join(home, p.slice(1));
  }
  return p;
}

const SSH_HOST = process.env.SSH_HOST || "5.75.171.23";
const SSH_PORT = Number(process.env.SSH_PORT || 22);
const SSH_USERNAME = process.env.SSH_USERNAME;
const SSH_KEY_PATH = expandHome(stripQuotes(process.env.SSH_KEY_PATH));

const DB_TUNNEL_PORT = Number(process.env.DB_TUNNEL_PORT || 5433);
const DB_REMOTE_PORT = Number(process.env.DB_REMOTE_PORT || 5433);

if (!SSH_USERNAME || !SSH_KEY_PATH) {
  console.error("[tunnel] Missing SSH_USERNAME or SSH_KEY_PATH in env.");
  process.exit(1);
}

const privateKey = fs.readFileSync(SSH_KEY_PATH);

const client = new Client();

client.on("ready", () => {
  const server = net.createServer((socket) => {
    client.forwardOut(
      socket.remoteAddress || "127.0.0.1",
      socket.remotePort || 0,
      "127.0.0.1",
      DB_REMOTE_PORT,
      (err, stream) => {
        if (err) {
          console.error("[tunnel] forwardOut error:", err);
          socket.destroy();
          return;
        }
        socket.pipe(stream).pipe(socket);
      }
    );
  });

  server.listen(DB_TUNNEL_PORT, "127.0.0.1", () => {
    console.log(
      `[tunnel] Listening on localhost:${DB_TUNNEL_PORT} -> ${SSH_HOST}:localhost:${DB_REMOTE_PORT}`
    );
  });

  const shutdown = () => {
    try {
      server.close();
    } catch {}
    try {
      client.end();
    } catch {}
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
});

client.on("error", (err) => {
  console.error("[tunnel] SSH connection error:", err);
  process.exit(1);
});

console.log(`[tunnel] Connecting SSH ${SSH_USERNAME}@${SSH_HOST}:${SSH_PORT} ...`);

client.connect({
  host: SSH_HOST,
  port: SSH_PORT,
  username: SSH_USERNAME,
  privateKey,
});

