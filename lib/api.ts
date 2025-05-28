import { supabase } from "./supabase"
import type {
  Patient,
  Profile,
  AppointmentFormData,
  DoctorFormData,
  ServiceFormData,
  InvoiceFormData,
  MedicalRecordFormData,
  TreatmentFormData,
} from "./supabase"

// PROFILES
export const getProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
    if (error) throw error
    return data
  } catch (error: any) {
    console.error("Get profile error:", error)
    throw new Error("Error fetching profile: " + error.message)
  }
}

export const createProfile = async (profile: Omit<Profile, "created_at">) => {
  try {
    const { data, error } = await supabase.from("profiles").insert([profile]).select().single()
    if (error) throw error
    return data
  } catch (error: any) {
    console.error("Create profile error:", error)
    throw new Error("Error creating profile: " + error.message)
  }
}

// PATIENTS
export const getPatients = async () => {
  try {
    const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false })
    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error("Get patients error:", error)
    throw new Error("Error fetching patients: " + error.message)
  }
}

export const createPatient = async (patient: Omit<Patient, "id" | "created_at" | "updated_at">) => {
  try {
    const { data, error } = await supabase.from("patients").insert([patient]).select().single()
    if (error) throw error
    return data
  } catch (error: any) {
    console.error("Create patient error:", error)
    throw new Error("Error creating patient: " + error.message)
  }
}

export const updatePatient = async (id: string, updates: Partial<Patient>) => {
  try {
    const { data, error } = await supabase
      .from("patients")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data
  } catch (error: any) {
    console.error("Update patient error:", error)
    throw new Error("Error updating patient: " + error.message)
  }
}

export const deletePatient = async (id: string) => {
  try {
    const { error } = await supabase.from("patients").delete().eq("id", id)
    if (error) throw error
  } catch (error: any) {
    console.error("Delete patient error:", error)
    throw new Error("Error deleting patient: " + error.message)
  }
}

// DOCTORS
export const getDoctors = async () => {
  try {
    const { data, error } = await supabase.from("doctors").select("*").order("full_name", { ascending: true })
    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error("Get doctors error:", error)
    throw new Error("Error fetching doctors: " + error.message)
  }
}

export const createDoctor = async (doctor: DoctorFormData) => {
  try {
    const { data, error } = await supabase.from("doctors").insert([doctor]).select().single()
    if (error) throw error
    return data
  } catch (error: any) {
    console.error("Create doctor error:", error)
    throw new Error("Error creating doctor: " + error.message)
  }
}

export const updateDoctor = async (id: string, updates: Partial<DoctorFormData>) => {
  try {
    const { data, error } = await supabase.from("doctors").update(updates).eq("id", id).select().single()
    if (error) throw error
    return data
  } catch (error: any) {
    console.error("Update doctor error:", error)
    throw new Error("Error updating doctor: " + error.message)
  }
}

export const deleteDoctor = async (id: string) => {
  try {
    const { error } = await supabase.from("doctors").delete().eq("id", id)
    if (error) throw error
  } catch (error: any) {
    console.error("Delete doctor error:", error)
    throw new Error("Error deleting doctor: " + error.message)
  }
}

// SERVICES
export const getServices = async () => {
  try {
    const { data, error } = await supabase.from("services").select("*").order("name", { ascending: true })
    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error("Get services error:", error)
    throw new Error("Error fetching services: " + error.message)
  }
}

export const createService = async (service: ServiceFormData) => {
  try {
    const { data, error } = await supabase.from("services").insert([service]).select().single()
    if (error) throw error
    return data
  } catch (error: any) {
    console.error("Create service error:", error)
    throw new Error("Error creating service: " + error.message)
  }
}

export const updateService = async (id: string, updates: Partial<ServiceFormData>) => {
  try {
    const { data, error } = await supabase.from("services").update(updates).eq("id", id).select().single()
    if (error) throw error
    return data
  } catch (error: any) {
    console.error("Update service error:", error)
    throw new Error("Error updating service: " + error.message)
  }
}

export const deleteService = async (id: string) => {
  try {
    const { error } = await supabase.from("services").delete().eq("id", id)
    if (error) throw error
  } catch (error: any) {
    console.error("Delete service error:", error)
    throw new Error("Error deleting service: " + error.message)
  }
}

