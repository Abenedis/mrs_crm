"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Appointment, Doctor } from "@/lib/supabase"

interface DayViewProps {
  date: Date
  appointments: Appointment[]
  timeSlots: string[]
  doctors: Doctor[]
  onAppointmentClick: (appointment: Appointment) => void
  onSlotClick: (date: Date, time: string, doctorId?: string) => void
  onAppointmentDrop?: (appointmentId: string, newDate: Date, newTime: string) => void
}

export default function DayView({
  date,
  appointments,
  timeSlots,
  doctors,
  onAppointmentClick,
  onSlotClick,
  onAppointmentDrop,
}: DayViewProps) {
  const [draggedAppointment, setDraggedAppointment] = useState<string | null>(null)

  const dateStr = format(date, "yyyy-MM-dd")
  const dayAppointments = appointments.filter((apt) => apt.appointment_date === dateStr)

  const handleDragStart = (appointmentId: string) => {
    setDraggedAppointment(appointmentId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, time: string) => {
    e.preventDefault()
    if (draggedAppointment && onAppointmentDrop) {
      onAppointmentDrop(draggedAppointment, date, time)
      setDraggedAppointment(null)
    }
  }

  const getAppointmentColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 border-blue-300 text-blue-800"
      case "completed":
        return "bg-green-100 border-green-300 text-green-800"
      case "cancelled":
        return "bg-red-100 border-red-300 text-red-800"
      case "no_show":
        return "bg-orange-100 border-orange-300 text-orange-800"
      default:
        return "bg-gray-100 border-gray-300 text-gray-800"
    }
  }

  return (
    <div className="h-full overflow-auto">
      <div className="grid grid-cols-[100px_1fr] h-full">
        {/* Time slots column */}
        <div className="border-r border-gray-200 bg-gray-50">
          <div className="h-16 border-b border-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">Time</span>
          </div>
          {timeSlots.map((time) => (
            <div key={time} className="h-16 border-b border-gray-200 px-2 py-1 text-sm text-gray-500 flex items-center">
              {time}
            </div>
          ))}
        </div>

        {/* Appointments column */}
        <div className="relative">
          <div className="grid grid-cols-1 h-16 border-b border-gray-200">
            <div className="p-2 font-medium flex items-center">{format(date, "EEEE, MMMM d, yyyy")}</div>
          </div>

          {timeSlots.map((time) => {
            const timeAppointments = dayAppointments.filter((apt) => apt.appointment_time === time)

            return (
              <div
                key={time}
                className="h-16 border-b border-gray-200 hover:bg-gray-50 cursor-pointer relative"
                onClick={() => onSlotClick(date, time)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, time)}
              >
                {timeAppointments.length > 0 ? (
                  <div className="h-full p-1 space-y-1">
                    {timeAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className={cn(
                          "p-2 text-sm rounded border overflow-hidden cursor-pointer",
                          getAppointmentColor(appointment.status),
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          onAppointmentClick(appointment)
                        }}
                        draggable
                        onDragStart={() => handleDragStart(appointment.id)}
                      >
                        <div className="font-medium">{appointment.patient?.full_name}</div>
                        <div className="text-xs opacity-75">{appointment.doctor?.full_name}</div>
                        {appointment.service?.name && (
                          <div className="text-xs opacity-75">{appointment.service.name}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
