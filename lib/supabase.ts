import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Data Types
export interface Patient {
  id: string
  full_name: string
  phone: string
  email?: string | null
  birth_date?: string | null
  address?: string | null
  medical_notes?: string | null
  created_at: string
  updated_at: string
}

export interface Doctor {
  id: string
  full_name: string
  specialization: string
  phone?: string | null
  email?: string | null
  price_per_hour: number
  schedule?: {
    monday?: string[]
    tuesday?: string[]
    wednesday?: string[]
    thursday?: string[]
    friday?: string[]
    saturday?: string[]
    sunday?: string[]
  } | null
  created_at: string
}

export interface Service {
  id: string
  name: string
  description?: string | null
  price: number
  duration_minutes: number
  created_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  service_id?: string | null
  appointment_date: string
  appointment_time: string
  status: "scheduled" | "completed" | "cancelled" | "no_show"
  notes?: string | null
  price?: number | null
  created_at: string
  updated_at: string
  patient?: { full_name: string; phone: string; email?: string }
  doctor?: { full_name: string; specialization: string }
  service?: { name: string; price: number }
}

export interface MedicalRecord {
  id: string
  patient_id: string
  doctor_id: string
  tooth_number?: number | null
  diagnosis: string
  treatment?: string | null
  notes?: string | null
  date: string
  status: "active" | "completed" | "cancelled"
  created_at: string
  updated_at: string
  patient?: { full_name: string }
  doctor?: { full_name: string; specialization: string }
}

export interface Treatment {
  id: string
  patient_id: string
  doctor_id: string
  service_id?: string | null
  tooth_number?: number | null
  treatment_plan: string
  estimated_cost?: number | null
  estimated_sessions: number
  priority: "low" | "medium" | "high" | "urgent"
  status: "planned" | "in_progress" | "completed" | "cancelled"
  start_date?: string | null
  end_date?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  patient?: { full_name: string }
  doctor?: { full_name: string; specialization: string }
  service?: { name: string; price: number }
}

export interface Invoice {
  id: string
  patient_id: string
  appointment_id?: string | null
  invoice_number: string
  date: string
  due_date: string
  status: "draft" | "sent" | "paid" | "overdue"
  subtotal: number
  tax_amount: number
  total_amount: number
  notes?: string | null
  created_at: string
  updated_at: string
  patient?: { full_name: string; email?: string; phone: string; address?: string }
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  service_id?: string | null
  description: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface Profile {
  id: string
  full_name?: string | null
  role: string
  specialization?: string | null
  phone?: string | null
  created_at: string
}

export type CalendarView = "day" | "week" | "month"

export interface AppointmentFormData {
  patient_id: string
  doctor_id: string
  service_id?: string
  appointment_date: string
  appointment_time: string
  notes?: string
  status: "scheduled" | "completed" | "cancelled" | "no_show"
  price?: number | null
}

export interface DoctorFormData {
  full_name: string
  specialization: string
  phone: string
  email?: string
  price_per_hour: number
  schedule: {
    monday: string[]
    tuesday: string[]
    wednesday: string[]
    thursday: string[]
    friday: string[]
    saturday: string[]
    sunday: string[]
  }
}

export interface ServiceFormData {
  name: string
  description?: string
  price: number
  duration_minutes: number
}

export interface InvoiceFormData {
  patient_id: string
  appointment_id?: string
  due_date: string
  notes?: string
  items: {
    service_id?: string
    description: string
    quantity: number
    unit_price: number
  }[]
}

export interface MedicalRecordFormData {
  patient_id: string
  doctor_id: string
  tooth_number?: number
  diagnosis: string
  treatment?: string
  notes?: string
  date: string
  status: "active" | "completed" | "cancelled"
}

export interface TreatmentFormData {
  patient_id: string
  doctor_id: string
  service_id?: string
  tooth_number?: number
  treatment_plan: string
  estimated_cost?: number
  estimated_sessions: number
  priority: "low" | "medium" | "high" | "urgent"
  status: "planned" | "in_progress" | "completed" | "cancelled"
  start_date?: string
  end_date?: string
  notes?: string
}
