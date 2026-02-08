import axios from "axios";
import { z } from "zod";

/* Sign up request */
import { SignUpSchema } from "@/types/Schemas/AuthSchema";

export const signUpRequest = async (data: z.infer<typeof SignUpSchema>) => {
  try {
    const response = await axios.post("/api/auth/signup", data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

/* User Profile Request */

export const userProfileRequest = async () => {
  try {
    const response = await axios.get("/api/auth/profile");
    return response.data;
  } catch (error) {
    return error;
  }
};
