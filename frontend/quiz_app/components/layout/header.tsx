"use client";

import { LoginButton } from "../auth/login-button";

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Quiz App</h1>
          </div>
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
