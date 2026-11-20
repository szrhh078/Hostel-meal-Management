import type { Resident, Room, Transaction, MealEntry } from "../types";

export const demoResidents: Resident[] = [
  { id: "R-1001", name: "Arafat Hossain", email: "arafat@example.com", phone: "+880 1712-000001", room: "A-201", joined: "2026-09-01", status: "Active", balance: 1250 },
  { id: "R-1002", name: "Nusrat Jahan", email: "nusrat@example.com", phone: "+880 1812-000002", room: "A-202", joined: "2026-09-04", status: "Active", balance: 0 },
  { id: "R-1003", name: "Tanvir Ahmed", email: "tanvir@example.com", phone: "+880 1912-000003", room: "B-101", joined: "2026-09-10", status: "Pending", balance: 2300 },
  { id: "R-1004", name: "Sadia Islam", email: "sadia@example.com", phone: "+880 1612-000004", room: "B-102", joined: "2026-10-02", status: "Active", balance: 750 },
  { id: "R-1005", name: "Mehedi Hasan", email: "mehedi@example.com", phone: "+880 1512-000005", room: "C-301", joined: "2026-10-12", status: "Inactive", balance: 0 }
];
export const demoRooms: Room[] = [
  { id: "A-201", name: "Room 201", beds: 4, occupied: 3, floor: "2nd Floor" },
  { id: "A-202", name: "Room 202", beds: 4, occupied: 4, floor: "2nd Floor" },
  { id: "B-101", name: "Room 101", beds: 3, occupied: 2, floor: "1st Floor" },
  { id: "B-102", name: "Room 102", beds: 3, occupied: 3, floor: "1st Floor" },
  { id: "C-301", name: "Room 301", beds: 2, occupied: 1, floor: "3rd Floor" }
];
export const demoTransactions: Transaction[] = [
  { id: "TX-901", title: "Monthly resident deposits", category: "Deposits", amount: 18500, type: "Income", date: "2026-11-18", status: "Paid" },
  { id: "TX-902", title: "Grocery purchase", category: "Kitchen", amount: 8200, type: "Expense", date: "2026-11-17", status: "Paid" },
  { id: "TX-903", title: "Electricity bill", category: "Utilities", amount: 4600, type: "Expense", date: "2026-11-15", status: "Pending" },
  { id: "TX-904", title: "Room rent collection", category: "Rent", amount: 12000, type: "Income", date: "2026-11-12", status: "Paid" }
];
export const demoMeals: MealEntry[] = [
  { id: "M-01", resident: "Arafat Hossain", date: "2026-11-19", breakfast: true, lunch: true, dinner: true },
  { id: "M-02", resident: "Nusrat Jahan", date: "2026-11-19", breakfast: false, lunch: true, dinner: true },
  { id: "M-03", resident: "Tanvir Ahmed", date: "2026-11-19", breakfast: true, lunch: true, dinner: false },
  { id: "M-04", resident: "Sadia Islam", date: "2026-11-19", breakfast: true, lunch: false, dinner: true }
];