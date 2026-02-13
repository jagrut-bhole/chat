import prisma from "@/lib/prisma";
import { CacheTTL, CacheKeys, setCachedData, getCachedData } from "@/lib/upstash-redis/cache";

export type CacheGroup = {
    id: string;
    name: string;
    latitude: number | null;
    longitude: number | null;
    radius: number | null;
    maxMembers: number | null;
    expiresAt: Date | null;
    createdAt: Date;
}

export async function getGroupById(groupId: string) {
    try {
        const cacheKey = CacheKeys.group(groupId);

        const cachedGroup = await getCachedData<CacheGroup>(cacheKey);

        if (cachedGroup) {
            console.log("Cache hit!!");
            return cachedGroup;
        }

        console.log("Cache miss!!");
        console.log("Getting group from DB...");

        const group = await prisma.group.findUnique({
            where: {
                id: groupId,
            },
            select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
                radius: true,
                maxMembers: true,
                expiresAt: true,
                createdAt: true,
            },
        });

        if (!group) {
            return null;
        }

        await setCachedData(cacheKey, group, CacheTTL.group);

        return group;
    } catch (error) {
        console.error(`Error getting group by ID: ${error}`);
        return null;
    }
}