import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { PastureCreationProvider } from "@/components/ui/pasture-form/PastureCreationContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pasture Plus",
  description: "Create and manage ranch pastures on a map",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PastureCreationProvider>{children}</PastureCreationProvider>
      </body>
    </html>
  );
}
