"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormProps {
  mode: "signin" | "signup";
  onSubmit: (username: string, password: string) => Promise<void>;
  loading?: boolean;
}

export default function Form({ mode, onSubmit, loading = false }: FormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isSignIn = mode === "signin";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(username, password);
  };

  return (
    <div className="overflow-y-hidden bg-[#030303]">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 bg-[#101010] rounded-4xl py-20 px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              {isSignIn ? "Sign In to Your Account" : "Create Your Account"}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              {isSignIn
                ? "Welcome back! Please enter your details."
                : "Join us today! Please enter your details."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Username */}
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username..."
                  className="text-white"
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="text-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-200 hover:text-gray-400 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 cursor-pointer" />
                    ) : (
                      <Eye className="h-5 w-5 cursor-pointer" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-6 text-black bg-white hover:bg-white/80 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please Wait...
                </>
              ) : isSignIn ? (
                "Sign In"
              ) : (
                "Sign Up"
              )}
            </Button>

            <div className="text-center text-sm mt-5">
              <span className="text-gray-400">
                {isSignIn ? "Don't have an account? " : "Already have an account? "}
              </span>
              <Link
                href={isSignIn ? "/signup" : "/signin"}
                className="font-medium text-white hover:text-gray-300"
              >
                {isSignIn ? "Sign Up" : "Sign In"}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
