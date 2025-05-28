"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Loader2, Plus, X, Mail, Download } from "lucide-react"
import { createInvoice, sendInvoiceEmail } from "@/lib/api"
import type { Patient, Service, Appointment, InvoiceFormData } from "@/lib/supabase"

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  patients: Patient[]
  services: Service[]
  appointment?: Appointment
}

interface InvoiceItem {
  service_id?: string
  description: string
  quantity: number
  unit_price: number
}

export default function InvoiceDialog({
  open,
  onOpenChange,
  onSuccess,
  patients,
  services,
  appointment,
}: InvoiceDialogProps) {
  const [loading, setLoading] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<InvoiceFormData>({
    patient_id: "",
    appointment_id: "",
    due_date: "",
    notes: "",
    items: [{ description: "", quantity: 1, unit_price: 0 }],
  })

  useEffect(() => {
    if (open) {
      if (appointment) {
        setFormData({
          patient_id: appointment.patient_id,
          appointment_id: appointment.id,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
          notes: "",
          items: appointment.service_id
            ? [
                {
                  service_id: appointment.service_id,
                  description: appointment.service?.name || "",
                  quantity: 1,
                  unit_price: appointment.service?.price || 0,
                },
              ]
            : [{ description: "", quantity: 1, unit_price: 0 }],
        })
      } else {
        setFormData({
          patient_id: "",
          appointment_id: "",
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          notes: "",
          items: [{ description: "", quantity: 1, unit_price: 0 }],
        })
      }
    }
  }, [open, appointment])

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, unit_price: 0 }],
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const handleServiceSelect = (index: number, serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    if (service) {
      updateItem(index, "service_id", serviceId)
      updateItem(index, "description", service.name)
      updateItem(index, "unit_price", service.price)
    }
  }

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.1 // 10% tax
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const validateForm = () => {
    if (!formData.patient_id) {
      toast({
        title: "Validation Error",
        description: "Please select a patient",
        variant: "destructive",
      })
      return false
    }

    if (!formData.due_date) {
      toast({
        title: "Validation Error",
        description: "Please select a due date",
        variant: "destructive",
      })
      return false
    }

    if (formData.items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item",
        variant: "destructive",
      })
      return false
    }

    for (const item of formData.items) {
      if (!item.description.trim()) {
        toast({
          title: "Validation Error",
          description: "All items must have a description",
          variant: "destructive",
        })
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Clean the form data
      const cleanFormData = {
        ...formData,
        appointment_id: formData.appointment_id || null,
        notes: formData.notes.trim() || null,
      }

      const invoice = await createInvoice(cleanFormData)
      toast({
        title: "Invoice created",
        description: "Invoice has been created successfully.",
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
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!formData.patient_id) return

    if (!validateForm()) {
      return
    }

    setSendingEmail(true)
    try {
      const patient = patients.find((p) => p.id === formData.patient_id)
      if (!patient?.email) {
        throw new Error("Patient email not found")
      }

      // Clean the form data
      const cleanFormData = {
        ...formData,
        appointment_id: formData.appointment_id || null,
        notes: formData.notes.trim() || null,
      }

      // First create the invoice
      const invoice = await createInvoice(cleanFormData)

      // Then send email
      await sendInvoiceEmail(invoice.id, patient.email)

      toast({
        title: "Invoice sent",
        description: "Invoice has been created and sent via email.",
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
      setSendingEmail(false)
    }
  }

  const selectedPatient = patients.find((p) => p.id === formData.patient_id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>Generate an invoice for services provided</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patient_id">Patient *</Label>
              <Select
                value={formData.patient_id}
                onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.full_name} ({patient.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label>Invoice Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                    <div className="col-span-4">
                      <Label className="text-xs">Service</Label>
                      <Select
                        value={item.service_id || ""}
                        onValueChange={(value) => handleServiceSelect(index, value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Label className="text-xs">Description</Label>
                      <Input
                        className="h-8"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        placeholder="Description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        className="h-8"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Price</Label>
                      <Input
                        className="h-8"
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, "unit_price", Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Invoice Summary */}
            <div className="border-t pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%):</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t pt-2">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              {selectedPatient?.email && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendEmail}
                  disabled={sendingEmail || !formData.patient_id}
                >
                  {sendingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              )}
              <Button
                type="submit"
                disabled={loading || !formData.patient_id}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Download className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
