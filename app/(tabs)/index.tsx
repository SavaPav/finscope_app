import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/providers/authProvider";
import type { TransactionDoc } from "@/types/models";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where
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
      `Are you sure you want to delete "${item.title}"?`,
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
    const iconName = isIncome ? "arrow-upward" : "arrow-downward";
  
    // Dark theme color palette
    const tone = isIncome
      ? {
          bg: "bg-emerald-900/30",
          text: "text-emerald-300",
          iconHex: "#34d399",
          border: "border-emerald-500/40",
          pillBg: "bg-emerald-800/40",
          pillBorder: "border-emerald-400/50",
          chipBorder: "border-emerald-400/50",
        }
      : {
          bg: "bg-rose-900/30",
          text: "text-rose-300",
          iconHex: "#f87171",
          border: "border-rose-500/40",
          pillBg: "bg-rose-800/40",
          pillBorder: "border-rose-400/50",
          chipBorder: "border-rose-400/50",
        };
  
    const dateText = (() => {
      const ts = item.createdAt as any;
      if (!ts?.toDate) return "";
      const d = ts.toDate();
      return d.toLocaleDateString?.() ?? d.toDateString();
    })();

    const cardBg = isIncome 
    ? "bg-emerald-400/20 border-emerald-700/30" 
    : "bg-rose-400/20 border-rose-700/30";
  
    return (
      <View
        className={`rounded-2xl ${cardBg} border-2 p-4 mb-3`}
        style={{
          elevation: 4,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }}
      >

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">

            <View className={`w-11 h-11 rounded-full items-center justify-center ${tone.bg} border-2 ${tone.border}`}>
              <MaterialIcons name={iconName as any} size={20} color={tone.iconHex} />
            </View>
            <View className="ml-3">
              <Text className="text-slate-100 text-base font-semibold" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-slate-400 text-xs" numberOfLines={1}>
                {dateText}
              </Text>
            </View>
          </View>
  

          <View className={`px-3 py-1 rounded-xl ${tone.pillBg} border-2 ${tone.pillBorder}`}>
            <Text className={`font-extrabold ${tone.text}`}>
              {isIncome ? "+" : "-"}
              {item.amount}
            </Text>
          </View>
        </View>
  

        {!!item.description && (
          <Text className="text-slate-300 mt-3" numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View className="flex-row items-center justify-between mt-3">

          <View className={`px-2 py-1 rounded-lg ${tone.bg} border-2 ${tone.chipBorder}`}>
            <Text className={`text-xs font-semibold ${tone.text}`}>
              {isIncome ? "Income" : "Expense"}
            </Text>
          </View>
  
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => doEdit(item)}
              className="w-9 h-9 rounded-full items-center justify-center bg-slate-700/50 border-2 border-slate-600/50"
            >
              <MaterialIcons name="edit" size={18} color="#cbd5e1" />
            </Pressable>
  

            <Pressable
              onPress={() => doDelete(item)}
              className="w-9 h-9 rounded-full items-center justify-center bg-rose-900/30 border-2 border-rose-600/50"
            >
              <MaterialIcons name="delete-outline" size={18} color="#f87171" />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };
  

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-900">
        <Text className="text-slate-300">Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">

      <View className="bg-slate-800 border border-slate-700/50 p-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <MaterialIcons name="account-circle" size={40} color="#6366f1" />
          <View className="ml-3">
            <Text className="text-slate-100 font-semibold text-xl">
              {userDoc?.name ?? "User"}
            </Text>
            <Text className="text-slate-400 text-xs">
              {userDoc?.email ?? user?.email ?? "-"}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={doLogout}
          className="flex-row items-center gap-1 px-3 py-2 rounded-xl border border-slate-600 bg-slate-700/50"
        >
          <MaterialIcons name="logout" size={18} color="#cbd5e1" />
          <Text className="text-slate-200 font-semibold">Logout</Text>
        </Pressable>
      </View>

      <View className="px-6 mt-6">
        <Text className="text-center text-4xl font-extrabold tracking-tight text-slate-100">
          <Text className="text-indigo-400">Home</Text> Page
        </Text>
        <Text className="text-center text-slate-400 mt-1">
          Add & Review your transactions
        </Text>
      </View>


      <View className="mx-6 mt-4 flex-1">
        <Text className="text-slate-100 text-lg font-semibold mb-2">Your transactions</Text>
        <FlatList
          data={txns}
          keyExtractor={(item) => item.id}
          renderItem={renderTxn}
          ListEmptyComponent={
            <Text className="text-slate-400">No transactions yet. Tap + to add.</Text>
          }
          contentContainerStyle={{ paddingBottom: 96 }}
        />
      </View>

      <Pressable
        onPress={() => router.push("/new-transaction")}
        className="absolute right-6 bottom-6 w-16 h-16 rounded-full bg-indigo-600 items-center justify-center"
        style={{
          elevation: 8,
          shadowColor: "#6366f1",
          shadowOpacity: 0.4,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        <Text className="text-white text-3xl leading-none">+</Text>
      </Pressable>
    </SafeAreaView>
  );
}