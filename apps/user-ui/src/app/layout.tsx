import Header from "../shared/widgets/header";
import "./global.css";
import { Poppins, Inter, Oregano, Jost } from "next/font/google";
import Providers from "./providers";

export const metadata = {
  title: "Zshop",
  description: "Zshop _ Multi-Vendor SaaS Platform",
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-inter",
});
const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jost",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const oregano = Oregano({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-oregano",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${inter.variable} ${oregano.variable} ${jost.variable}`}
      >
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
