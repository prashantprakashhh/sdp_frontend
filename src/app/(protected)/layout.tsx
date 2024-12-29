'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Zustand persist store provides a "persist" object on the store,
  // which can tell us if hydration is complete.
  const token = useAuthStore((state) => state.token);

  const hasHydrated = useAuthStore.persist?.hasHydrated?.();

  useEffect(() => {
    // Only run the check when hydration is complete.
    if (hasHydrated && !token) {
      router.push('/login');
    }
  }, [token, hasHydrated, router]);

  // If hydration is not complete, you can show a loading spinner or a blank page
  if (!hasHydrated) {
    return <div>Loading...</div>;
  }

  return <div>{children}</div>;
}
