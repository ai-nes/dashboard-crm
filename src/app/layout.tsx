import Providers from "@/app/providers";
import { cn } from "@/utils/cn";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistInter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | AI-NES — Hệ thống quản trị tuyển sinh",
    default: "AI-NES — Hệ thống quản trị tuyển sinh",
  },
  description:
    "AI-NES là hệ thống quản trị tuyển sinh thông minh, giúp theo dõi hồ sơ, điều phối tư vấn, SLA, thống kê và chuyển đổi nhập học.",
  applicationName: "AI-NES",
  keywords: [
    "AI-NES",
    "tuyển sinh",
    "quản trị tuyển sinh",
    "CRM tuyển sinh",
    "admissions",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "AI-NES — Hệ thống quản trị tuyển sinh",
    description:
      "Theo dõi toàn cảnh tuyển sinh, hiệu suất vận hành, SLA và chuyển đổi nhập học trên một nền tảng.",
    type: "website",
    locale: "vi_VN",
    siteName: "AI-NES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="vi"
      className={cn("h-full overflow-hidden antialiased", geistInter.className)}
    >
      <body className="h-full overflow-hidden bg-background-gray-secondary_alt_2">
        <ThemeProvider defaultTheme="light" enableSystem>
          <Providers>{children}</Providers>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
