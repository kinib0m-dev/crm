import type { Metadata } from "next";
import { Sora, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { Toaster } from "sonner";
import AuthProvider from "@/components/auth/AuthProvider";

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-sora",
  display: "swap",
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://domain"),
  title: {
    default: "Auth",
    template: `%s | Auth`,
  },
  description: "Description",
  keywords: [],
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Auth",
    description: "Description",
    images: [""],
    url: "https://domain",
    siteName: "Auth",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <AuthProvider session={session}>
      <html lang="en">
        <body
          className={`${sora.variable} ${sourceSans3.variable} antialiased min-h-screen flex flex-col`}
        >
          <main>{children}</main>
          <Toaster richColors closeButton />
        </body>
      </html>
    </AuthProvider>
  );
}
