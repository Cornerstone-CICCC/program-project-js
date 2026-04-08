// src/app/layout.tsx
import "./globals.css";

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
        <main>{children}</main>
      </body>
    </html>
  );
}
