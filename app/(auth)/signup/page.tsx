"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Form from "@/components/Form";
import { signUpRequest } from "@/api-axios/authRequest";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (username: string, password: string) => {
    setLoading(true);

    try {
      const data = await signUpRequest({ username, password });

      if (!data.success) {
        toast.error(data.message || "Failed to create account");
        return;
      }

      toast.success("Account created successfully!");

      const signInResult = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error("Account created but auto sign-in failed. Please sign in manually.");
        router.push("/signin");
      } else if (signInResult?.ok) {
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      console.error("Signup error:", error);
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "An unexpected error occurred. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return <Form mode="signup" onSubmit={handleSubmit} loading={loading} />;
}
