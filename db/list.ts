import { auth, db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

export async function listMyTransactions() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const q = query(
    collection(db, "transactions"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}