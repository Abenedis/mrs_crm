"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
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
import { createAppointment, updateAppointment, deleteAppointment } from "@/lib/api"
import { isDoctorAvailable, getAvailableTimeSlots } from "@/utils/schedule-validation"
import type { Patient, Doctor, Service, Appointment, AppointmentFormData } from "@/lib/supabase"

interface AppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  patients: Patient[]
  doctors: Doctor[]
  services: Service[]
  appointment?: Appointment
  selectedDate?: Date
  selectedTime?: string
  selectedDoctorId?: string
}

export default function AppointmentDialog({
  open,
  onOpenChange,
  onSuccess,
  patients,
  doctors,
  services,
  appointment,
  selectedDate,
  selectedTime,
  selectedDoctorId,
}: AppointmentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState<AppointmentFormData>({
    patient_id: "",
    doctor_id: "",
    service_id: "",
    appointment_date: "",
    appointment_time: "",
    notes: "",
    status: "scheduled",
    price: null,
  })

  useEffect(() => {
    if (open) {
      if (appointment) {
        // Edit mode
        setFormData({
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
          service_id: appointment.service_id || "",
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
          notes: appointment.notes || "",
          status: appointment.status,
          price: appointment.price,
        })

        if (appointment.doctor_id) {
          const doctor = doctors.find((d) => d.id === appointment.doctor_id)
          const date = new Date(appointment.appointment_date)
          if (doctor) {
            updateAvailableTimeSlots(doctor, date)
          }
        }
      } else {
        // Create mode
        const initialDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")

        setFormData({
          patient_id: "",
          doctor_id: selectedDoctorId || "",
          service_id: "",
          appointment_date: initialDate,
          appointment_time: selectedTime || "09:00",
          notes: "",
          status: "scheduled",
          price: null,
        })

        if (selectedDoctorId) {
          const doctor = doctors.find((d) => d.id === selectedDoctorId)
          if (doctor && selectedDate) {
            updateAvailableTimeSlots(doctor, selectedDate)
          }
        }
      }
    }
  }, [open, appointment, selectedDate, selectedTime, selectedDoctorId, doctors])

  const updateAvailableTimeSlots = (doctor: Doctor, date: Date) => {
    // In a real app, you would fetch existing appointments for this doctor and date
    // For now, we'll just check if the doctor is available on this day
    if (isDoctorAvailable(doctor, date, "09:00")) {
      // Generate time slots based on doctor's schedule
      const slots = getAvailableTimeSlots(doctor, date, [])
      setAvailableTimeSlots(slots)
    } else {
      setAvailableTimeSlots([])
    }
  }

  const handleDoctorChange = (doctorId: string) => {
    setFormData({ ...formData, doctor_id: doctorId })

    const doctor = doctors.find((d) => d.id === doctorId)
    if (doctor) {
      const date = formData.appointment_date ? new Date(formData.appointment_date) : new Date()
      updateAvailableTimeSlots(doctor, date)
    }
  }

  const handleDateChange = (date: string) => {
    setFormData({ ...formData, appointment_date: date })

    if (formData.doctor_id) {
      const doctor = doctors.find((d) => d.id === formData.doctor_id)
      if (doctor) {
        updateAvailableTimeSlots(doctor, new Date(date))
      }
    }
  }

  const handleServiceChange = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    setFormData({
      ...formData,
      service_id: serviceId,
      price: service ? service.price : null,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (appointment) {
        // Update existing appointment
        await updateAppointment(appointment.id, formData)
        toast({
          title: "Appointment updated",
          description: "The appointment has been updated successfully.",
        })
      } else {
        // Create new appointment
        await createAppointment(formData)
        toast({
          title: "Appointment created",
          description: "New appointment has been created successfully.",
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

  const handleDelete = async () => {
    if (!appointment) return

    setDeleting(true)
    try {
      await deleteAppointment(appointment.id)
      toast({
        title: "Appointment deleted",
        description: "The appointment has been deleted successfully.",
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
      setDeleting(false)
    }
  }

  const selectedDoctor = doctors.find((d) => d.id === formData.doctor_id)
  const isDoctorWorkingOnSelectedDate =
    selectedDoctor && formData.appointment_date
      ? isDoctorAvailable(selectedDoctor, new Date(formData.appointment_date), "09:00")
      : false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{appointment ? "Edit Appointment" : "New Appointment"}</DialogTitle>
          <DialogDescription>
            {appointment ? "Update the appointment details" : "Schedule a new appointment"}
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
              <Select value={formData.doctor_id} onValueChange={handleDoctorChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="appointment_date">Date *</Label>
                <Input
                  id="appointment_date"
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="appointment_time">Time *</Label>
                {isDoctorWorkingOnSelectedDate ? (
                  <Select
                    value={formData.appointment_time}
                    onValueChange={(value) => setFormData({ ...formData, appointment_time: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="appointment_time"
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                    required
                  />
                )}
              </div>
            </div>

            {appointment && (
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
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price?.toString() || ""}
                onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : null })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <div>
              {appointment && (
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {appointment ? "Update" : "Create"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
