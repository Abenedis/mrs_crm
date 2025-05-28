"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { getPatients, deletePatient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Search, Edit, Trash2, Users, Phone, Mail, Calendar, FileText } from "lucide-react"
import BackButton from "@/components/back-button"
import PatientDialog from "@/components/patient-dialog"
import type { Patient } from "@/lib/supabase"

export default function PatientsPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showPatientDialog, setShowPatientDialog] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>()
  const { toast } = useToast()

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const data = await getPatients()
      setPatients(data)
    } catch (error: any) {
      toast({
        title: "Error loading patients",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient)
    setShowPatientDialog(true)
  }

  const handleDelete = async (patient: Patient) => {
    if (confirm(`Are you sure you want to delete "${patient.full_name}"?`)) {
      try {
        await deletePatient(patient.id)
        toast({
          title: "Patient deleted",
          description: "Patient has been deleted successfully.",
        })
        loadPatients()
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  const handleViewHistory = (patient: Patient) => {
    router.push(`/patients/${patient.id}/medical-history`)
  }

  const handleDialogClose = () => {
    setShowPatientDialog(false)
    setEditingPatient(undefined)
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <BackButton label="Back to Dashboard" />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">Manage your clinic patients</p>
        </div>
        <Button onClick={() => setShowPatientDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search patients by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="text-center py-16">
          <Users className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No patients found</h3>
          <p className="mt-2 text-gray-500">
            {patients.length === 0 ? "Get started by adding your first patient." : "Try adjusting your search term."}
          </p>
          {patients.length === 0 && (
            <Button className="mt-6 bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowPatientDialog(true)}>
              Add First Patient
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-lg transition-shadow border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900">{patient.full_name}</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      Patient since {new Date(patient.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-emerald-600" />
                    {patient.phone}
                  </div>

                  {patient.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-emerald-600" />
                      {patient.email}
                    </div>
                  )}

                  {patient.birth_date && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                      Born: {new Date(patient.birth_date).toLocaleDateString()}
                    </div>
                  )}

                  {patient.address && (
                    <div className="text-sm text-gray-600">
                      <strong>Address:</strong> {patient.address}
                    </div>
                  )}

                  {patient.medical_notes && (
                    <div className="text-sm text-gray-600">
                      <strong>Notes:</strong> {patient.medical_notes}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => handleViewHistory(patient)}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      History
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(patient)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(patient)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PatientDialog
        open={showPatientDialog}
        onOpenChange={handleDialogClose}
        onSuccess={loadPatients}
        patient={editingPatient}
      />
    </div>
  )
}
