import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default:
      "Full Electric — Motos Elétricas em Curitiba | Autopropelido, Res. CONTRAN 996/2023",
    template: "%s | Full Electric — Motos Elétricas Curitiba",
  },
  description:
    "Scooter elétrica em Curitiba com pronta entrega. Equipamento de mobilidade individual autopropelido (Res. CONTRAN 996/2023): dispensa CNH, placa e IPVA. A partir de R$ 8.499, nota fiscal e 6 meses de garantia. Test drive gratuito.",
  keywords: [
    "moto elétrica sem cnh curitiba",
    "scooter elétrica curitiba",
    "autopropelido curitiba",
    "moto elétrica para ifood",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
