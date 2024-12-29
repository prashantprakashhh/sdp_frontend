'use client';

import React from 'react';
// import LoginForm from '@/components/custom/LoginForm';
import { Toaster } from '@/components/ui/sonner';
import LoginForm from '@/components/custom/login-form';

const LoginPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6 md:p-10">
      <div className="w-full max-w-md md:max-w-2xl">
        <LoginForm />
      </div>
      <Toaster />
    </div>
  );
};

export default LoginPage;