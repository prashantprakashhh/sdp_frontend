'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import React from 'react';

const LogoutButton: React.FC = () => {
  const removeToken = useAuthStore((state) => state.resetAuth);
  const router = useRouter();

  const handleLogout = () => {
    removeToken(); // Remove the token from Zustand store (and localStorage)
    router.push('/login'); // Redirect to login page
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
