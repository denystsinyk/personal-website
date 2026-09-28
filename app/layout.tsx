import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Denys Tsinyk',
  description:
    'CS @ Pitt',
  icons: { icon: './favicon.svg' },
  openGraph: {
    title: 'Denys Tsinyk',
    description:
      'CS @ Pitt',
    images: ['https://denystsinyk.github.io/personal-website/assets/me.jpg'],
  },
  twitter: {
    card: 'summary',
    title: 'Denys Tsinyk',
    description:
      'CS @ Pitt',
    images: ['https://denystsinyk.github.io/personal-website/assets/me.jpg'],
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='light'?'light':'dark';}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
