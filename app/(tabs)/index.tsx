import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/providers/authProvider";
import type { TransactionDoc } from "@/types/models";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TxnItem = TransactionDoc & { id: string };

export default function HomeScreen() {
  const { user, userDoc, loading } = useAuth();
  const [txns, setTxns] = useState<TxnItem[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setTxns(snap.docs.map((d) => ({ id: d.id, ...(d.data() as TransactionDoc) })));
    });
    return unsub;
  }, [user]);

  const doLogout = async () => {
    try {
      await signOut(auth);
    } catch (e: any) {
      Alert.alert("Greška pri odjavi", e?.message ?? String(e));
    }
  };

  const doDelete = (item: TxnItem) => {
    Alert.alert(
      "Delete transaction",
      `Are you sure you want to delete “${item.title}”?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "transactions", item.id));
            } catch (e: any) {
              Alert.alert("Greška pri brisanju", e?.message ?? String(e));
            }
          },
        },
      ]
    );
  };

  const doEdit = (item: TxnItem) => {
    router.push({ pathname: "/edit-transaction/[id]", params: { id: item.id } });
  };

  const renderTxn = ({ item }: { item: TxnItem }) => {
    const isIncome = item.typeId === "income";
    const badge = isIncome
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-rose-100 text-rose-700 border-rose-200";
    const sign = isIncome ? "+" : "-";
    const dateText = (() => {
      const ts = item.createdAt as unknown as Timestamp | undefined;
      if (!ts || typeof (ts as any).toDate !== "function") return "";
      const d = (ts as Timestamp).toDate();
      return d.toLocaleDateString?.() ?? d.toDateString();
    })();

    return (
      <View className="rounded-2xl bg-white border border-slate-200 p-4 mb-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-slate-900 text-base font-semibold">{item.title}</Text>
          <Text className={`px-2 py-1 rounded-xl text-xs border ${badge}`}>
            {isIncome ? "Income" : "Expense"}
          </Text>
        </View>

        {!!item.description && (
          <Text className="text-slate-600 mt-1">{item.description}</Text>
        )}

        {/* Actions */}
        <View className="flex-row justify-end gap-2 mt-3">
          <Pressable
            onPress={() => doEdit(item)}
            className="px-3 py-1 rounded-xl border border-indigo-200 bg-indigo-50"
          >
            <Text className="text-indigo-700 text-xs font-semibold">Edit</Text>
          </Pressable>
          <Pressable
            onPress={() => doDelete(item)}
            className="px-3 py-1 rounded-xl border border-rose-200 bg-rose-50"
          >
            <Text className="text-rose-700 text-xs font-semibold">Delete</Text>
          </Pressable>
        </View>

        <View className="flex-row items-center justify-between mt-3">
          <Text className="text-slate-500 text-xs">{dateText}</Text>
          <Text className={`text-lg font-bold ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
            {sign}{item.amount}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-100">
        <Text className="text-slate-600">Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-300">
      <View className=" bg-white border border-slate-200 p-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <MaterialIcons name="account-circle" size={50} color="#334155" />
          <View className="ml-3">
            <Text className="text-slate-900 font-semibold text-2xl">
              {userDoc?.name ?? "User"}
            </Text>
            <Text className="text-slate-500 text-xs">
              {userDoc?.email ?? user?.email ?? "-"}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={doLogout}
          className="flex-row items-center gap-1 px-3 py-2 rounded-xl border border-slate-300 bg-slate-100"
        >
          <MaterialIcons name="logout" size={18} color="#334155" />
          <Text className="text-slate-700 font-semibold">Logout</Text>
        </Pressable>
      </View>

      {/* Header */}
      <View className="px-6 mt-6">
        <Text className="text-center text-4xl font-extrabold tracking-tight text-slate-900">
          <Text className="text-indigo-600">Home</Text> Page
        </Text>
        <Text className="text-center text-slate-500 mt-1">
          Add & Review your transactions
        </Text>
      </View>

      {/* List */}
      <View className="mx-6 mt-4 flex-1">
        <Text className="text-slate-900 text-lg font-semibold mb-2">Your transactions</Text>
        <FlatList
          data={txns}
          keyExtractor={(item) => item.id}
          renderItem={renderTxn}
          ListEmptyComponent={
            <Text className="text-slate-500">No transactions yet. Tap + to add.</Text>
          }
          contentContainerStyle={{ paddingBottom: 96 }}
        />
      </View>

      <Pressable
        onPress={() => router.push("/new-transaction")}
        className="absolute right-6 bottom-6 w-16 h-16 rounded-full bg-indigo-600 items-center justify-center"
        style={{
          elevation: 6,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <Text className="text-white text-3xl leading-none">+</Text>
      </Pressable>
    </SafeAreaView>
  );
}