// APPOINTMENTS - ИСПРАВЛЕННАЯ ВЕРСИЯ
export const getAppointments = async () => {
  try {
    console.log("🔄 Fetching all appointments...")

    // Сначала получаем все встречи
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true })

    if (appointmentsError) {
      console.error("❌ Appointments error:", appointmentsError)
      throw appointmentsError
    }

    console.log("✅ Raw appointments:", appointmentsData?.length || 0)

    if (!appointmentsData || appointmentsData.length === 0) {
      console.log("⚠️ No appointments found")
      return []
    }

    // Получаем связанные данные отдельно
    const [patientsData, doctorsData, servicesData] = await Promise.all([
      supabase.from("patients").select("id, full_name, phone, email"),
      supabase.from("doctors").select("id, full_name, specialization"),
      supabase.from("services").select("id, name, price"),
    ])

    // Создаем мапы для быстрого поиска
    const patientsMap = new Map(patientsData.data?.map((p) => [p.id, p]) || [])
    const doctorsMap = new Map(doctorsData.data?.map((d) => [d.id, d]) || [])
    const servicesMap = new Map(servicesData.data?.map((s) => [s.id, s]) || [])

    // Объединяем данные
    const transformedData = appointmentsData.map((appointment) => ({
      ...appointment,
      patient: patientsMap.get(appointment.patient_id) || null,
      doctor: doctorsMap.get(appointment.doctor_id) || null,
      service: appointment.service_id ? servicesMap.get(appointment.service_id) || null : null,
    }))

    console.log("✅ Transformed appointments:", transformedData.length)
    console.log("📊 Sample appointment:", transformedData[0])

    return transformedData
  } catch (error: any) {
    console.error("❌ Get appointments error:", error)
    throw new Error("Error fetching appointments: " + error.message)
  }
}

export const getAppointmentsByDateRange = async (startDate: string, endDate: string) => {
  try {
    console.log(`🔄 Fetching appointments from ${startDate} to ${endDate}`)

    // Сначала получаем встречи в диапазоне дат
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from("appointments")
      .select("*")
      .gte("appointment_date", startDate)
      .lte("appointment_date", endDate)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true })

    if (appointmentsError) {
      console.error("❌ Appointments error:", appointmentsError)
      throw appointmentsError
    }

    console.log("✅ Raw appointments in range:", appointmentsData?.length || 0)

    if (!appointmentsData || appointmentsData.length === 0) {
      console.log("⚠️ No appointments found in date range")
      return []
    }

    // Получаем связанные данные отдельно
    const [patientsData, doctorsData, servicesData] = await Promise.all([
      supabase.from("patients").select("id, full_name, phone, email"),
      supabase.from("doctors").select("id, full_name, specialization"),
      supabase.from("services").select("id, name, price"),
    ])

    // Создаем мапы для быстрого поиска
    const patientsMap = new Map(patientsData.data?.map((p) => [p.id, p]) || [])
    const doctorsMap = new Map(doctorsData.data?.map((d) => [d.id, d]) || [])
    const servicesMap = new Map(servicesData.data?.map((s) => [s.id, s]) || [])

    // Объединяем данные
    const transformedData = appointmentsData.map((appointment) => ({
      ...appointment,
      patient: patientsMap.get(appointment.patient_id) || null,
      doctor: doctorsMap.get(appointment.doctor_id) || null,
      service: appointment.service_id ? servicesMap.get(appointment.service_id) || null : null,
    }))

    console.log("✅ Transformed appointments in range:", transformedData.length)
    console.log("📊 Sample appointment:", transformedData[0])

    return transformedData
  } catch (error: any) {
    console.error("❌ Get appointments by date range error:", error)
    throw new Error("Error fetching appointments by date range: " + error.message)
  }
}

export const createAppointment = async (appointment: AppointmentFormData) => {
  try {
    console.log("🔄 Creating appointment:", appointment)
    const { data, error } = await supabase.from("appointments").insert([appointment]).select("*").single()

    if (error) {
      console.error("❌ Create appointment error:", error)
      throw error
    }

    console.log("✅ Created appointment:", data)

    // Получаем связанные данные для созданной встречи
    const [patientData, doctorData, serviceData] = await Promise.all([
      supabase.from("patients").select("id, full_name, phone, email").eq("id", data.patient_id).single(),
      supabase.from("doctors").select("id, full_name, specialization").eq("id", data.doctor_id).single(),
      data.service_id
        ? supabase.from("services").select("id, name, price").eq("id", data.service_id).single()
        : Promise.resolve({ data: null }),
    ])

    const transformedData = {
      ...data,
      patient: patientData.data,
      doctor: doctorData.data,
      service: serviceData.data,
    }

    console.log("✅ Transformed created appointment:", transformedData)
    return transformedData
  } catch (error: any) {
    console.error("❌ Create appointment error:", error)
    throw new Error("Error creating appointment: " + error.message)
  }
}

