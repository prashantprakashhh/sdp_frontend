'use client';

import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../ui/navigation-menu';
import { useAuthStore } from '@/store/authStore';
import { Button } from '../ui/button';
import Image from 'next/image';
import { GET_CATEGORIES } from '@/graphql/queries';
import { useQuery } from '@apollo/client';

const components: { title: string; href: string }[] = [
  {
    title: 'Fashion',
    href: '/shop/fashion',
  },
  {
    title: 'Electronics',
    href: '/shop/electronics',
  },
  {
    title: 'Home & Furniture',
    href: '/shop/home-furniture',
  },
  {
    title: 'Appliances',
    href: '/shop/appliances',
  },
];

interface NavbarProps {

}

const Navbar: React.FC<NavbarProps> = () => {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.resetAuth);

  const totalItems = useCartStore((state) =>
    state.cartItems.reduce((sum, item) => sum + item.quantity, 0)
  );

  const { data, loading, error } = useQuery(GET_CATEGORIES);
  const categories = data?.categories || [];

  const handleLogout = () => {
    logout();
    // Optionally, redirect to home or login page after logout
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/">

          <Image
            src="/images/logo.png" // Path to your logo image in public/images
            alt="Nine11 Logo" // Descriptive alt text for accessibility
            width={50} // Adjust width as needed
            height={50} // Adjust height as needed
            className="object-contain" // Ensures the image fits within the specified dimensions
          />

        </Link>
        <div className="flex items-center space-x-6">
          {/* Navigation Menu */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                {/* <NavigationMenuTrigger>Shop</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="flex flex-col gap-3 p-4">
                    {/* {components.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                      />
                    ))}

                  {categories.map((cat: { categoryId: number; name: string }) => (
                            <li key={cat.categoryId}>
                              <Link href={`/products?categoryId=${cat.categoryId}`}>
                                <span className="cursor-pointer text-blue-600 hover:underline">
                                  {cat.name}
                                </span>
                              </Link>
                            </li>
                          ))}
                  </ul>
                </NavigationMenuContent> */}
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Static Links */}
          {/* <Link href="/about">
            <span className="cursor-pointer transition-colors hover:text-indigo-600">About</span>
          </Link> */}
          {/* <Link href="/contact">
            <span className="cursor-pointer transition-colors hover:text-indigo-600">Contact</span>
          </Link> */}

          {/* Authentication Links */}
          {token ? (
            <div className="flex items-center space-x-4">
              {role === 'customer' && (
                <Link href="/account">
                  <span className="flex cursor-pointer items-center transition-colors hover:text-indigo-600">
                    <User className="mr-1" />
                    Account
                  </span>
                </Link>
              )}
              {role === 'supplier' && (
                <Link href="/supplier-profile">
                  <span className="flex cursor-pointer items-center transition-colors hover:text-indigo-600">
                    <User className="mr-1" />
                    Profile
                  </span>
                </Link>
              )}
              <span
                className="flex cursor-pointer items-center transition-colors hover:text-indigo-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-1" />
                Logout
              </span>
            </div>
          ) : (
            <Link href="/login">
              <span className="flex cursor-pointer items-center transition-colors hover:text-indigo-600">
                <User className="mr-1" />
                Login
              </span>
            </Link>
          )}

          {/* Shopping Cart */}
          <Link href="/cart">
            <div className="relative cursor-pointer transition-colors hover:text-indigo-600">
              <ShoppingCart className="size-6" />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {totalItems}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

// Updated ListItem Component
const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  { title: string; href: string } & React.ComponentPropsWithoutRef<'a'>
>(({ className, title, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          ref={ref}
          className={cn(
            'block select-none rounded-md p-2 text-lg font-medium text-gray-700 transition-colors hover:bg-indigo-100',
            className
          )}
          {...props}
        >
          {title}
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';