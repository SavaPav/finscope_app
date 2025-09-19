import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/providers/authProvider";
import type { TransactionDoc } from "@/types/models";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { signOut } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Alert, Dimensions, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, G, Line, Polyline, Text as SvgText } from "react-native-svg";


type Txn = TransactionDoc & { id: string };

const MONTHS_BACK = 6;

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function lastNMonthsKeys(n: number, base = new Date()): { key: string; label: string }[] {
  const arr: { key: string; label: string }[] = [];
  const baseYear = base.getFullYear();
  const baseMonth = base.getMonth(); // 0-11
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(baseYear, baseMonth - i, 1);
    arr.push({
      key: monthKey(d),
      label: d.toLocaleString(undefined, { month: "short" }), // Jan, Feb...
    });
  }
  return arr;
}

function buildMonthlySeries(txns: Txn[]) {
  const buckets = lastNMonthsKeys(MONTHS_BACK);
  const byKey = Object.fromEntries(buckets.map((b) => [b.key, { income: 0, expense: 0 }]));

  for (const t of txns) {
    const d = (t.createdAt as any)?.toDate?.() as Date | undefined;
    if (!d) continue;
    const key = monthKey(d);
    if (byKey[key]) {
      if (t.typeId === "income") byKey[key].income += Number(t.amount) || 0;
      else byKey[key].expense += Number(t.amount) || 0;
    }
  }

  const income = buckets.map((b) => byKey[b.key]?.income ?? 0);
  const expense = buckets.map((b) => byKey[b.key]?.expense ?? 0);
  const max = Math.max(1, ...income, ...expense);
  return { labels: buckets.map((b) => b.label), income, expense, max };
}

function IncomeExpenseChart({
  income,
  expense,
  labels,
  max,
}: {
  income: number[];
  expense: number[];
  labels: string[];
  max: number;
}) {
  const width = Math.min(Dimensions.get("window").width - 24 * 2, 700);
  const height = 180;
  const padX = 20;
  const padY = 16;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const n = Math.max(income.length, expense.length);
  const stepX = n > 1 ? innerW / (n - 1) : innerW;

  const y = (v: number) => innerH - (v / max) * innerH;

  const toPoints = (arr: number[]) =>
    arr.map((v, i) => `${padX + i * stepX},${padY + y(v)}`).join(" ");

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((p) => ({
    y: padY + innerH * p,
    val: Math.round(max * (1 - p)),
  }));

  return (
    <View className="rounded-2xl bg-slate-800/80 border border-slate-700/50 p-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-slate-300 text-sm">Income vs Expense (last {MONTHS_BACK} months)</Text>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <View className="w-3 h-3 rounded-full bg-emerald-500" />
            <Text className="text-slate-400 text-xs">Income</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-3 h-3 rounded-full bg-rose-500" />
            <Text className="text-slate-400 text-xs">Expense</Text>
          </View>
        </View>
      </View>

      <Svg width={width} height={height}>
        <G>
          {gridLines.map((g, idx) => (
            <G key={idx}>
              <Line
                x1={padX}
                y1={g.y}
                x2={padX + innerW}
                y2={g.y}
                stroke="#475569"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <SvgText
                x={padX - 6}
                y={g.y + 4}
                fontSize="10"
                fill="#94a3b8"
                textAnchor="end"
              >
                {g.val}
              </SvgText>
            </G>
          ))}
        </G>

        <Polyline
          points={toPoints(income)}
          fill="none"
          stroke="#22c55e"
          strokeWidth={3}
        />
        <Polyline
          points={toPoints(expense)}
          fill="none"
          stroke="#f43f5e"
          strokeWidth={3}
        />

        {income.length > 0 && (
          <Circle
            cx={padX + (income.length - 1) * stepX}
            cy={padY + y(income[income.length - 1])}
            r={4}
            fill="#22c55e"
          />
        )}
        {expense.length > 0 && (
          <Circle
            cx={padX + (expense.length - 1) * stepX}
            cy={padY + y(expense[expense.length - 1])}
            r={4}
            fill="#f43f5e"
          />
        )}

        <G>
          {labels.map((lab, i) => (
            <SvgText
              key={i}
              x={padX + i * stepX}
              y={padY + innerH + 14}
              fontSize="10"
              fill="#94a3b8"
              textAnchor="middle"
            >
              {lab}
            </SvgText>
          ))}
        </G>
      </Svg>
    </View>
  );
}


