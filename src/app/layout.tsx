import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import ClientProvider from "@/app/ClientProvider";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meetings App",
  description: "A video calling app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ClientProvider>
            <Navbar />
            <main className="mx-auto max-w-5xl px-3 py-6 ">{children}</main>
          </ClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