export const updateAppointment = async (id: string, updates: Partial<AppointmentFormData>) => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single()

    if (error) throw error

    // Получаем связанные данные для обновленной встречи
    const [patientData, doctorData, serviceData] = await Promise.all([
      supabase.from("patients").select("id, full_name, phone, email").eq("id", data.patient_id).single(),
      supabase.from("doctors").select("id, full_name, specialization").eq("id", data.doctor_id).single(),
      data.service_id
        ? supabase.from("services").select("id, name, price").eq("id", data.service_id).single()
        : Promise.resolve({ data: null }),
    ])

    const transformedData = {
      ...data,
      patient: patientData.data,
      doctor: doctorData.data,
      service: serviceData.data,
    }

    return transformedData
  } catch (error: any) {
    console.error("Update appointment error:", error)
    throw new Error("Error updating appointment: " + error.message)
  }
}

export const deleteAppointment = async (id: string) => {
  try {
    const { error } = await supabase.from("appointments").delete().eq("id", id)
    if (error) throw error
  } catch (error: any) {
    console.error("Delete appointment error:", error)
    throw new Error("Error deleting appointment: " + error.message)
  }
}

// MEDICAL RECORDS
export const getMedicalRecords = async (patientId?: string) => {
  try {
    let query = supabase
      .from("medical_records")
      .select(`
        *,
        patients(full_name),
        doctors(full_name, specialization)
      `)
      .order("date", { ascending: false })

    if (patientId) {
      query = query.eq("patient_id", patientId)
    }

    const { data, error } = await query

    if (error) throw error

    const transformedData =
      data?.map((record) => ({
        ...record,
        patient: record.patients,
        doctor: record.doctors,
      })) || []

    return transformedData
  } catch (error: any) {
    console.error("Get medical records error:", error)
    throw new Error("Error fetching medical records: " + error.message)
  }
}

export const createMedicalRecord = async (record: MedicalRecordFormData) => {
  try {
    // Clean the data before insertion
    const cleanRecord = {
      ...record,
      tooth_number: record.tooth_number || null,
      treatment: record.treatment?.trim() || null,
      notes: record.notes?.trim() || null,
    }

    const { data, error } = await supabase
      .from("medical_records")
      .insert([cleanRecord])
      .select(`
        *,
        patients(full_name),
        doctors(full_name, specialization)
      `)
      .single()

    if (error) throw error

    const transformedData = {
      ...data,
      patient: data.patients,
      doctor: data.doctors,
    }

    return transformedData
  } catch (error: any) {
    console.error("Create medical record error:", error)
    throw new Error("Error creating medical record: " + error.message)
  }
}

export const updateMedicalRecord = async (id: string, updates: Partial<MedicalRecordFormData>) => {
  try {
    const { data, error } = await supabase
      .from("medical_records")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(`
        *,
        patients(full_name),
        doctors(full_name, specialization)
      `)
      .single()

    if (error) throw error

    const transformedData = {
      ...data,
      patient: data.patients,
      doctor: data.doctors,
    }

    return transformedData
  } catch (error: any) {
    console.error("Update medical record error:", error)
    throw new Error("Error updating medical record: " + error.message)
  }
}

export const deleteMedicalRecord = async (id: string) => {
  try {
    const { error } = await supabase.from("medical_records").delete().eq("id", id)
    if (error) throw error
  } catch (error: any) {
    console.error("Delete medical record error:", error)
    throw new Error("Error deleting medical record: " + error.message)
  }
}

// TREATMENTS
export const getTreatments = async (patientId?: string) => {
  try {
    let query = supabase
      .from("treatments")
      .select(`
        *,
        patients(full_name),
        doctors(full_name, specialization),
        services(name, price)
      `)
      .order("created_at", { ascending: false })

    if (patientId) {
      query = query.eq("patient_id", patientId)
    }

    const { data, error } = await query

    if (error) throw error

    const transformedData =
      data?.map((treatment) => ({
        ...treatment,
        patient: treatment.patients,
        doctor: treatment.doctors,
        service: treatment.services,
      })) || []

    return transformedData
  } catch (error: any) {
    console.error("Get treatments error:", error)
    throw new Error("Error fetching treatments: " + error.message)
  }
}

