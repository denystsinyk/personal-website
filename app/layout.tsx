import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Denys Tsinyk — Software & safety',
  description:
    'Computer science at Pitt. Building software, security automation, and useful things.',
  openGraph: {
    title: 'Denys Tsinyk',
    description:
      'Computer science at Pitt. Software, security, and useful things.',
    images: ['https://denystsinyk.github.io/denys_tsinyk/assets/me.jpg'],
  },
  twitter: {
    card: 'summary',
    title: 'Denys Tsinyk',
    description:
      'Computer science at Pitt. Software, security, and useful things.',
    images: ['https://denystsinyk.github.io/denys_tsinyk/assets/me.jpg'],
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
