import Header from "../shared/widgets/header";
import "./global.css";
import { Poppins, Inter, Oregano, Jost } from "next/font/google";
import Providers from "./providers";
import { Toaster } from "react-hot-toast";

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
          <Toaster
            position="top-right"
            toastOptions={{
              className:
                "rounded-lg shadow-xl border border-gray-200 font-medium text-sm backdrop-blur-sm",
              style: {
                background: "white",
                color: "#111",
                padding: "12px 16px",
                maxWidth: "350px",
              },
              success: {
                iconTheme: {
                  primary: "#0ea5e9",
                  secondary: "#e0f2fe",
                },
                style: {
                  borderLeft: "4px solid #0ea5e9",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fee2e2",
                },
                style: {
                  borderLeft: "4px solid #ef4444",
                },
              },
              loading: {
                iconTheme: {
                  primary: "#facc15",
                  secondary: "#fef9c3",
                },
                style: {
                  borderLeft: "4px solid #facc15",
                },
              },
              duration: 4000,
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
