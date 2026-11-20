export type ResidentStatus = "Active" | "Pending" | "Inactive";
export type Resident = {
  id: string; name: string; email: string; phone: string; room: string;
  joined: string; status: ResidentStatus; balance: number;
};
export type Room = { id: string; name: string; beds: number; occupied: number; floor: string; };
export type Transaction = {
  id: string; title: string; category: string; amount: number;
  type: "Income" | "Expense"; date: string; status: "Paid" | "Pending";
};
export type MealEntry = { id: string; resident: string; residentId?: string; date: string; breakfast: boolean; lunch: boolean; dinner: boolean; };
export type InventoryItem = { id:string; name:string; category:string; quantity:number; unit:string; reorderLevel:number; };
export type BazarEntry = { id: string; date: string; item: string; category: string; quantity: number; unit: string; amount: number; purchasedBy: string; notes: string; recordedAt?: string };
export type MealAdvance = { id: string; residentId: string; resident: string; date: string; amount: number; method: string; reference: string; notes: string; recordedAt?: string };
