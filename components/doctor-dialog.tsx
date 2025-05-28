"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Loader2, Plus, X } from "lucide-react"
import { createDoctor, updateDoctor, deleteDoctor } from "@/lib/api"
import type { Doctor, DoctorFormData } from "@/lib/supabase"

interface DoctorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  doctor?: Doctor
}

const specializations = [
  "General Dentistry",
  "Oral Surgery",
  "Orthodontics",
  "Periodontics",
  "Endodontics",
  "Pediatric Dentistry",
  "Cosmetic Dentistry",
]

const defaultSchedule = {
  monday: ["09:00-17:00"],
  tuesday: ["09:00-17:00"],
  wednesday: ["09:00-17:00"],
  thursday: ["09:00-17:00"],
  friday: ["09:00-17:00"],
  saturday: [],
  sunday: [],
}

export default function DoctorDialog({ open, onOpenChange, onSuccess, doctor }: DoctorDialogProps) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<DoctorFormData>({
    full_name: "",
    specialization: "",
    phone: "",
    email: "",
    price_per_hour: 0,
    schedule: { ...defaultSchedule },
  })

  useEffect(() => {
    if (open && doctor) {
      // Edit mode
      setFormData({
        full_name: doctor.full_name,
        specialization: doctor.specialization,
        phone: doctor.phone || "",
        email: doctor.email || "",
        price_per_hour: doctor.price_per_hour,
        schedule: doctor.schedule || { ...defaultSchedule },
      })
    } else if (open) {
      // Create mode
      setFormData({
        full_name: "",
        specialization: "",
        phone: "",
        email: "",
        price_per_hour: 0,
        schedule: { ...defaultSchedule },
      })
    }
  }, [open, doctor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (doctor) {
        // Update existing doctor
        await updateDoctor(doctor.id, formData)
        toast({
          title: "Doctor updated",
          description: "The doctor has been updated successfully.",
        })
      } else {
        // Create new doctor
        await createDoctor(formData)
        toast({
          title: "Doctor created",
          description: "New doctor has been created successfully.",
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
    if (!doctor) return

    if (confirm(`Are you sure you want to delete Dr. ${doctor.full_name}? This action cannot be undone.`)) {
      setDeleting(true)
      try {
        await deleteDoctor(doctor.id)
        toast({
          title: "Doctor deleted",
          description: "The doctor has been deleted successfully.",
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
  }

  const handleAddTimeRange = (day: keyof typeof formData.schedule) => {
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        [day]: [...(formData.schedule[day] || []), "09:00-17:00"],
      },
    })
  }

  const handleRemoveTimeRange = (day: keyof typeof formData.schedule, index: number) => {
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        [day]: formData.schedule[day].filter((_, i) => i !== index),
      },
    })
  }

  const handleTimeRangeChange = (day: keyof typeof formData.schedule, index: number, value: string) => {
    const newSchedule = { ...formData.schedule }
    newSchedule[day][index] = value
    setFormData({
      ...formData,
      schedule: newSchedule,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{doctor ? "Edit Doctor" : "New Doctor"}</DialogTitle>
          <DialogDescription>
            {doctor ? "Update the doctor's information" : "Add a new doctor to the system"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                minLength={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="specialization">Specialization *</Label>
              <Select
                value={formData.specialization}
                onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price_per_hour">Price per Hour ($) *</Label>
              <Input
                id="price_per_hour"
                type="number"
                min="0"
                step="0.01"
                value={formData.price_per_hour}
                onChange={(e) => setFormData({ ...formData, price_per_hour: Number(e.target.value) })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Weekly Schedule</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {Object.entries(formData.schedule).map(([day, timeRanges]) => (
                  <div key={day} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="capitalize text-sm">{day}</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTimeRange(day as keyof typeof formData.schedule)}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </div>
                    {timeRanges.length === 0 ? (
                      <div className="text-sm text-gray-500">No working hours</div>
                    ) : (
                      timeRanges.map((timeRange, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={timeRange}
                            onChange={(e) =>
                              handleTimeRangeChange(day as keyof typeof formData.schedule, index, e.target.value)
                            }
                            placeholder="09:00-17:00"
                            className="text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTimeRange(day as keyof typeof formData.schedule, index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <div>
              {doctor && (
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete Doctor
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {doctor ? "Update" : "Create"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
