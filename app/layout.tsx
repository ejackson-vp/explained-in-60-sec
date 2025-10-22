import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import ThemeRegistry from './components/ThemeRegistry';

export const metadata: Metadata = {
  title: 'Explained in 60 seconds - AI-Powered Micro Podcasts',
  description: 'Turn any topic into a crisp 60-second podcast—instantly. Type a topic and get your AI-generated mini-podcast in under a minute.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body style={{ margin: 0 }}>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
        <Analytics />
      </body>
    </html>
  );
}

