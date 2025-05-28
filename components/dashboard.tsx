"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getPatients, getDoctors, getAppointments, getServices, getInvoices } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Users,
  Calendar,
  LogOut,
  Plus,
  FileText,
  ListChecks,
  TrendingUp,
  Clock,
  CuboidIcon as Cube,
} from "lucide-react"
import type { Patient, Doctor, Appointment, Service } from "@/lib/supabase"
import PatientDialog from "./patient-dialog"
import AppointmentDialog from "./appointment-dialog"
import InvoiceDialog from "./invoice-dialog"

export default function Dashboard() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showPatientDialog, setShowPatientDialog] = useState(false)
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("User not authenticated")
      }

      const [patientsData, doctorsData, appointmentsData, servicesData, invoicesData] = await Promise.all([
        getPatients(),
        getDoctors(),
        getAppointments(),
        getServices(),
        getInvoices(),
      ])

      setPatients(patientsData || [])
      setDoctors(doctorsData || [])
      setAppointments(appointmentsData || [])
      setServices(servicesData || [])
      setInvoices(invoicesData || [])
    } catch (error: any) {
      console.error("Data loading error:", error)
      toast({
        title: "Error loading data",
        description: error.message || "Unknown error",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    })
  }

  const todayAppointments = appointments.filter(
    (apt) => apt.appointment_date === new Date().toISOString().split("T")[0],
  )

  const monthlyRevenue = appointments
    .filter((apt) => apt.status === "completed" && apt.price)
    .reduce((sum, apt) => sum + (apt.price || 0), 0)

  const pendingInvoices = invoices.filter((invoice) => invoice.status === "sent" || invoice.status === "overdue").length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-emerald-600">Dentak</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={() => router.push("/calendar")}>
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/appointments")}>
                <Calendar className="h-4 w-4 mr-2" />
                Appointments
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/patients")}>
                <Users className="h-4 w-4 mr-2" />
                Patients
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/doctors")}>
                <Users className="h-4 w-4 mr-2" />
                Doctors
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/services")}>
                <ListChecks className="h-4 w-4 mr-2" />
                Services
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/invoices")}>
                <FileText className="h-4 w-4 mr-2" />
                Invoices
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/3d-view")}>
                <Cube className="h-4 w-4 mr-2" />
                3D View
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowPatientDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Patient
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setShowAppointmentDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
            <Button
              onClick={() => setShowPatientDialog(true)}
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
            <Button
              onClick={() => setShowInvoiceDialog(true)}
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
            <Button
              onClick={() => router.push("/calendar")}
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
            <Button
              onClick={() => router.push("/3d-view")}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Cube className="h-4 w-4 mr-2" />
              3D View
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-emerald-50 to-emerald-100"
            onClick={() => router.push("/patients")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Total Patients</CardTitle>
              <Users className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">{patients.length}</div>
              <p className="text-xs text-emerald-600 mt-1">Click to view all patients</p>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100"
            onClick={() => router.push("/appointments")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Today's Appointments</CardTitle>
              <Clock className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{todayAppointments.length}</div>
              <p className="text-xs text-blue-600 mt-1">Click to manage appointments</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Monthly Revenue</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">${monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-green-600 mt-1">Completed procedures</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Pending Invoices</CardTitle>
              <FileText className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{pendingInvoices}</div>
              <p className="text-xs text-orange-600 mt-1">Awaiting payment</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Appointments */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Appointments</CardTitle>
              <CardDescription className="text-gray-600">Latest scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-sm font-medium text-gray-900">No appointments</h3>
                  <p className="mt-2 text-sm text-gray-500">Schedule your first appointment.</p>
                  <Button className="mt-4" size="sm" onClick={() => setShowAppointmentDialog(true)}>
                    New Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{appointment.patient?.full_name}</p>
                        <p className="text-sm text-gray-600">
                          {appointment.doctor?.full_name} • {appointment.appointment_date} at{" "}
                          {appointment.appointment_time}
                        </p>
                        {appointment.service?.name && (
                          <p className="text-xs text-gray-500">{appointment.service.name}</p>
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className={
                          appointment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : appointment.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-orange-100 text-orange-800"
                        }
                      >
                        {appointment.status === "completed"
                          ? "Completed"
                          : appointment.status === "scheduled"
                            ? "Scheduled"
                            : appointment.status === "cancelled"
                              ? "Cancelled"
                              : "No Show"}
                      </Badge>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Button variant="outline" onClick={() => router.push("/appointments")}>
                      View All Appointments
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Patients</CardTitle>
              <CardDescription className="text-gray-600">Recently added patients</CardDescription>
            </CardHeader>
            <CardContent>
              {patients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-sm font-medium text-gray-900">No patients</h3>
                  <p className="mt-2 text-sm text-gray-500">Get started by adding a new patient.</p>
                  <Button className="mt-4" size="sm" onClick={() => setShowPatientDialog(true)}>
                    Add Patient
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {patients.slice(0, 5).map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{patient.full_name}</p>
                        <p className="text-sm text-gray-600">{patient.phone}</p>
                        {patient.email && <p className="text-xs text-gray-500">{patient.email}</p>}
                      </div>
                      <div className="text-sm text-gray-500">{new Date(patient.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Button variant="outline" onClick={() => router.push("/patients")}>
                      View All Patients
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <PatientDialog open={showPatientDialog} onOpenChange={setShowPatientDialog} onSuccess={loadData} />

      <AppointmentDialog
        open={showAppointmentDialog}
        onOpenChange={setShowAppointmentDialog}
        onSuccess={loadData}
        patients={patients}
        doctors={doctors}
        services={services}
      />

      <InvoiceDialog
        open={showInvoiceDialog}
        onOpenChange={setShowInvoiceDialog}
        onSuccess={loadData}
        patients={patients}
        services={services}
      />
    </div>
  )
}
