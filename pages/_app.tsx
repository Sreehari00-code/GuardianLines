import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { ThemeProvider } from "@/context/ThemeContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  );
}
