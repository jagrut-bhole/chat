"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  if (loading) {
    return <p>Loading...</p>;
  }
  if (!session) {
    return <p>You are not authenticated. Please sign in to access the dashboard.</p>;
  }
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-4 text-gray-600">
        Welcome to your dashboard! Here you can manage your settings and view your activity.
      </p>
      <div>
        <li>
          <strong>Username:</strong> {session.username}
          <br />
          <strong>Created at:</strong> {session.createdAt}
          <br />
          <strong>ID:</strong> {session.id}
          <br />
        </li>
      </div>
    </div>
  );
}
