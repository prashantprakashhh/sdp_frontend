'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, gql } from '@apollo/client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
// import jwt_decode from 'jwt-decode';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';


// Define GraphQL Mutation
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(loginDetails: { email: $email, password: $password }) {
      token
      userRole
    }
  }
`;

// Define Validation Schema with zod
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Define TypeScript Types
type LoginFormValues = z.infer<typeof loginSchema>;
interface TokenPayload {
  sub: string; // Adjust based on your JWT payload
}

const LoginForm: React.FC = () => {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const setRole = useAuthStore((state) => state.setRole);
  const setCustomer = useAuthStore((state) => state.setCustomer);
  const setSupplier = useAuthStore((state) => state.setSupplier);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const [login, { loading }] = useMutation<
    { login: { token: string; userRole: "customer" | "supplier" } },
    { email: string; password: string }
  >(LOGIN_MUTATION, {
    onCompleted: (data) => {
      if (data?.login && data.login.token) {
        const { token, userRole } = data.login;
        setToken(token);
        setRole(userRole);

        // Decode JWT to extract user_id
        // const decoded = jwt_decode<TokenPayload>(token);
        // const userId = parseInt(decoded.sub, 10); // Adjust based on your JWT payload

        if (userRole === 'customer') {
          // setCustomer(userId);
          router.push('/account');
        } else if (userRole === 'supplier') {
          // setSupplier(userId);
          router.push('/supplier-profile');
        }

        toast.success('Logged in successfully!');
      } else {
        toast.error('Invalid credentials');
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error('Login failed. Please check your credentials.');
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login({ variables: { email: data.email, password: data.password } });
    } catch (error) {
      // Errors are handled in onError
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">Welcome Back</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className={cn(
                'mt-1 block w-full',
                errors.email ? 'border-red-500' : 'border-gray-300'
              )}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <p  className="text-sm text-indigo-600 hover:underline">
                Forgot your password?
              </p>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="********"
              {...register('password')}
              className={cn(
                'mt-1 block w-full',
                errors.password ? 'border-red-500' : 'border-gray-300'
              )}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
            {isSubmitting || loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

       

        {/* Signup Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup">
            <p className="text-black hover:underline">Sign up</p>
          </Link>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="text-center text-xs text-gray-500">
        By clicking continue, you agree to our{' '}
        <Link href="/terms">
          <p className="underline hover:text-indigo-600">Terms of Service</p>
        </Link>{' '}
        and{' '}
        <Link href="/privacy">
          <p className="underline hover:text-indigo-600">Privacy Policy</p>
        </Link>
        .
      </div>
    </div>
  );
};

export default LoginForm;