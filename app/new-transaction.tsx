import { db } from "@/lib/firebase";
import { useAuth } from "@/providers/authProvider";
import type { TransactionDoc, TransactionTypeName } from "@/types/models";
import { router } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export default function NewTransactionModal() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [typeId, setTypeId] = useState<TransactionTypeName>("income");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      if (!user) return Alert.alert("Not authenticated");
      const amt = Number(amount);
      if (!title.trim() || !Number.isFinite(amt) || amt <= 0) {
        return Alert.alert("Error", "Insert valid values.");
      }

      setSaving(true);
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        typeId,
        title: title.trim(),
        amount: amt,
        description: description.trim(),
        createdAt: serverTimestamp(),
      } as TransactionDoc);

      router.back(); // zatvori modal
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-950 px-6 justify-center">
      <View className="bg-slate-900/70 rounded-2xl p-5 border border-slate-800">
        <Text className="text-center text-2xl font-extrabold tracking-tight text-white">
          Add transaction
        </Text>
        <Text className="text-center text-slate-400 mt-1 mb-5">Fill the details below</Text>

        <Text className="text-slate-300 mb-1">Title</Text>
        <TextInput
          className="rounded-xl px-4 py-3 mb-3 bg-slate-800 text-slate-100"
          placeholder="e.g. Salary / Groceries"
          placeholderTextColor="#94a3b8"
          value={title}
          onChangeText={setTitle}
        />

        <Text className="text-slate-300 mb-1">Amount</Text>
        <TextInput
          className="rounded-xl px-4 py-3 mb-3 bg-slate-800 text-slate-100"
          placeholder="e.g. 250"
          placeholderTextColor="#94a3b8"
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
            <Text className={`${typeId === "income" ? "text-white" : "text-slate-300"} font-semibold`}>Income</Text>
          </Pressable>
          <Pressable
            onPress={() => setTypeId("expense")}
            className={`flex-1 rounded-xl py-3 items-center border ${
              typeId === "expense" ? "bg-rose-600 border-rose-700" : "bg-slate-800 border-slate-700"
            }`}
          >
            <Text className={`${typeId === "expense" ? "text-white" : "text-slate-300"} font-semibold`}>Expense</Text>
          </Pressable>
        </View>

        <Text className="text-slate-300 mb-1">Description (optional)</Text>
        <TextInput
          className="rounded-xl px-4 py-3 mb-4 bg-slate-800 text-slate-100"
          placeholder="Notes…"
          placeholderTextColor="#94a3b8"
          value={description}
          onChangeText={setDescription}
        />

        <Pressable
          disabled={saving}
          onPress={save}
          className="bg-indigo-600 rounded-2xl py-3 items-center"
        >
          <Text className="text-white font-semibold">{saving ? "Saving…" : "Save"}</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} className="items-center mt-4">
          <Text className="text-slate-400">Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}