export const createTreatment = async (treatment: TreatmentFormData) => {
  try {
    const { data, error } = await supabase
      .from("treatments")
      .insert([treatment])
      .select(`
        *,
        patients(full_name),
        doctors(full_name, specialization),
        services(name, price)
      `)
      .single()

    if (error) throw error

    const transformedData = {
      ...data,
      patient: data.patients,
      doctor: data.doctors,
      service: data.services,
    }

    return transformedData
  } catch (error: any) {
    console.error("Create treatment error:", error)
    throw new Error("Error creating treatment: " + error.message)
  }
}

export const updateTreatment = async (id: string, updates: Partial<TreatmentFormData>) => {
  try {
    const { data, error } = await supabase
      .from("treatments")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(`
        *,
        patients(full_name),
        doctors(full_name, specialization),
        services(name, price)
      `)
      .single()

    if (error) throw error

    const transformedData = {
      ...data,
      patient: data.patients,
      doctor: data.doctors,
      service: data.services,
    }

    return transformedData
  } catch (error: any) {
    console.error("Update treatment error:", error)
    throw new Error("Error updating treatment: " + error.message)
  }
}

export const deleteTreatment = async (id: string) => {
  try {
    const { error } = await supabase.from("treatments").delete().eq("id", id)
    if (error) throw error
  } catch (error: any) {
    console.error("Delete treatment error:", error)
    throw new Error("Error deleting treatment: " + error.message)
  }
}

// INVOICES
export const getInvoices = async () => {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        patients(full_name, email, phone, address),
        invoice_items(*)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    const transformedData =
      data?.map((invoice) => ({
        ...invoice,
        patient: invoice.patients,
      })) || []

    return transformedData
  } catch (error: any) {
    console.error("Get invoices error:", error)
    throw new Error("Error fetching invoices: " + error.message)
  }
}

export const createInvoice = async (invoiceData: InvoiceFormData) => {
  try {
    // Проверяем и очищаем данные
    if (!invoiceData.patient_id) {
      throw new Error("Patient ID is required")
    }

    const invoiceNumber = `INV-${Date.now()}`
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
    const taxAmount = subtotal * 0.1
    const totalAmount = subtotal + taxAmount

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert([
        {
          patient_id: invoiceData.patient_id,
          appointment_id: invoiceData.appointment_id || null, // Явно указываем null вместо пустой строки
          invoice_number: invoiceNumber,
          date: new Date().toISOString().split("T")[0],
          due_date: invoiceData.due_date,
          status: "draft",
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          notes: invoiceData.notes || null, // Явно указываем null вместо пустой строки
        },
      ])
      .select()
      .single()

    if (invoiceError) throw invoiceError

    const items = invoiceData.items.map((item) => ({
      invoice_id: invoice.id,
      service_id: item.service_id || null, // Явно указываем null вместо пустой строки
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
    }))

    const { error: itemsError } = await supabase.from("invoice_items").insert(items)

    if (itemsError) throw itemsError

    return invoice
  } catch (error: any) {
    console.error("Create invoice error:", error)
    throw new Error("Error creating invoice: " + error.message)
  }
}

export const updateInvoiceStatus = async (id: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data
  } catch (error: any) {
    console.error("Update invoice status error:", error)
    throw new Error("Error updating invoice status: " + error.message)
  }
}

export const deleteInvoice = async (id: string) => {
  try {
    const { error } = await supabase.from("invoices").delete().eq("id", id)
    if (error) throw error
  } catch (error: any) {
    console.error("Delete invoice error:", error)
    throw new Error("Error deleting invoice: " + error.message)
  }
}

export const sendInvoiceEmail = async (invoiceId: string, recipientEmail: string) => {
  try {
    console.log(`Sending invoice ${invoiceId} to ${recipientEmail}`)
    await updateInvoiceStatus(invoiceId, "sent")
    return { success: true }
  } catch (error: any) {
    console.error("Send invoice email error:", error)
    throw new Error("Error sending invoice email: " + error.message)
  }
}
