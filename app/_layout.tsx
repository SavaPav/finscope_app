import { useColorScheme } from "@/hooks/use-color-scheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Redirect, Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import "react-native-reanimated";
import "../global.css";
import { AuthProvider, useAuth } from "../providers/authProvider";

export const unstable_settings = {
  anchor: "/",
};

// Gate 
function Gate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const inAuth = pathname?.startsWith("/auth");

  if (loading) {
    return null;
  }

  // Nije ulogovan: šaljemo na login
  if (!user && !inAuth) {
    return <Redirect href="/auth/login" />;
  }

  // Ulogovan
  if (user && inAuth) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Gate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/register" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="new-transaction" options={{ headerShown: false, presentation: "modal" }} />
            <Stack.Screen name="edit-transaction/[id]" options={{ headerShown: false, presentation: "modal" }} />
          </Stack>
        </Gate>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
