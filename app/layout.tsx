import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "RX MOD — Learn without limits", description: "Practical courses. Clear lessons. Skills you can put to work.", applicationName: "RX MOD" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
