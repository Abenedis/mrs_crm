"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { getAppointmentsByDateRange, getDoctors, getPatients, getServices } from "@/lib/api"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns"
import CalendarComponent from "@/components/calendar/calendar"
import AppointmentDialog from "@/components/appointment-dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, RefreshCw } from "lucide-react"
import type { Appointment, Doctor, Patient, Service, CalendarView } from "@/lib/supabase"
import BackButton from "@/components/back-button"

export default function CalendarPage() {
  const [view, setView] = useState<CalendarView>("week")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>(undefined)
  const [selectedSlotDate, setSelectedSlotDate] = useState<Date | undefined>(undefined)
  const [selectedSlotTime, setSelectedSlotTime] = useState<string | undefined>(undefined)
  const [selectedSlotDoctor, setSelectedSlotDoctor] = useState<string | undefined>(undefined)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadAppointments()
  }, [selectedDate, view, selectedDoctor])

  const loadData = async () => {
    try {
      setLoading(true)
      const [doctorsData, patientsData, servicesData] = await Promise.all([getDoctors(), getPatients(), getServices()])

      console.log("📊 Calendar - Loaded data:", {
        doctors: doctorsData.length,
        patients: patientsData.length,
        services: servicesData.length,
      })

      setDoctors(doctorsData)
      setPatients(patientsData)
      setServices(servicesData)
    } catch (error: any) {
      console.error("❌ Error loading data:", error)
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAppointments = async () => {
    try {
      setAppointmentsLoading(true)
      let startDate, endDate

      if (view === "day") {
        startDate = format(selectedDate, "yyyy-MM-dd")
        endDate = startDate
      } else if (view === "week") {
        const start = startOfWeek(selectedDate, { weekStartsOn: 1 })
        const end = endOfWeek(selectedDate, { weekStartsOn: 1 })
        startDate = format(start, "yyyy-MM-dd")
        endDate = format(end, "yyyy-MM-dd")
      } else {
        // For month view, get a wider range to ensure we have all days visible in the calendar
        const start = startOfMonth(selectedDate)
        const end = endOfMonth(selectedDate)
        // Add padding for days from previous/next month that appear in the calendar
        const paddedStart = addDays(start, -7)
        const paddedEnd = addDays(end, 7)
        startDate = format(paddedStart, "yyyy-MM-dd")
        endDate = format(paddedEnd, "yyyy-MM-dd")
      }

      console.log(`🔄 Calendar - Loading appointments from ${startDate} to ${endDate} (view: ${view})`)
      const appointmentsData = await getAppointmentsByDateRange(startDate, endDate)
      console.log(`✅ Calendar - Loaded ${appointmentsData.length} appointments:`, appointmentsData)

      // Filter by selected doctor if needed
      const filteredAppointments =
        selectedDoctor === "all" ? appointmentsData : appointmentsData.filter((apt) => apt.doctor_id === selectedDoctor)

      console.log(`🎯 Calendar - After doctor filter: ${filteredAppointments.length} appointments`)
      setAppointments(filteredAppointments)

      // Show detailed info about appointments
      if (filteredAppointments.length > 0) {
        console.log("📋 Calendar - Sample appointments:")
        filteredAppointments.slice(0, 3).forEach((apt, index) => {
          console.log(
            `  ${index + 1}. Date: ${apt.appointment_date}, Time: ${apt.appointment_time}, Patient: ${apt.patient?.full_name}`,
          )
        })
      }

      // Show a toast if no appointments found
      if (appointmentsData.length === 0) {
        toast({
          title: "No appointments found",
          description: `No appointments found for the selected date range (${startDate} to ${endDate})`,
        })
      }
    } catch (error: any) {
      console.error("❌ Error loading appointments:", error)
      toast({
        title: "Error loading appointments",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setAppointmentsLoading(false)
    }
  }

  const handleViewChange = (newView: CalendarView) => {
    console.log(`🔄 Calendar - Changing view from ${view} to ${newView}`)
    setView(newView)
  }

  const handleDateChange = (date: Date) => {
    console.log(`📅 Calendar - Changing date to ${format(date, "yyyy-MM-dd")}`)
    setSelectedDate(date)
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    console.log(`👆 Calendar - Clicked appointment:`, appointment)
    setSelectedAppointment(appointment)
    setSelectedSlotDate(undefined)
    setSelectedSlotTime(undefined)
    setSelectedSlotDoctor(undefined)
    setShowAppointmentDialog(true)
  }

  const handleSlotClick = (date: Date, time: string, doctorId?: string) => {
    console.log(`👆 Calendar - Clicked slot: ${format(date, "yyyy-MM-dd")} at ${time}`)
    setSelectedAppointment(undefined)
    setSelectedSlotDate(date)
    setSelectedSlotTime(time)
    setSelectedSlotDoctor(doctorId)
    setShowAppointmentDialog(true)
  }

  const handleDoctorFilterChange = (doctorId: string) => {
    console.log(`👨‍⚕️ Calendar - Changing doctor filter to: ${doctorId}`)
    setSelectedDoctor(doctorId)
  }

  const handleAppointmentSuccess = () => {
    console.log("✅ Calendar - Appointment operation successful, reloading...")
    loadAppointments()
  }

  const handleRefresh = () => {
    console.log("🔄 Calendar - Manual refresh triggered")
    loadAppointments()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 h-screen flex flex-col">
      <BackButton href="/" label="Back to Dashboard" />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Appointment Calendar</h1>
          {appointmentsLoading && <p className="text-sm text-gray-500">Loading appointments...</p>}
          <p className="text-sm text-gray-600">
            Showing {appointments.length} appointment{appointments.length !== 1 ? "s" : ""} in {view} view
            {appointments.length === 0 && !appointmentsLoading && " - Try creating a new appointment"}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={appointmentsLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${appointmentsLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Doctor:</span>
            <Select value={selectedDoctor} onValueChange={handleDoctorFilterChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => handleSlotClick(new Date(), "09:00")} className="bg-emerald-600 hover:bg-emerald-700">
            New Appointment
          </Button>
        </div>
      </div>

      <div className="flex-1">
        <CalendarComponent
          view={view}
          selectedDate={selectedDate}
          appointments={appointments}
          doctors={doctors}
          onViewChange={handleViewChange}
          onDateChange={handleDateChange}
          onAppointmentClick={handleAppointmentClick}
          onSlotClick={handleSlotClick}
        />
      </div>

      <AppointmentDialog
        open={showAppointmentDialog}
        onOpenChange={setShowAppointmentDialog}
        onSuccess={handleAppointmentSuccess}
        patients={patients}
        doctors={doctors}
        services={services}
        appointment={selectedAppointment}
        selectedDate={selectedSlotDate}
        selectedTime={selectedSlotTime}
        selectedDoctorId={selectedSlotDoctor}
      />
    </div>
  )
}
