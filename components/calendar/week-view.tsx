"use client"

import type React from "react"

import { useState } from "react"
import { format, addDays, startOfWeek } from "date-fns"
import { cn } from "@/lib/utils"
import type { Appointment, Doctor } from "@/lib/supabase"

interface WeekViewProps {
  date: Date
  appointments: Appointment[]
  timeSlots: string[]
  doctors: Doctor[]
  onAppointmentClick: (appointment: Appointment) => void
  onSlotClick: (date: Date, time: string, doctorId?: string) => void
  onAppointmentDrop?: (appointmentId: string, newDate: Date, newTime: string) => void
}

export default function WeekView({
  date,
  appointments,
  timeSlots,
  doctors,
  onAppointmentClick,
  onSlotClick,
  onAppointmentDrop,
}: WeekViewProps) {
  const [draggedAppointment, setDraggedAppointment] = useState<string | null>(null)

  // Get the start of the week (Monday)
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })

  // Generate array of 7 days starting from Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const handleDragStart = (appointmentId: string) => {
    setDraggedAppointment(appointmentId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropDate: Date, time: string) => {
    e.preventDefault()
    if (draggedAppointment && onAppointmentDrop) {
      onAppointmentDrop(draggedAppointment, dropDate, time)
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
      <div className="grid grid-cols-[100px_repeat(7,1fr)] h-full min-w-[800px]">
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

        {/* Days columns */}
        {weekDays.map((day) => {
          const dayStr = format(day, "yyyy-MM-dd")
          const dayAppointments = appointments.filter((apt) => apt.appointment_date === dayStr)
          const isToday = format(new Date(), "yyyy-MM-dd") === dayStr

          return (
            <div key={dayStr} className="border-r border-gray-200 last:border-r-0">
              {/* Day header */}
              <div className={cn("h-16 border-b border-gray-200 p-2 text-center", isToday && "bg-blue-50")}>
                <div className="text-sm font-medium">{format(day, "EEE")}</div>
                <div className={cn("text-lg", isToday && "font-bold text-blue-600")}>{format(day, "d")}</div>
              </div>

              {/* Time slots */}
              {timeSlots.map((time) => {
                const timeAppointments = dayAppointments.filter((apt) => apt.appointment_time === time)

                return (
                  <div
                    key={`${dayStr}-${time}`}
                    className="h-16 border-b border-gray-200 hover:bg-gray-50 cursor-pointer relative"
                    onClick={() => onSlotClick(day, time)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day, time)}
                  >
                    {timeAppointments.length > 0 ? (
                      <div className="h-full p-1 space-y-1">
                        {timeAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className={cn(
                              "p-1 text-xs rounded border overflow-hidden cursor-pointer",
                              getAppointmentColor(appointment.status),
                            )}
                            onClick={(e) => {
                              e.stopPropagation()
                              onAppointmentClick(appointment)
                            }}
                            draggable
                            onDragStart={() => handleDragStart(appointment.id)}
                            title={`${appointment.patient?.full_name} - ${appointment.doctor?.full_name}`}
                          >
                            <div className="font-medium truncate">{appointment.patient?.full_name}</div>
                            <div className="truncate text-xs opacity-75">{appointment.doctor?.full_name}</div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
