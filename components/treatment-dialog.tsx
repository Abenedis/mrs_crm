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
import { Loader2, Calendar } from "lucide-react"
import { createTreatment, updateTreatment, createAppointment } from "@/lib/api"
import type { Treatment, Patient, Doctor, Service, TreatmentFormData, AppointmentFormData } from "@/lib/supabase"

interface TreatmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  patients: Patient[]
  doctors: Doctor[]
  services: Service[]
  treatment?: Treatment
  selectedPatientId?: string
  selectedToothNumber?: number
}

export default function TreatmentDialog({
  open,
  onOpenChange,
  onSuccess,
  patients,
  doctors,
  services,
  treatment,
  selectedPatientId,
  selectedToothNumber,
}: TreatmentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [schedulingAppointment, setSchedulingAppointment] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<TreatmentFormData>({
    patient_id: "",
    doctor_id: "",
    service_id: "",
    tooth_number: undefined,
    treatment_plan: "",
    estimated_cost: undefined,
    estimated_sessions: 1,
    priority: "medium",
    status: "planned",
    start_date: "",
    end_date: "",
    notes: "",
  })

  const [appointmentData, setAppointmentData] = useState({
    date: "",
    time: "09:00",
  })

  useEffect(() => {
    if (open) {
      if (treatment) {
        setFormData({
          patient_id: treatment.patient_id,
          doctor_id: treatment.doctor_id,
          service_id: treatment.service_id || "",
          tooth_number: treatment.tooth_number || undefined,
          treatment_plan: treatment.treatment_plan,
          estimated_cost: treatment.estimated_cost || undefined,
          estimated_sessions: treatment.estimated_sessions,
          priority: treatment.priority,
          status: treatment.status,
          start_date: treatment.start_date || "",
          end_date: treatment.end_date || "",
          notes: treatment.notes || "",
        })
      } else {
        setFormData({
          patient_id: selectedPatientId || "",
          doctor_id: "",
          service_id: "",
          tooth_number: selectedToothNumber,
          treatment_plan: "",
          estimated_cost: undefined,
          estimated_sessions: 1,
          priority: "medium",
          status: "planned",
          start_date: "",
          end_date: "",
          notes: "",
        })
      }
    }
  }, [open, treatment, selectedPatientId, selectedToothNumber])

  const handleServiceChange = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    setFormData({
      ...formData,
      service_id: serviceId,
      estimated_cost: service ? service.price : undefined,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (treatment) {
        await updateTreatment(treatment.id, formData)
        toast({
          title: "Treatment updated",
          description: "The treatment plan has been updated successfully.",
        })
      } else {
        await createTreatment(formData)
        toast({
          title: "Treatment created",
          description: "New treatment plan has been created successfully.",
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

  const handleScheduleAppointment = async () => {
    if (!appointmentData.date || !appointmentData.time) {
      toast({
        title: "Error",
        description: "Please select date and time for the appointment.",
        variant: "destructive",
      })
      return
    }

    setSchedulingAppointment(true)

    try {
      // First create/update the treatment
      let treatmentId = treatment?.id
      if (!treatmentId) {
        const newTreatment = await createTreatment(formData)
        treatmentId = newTreatment.id
      } else {
        await updateTreatment(treatmentId, formData)
      }

      // Then create the appointment
      const appointmentFormData: AppointmentFormData = {
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        service_id: formData.service_id || undefined,
        appointment_date: appointmentData.date,
        appointment_time: appointmentData.time,
        notes: `Treatment: ${formData.treatment_plan}${formData.tooth_number ? ` (Tooth ${formData.tooth_number})` : ""}`,
        status: "scheduled",
        price: formData.estimated_cost || undefined,
      }

      await createAppointment(appointmentFormData)

      toast({
        title: "Appointment scheduled",
        description: "Treatment plan saved and appointment scheduled successfully.",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSchedulingAppointment(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{treatment ? "Edit Treatment Plan" : "New Treatment Plan"}</DialogTitle>
          <DialogDescription>
            {treatment ? "Update the treatment plan details" : "Create a new treatment plan for the patient"}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="doctor_id">Doctor *</Label>
                <Select
                  value={formData.doctor_id}
                  onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="service_id">Service</Label>
                <Select value={formData.service_id} onValueChange={handleServiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} (${service.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
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
                  placeholder="1-32"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="treatment_plan">Treatment Plan *</Label>
              <Textarea
                id="treatment_plan"
                value={formData.treatment_plan}
                onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
                placeholder="Describe the treatment plan..."
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="estimated_cost">Estimated Cost ($)</Label>
                <Input
                  id="estimated_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.estimated_cost || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, estimated_cost: e.target.value ? Number(e.target.value) : undefined })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="estimated_sessions">Estimated Sessions</Label>
                <Input
                  id="estimated_sessions"
                  type="number"
                  min="1"
                  value={formData.estimated_sessions}
                  onChange={(e) => setFormData({ ...formData, estimated_sessions: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
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

            {/* Schedule Appointment Section */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Schedule Appointment (Optional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="appointment_date">Date</Label>
                  <Input
                    id="appointment_date"
                    type="date"
                    value={appointmentData.date}
                    onChange={(e) => setAppointmentData({ ...appointmentData, date: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="appointment_time">Time</Label>
                  <Input
                    id="appointment_time"
                    type="time"
                    value={appointmentData.time}
                    onChange={(e) => setAppointmentData({ ...appointmentData, time: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              {appointmentData.date && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleScheduleAppointment}
                  disabled={schedulingAppointment}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  {schedulingAppointment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Calendar className="mr-2 h-4 w-4" />
                  Save & Schedule
                </Button>
              )}
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {treatment ? "Update" : "Create"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
