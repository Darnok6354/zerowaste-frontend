"use client";

import LogoutButton from "../components/LogoutButton";

export default function ProfilePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-3xl font-bold mb-4">Profile Page</h1>
      <p className="text-lg mb-6">Welcome to your profile!</p>
        <LogoutButton />
    </div>
  );
}