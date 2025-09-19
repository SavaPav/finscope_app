import { signUp } from "@/auth/register";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const doRegister = async () => {
    try {
      if (!name || !age) return Alert.alert("Greška", "Unesi ime i godine.");
      await signUp(name.trim(), email.trim(), password, Number(age));
      // Gate u _layout-u će te automatski prebaciti na "/"
    } catch (e: any) {
      Alert.alert("Registracija greška", e?.message ?? String(e));
    }
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-2xl font-bold mb-6">Registracija</Text>

      <Text className="mb-1">Ime</Text>
      <TextInput className="border border-gray-300 rounded-xl px-4 py-3 mb-3" value={name} onChangeText={setName} />

      <Text className="mb-1">Godine</Text>
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
        keyboardType="number-pad"
        value={age}
        onChangeText={setAge}
      />

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

      <Pressable onPress={doRegister} className="bg-black rounded-2xl py-3 items-center">
        <Text className="text-white font-semibold">Sign up</Text>
      </Pressable>
    </View>
  );
}
