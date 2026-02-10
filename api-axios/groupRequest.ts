import axios from "axios";
import { z } from "zod";

/* Create Group Request */
import { CreateGroupSchema, JoinGroupSchema } from "@/types/Group/groupSchema";

export const createGroupRequest = async (data: z.infer<typeof CreateGroupSchema>) => {
    try {
        const response = await axios.post('/api/group/create', data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
}

/* Join Group Request */
export const joinGroupRequest = async (data: z.infer<typeof JoinGroupSchema>) => {
    try {
        const response = await axios.post('/api/group/join', data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
}

/* Fetch Joined Groups Request */
export const fetchJoinedGroupsRequest = async () => {
    try {
        const response = await axios.get('/api/group/joined');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
}

/* Fetch All Groups Request */
export const fetchAllGroupsRequest = async () => {
    try {
        const response = await axios.get('/api/group/all');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
}
