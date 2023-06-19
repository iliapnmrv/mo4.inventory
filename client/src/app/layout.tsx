import NavHeader from "components/Header/NavHeader";
import { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Инвентаризация",
  description: "Инвентаризация by МО4",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <NavHeader>{children}</NavHeader>
        </Providers>
      </body>
    </html>
  );
}
