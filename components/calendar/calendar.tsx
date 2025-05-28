"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { format, addDays, startOfWeek, endOfWeek, addWeeks, subWeeks, addMonths, subMonths } from "date-fns"
import type { Appointment, Doctor, CalendarView } from "@/lib/supabase"
import DayView from "./day-view"
import WeekView from "./week-view"
import MonthView from "./month-view"
import { generateTimeSlots } from "@/utils/schedule-validation"

interface CalendarProps {
  view: CalendarView
  selectedDate: Date
  appointments: Appointment[]
  doctors: Doctor[]
  onViewChange: (view: CalendarView) => void
  onDateChange: (date: Date) => void
  onAppointmentClick: (appointment: Appointment) => void
  onSlotClick: (date: Date, time: string, doctorId?: string) => void
  onAppointmentDrop?: (appointmentId: string, newDate: Date, newTime: string) => void
}

export default function CalendarComponent({
  view,
  selectedDate,
  appointments,
  doctors,
  onViewChange,
  onDateChange,
  onAppointmentClick,
  onSlotClick,
  onAppointmentDrop,
}: CalendarProps) {
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [calendarOpen, setCalendarOpen] = useState(false)

  useEffect(() => {
    setTimeSlots(generateTimeSlots(8, 20, 30))
  }, [])

  const handlePrevious = () => {
    if (view === "day") {
      onDateChange(addDays(selectedDate, -1))
    } else if (view === "week") {
      onDateChange(subWeeks(selectedDate, 1))
    } else if (view === "month") {
      onDateChange(subMonths(selectedDate, 1))
    }
  }

  const handleNext = () => {
    if (view === "day") {
      onDateChange(addDays(selectedDate, 1))
    } else if (view === "week") {
      onDateChange(addWeeks(selectedDate, 1))
    } else if (view === "month") {
      onDateChange(addMonths(selectedDate, 1))
    }
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  const getDateRangeText = () => {
    if (view === "day") {
      return format(selectedDate, "MMMM d, yyyy")
    } else if (view === "week") {
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 })
      const end = endOfWeek(selectedDate, { weekStartsOn: 1 })
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`
    } else {
      return format(selectedDate, "MMMM yyyy")
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" onClick={handlePrevious} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNext} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="font-medium">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {getDateRangeText()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    onDateChange(date)
                    setCalendarOpen(false)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center space-x-1 bg-white rounded-lg p-1 border">
          <Button
            variant={view === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("day")}
            className="h-7"
          >
            Day
          </Button>
          <Button
            variant={view === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("week")}
            className="h-7"
          >
            Week
          </Button>
          <Button
            variant={view === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("month")}
            className="h-7"
          >
            Month
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-hidden">
        {view === "day" && (
          <DayView
            date={selectedDate}
            appointments={appointments}
            timeSlots={timeSlots}
            doctors={doctors}
            onAppointmentClick={onAppointmentClick}
            onSlotClick={onSlotClick}
            onAppointmentDrop={onAppointmentDrop}
          />
        )}
        {view === "week" && (
          <WeekView
            date={selectedDate}
            appointments={appointments}
            timeSlots={timeSlots}
            doctors={doctors}
            onAppointmentClick={onAppointmentClick}
            onSlotClick={onSlotClick}
            onAppointmentDrop={onAppointmentDrop}
          />
        )}
        {view === "month" && (
          <MonthView
            date={selectedDate}
            appointments={appointments}
            onAppointmentClick={onAppointmentClick}
            onDateClick={(date) => onSlotClick(date, "09:00")}
          />
        )}
      </div>
    </div>
  )
}
