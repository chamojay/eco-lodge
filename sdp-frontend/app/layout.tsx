import React from 'react';
import '../styles/globals.css';  // Updated import path
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Algama Ella Eco Lodge',
  description: 'Luxury eco-friendly accommodation in Ella, Sri Lanka',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}