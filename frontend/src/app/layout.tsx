import type { Metadata } from 'next';
import './globals.css';
import { Layout } from '@/shared/components/Layout';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Procesador de CSV',
  description: 'Sube archivos CSV y consulta el estado de su procesamiento',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
