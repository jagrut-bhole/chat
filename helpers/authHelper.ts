import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  CacheTTL,
  CacheKeys,
  setCachedData,
  getCachedData,
} from "@/lib/upstash-redis/cache";

export type CacheUser = {
  id: string;
  username: string;
  createdAt: Date;
  lastLocation: Date | null;
  isOnline: boolean;
};

export async function getAuthenticatedUser(): Promise<CacheUser | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return null;
    }

    const userId = session.user.id;
    const cacheKey = CacheKeys.user(userId);

    const cachedUser = await getCachedData<CacheUser>(cacheKey);

    if (cachedUser) {
      console.log("Cache hit!!");
      return cachedUser;
    }

    console.log("Cache miss!!");
    console.log("Getting user from DB...");

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        lastLocation: true,
        isOnline: true,
      },
    });

    if (!user) {
      return null;
    }

    await setCachedData(cacheKey, user, CacheTTL.user);

    return user;
  } catch (error) {
    console.error(`Error getting authenticated user: ${error}`);
    return null;
  }
}
