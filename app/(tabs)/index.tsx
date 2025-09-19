// app/(tabs)/index.tsx
import { auth } from "@/lib/firebase";
import { useAuth } from "@/providers/authProvider";
import { signOut } from "firebase/auth";
import { Alert, Pressable, Text, View } from "react-native";

export default function HomeScreen() {
  const { userDoc, loading } = useAuth();

  const doLogout = async () => {
    try {
      await signOut(auth);
      // Gate u _layout-u detektuje da user == null i radi Redirect na /auth/login
    } catch (e: any) {
      Alert.alert("Greška pri odjavi", e?.message ?? String(e));
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-4">Dashboard</Text>

      {userDoc ? (
        <View className="mb-8">
          <Text className="text-base">Name: {userDoc.name}</Text>
          <Text className="text-base">Email: {userDoc.email}</Text>
          <Text className="text-base">Age: {userDoc.age}</Text>
        </View>
      ) : (
        <Text className="text-base mb-8">Nema user dokumenta.</Text>
      )}

      <Pressable
        onPress={doLogout}
        className="mt-auto bg-black rounded-2xl py-3 items-center"
      >
        <Text className="text-white font-semibold">Log out</Text>
      </Pressable>
    </View>
  );
}

