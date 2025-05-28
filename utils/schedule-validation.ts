import type { Doctor, Appointment } from "@/lib/supabase"

export const isDoctorAvailable = (doctor: Doctor, date: Date, time: string): boolean => {
  // Get day of week in lowercase
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() as keyof typeof doctor.schedule

  // Check if doctor has a schedule for this day
  if (!doctor.schedule || !doctor.schedule[dayOfWeek] || doctor.schedule[dayOfWeek]?.length === 0) {
    return false // Doctor doesn't work this day
  }

  // Check if time falls within any of the doctor's time ranges
  return doctor.schedule[dayOfWeek]!.some((timeRange) => {
    const [start, end] = timeRange.split("-")
    return time >= start && time <= end
  })
}

export const getAvailableTimeSlots = (
  doctor: Doctor,
  date: Date,
  existingAppointments: Appointment[],
  durationMinutes = 30,
): string[] => {
  // Get day of week in lowercase
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() as keyof typeof doctor.schedule

  // Check if doctor has a schedule for this day
  if (!doctor.schedule || !doctor.schedule[dayOfWeek] || doctor.schedule[dayOfWeek]?.length === 0) {
    return [] // Doctor doesn't work this day
  }

  const dateString = date.toISOString().split("T")[0]
  const doctorAppointments = existingAppointments.filter(
    (apt) => apt.doctor_id === doctor.id && apt.appointment_date === dateString,
  )

  // Generate all possible time slots based on doctor's schedule
  const allTimeSlots: string[] = []
  doctor.schedule[dayOfWeek]!.forEach((timeRange) => {
    const [start, end] = timeRange.split("-")
    const startTime = new Date(`2000-01-01T${start}:00`)
    const endTime = new Date(`2000-01-01T${end}:00`)

    // Generate slots in 30-minute intervals
    while (startTime < endTime) {
      const timeSlot = startTime.toTimeString().substring(0, 5)
      allTimeSlots.push(timeSlot)
      startTime.setMinutes(startTime.getMinutes() + durationMinutes)
    }
  })

  // Filter out slots that are already booked
  return allTimeSlots.filter((timeSlot) => {
    return !doctorAppointments.some((apt) => apt.appointment_time === timeSlot)
  })
}

export const generateTimeSlots = (startHour = 8, endHour = 20, intervalMinutes = 30): string[] => {
  const slots: string[] = []
  const start = new Date()
  start.setHours(startHour, 0, 0, 0)

  const end = new Date()
  end.setHours(endHour, 0, 0, 0)

  while (start < end) {
    slots.push(start.toTimeString().substring(0, 5))
    start.setMinutes(start.getMinutes() + intervalMinutes)
  }

  return slots
}

export const formatTimeRange = (timeRange: string): string => {
  const [start, end] = timeRange.split("-")
  return `${formatTime(start)} - ${formatTime(end)}`
}

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}
