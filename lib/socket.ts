import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config();

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

interface ClientMeta {
    userId: string;
    username: string;
    groupId: string;
}

interface IncomingMessage {
    type: "join" | "message";
    groupId?: string;
    userId?: string;
    username?: string;
    content?: string;
}

const groupRooms = new Map<string, Set<WebSocket>>();
const clientMeta = new Map<WebSocket, ClientMeta>();
const PORT = Number(process.env.WS_PORT) || 8080;
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (socket, request) => {
    const ip = request.socket.remoteAddress;
    console.log(`[WS] New connection from ${ip}`);

    socket.on("message", async (rawData) => {
        try {
            const data: IncomingMessage = JSON.parse(rawData.toString());

            if (data.type === "join") {
                if (!data.groupId || !data.userId || !data.username) {
                    socket.send(
                        JSON.stringify({ type: "error", message: "Missing join fields" })
                    );
                    return;
                }

                const meta: ClientMeta = {
                    userId: data.userId,
                    username: data.username,
                    groupId: data.groupId,
                };
                clientMeta.set(socket, meta);

                if (!groupRooms.has(data.groupId)) {
                    groupRooms.set(data.groupId, new Set());
                }
                groupRooms.get(data.groupId)!.add(socket);

                console.log(
                    `[WS] User ${data.username} joined group ${data.groupId}`
                );

                socket.send(JSON.stringify({ type: "joined", groupId: data.groupId }));
                return;
            }

            if (data.type === "message") {
                const meta = clientMeta.get(socket);
                if (!meta) {
                    socket.send(
                        JSON.stringify({
                            type: "error",
                            message: "You must join a group first",
                        })
                    );
                    return;
                }

                if (!data.content || !data.content.trim()) return;

                const content = data.content.trim();

                const savedMessage = await prisma.groupMessage.create({
                    data: {
                        groupId: meta.groupId,
                        userId: meta.userId,
                        content: content,
                    },
                });

                const broadcastPayload = JSON.stringify({
                    type: "new_message",
                    message: {
                        id: savedMessage.id,
                        groupId: meta.groupId,
                        userId: meta.userId,
                        username: meta.username,
                        content: content,
                        createdAt: savedMessage.createdAt.toISOString(),
                    },
                });

                const roomClients = groupRooms.get(meta.groupId);
                if (roomClients) {
                    roomClients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(broadcastPayload);
                        }
                    });
                }

                console.log(
                    `[WS] Message from ${meta.username} in group ${meta.groupId}: ${content}`
                );
                return;
            }
        } catch (err) {
            console.error("[WS] Error processing message:", err);
            socket.send(
                JSON.stringify({ type: "error", message: "Invalid message format" })
            );
        }
    });

    socket.on("error", (error) => {
        console.error(`[WS] Error from ${ip}: ${error.message}`);
    });

    socket.on("close", () => {
        const meta = clientMeta.get(socket);
        if (meta) {
            const room = groupRooms.get(meta.groupId);
            if (room) {
                room.delete(socket);
                if (room.size === 0) {
                    groupRooms.delete(meta.groupId);
                }
            }
            console.log(
                `[WS] User ${meta.username} left group ${meta.groupId}`
            );
            clientMeta.delete(socket);
        }
        console.log(`[WS] Connection closed from ${ip}`);
    });
});

console.log(`[WS] WebSocket server is running on ws://localhost:${PORT}`);