import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelper";

const MESSAGES_PER_PAGE = 30;

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const cursor = searchParams.get("cursor"); // message ID for pagination

    if (!groupId) {
      return NextResponse.json({ success: false, message: "groupId is required" }, { status: 400 });
    }

    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId: groupId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { success: false, message: "You are not a member of this group" },
        { status: 403 }
      );
    }

    // Fetch messages with cursor-based pagination
    // We fetch one extra to determine if there are more messages
    const messages = await prisma.groupMessage.findMany({
      where: {
        groupId: groupId,
        ...(cursor
          ? {
              createdAt: {
                lt: (
                  await prisma.groupMessage.findUnique({
                    where: { id: cursor },
                    select: { createdAt: true },
                  })
                )?.createdAt,
              },
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: MESSAGES_PER_PAGE + 1,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    const hasMore = messages.length > MESSAGES_PER_PAGE;
    const trimmedMessages = hasMore ? messages.slice(0, MESSAGES_PER_PAGE) : messages;

    // Return messages oldest-first for display, but cursor is the oldest one
    const formattedMessages = trimmedMessages
      .map((msg) => ({
        id: msg.id,
        groupId: msg.groupId,
        userId: msg.user.id,
        username: msg.user.username,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
      }))
      .reverse(); // Reverse so oldest is first for display

    const nextCursor = hasMore ? trimmedMessages[trimmedMessages.length - 1].id : null;

    return NextResponse.json(
      {
        success: true,
        data: {
          messages: formattedMessages,
          nextCursor,
          hasMore,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in GET /api/group/chat:`, error);
    return NextResponse.json(
      {
        success: false,
        message: "Error occurred while fetching messages",
      },
      { status: 500 }
    );
  }
}
