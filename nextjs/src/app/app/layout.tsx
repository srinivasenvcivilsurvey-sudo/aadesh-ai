// src/app/app/layout.tsx
import AppLayout from '@/components/AppLayout';
import { GlobalProvider } from '@/lib/context/GlobalContext';
import { LanguageProvider } from '@/lib/context/LanguageContext';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <GlobalProvider>
                <AppLayout>{children}</AppLayout>
            </GlobalProvider>
        </LanguageProvider>
    );
}
