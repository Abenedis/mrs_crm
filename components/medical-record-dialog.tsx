"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { createMedicalRecord, updateMedicalRecord } from "@/lib/api"
import type { MedicalRecord, Patient, Doctor, MedicalRecordFormData } from "@/lib/supabase"

interface MedicalRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  patients: Patient[]
  doctors: Doctor[]
  record?: MedicalRecord
  selectedPatientId?: string
  selectedToothNumber?: number
}

export default function MedicalRecordDialog({
  open,
  onOpenChange,
  onSuccess,
  patients,
  doctors,
  record,
  selectedPatientId,
  selectedToothNumber,
}: MedicalRecordDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<MedicalRecordFormData>({
    patient_id: "",
    doctor_id: "",
    tooth_number: undefined,
    diagnosis: "",
    treatment: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
    status: "active",
  })

  useEffect(() => {
    if (open) {
      if (record) {
        setFormData({
          patient_id: record.patient_id,
          doctor_id: record.doctor_id,
          tooth_number: record.tooth_number || undefined,
          diagnosis: record.diagnosis,
          treatment: record.treatment || "",
          notes: record.notes || "",
          date: record.date,
          status: record.status,
        })
      } else {
        setFormData({
          patient_id: selectedPatientId || "",
          doctor_id: "",
          tooth_number: selectedToothNumber,
          diagnosis: "",
          treatment: "",
          notes: "",
          date: new Date().toISOString().split("T")[0],
          status: "active",
        })
      }
    }
  }, [open, record, selectedPatientId, selectedToothNumber])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.patient_id || !formData.doctor_id || !formData.diagnosis.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Patient, Doctor, and Diagnosis).",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Clean the form data before submission
      const cleanFormData = {
        ...formData,
        tooth_number: formData.tooth_number || null,
        treatment: formData.treatment?.trim() || null,
        notes: formData.notes?.trim() || null,
      }

      if (record) {
        await updateMedicalRecord(record.id, cleanFormData)
        toast({
          title: "Medical record updated",
          description: "The medical record has been updated successfully.",
        })
      } else {
        await createMedicalRecord(cleanFormData)
        toast({
          title: "Medical record created",
          description: "New medical record has been created successfully.",
        })
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{record ? "Edit Medical Record" : "New Medical Record"}</DialogTitle>
          <DialogDescription>
            {record ? "Update the medical record details" : "Add a new medical record for the patient"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patient_id">Patient *</Label>
              <Select
                value={formData.patient_id}
                onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.full_name} ({patient.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="doctor_id">Doctor *</Label>
              <Select
                value={formData.doctor_id}
                onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.full_name} ({doctor.specialization})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tooth_number">Tooth Number</Label>
                <Input
                  id="tooth_number"
                  type="number"
                  min="1"
                  max="32"
                  value={formData.tooth_number || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, tooth_number: e.target.value ? Number(e.target.value) : undefined })
                  }
                  placeholder="1-32 or leave empty"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="diagnosis">Diagnosis *</Label>
              <Textarea
                id="diagnosis"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                placeholder="Enter diagnosis..."
                required
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="treatment">Treatment</Label>
              <Textarea
                id="treatment"
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                placeholder="Enter treatment details..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.patient_id || !formData.doctor_id || !formData.diagnosis.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {record ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
