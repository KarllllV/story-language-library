import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const SITE_URL = "https://story-language-library.vercel.app";
const SITE_NAME = "Ing. Karl Story Language Library";
const SITE_DESCRIPTION =
  "Učte se anglicky, německy a česky pomocí interaktivních příběhů s poslechem, klikacím překladem, ukládáním slovíček a tréninkem výslovnosti.";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },

  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  creator: "Ing. Karl ArtStudio",
  publisher: "Ing. Karl ArtStudio",

  keywords: [
    "výuka jazyků",
    "angličtina",
    "němčina",
    "čeština pro cizince",
    "interaktivní příběhy",
    "jazykové příběhy",
    "výslovnost",
    "slovní zásoba",
    "poslech cizích jazyků",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Ing. Karl Story Language Library",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="cs"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}