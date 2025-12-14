export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" dir="ltr">
      <body>
        {/* TODO: CircuitRack Header (zh) */}
        {children}
        {/* TODO: CircuitRack Footer (zh) */}
      </body>
    </html>
  );
}