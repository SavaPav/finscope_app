import { signIn } from "@/auth/login";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const doLogin = async () => {
    try {
      await signIn(email.trim(), password);
      router.replace("/");
    } catch (e: any) {
      Alert.alert("Greška pri prijavi", e?.message ?? String(e));
    }
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-2xl font-bold mb-6">Prijava</Text>

      <Text className="mb-1">Email</Text>
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text className="mb-1">Lozinka</Text>
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable onPress={doLogin} className="bg-black rounded-2xl py-3 items-center">
        <Text className="text-white font-semibold">Sign in</Text>
      </Pressable>

      <Link href="/auth/register" className="text-blue-600">
        Nemaš nalog? Registruj se
      </Link>
    </View>
  );
}