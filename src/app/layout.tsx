import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Web3Modal } from '@/context/Web3Modal';
import { Toaster } from 'react-hot-toast';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lending and Borrowing Dapp',
  description: 'This is a Lending and Borrowing Dapp.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Modal>
          {children}
          <Toaster position="bottom-right" reverseOrder={false} />
        </Web3Modal>
      </body>
    </html>
  );
}
