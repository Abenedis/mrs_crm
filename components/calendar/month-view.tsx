"use client"

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import type { Appointment } from "@/lib/supabase"

interface MonthViewProps {
  date: Date
  appointments: Appointment[]
  onAppointmentClick: (appointment: Appointment) => void
  onDateClick: (date: Date) => void
}

export default function MonthView({ date, appointments, onAppointmentClick, onDateClick }: MonthViewProps) {
  // Get all days in the month
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Add days from previous and next month to fill the calendar grid
  const startDay = monthStart.getDay() || 7 // Convert Sunday (0) to 7 for European calendar
  const endDay = monthEnd.getDay() || 7

  // Add days from previous month
  const prevMonthDays = Array.from({ length: startDay - 1 }, (_, i) => {
    const d = new Date(monthStart)
    d.setDate(d.getDate() - (startDay - 1 - i))
    return d
  })

  // Add days from next month
  const nextMonthDays = Array.from({ length: 7 - endDay }, (_, i) => {
    const d = new Date(monthEnd)
    d.setDate(d.getDate() + i + 1)
    return d
  })

  // Combine all days
  const allDays = [...prevMonthDays, ...days, ...nextMonthDays]

  // Group days into weeks
  const weeks = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  const getAppointmentsForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd")
    return appointments.filter((apt) => apt.appointment_date === dayStr)
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
      <div className="grid grid-cols-7 text-center py-2 border-b bg-gray-50">
        <div className="font-medium text-gray-700">Mon</div>
        <div className="font-medium text-gray-700">Tue</div>
        <div className="font-medium text-gray-700">Wed</div>
        <div className="font-medium text-gray-700">Thu</div>
        <div className="font-medium text-gray-700">Fri</div>
        <div className="font-medium text-gray-700">Sat</div>
        <div className="font-medium text-gray-700">Sun</div>
      </div>

      <div className="grid grid-cols-7 grid-rows-6 h-[calc(100%-40px)]">
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const isCurrentMonth = isSameMonth(day, date)
            const isToday = isSameDay(day, new Date())
            const dayAppointments = getAppointmentsForDay(day)

            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={cn(
                  "border-b border-r p-1 overflow-hidden cursor-pointer hover:bg-gray-50",
                  !isCurrentMonth && "bg-gray-50 text-gray-400",
                  isToday && "bg-blue-50",
                )}
                onClick={() => onDateClick(day)}
              >
                <div className={cn("text-right mb-1", isToday && "font-bold text-blue-600")}>{format(day, "d")}</div>

                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <div
                      key={appointment.id}
                      className={cn("p-1 text-xs rounded border truncate", getAppointmentColor(appointment.status))}
                      onClick={(e) => {
                        e.stopPropagation()
                        onAppointmentClick(appointment)
                      }}
                      title={`${appointment.appointment_time} - ${appointment.patient?.full_name} (${appointment.doctor?.full_name})`}
                    >
                      {appointment.appointment_time} - {appointment.patient?.full_name}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">+{dayAppointments.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}
