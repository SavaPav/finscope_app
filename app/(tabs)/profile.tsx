import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/providers/authProvider";
import { MaterialIcons } from "@expo/vector-icons";
import { signOut, updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, userDoc, loading } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    setNewName(userDoc?.name ?? "");
  }, [userDoc?.name]);

  const doLogout = async () => {
    try {
      await signOut(auth);
    } catch (e: any) {
      Alert.alert("Greška pri odjavi", e?.message ?? String(e));
    }
  };

  const saveName = async () => {
    try {
      const trimmed = newName.trim();
      if (!trimmed || trimmed.length < 2) {
        return Alert.alert("Greška", "Ime mora imati bar 2 znaka.");
      }
      if (!user) return Alert.alert("Nisi prijavljen.");

      setSaving(true);
      // 1) Firestore: users/{uid}.name
      await updateDoc(doc(db, "users", user.uid), { name: trimmed });
      // 2) Firebase Auth: displayName
      await updateProfile(auth.currentUser!, { displayName: trimmed });

      setEditing(false);
    } catch (e: any) {
      Alert.alert("Greška pri čuvanju", e?.message ?? String(e));
    } finally {
      setSaving(false);
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
      <View className="mx-6 mt-4 rounded-2xl bg-white border border-slate-200 p-5">
        {/* Avatar + email */}
        <View className="flex-row items-center">
          <MaterialIcons name="account-circle" size={56} color="#334155" />
          <View className="ml-3">
            <Text className="text-slate-900 text-lg font-semibold">
              {userDoc?.name ?? "User"}
            </Text>
            <Text className="text-slate-500">{userDoc?.email ?? user?.email ?? "-"}</Text>
          </View>
        </View>

        {/* Name row / editor */}
        <View className="mt-5">
          <Text className="text-slate-500 text-xs mb-1">Display name</Text>

          {!editing ? (
            <View className="flex-row items-center justify-between">
              <Text className="text-slate-900 text-base font-medium">
                {userDoc?.name ?? "—"}
              </Text>
              <Pressable
                onPress={() => setEditing(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-100"
              >
                <Text className="text-slate-700 font-semibold text-xs">Edit</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <TextInput
                className="rounded-xl px-4 py-3 bg-slate-100 text-slate-900 border border-slate-300"
                placeholder="Your name"
                placeholderTextColor="#64748b"
                value={newName}
                onChangeText={setNewName}
              />
              <View className="flex-row gap-2 mt-3">
                <Pressable
                  disabled={saving}
                  onPress={saveName}
                  className="flex-1 bg-indigo-600 rounded-2xl py-3 items-center"
                >
                  <Text className="text-white font-semibold">
                    {saving ? "Saving…" : "Save"}
                  </Text>
                </Pressable>
                <Pressable
                  disabled={saving}
                  onPress={() => {
                    setNewName(userDoc?.name ?? "");
                    setEditing(false);
                  }}
                  className="flex-1 rounded-2xl py-3 items-center border border-slate-300 bg-slate-100"
                >
                  <Text className="text-slate-700 font-semibold">Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Other info */}
        <View className="mt-5 gap-2">
          <Text className="text-slate-700">
            Age: <Text className="font-medium">{userDoc?.age ?? "-"}</Text>
          </Text>
          <Text className="text-slate-700">
            UID: <Text className="font-medium">{user?.uid ?? "-"}</Text>
          </Text>
        </View>

        {/* Logout */}
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
