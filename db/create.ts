import { auth, db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

type CreateTxnInput = {
  title: string;
  amount: number;
  description?: string;
  typeId: "income" | "expense";
};

export async function createTransaction(input: CreateTxnInput) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  await addDoc(collection(db, "transactions"), {
    userId: user.uid,
    typeId: input.typeId,
    title: input.title,
    amount: input.amount,
    description: input.description ?? "",
    createdAt: serverTimestamp(),
  });
}