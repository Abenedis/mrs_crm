"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { getAppointments, getDoctors, getPatients, getServices, deleteAppointment } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Search, Edit, Trash2, Calendar, Clock, User, Stethoscope } from "lucide-react"
import AppointmentDialog from "@/components/appointment-dialog"
import type { Appointment, Patient, Doctor, Service } from "@/lib/supabase"
import BackButton from "@/components/back-button"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [doctorFilter, setDoctorFilter] = useState("all")
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>()
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [appointmentsData, patientsData, doctorsData, servicesData] = await Promise.all([
        getAppointments(),
        getPatients(),
        getDoctors(),
        getServices(),
      ])

      console.log("Appointments page - loaded data:", {
        appointments: appointmentsData.length,
        patients: patientsData.length,
        doctors: doctorsData.length,
        services: servicesData.length,
      })

      setAppointments(appointmentsData)
      setPatients(patientsData)
      setDoctors(doctorsData)
      setServices(servicesData)
    } catch (error: any) {
      console.error("Error loading data:", error)
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setShowAppointmentDialog(true)
  }

  const handleDelete = async (appointment: Appointment) => {
    if (confirm(`Are you sure you want to delete the appointment for ${appointment.patient?.full_name}?`)) {
      try {
        await deleteAppointment(appointment.id)
        toast({
          title: "Appointment deleted",
          description: "Appointment has been deleted successfully.",
        })
        loadData()
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  const handleDialogClose = () => {
    setShowAppointmentDialog(false)
    setEditingAppointment(undefined)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "no_show":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patient?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
    const matchesDoctor = doctorFilter === "all" || appointment.doctor_id === doctorFilter

    return matchesSearch && matchesStatus && matchesDoctor
  })

  // Group appointments by date
  const groupedAppointments = filteredAppointments.reduce(
    (groups, appointment) => {
      const date = appointment.appointment_date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(appointment)
      return groups
    },
    {} as Record<string, Appointment[]>,
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <BackButton label="Back to Dashboard" />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage patient appointments and schedules</p>
        </div>
        <Button onClick={() => setShowAppointmentDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no_show">No Show</SelectItem>
          </SelectContent>
        </Select>
        <Select value={doctorFilter} onValueChange={setDoctorFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by doctor" />
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total</p>
                <p className="text-2xl font-bold text-blue-900">{appointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Completed</p>
                <p className="text-2xl font-bold text-green-900">
                  {appointments.filter((a) => a.status === "completed").length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Scheduled</p>
                <p className="text-2xl font-bold text-orange-900">
                  {appointments.filter((a) => a.status === "scheduled").length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Cancelled</p>
                <p className="text-2xl font-bold text-red-900">
                  {appointments.filter((a) => a.status === "cancelled" || a.status === "no_show").length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      {Object.keys(groupedAppointments).length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No appointments found</h3>
          <p className="mt-2 text-gray-500">
            {appointments.length === 0
              ? "Get started by scheduling your first appointment."
              : "Try adjusting your search or filter."}
          </p>
          {appointments.length === 0 && (
            <Button className="mt-6 bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAppointmentDialog(true)}>
              Schedule First Appointment
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAppointments)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, dayAppointments]) => (
              <div key={date}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {dayAppointments
                    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                    .map((appointment) => (
                      <Card key={appointment.id} className="hover:shadow-lg transition-shadow border-0 shadow-sm">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-emerald-600" />
                                {appointment.appointment_time}
                              </CardTitle>
                              <CardDescription className="text-gray-600 mt-1">
                                {appointment.service?.name || "General consultation"}
                              </CardDescription>
                            </div>
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="h-4 w-4 mr-2 text-emerald-600" />
                              <span className="font-medium">{appointment.patient?.full_name}</span>
                              <span className="ml-2 text-gray-500">({appointment.patient?.phone})</span>
                            </div>

                            <div className="flex items-center text-sm text-gray-600">
                              <Stethoscope className="h-4 w-4 mr-2 text-emerald-600" />
                              <span>{appointment.doctor?.full_name}</span>
                              <span className="ml-2 text-gray-500">({appointment.doctor?.specialization})</span>
                            </div>

                            {appointment.price && (
                              <div className="text-sm text-gray-600">
                                <strong>Price:</strong> ${appointment.price.toFixed(2)}
                              </div>
                            )}

                            {appointment.notes && (
                              <div className="text-sm text-gray-600">
                                <strong>Notes:</strong> {appointment.notes}
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                onClick={() => handleEdit(appointment)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(appointment)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}

      <AppointmentDialog
        open={showAppointmentDialog}
        onOpenChange={handleDialogClose}
        onSuccess={loadData}
        patients={patients}
        doctors={doctors}
        services={services}
        appointment={editingAppointment}
      />
    </div>
  )
}
