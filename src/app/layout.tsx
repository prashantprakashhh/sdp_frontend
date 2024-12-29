import React from 'react';
import localFont from 'next/font/local';
import { Toaster } from '@/components/ui/sonner';
import ApolloProviderWrapper from './ApolloProviderWrapper';
import Navbar from '@/components/custom/Navbar';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ApolloProviderWrapper>
            <Navbar  />    
            <main className="container mx-auto grow px-4">{children}</main>
            <Toaster />
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}