import { db } from "@/lib/firebase";
import { useAuth } from "@/providers/authProvider";
import type { TransactionDoc } from "@/types/models";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Txn = TransactionDoc & { id: string };

export default function StatisticsScreen() {
  const { user, loading, userDoc } = useAuth();
  const [txns, setTxns] = useState<Txn[]>([]);

  useEffect(() => {
    if (!user) return;
    // bez orderBy da ne traži kompozitni indeks
    const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setTxns(snap.docs.map((d) => ({ id: d.id, ...(d.data() as TransactionDoc) })));
    });
    return unsub;
  }, [user]);

  const stats = useMemo(() => {
    let income = 0, expense = 0, incomeCount = 0, expenseCount = 0;
    for (const t of txns) {
      if (t.typeId === "income") { income += Number(t.amount) || 0; incomeCount++; }
      else { expense += Number(t.amount) || 0; expenseCount++; }
    }
    const net = income - expense;
    const max = Math.max(income, expense, 1);
    return { income, expense, net, incomeCount, expenseCount, max };
  }, [txns]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-100">
        <Text className="text-slate-600">Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <View className="bg-white border border-slate-200 p-4 flex-row items-center">
        <MaterialIcons name="account-circle" size={40} color="#334155" />
        <View className="ml-3">
          <Text className="text-slate-900 font-semibold text-xl">
            {userDoc?.name ?? "User"}
          </Text>
          <Text className="text-slate-500 text-xs">
            {userDoc?.email ?? user?.email ?? "-"}
          </Text>
        </View>
      </View>
      {/* Header */}
      <View className="px-6 mt-6">
      <Text className="text-center text-4xl font-extrabold tracking-tight text-slate-900">
          <Text className="text-indigo-600">Statistics</Text> Page
        </Text>
        <Text className="text-center text-slate-500 mt-1">Income vs Expense overview</Text>
      </View>

      {/* Summary cards */}
      <View className="mx-6 mt-4 flex-row gap-3">
        <View className="flex-1 rounded-2xl bg-white border border-slate-200 p-4">
          <Text className="text-slate-500 text-xs">Income</Text>
          <Text className="text-emerald-600 text-2xl font-extrabold mt-1">+{stats.income}</Text>
          <Text className="text-slate-400 text-xs mt-1">{stats.incomeCount} items</Text>
        </View>
        <View className="flex-1 rounded-2xl bg-white border border-slate-200 p-4">
          <Text className="text-slate-500 text-xs">Expense</Text>
          <Text className="text-rose-600 text-2xl font-extrabold mt-1">-{stats.expense}</Text>
          <Text className="text-slate-400 text-xs mt-1">{stats.expenseCount} items</Text>
        </View>
      </View>

      <View className="mx-6 mt-3 rounded-2xl bg-white border border-slate-200 p-4">
        <Text className="text-slate-500 text-xs mb-2">Net balance</Text>
        <Text
          className={`text-2xl font-extrabold ${
            stats.net >= 0 ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          {stats.net >= 0 ? "+" : "-"}
          {Math.abs(stats.net)}
        </Text>

        {/* Horizontal comparison bars */}
        <View className="mt-4">
          <Text className="text-slate-600 mb-1">Income</Text>
          <View className="h-3 rounded-full bg-slate-200 overflow-hidden">
            <View
              className="h-3 bg-emerald-500 rounded-full"
              style={{ width: `${(stats.income / stats.max) * 100}%` }}
            />
          </View>

          <Text className="text-slate-600 mt-3 mb-1">Expense</Text>
          <View className="h-3 rounded-full bg-slate-200 overflow-hidden">
            <View
              className="h-3 bg-rose-500 rounded-full"
              style={{ width: `${(stats.expense / stats.max) * 100}%` }}
            />
          </View>
        </View>
      </View>

      {/* Optional: simple list of last few items */}
      <View className="mx-6 mt-4 flex-1">
        <Text className="text-slate-900 text-lg font-semibold mb-2">Recent</Text>
        <FlatList
          data={txns.slice(0, 10)}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View className="rounded-2xl bg-white border border-slate-200 p-4 mb-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-900 font-semibold">{item.title}</Text>
                <Text
                  className={`font-bold ${
                    item.typeId === "income" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {item.typeId === "income" ? "+" : "-"}
                  {item.amount}
                </Text>
              </View>
              {!!item.description && (
                <Text className="text-slate-600 mt-1">{item.description}</Text>
              )}
            </View>
          )}
          ListEmptyComponent={<Text className="text-slate-500">No data yet.</Text>}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </SafeAreaView>
  );
}
