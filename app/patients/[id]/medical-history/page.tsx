"use client"

import { useState } from "react"

export default function PatientMedicalHistoryPage({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [recordDialogOpen, setRecordDialogOpen] = useState(false)
  const [treatmentDialogOpen, setTreatmentDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | undefined>()
  const [editingTreatment, setEditingTreatment] = useState<Treatment | undefined>()

  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [patientData, recordsData, treatmentsData, doctorsData, servicesData] = await Promise.all([
        getPatients(),
        getMedicalRecords(params.id),
        getTreatments(params.id),
        getDoctors(),
        getServices(),
      ])

      const currentPatient = patientData.find((p) => p.id === params.id)
      if (!currentPatient) {
        throw new Error("Patient not found")
      }

      setPatient(currentPatient)
      setMedicalRecords(recordsData)
      setTreatments(treatmentsData)
      setDoctors(doctorsData)
      setServices(servicesData)

      if (doctorsData.length === 0) {
        toast({
          title: "No doctors available",
          description: "Please add doctors to the system before creating medical records.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error loading data:", error)
      setError(error.message)
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
}
