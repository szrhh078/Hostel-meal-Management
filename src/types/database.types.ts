export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      hostels: {
        Row: { id: string; name: string; slug: string | null; address: string | null; phone: string | null; created_by: string; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; slug?: string | null; address?: string | null; phone?: string | null; created_by: string; created_at?: string; updated_at?: string };
        Update: { id?: string; name?: string; slug?: string | null; address?: string | null; phone?: string | null; created_by?: string; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      hostel_members: {
        Row: { id: string; hostel_id: string; user_id: string; role: Database['public']['Enums']['member_role']; status: Database['public']['Enums']['member_status']; joined_at: string };
        Insert: { id?: string; hostel_id: string; user_id: string; role?: Database['public']['Enums']['member_role']; status?: Database['public']['Enums']['member_status']; joined_at?: string };
        Update: { id?: string; hostel_id?: string; user_id?: string; role?: Database['public']['Enums']['member_role']; status?: Database['public']['Enums']['member_status']; joined_at?: string };
        Relationships: [];
      };
      rooms: {
        Row: { id: string; hostel_id: string; room_code: string; floor: string | null; bed_capacity: number; created_at: string };
        Insert: { id?: string; hostel_id: string; room_code: string; floor?: string | null; bed_capacity: number; created_at?: string };
        Update: { id?: string; hostel_id?: string; room_code?: string; floor?: string | null; bed_capacity?: number; created_at?: string };
        Relationships: [];
      };
      residents: {
        Row: { id: string; hostel_id: string; user_id: string | null; room_id: string | null; full_name: string; email: string | null; phone: string | null; status: Database['public']['Enums']['resident_status']; joined_on: string; created_at: string };
        Insert: { id?: string; hostel_id: string; user_id?: string | null; room_id?: string | null; full_name: string; email?: string | null; phone?: string | null; status?: Database['public']['Enums']['resident_status']; joined_on?: string; created_at?: string };
        Update: { id?: string; hostel_id?: string; user_id?: string | null; room_id?: string | null; full_name?: string; email?: string | null; phone?: string | null; status?: Database['public']['Enums']['resident_status']; joined_on?: string; created_at?: string };
        Relationships: [];
      };
      daily_bazar: {
        Row: { id: string; hostel_id: string; bazar_date: string; item_name: string; category: string; quantity: number; unit: string; amount: number; purchased_by: string | null; notes: string | null; created_by: string | null; created_at: string };
        Insert: { id?: string; hostel_id: string; bazar_date?: string; item_name: string; category?: string; quantity?: number; unit?: string; amount: number; purchased_by?: string | null; notes?: string | null; created_by?: string | null; created_at?: string };
        Update: { id?: string; hostel_id?: string; bazar_date?: string; item_name?: string; category?: string; quantity?: number; unit?: string; amount?: number; purchased_by?: string | null; notes?: string | null; created_by?: string | null; created_at?: string };
        Relationships: [];
      };
      meal_advances: {
        Row: { id: string; hostel_id: string; resident_id: string; payment_date: string; amount: number; payment_method: string; reference: string | null; notes: string | null; received_by: string | null; created_at: string };
        Insert: { id?: string; hostel_id: string; resident_id: string; payment_date?: string; amount: number; payment_method?: string; reference?: string | null; notes?: string | null; received_by?: string | null; created_at?: string };
        Update: { id?: string; hostel_id?: string; resident_id?: string; payment_date?: string; amount?: number; payment_method?: string; reference?: string | null; notes?: string | null; received_by?: string | null; created_at?: string };
        Relationships: [];
      };
      inventory_items: {
        Row: { id:string; hostel_id:string; item_name:string; category:string; quantity:number; unit:string; reorder_level:number; created_at:string; updated_at:string };
        Insert: { id?:string; hostel_id:string; item_name:string; category?:string; quantity?:number; unit?:string; reorder_level?:number; created_at?:string; updated_at?:string };
        Update: { id?:string; hostel_id?:string; item_name?:string; category?:string; quantity?:number; unit?:string; reorder_level?:number; updated_at?:string };
        Relationships: [];
      };
      meal_entries: {
        Row: { id: string; hostel_id: string; resident_id: string; meal_date: string; breakfast: boolean; lunch: boolean; dinner: boolean; created_by: string | null; created_at: string };
        Insert: { id?: string; hostel_id: string; resident_id: string; meal_date: string; breakfast?: boolean; lunch?: boolean; dinner?: boolean; created_by?: string | null; created_at?: string };
        Update: { id?: string; hostel_id?: string; resident_id?: string; meal_date?: string; breakfast?: boolean; lunch?: boolean; dinner?: boolean; created_by?: string | null; created_at?: string };
        Relationships: [];
      };
      transactions: {
        Row: { id: string; hostel_id: string; title: string; category: string; amount: number; type: Database['public']['Enums']['transaction_type']; transaction_date: string; status: string; created_by: string | null; created_at: string };
        Insert: { id?: string; hostel_id: string; title: string; category: string; amount: number; type: Database['public']['Enums']['transaction_type']; transaction_date?: string; status?: string; created_by?: string | null; created_at?: string };
        Update: { id?: string; hostel_id?: string; title?: string; category?: string; amount?: number; type?: Database['public']['Enums']['transaction_type']; transaction_date?: string; status?: string; created_by?: string | null; created_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: { create_hostel: { Args: { hostel_name: string; hostel_address?: string; hostel_phone?: string }; Returns: string } };
    Enums: {
      member_role: 'owner' | 'manager' | 'accountant' | 'resident';
      member_status: 'active' | 'invited' | 'suspended';
      resident_status: 'active' | 'pending' | 'inactive';
      transaction_type: 'income' | 'expense';
    };
    CompositeTypes: Record<string, never>;
  };
};
