// src/app/layout.tsx
import "./globals.css";
import { Providers } from "../components/Providers";

export const metadata = {
  title: "자취생 냉장고 친구",
  description: "냉장고 파먹기 프로젝트",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {/* Providers로 children을 감싸줍니다. */}
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
