"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { getDoctors } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Search, Users } from "lucide-react"
import DoctorDialog from "@/components/doctor-dialog"
import { formatTimeRange } from "@/utils/schedule-validation"
import type { Doctor } from "@/lib/supabase"
import BackButton from "@/components/back-button"

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [specialization, setSpecialization] = useState("all")
  const [showDoctorDialog, setShowDoctorDialog] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>(undefined)
  const { toast } = useToast()

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      setLoading(true)
      const data = await getDoctors()
      setDoctors(data)
    } catch (error: any) {
      toast({
        title: "Error loading doctors",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddDoctor = () => {
    setSelectedDoctor(undefined)
    setShowDoctorDialog(true)
  }

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setShowDoctorDialog(true)
  }

  const handleDoctorSuccess = () => {
    loadDoctors()
  }

  // Get unique specializations for filter
  const specializations = ["all", ...new Set(doctors.map((doctor) => doctor.specialization))]

  // Filter doctors based on search term and specialization
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = specialization === "all" || doctor.specialization === specialization
    return matchesSearch && matchesSpecialization
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <BackButton label="Back to Dashboard" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Doctors</h1>
        <Button onClick={handleAddDoctor}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Doctor
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={specialization} onValueChange={setSpecialization}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by specialization" />
          </SelectTrigger>
          <SelectContent>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec === "all" ? "All Specializations" : spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredDoctors.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {doctors.length === 0 ? "Get started by adding a new doctor." : "Try adjusting your search or filter."}
          </p>
          {doctors.length === 0 && (
            <Button className="mt-6" onClick={handleAddDoctor}>
              Add New Doctor
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="p-6">
                  <h3 className="text-lg font-semibold">{doctor.full_name}</h3>
                  <p className="text-sm text-gray-500">{doctor.specialization}</p>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span> {doctor.phone}
                    </p>
                    {doctor.email && (
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {doctor.email}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-medium">Price per hour:</span> ${doctor.price_per_hour}
                    </p>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Schedule:</h4>
                    <div className="space-y-1 text-xs">
                      {doctor.schedule &&
                        Object.entries(doctor.schedule).map(([day, timeRanges]) =>
                          timeRanges && timeRanges.length > 0 ? (
                            <p key={day} className="capitalize">
                              <span className="font-medium">{day}:</span> {timeRanges.map(formatTimeRange).join(", ")}
                            </p>
                          ) : null,
                        )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3">
                  <Button variant="outline" className="w-full" onClick={() => handleEditDoctor(doctor)}>
                    Edit Doctor
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DoctorDialog
        open={showDoctorDialog}
        onOpenChange={setShowDoctorDialog}
        onSuccess={handleDoctorSuccess}
        doctor={selectedDoctor}
      />
    </div>
  )
}
