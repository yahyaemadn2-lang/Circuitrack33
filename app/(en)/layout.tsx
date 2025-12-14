export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        {/* TODO: CircuitRack Header (en) */}
        {children}
        {/* TODO: CircuitRack Footer (en) */}
      </body>
    </html>
  );
}