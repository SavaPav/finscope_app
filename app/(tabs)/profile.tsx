import { auth } from "@/lib/firebase";
import { useAuth } from "@/providers/authProvider";
import { MaterialIcons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, userDoc, loading } = useAuth();

  const doLogout = async () => {
    try {
      await signOut(auth);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? String(e));
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-100">
        <Text className="text-slate-600">Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <View className="px-6 mt-3">
        <Text className="text-center text-3xl font-extrabold tracking-tight text-slate-900">
          Profile
        </Text>
        <Text className="text-center text-slate-500 mt-1">Your account details</Text>
      </View>

      <View className="mx-6 mt-4 rounded-2xl bg-white border border-slate-200 p-5">
        <View className="flex-row items-center">
          <MaterialIcons name="account-circle" size={56} color="#334155" />
          <View className="ml-3">
            <Text className="text-slate-900 text-lg font-semibold">
              {userDoc?.name ?? "User"}
            </Text>
            <Text className="text-slate-500">{userDoc?.email ?? user?.email ?? "-"}</Text>
          </View>
        </View>

        <View className="mt-4 gap-2">
          <Text className="text-slate-700">
            Age: <Text className="font-medium">{userDoc?.age ?? "-"}</Text>
          </Text>
          <Text className="text-slate-700">
            UID: <Text className="font-medium">{user?.uid ?? "-"}</Text>
          </Text>
        </View>

        <Pressable
          onPress={doLogout}
          className="mt-6 bg-indigo-600 rounded-2xl py-3 items-center"
        >
          <Text className="text-white font-semibold">Log out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
