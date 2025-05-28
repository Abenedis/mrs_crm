"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface BackButtonProps {
  href?: string
  label?: string
}

export default function BackButton({ href = "/", label = "Back to Dashboard" }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className="mb-6 hover:bg-emerald-50 text-emerald-700 flex items-center gap-1 px-2 py-1 h-auto"
    >
      <ChevronLeft className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  )
}