export default function StatisticsScreen() {
  const { user, loading, userDoc } = useAuth();
  const [txns, setTxns] = useState<Txn[]>([]);

  useEffect(() => {
    if (!user) return;
    // bez orderBy da ne zahteva composite index
    const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
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

  const stats = useMemo(() => {
    let income = 0,
      expense = 0,
      incomeCount = 0,
      expenseCount = 0;
    for (const t of txns) {
      if (t.typeId === "income") {
        income += Number(t.amount) || 0;
        incomeCount++;
      } else {
        expense += Number(t.amount) || 0;
        expenseCount++;
      }
    }
    const net = income - expense;
    const max = Math.max(income, expense, 1);
    return { income, expense, net, incomeCount, expenseCount, max };
  }, [txns]);

  // monthly series for chart
  const series = useMemo(() => buildMonthlySeries(txns), [txns]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-900">
        <Text className="text-slate-300">Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      {/* top user bar */}
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
          <Text className="text-slate-200 font-semibold">Sign Out</Text>
        </Pressable>
      </View>

      {/* title */}
      <View className="px-6 mt-6">
        <Text className="text-center text-4xl font-extrabold tracking-tight text-slate-100">
          <Text className="text-indigo-400">Statistics</Text> Page
        </Text>
        <Text className="text-center text-slate-400 mt-1">Income vs Expense overview</Text>
      </View>

      {/* summary cards */}
      <View className="mx-6 mt-4 flex-row gap-3">
        <View className="flex-1 rounded-2xl bg-slate-800/80 border border-slate-700/50 p-4">
          <Text className="text-slate-400 text-xs">Income</Text>
          <Text className="text-emerald-400 text-2xl font-extrabold mt-1">
            +{stats.income} RSD
          </Text>
          <Text className="text-slate-500 text-xs mt-1">{stats.incomeCount} items</Text>
        </View>
        <View className="flex-1 rounded-2xl bg-slate-800/80 border border-slate-700/50 p-4">
          <Text className="text-slate-400 text-xs">Expense</Text>
          <Text className="text-rose-400 text-2xl font-extrabold mt-1">
            -{stats.expense} RSD
          </Text>
          <Text className="text-slate-500 text-xs mt-1">{stats.expenseCount} items</Text>
        </View>
      </View>

      {/* chart card */}
      <View className="mx-6 mt-3">
        <IncomeExpenseChart
          income={series.income}
          expense={series.expense}
          labels={series.labels}
          max={series.max}
        />
      </View>

      {/* Recent transactions list */}
      <View className="mx-6 mt-4 flex-1">
        <Text className="text-slate-100 text-lg font-semibold mb-2">Recent</Text>
        <FlatList
          data={txns.slice(0, 10)}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => {
            const isIncome = item.typeId === "income";
            const cardBg =
              isIncome ? "bg-emerald-900/20 border-emerald-700/30" : "bg-rose-900/20 border-rose-700/30";

            return (
              <View className={`rounded-2xl ${cardBg} border p-4 mb-3`}>
                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-100 font-semibold">{item.title}</Text>
                  <Text className={`font-bold ${isIncome ? "text-emerald-400" : "text-rose-400"}`}>
                    {isIncome ? "+" : "-"}
                    {item.amount} RSD
                  </Text>
                </View>
                {!!item.description && (
                  <Text className="text-slate-300 mt-1">{item.description}</Text>
                )}
              </View>
            );
          }}
          ListEmptyComponent={<Text className="text-slate-400">No data yet.</Text>}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </SafeAreaView>
  );
}
