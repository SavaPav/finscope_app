import { db } from "@/lib/firebase";
import type { TransactionDoc, TransactionTypeName } from "@/types/models";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export default function EditTransactionModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [typeId, setTypeId] = useState<TransactionTypeName>("income");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        const ref = doc(db, "transactions", String(id));
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          Alert.alert("Not found", "Transaction no longer exists.");
          return router.back();
        }
        const data = snap.data() as TransactionDoc;
        setTitle(data.title);
        setAmount(String(data.amount));
        setTypeId(data.typeId as TransactionTypeName);
        setDescription(data.description ?? "");
      } catch (e: any) {
        Alert.alert("Greška", e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const save = async () => {
    try {
      if (!id) return;
      const amt = Number(amount);
      if (!title.trim() || !Number.isFinite(amt) || amt <= 0) {
        return Alert.alert("Greška", "Unesi naslov i pozitivan iznos.");
      }
      setSaving(true);
      const ref = doc(db, "transactions", String(id));
      await updateDoc(ref, {
        title: title.trim(),
        amount: amt,
        typeId,
        description: description.trim(),
        // (po želji) updatedAt: serverTimestamp(),
      } as Partial<TransactionDoc>);
      router.back();
    } catch (e: any) {
      Alert.alert("Greška pri izmeni", e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950">
        <Text className="text-slate-400">Loading…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-950 px-6 justify-center">
      <View className="bg-slate-900/70 rounded-2xl p-5 border border-slate-800">
        <Text className="text-center text-2xl font-extrabold tracking-tight text-white">
          Edit transaction
        </Text>
        <Text className="text-center text-slate-400 mt-1 mb-5">Update the fields below</Text>

        <Text className="text-slate-300 mb-1">Title</Text>
        <TextInput
          className="rounded-xl px-4 py-3 mb-3 bg-slate-800 text-slate-100"
          value={title}
          onChangeText={setTitle}
        />

        <Text className="text-slate-300 mb-1">Amount</Text>
        <TextInput
          className="rounded-xl px-4 py-3 mb-3 bg-slate-800 text-slate-100"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text className="text-slate-300 mb-1">Type</Text>
        <View className="flex-row gap-2 mb-3">
          <Pressable
            onPress={() => setTypeId("income")}
            className={`flex-1 rounded-xl py-3 items-center border ${
              typeId === "income" ? "bg-emerald-600 border-emerald-700" : "bg-slate-800 border-slate-700"
            }`}
          >
            <Text className={`${typeId === "income" ? "text-white" : "text-slate-300"} font-semibold`}>
              Income
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTypeId("expense")}
            className={`flex-1 rounded-xl py-3 items-center border ${
              typeId === "expense" ? "bg-rose-600 border-rose-700" : "bg-slate-800 border-slate-700"
            }`}
          >
            <Text className={`${typeId === "expense" ? "text-white" : "text-slate-300"} font-semibold`}>
              Expense
            </Text>
          </Pressable>
        </View>

        <Text className="text-slate-300 mb-1">Description (optional)</Text>
        <TextInput
          className="rounded-xl px-4 py-3 mb-4 bg-slate-800 text-slate-100"
          value={description}
          onChangeText={setDescription}
        />

        <Pressable disabled={saving} onPress={save} className="bg-indigo-600 rounded-2xl py-3 items-center">
          <Text className="text-white font-semibold">{saving ? "Saving…" : "Save changes"}</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} className="items-center mt-4">
          <Text className="text-slate-400">Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}
