export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {/* TODO: CircuitRack Header (ar) */}
        {children}
        {/* TODO: CircuitRack Footer (ar) */}
      </body>
    </html>
  );
}