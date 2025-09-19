import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export async function signUp(name: string, email: string, password: string, age: number) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // (opciono) prikaži ime na profilu auth korisnika
  await updateProfile(cred.user, { displayName: name });

  // upiši user dokument u Firestore
  const userRef = doc(db, "users", cred.user.uid);
  await setDoc(userRef, {
    name,
    email,
    age,
    createdAt: serverTimestamp(),
  });
}