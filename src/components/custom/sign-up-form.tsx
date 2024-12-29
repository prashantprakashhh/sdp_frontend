/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  LOGIN_MUTATION,
  REGISTER_CUSTOMER,
  REGISTER_SUPPLIER,
  REGISTER_USER,
} from '@/graphql/mutation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import {
  LoginUserResponse,
  LoginUserVars,
  RegisterCustomerResponse,
  RegisterCustomerVars,
  RegisterSupplierResponse,
  RegisterSupplierVars,
  RegisterUserResponse,
  RegisterUserVars,
} from '@/types/graphql';
import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Define the form schema using zod
const formSchema = z
  .object({
    email: z
      .string({
        required_error:
          'You must fill in your email address to complete registration.',
      })
      .email('Please provide a valid email address.'),
    password: z
      .string({
        required_error: 'You must fill in this field.',
      })
      .min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string({
      required_error: 'You must fill in this field.',
    }),
    role: z.enum(['customer', 'supplier'], {
      required_error: 'You must select a role.',
    }),
    // Conditional fields based on role
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    name: z.string().optional(),
    contactPhone: z.string().optional(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (values) => {
      if (values.role === 'customer') {
        return values.firstName && values.lastName;
      } else if (values.role === 'supplier') {
        return values.name && values.contactPhone;
      }
      return true;
    },
    {
      message: 'All fields must be filled based on role',
      path: ['firstName', 'lastName', 'name', 'contactPhone'],
    }
  );

type FormValues = z.infer<typeof formSchema>;

interface SignupFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SignupForm({ className, ...props }: SignupFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const setCustomer = useAuthStore((state) => state.setCustomer);
  const setSupplier = useAuthStore((state) => state.setSupplier);
  const setRole = useAuthStore((state) => state.setRole);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  // Define mutation hooks
  const [registerUserMutation] = useMutation<
    RegisterUserResponse,
    RegisterUserVars
  >(REGISTER_USER);

  const [registerCustomerMutation] = useMutation<
    RegisterCustomerResponse,
    RegisterCustomerVars
  >(REGISTER_CUSTOMER);

  const [registerSupplierMutation] = useMutation<
    RegisterSupplierResponse,
    RegisterSupplierVars
  >(REGISTER_SUPPLIER);

  const [loginUserMutation] = useMutation<LoginUserResponse, LoginUserVars>(
    LOGIN_MUTATION
  );

  const handleSignup: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      // Step 1: Register User
      const { data: userData, errors: userErrors } = await registerUserMutation(
        {
          variables: {
            input: {
              email: data.email,
              password: data.password,
              role: data.role,
            },
          },
        }
      );
      console.log({ userData, userErrors });

      // Handle GraphQL errors
      if (userErrors && userErrors.length > 0) {
        toast.error(userErrors[0].message || 'User registration failed.');
        return;
      }

      // Check if registerUser was successful
      if (userData?.registerUser) {
        // **Store the token immediately**
        setToken(userData.registerUser);
        // Step 2: Register Customer or Supplier based on role
        if (data.role === 'customer') {
          const { data: customerData, errors: customerErrors } =
            await registerCustomerMutation({
              variables: {
                input: {
                  firstName: data.firstName as string,
                  lastName: data.lastName as string,
                },
              },
            });

          if (customerErrors && customerErrors.length > 0) {
            toast.error(
              customerErrors[0].message || 'Customer registration failed.'
            );
            return;
          }

          if (customerData?.registerCustomer) {
            // Successful customer registration
            setCustomer(customerData.registerCustomer.customerId);
            setRole('customer');
            toast.success('Registration successfully complete!', {
              description: 'Welcome, valued customer!',
            });
          } else {
            toast.error('Customer registration failed.');
            return;
          }
        } else if (data.role === 'supplier') {
          const { data: supplierData, errors: supplierErrors } =
            await registerSupplierMutation({
              variables: {
                input: {
                  name: data.name as string,
                  contactPhone: data.contactPhone as string,
                },
              },
            });

          if (supplierErrors && supplierErrors.length > 0) {
            toast.error(
              supplierErrors[0].message || 'Supplier registration failed.'
            );
            return;
          }

          if (supplierData?.registerSupplier) {
            // Successful supplier registration
            setSupplier(supplierData.registerSupplier.supplierId);
            setRole('supplier');
            toast.success('Registration successfully complete!', {
              description: 'Welcome, valued supplier!',
            });
          } else {
            toast.error('Supplier registration failed.');
            return;
          }
        }

        // Step 3: Login to obtain token
        const { data: loginData, errors: loginErrors } =
          await loginUserMutation({
            variables: {
              email: data.email,
              password: data.password,
            },
          });

        if (loginErrors && loginErrors.length > 0) {
          toast.error(loginErrors[0].message || 'Login failed.');
          return;
        }

        if (loginData?.login) {
          const { role } = useAuthStore.getState();
          console.log('Login successful:', role);
          // Store the token in Zustand store
          setToken(loginData.login);
          toast.success('Logged in successfully!');
          if (role === 'customer') {
            router.push('/cart');
          }
          if (role === 'supplier') {
            router.push('/supplier-profile');
          }

          // router.push("/dashboard");
        } else {
          toast.error('Failed to obtain authentication token.');
        }
      } else {
        toast.error('User registration failed.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.networkError) {
        toast.error('Network error. Please check your connection.');
      } else if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        toast.error(error.graphQLErrors[0].message || 'An error occurred.');
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Watch role to conditionally render fields
  const selectedRole = form.watch('role');

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <div className="flex flex-col space-y-2 pt-3 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Want to be a Part of Nine11?
        </h1>
        <p className="text-sm text-muted-foreground">
          Register with your email and password
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSignup)}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              {/* EMAIL ADDRESS FIELD */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full pb-4">
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <div className="relative w-full">
                      <FormControl className="w-full">
                        <Input
                          id="email"
                          type="email"
                          autoCapitalize="none"
                          autoCorrect="off"
                          placeholder="name@example.com"
                          className="w-full text-zinc-700"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PASSWORD FIELD */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-full pb-4">
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <div className="relative w-full">
                      <FormControl className="w-full">
                        <Input
                          id="password"
                          type="password"
                          autoCapitalize="none"
                          autoCorrect="off"
                          placeholder="Must be at least 8 characters long"
                          className="w-full text-zinc-700"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CONFIRM PASSWORD FIELD */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="w-full pb-4">
                    <FormLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FormLabel>
                    <div className="relative w-full">
                      <FormControl className="w-full">
                        <Input
                          id="confirmPassword"
                          type="password"
                          autoCapitalize="none"
                          autoCorrect="off"
                          placeholder="Enter the same password again"
                          className="w-full text-zinc-700"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ROLE SELECTION FIELD */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="w-full pb-4">
                    <FormLabel htmlFor="role">Role</FormLabel>
                    <div className="relative w-full">
                      <FormControl className="w-full">
                        <select
                          id="role"
                          {...field}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                          disabled={isLoading}
                        >
                          <option value="">Select your role</option>
                          <option value="customer">Customer</option>
                          <option value="supplier">Supplier</option>
                        </select>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CONDITIONAL FIELDS FOR CUSTOMER */}
              {selectedRole === 'customer' && (
                <>
                  {/* FIRST NAME FIELD */}
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="w-full pb-4">
                        <FormLabel htmlFor="firstName">First Name</FormLabel>
                        <div className="relative w-full">
                          <FormControl className="w-full">
                            <Input
                              id="firstName"
                              type="text"
                              autoCapitalize="none"
                              autoCorrect="off"
                              placeholder="Enter your first name"
                              className="w-full text-zinc-700"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* LAST NAME FIELD */}
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="w-full pb-4">
                        <FormLabel htmlFor="lastName">Last Name</FormLabel>
                        <div className="relative w-full">
                          <FormControl className="w-full">
                            <Input
                              id="lastName"
                              type="text"
                              autoCapitalize="none"
                              autoCorrect="off"
                              placeholder="Enter your last name"
                              className="w-full text-zinc-700"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* CONDITIONAL FIELDS FOR SUPPLIER */}
              {selectedRole === 'supplier' && (
                <>
                  {/* COMPANY NAME FIELD */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="w-full pb-4">
                        <FormLabel htmlFor="name">Company Name</FormLabel>
                        <div className="relative w-full">
                          <FormControl className="w-full">
                            <Input
                              id="name"
                              type="text"
                              autoCapitalize="none"
                              autoCorrect="off"
                              placeholder="Enter your company name"
                              className="w-full text-zinc-700"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CONTACT PHONE FIELD */}
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem className="w-full pb-4">
                        <FormLabel htmlFor="contactPhone">
                          Contact Phone
                        </FormLabel>
                        <div className="relative w-full">
                          <FormControl className="w-full">
                            <Input
                              id="contactPhone"
                              type="tel"
                              autoCapitalize="none"
                              autoCorrect="off"
                              placeholder="Enter your contact phone number"
                              className="w-full text-zinc-700"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <div className="mr-2 size-4 animate-spin rounded-full border-2 border-x-white" />
              )}
              Sign Up with Email
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
