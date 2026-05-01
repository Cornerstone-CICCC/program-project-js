// src/app/layout.tsx
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "../components/Providers";
import Navigation from "../components/Navigation";

export const metadata = {
  title: "Refridge",
  description: "Clear My Fridge",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Providers로 children을 감싸줍니다. */}
        <Providers>
          <main>
            {children}
            <Toaster position="top-center" reverseOrder={false} />
          </main>
          <Navigation />
        </Providers>
      </body>
    </html>
  );
}
