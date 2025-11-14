import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spark Profiler Analyzer - Premium Minecraft Performance Analysis',
  description: 'Analyze your Minecraft server performance with AI-powered insights and recommendations',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
