"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Form from "@/components/Form";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (username: string, password: string) => {
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.ok) {
        toast.success("Signed in successfully!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return <Form mode="signin" onSubmit={handleSubmit} loading={loading} />;
}
