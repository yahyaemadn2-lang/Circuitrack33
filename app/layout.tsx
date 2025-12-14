import Providers from "./providers";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import PageWrapper from "../src/components/PageWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <body>
        <Providers>
          <Header />
          <PageWrapper>{children}</PageWrapper>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
