import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Windopoly: Clean Energy Empire',
  description: 'A renewable energy monopoly game that builds professional English vocabulary, grid strategy, and climate literacy through immersive gameplay.',
  openGraph: {
    title: 'Windopoly: Clean Energy Empire',
    description: 'A renewable energy monopoly game that builds professional English vocabulary, grid strategy, and climate literacy through immersive gameplay.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Windopoly: Clean Energy Empire',
    description: 'A renewable energy monopoly game that builds professional English vocabulary, grid strategy, and climate literacy through immersive gameplay.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
