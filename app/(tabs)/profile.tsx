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
      Alert.alert("Error", e?.message ?? String(e));
    }
  };

  const saveName = async () => {
    try {
      const trimmed = newName.trim();
      if (!trimmed || trimmed.length < 2) {
        return Alert.alert("Error", "Name needs to have at least 2 characters.");
      }
      if (!user) return Alert.alert("Login failed.");

      setSaving(true);
      // 1) Firestore: users/{uid}.name
      await updateDoc(doc(db, "users", user.uid), { name: trimmed });
      // 2) Firebase Auth: displayName
      await updateProfile(auth.currentUser!, { displayName: trimmed });

      setEditing(false);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-900">
        <Text className="text-slate-300">Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950">

      <View className="px-6 mt-10 mb-6">
        <Text className="text-center text-4xl font-extrabold tracking-tight text-slate-100">
          <Text className="text-indigo-400">Profile</Text> Settings
        </Text>
        <Text className="text-center text-slate-400 mt-1">
          Manage your account information
        </Text>
      </View>

      <View 
        className="mx-6 rounded-3xl bg-slate-800/90 border border-slate-700/60 p-6"
        style={{
          elevation: 8,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
        }}
      >

        <View className="items-center mb-6">
          <View 
            className="w-20 h-20 rounded-full bg-indigo-600/20 border-3 border-indigo-500/40 items-center justify-center mb-3"
            style={{
              elevation: 4,
              shadowColor: "#6366f1",
              shadowOpacity: 0.3,
              shadowRadius: 2,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <MaterialIcons name="account-circle" size={64} color="#6366f1" />
          </View>
          <Text className="text-slate-100 text-xl font-bold">
            {userDoc?.name ?? "User"}
          </Text>
          <Text className="text-slate-400 text-sm">
            {userDoc?.email ?? user?.email ?? "-"}
          </Text>
        </View>


        <View className="h-px bg-slate-700/50 mb-6" />


        <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="edit" size={16} color="#6366f1" />
            <Text className="text-indigo-400 text-sm font-semibold ml-2">Display Name</Text>
          </View>

          {!editing ? (
            <View className="flex-row items-center justify-between bg-slate-700/30 rounded-xl px-4 py-3 border border-slate-600/40">
              <Text className="text-slate-100 text-base font-medium">
                {userDoc?.name ?? "—"}
              </Text>
              <Pressable
                onPress={() => setEditing(true)}
                className="px-3 py-1.5 rounded-lg border border-indigo-500/50 bg-indigo-600/20"
              >
                <Text className="text-indigo-300 font-semibold text-xs">Edit</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <TextInput
                className="rounded-xl px-4 py-3 bg-slate-700/50 text-slate-100 border-2 border-indigo-500/40 mb-3"
                placeholder="Enter your name"
                placeholderTextColor="#64748b"
                value={newName}
                onChangeText={setNewName}
                style={{ fontSize: 16 }}
              />
              <View className="flex-row gap-3">
                <Pressable
                  disabled={saving}
                  onPress={saveName}
                  className="flex-1 bg-indigo-600 rounded-xl py-3 items-center"
                  style={{
                    elevation: 4,
                    shadowColor: "#6366f1",
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 3 },
                  }}
                >
                  <Text className="text-white font-bold">
                    {saving ? "Saving…" : "Save Changes"}
                  </Text>
                </Pressable>
                <Pressable
                  disabled={saving}
                  onPress={() => {
                    setNewName(userDoc?.name ?? "");
                    setEditing(false);
                  }}
                  className="flex-1 rounded-xl py-3 items-center border border-slate-600 bg-slate-700/50"
                >
                  <Text className="text-slate-300 font-bold">Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>


        <View className="h-px bg-slate-700/50 mb-6" />


        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="info-outline" size={16} color="#6366f1" />
            <Text className="text-indigo-400 text-sm font-semibold ml-2">Account Information</Text>
          </View>
          
          <View className="bg-slate-700/20 rounded-xl p-4 border border-slate-600/30">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-slate-400 text-sm">Age</Text>
              <Text className="font-medium text-slate-100">{userDoc?.age ?? "Not set"}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-slate-400 text-sm">User ID</Text>
              <Text className="font-medium text-slate-100 text-xs">
                {user?.uid}
              </Text>
            </View>
          </View>
        </View>


        <Pressable
          onPress={doLogout}
          className="bg-red-900 rounded-xl py-4 items-center flex-row justify-center"
        >
          <MaterialIcons name="logout" size={20} color="white" />
          <Text className="text-white font-bold text-base ml-2">Sign Out</Text>
        </Pressable>
      </View>


      <View className="h-8" />
    </SafeAreaView>
  );
}