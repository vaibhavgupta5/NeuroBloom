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

import SmoothScroll from '../components/SmoothScroll';

export const metadata = {
  title: 'NeuroBloom | Where Every Child\'s Brain Gets to Bloom',
  description: 'Science-backed, game-based therapy for children on the autism spectrum.',
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
  themeColor: '#E8FAF6',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${dmSans.variable} ${sora.variable} font-sans antialiased bg-[#E8FAF6]`}>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
