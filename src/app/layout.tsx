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
    template: "%s | FAIP — FPTU Admission Intelligence Platform",
    default: "FAIP — FPTU Admission Intelligence Platform",
  },
  description:
    "FAIP là nền tảng quản trị tuyển sinh thông minh của FPTU, giúp theo dõi hồ sơ, điều phối tư vấn, SLA, thống kê và chuyển đổi nhập học.",
  applicationName: "FAIP",
  manifest: "/site.webmanifest",
  keywords: [
    "FAIP",
    "FPTU Admission Intelligence Platform",
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
    title: "FAIP — FPTU Admission Intelligence Platform",
    description:
      "Theo dõi toàn cảnh tuyển sinh, hiệu suất vận hành, SLA và chuyển đổi nhập học trên một nền tảng.",
    type: "website",
    locale: "vi_VN",
    siteName: "FAIP",
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
