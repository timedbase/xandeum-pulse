import { ReactNode } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Chatbot } from '@/components/Chatbot';

const CHATBOT_ENABLED = import.meta.env.VITE_ENABLE_CHATBOT === 'true';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Chatbot overlay - only render if enabled */}
      {CHATBOT_ENABLED && <Chatbot />}

      <Footer />
    </div>
  );
}
