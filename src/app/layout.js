import { Nunito, DM_Sans, Sora } from 'next/font/google';
import './globals.css';

const nunito = Nunito({ 
  subsets: ['latin'], 
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800']
});

const dmSans = DM_Sans({ 
  subsets: ['latin'], 
  variable: '--font-dm-sans',
  weight: ['400', '500', '700']
});

const sora = Sora({ 
  subsets: ['latin'], 
  variable: '--font-sora',
  weight: ['400', '600', '700']
});


export const metadata = {
  title: 'NeuroBloom — calm, adaptive practice for autistic children',
  description: 'Short, sensory-friendly practice games, visual supports and a Talk board for autistic children, with progress their parents and therapists can act on.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NeuroBloom',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: '#F4FBF9',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${dmSans.variable} ${sora.variable} font-sans antialiased bg-mint`}>
        {children}
      </body>
    </html>
  );
}
