export type TransactionTypeName = "income" | "expense";

// Model 1: Korinsik
export interface UserDoc {
  name: string;
  email: string;
  age: number;
  createdAt: any; // Firebase Timestamp
}

// Model 2: Tipovi transakcije (Ručno naravljen na Firebase-u)
export interface TransactionTypeDoc {
  name: TransactionTypeName;
}

// Model 3: Transakcije
export interface TransactionDoc {
  userId: string;        // UID iz Auth
  typeId: string;        // "income" | "expense"
  title: string;
  amount: number;
  description?: string;
  createdAt: any;        // Firebase Timestamp
}