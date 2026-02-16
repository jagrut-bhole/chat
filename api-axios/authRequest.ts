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

/* User Location Request */
import { LocationSchema } from "@/types/Schemas/AuthSchema";

export const userLocation = async (data: z.infer<typeof LocationSchema>) => {
  try {
    const response = await axios.post("/api/auth/location", data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

/* Change Password Request */

import { ChangePasswordSchema } from "@/types/Schemas/AuthSchema";

export const changePasswordRequest = async (data: z.infer<typeof ChangePasswordSchema>) => {
  try {
    const response = await axios.post("/api/auth/change-password", data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

/* Updating Users Location */

import { UpdateLocationSchema } from "@/types/Schemas/AuthSchema";

export const updateLocation = async (data: z.infer<typeof UpdateLocationSchema>) => {
  try {
    const response = await axios.post("/api/auth/location", data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

/* Delete Account Request */

import { DeleteAccountSchema } from "@/types/Schemas/AuthSchema";

export const deleteAccount = async (data: z.infer<typeof DeleteAccountSchema>) => {
  try {
    const response = await axios.delete("/api/auth/delete-account", {
      data,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
