import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export async function signIn(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password);
}