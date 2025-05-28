"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CuboidIcon as Cube, Sparkles, Eye, Layers } from "lucide-react"
import BackButton from "@/components/back-button"

export default function ThreeDViewPage() {
  return (
    <div className="container mx-auto py-8 px-4 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <BackButton label="Back to Dashboard" />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Cube className="h-24 w-24 text-blue-600 animate-pulse" />
              <Sparkles className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">3D Dental Visualization</h1>
          <p className="text-xl text-gray-600 mb-8">
            Advanced 3D modeling and visualization tools for dental professionals
          </p>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl font-bold text-blue-600 mb-2">Coming Soon!</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                We're working hard to bring you cutting-edge 3D dental visualization technology
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <Eye className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">3D Tooth Modeling</h3>
                  <p className="text-gray-600">Interactive 3D models of individual teeth with detailed anatomy</p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <Layers className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Treatment Planning</h3>
                  <p className="text-gray-600">Visualize treatment plans in 3D before implementation</p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <Cube className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Virtual Reality</h3>
                  <p className="text-gray-600">Immersive VR experience for patient education</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  This feature will include advanced 3D visualization tools, interactive dental models, treatment
                  simulation, and virtual reality capabilities for enhanced patient care.
                </p>
                <div className="flex justify-center">
                  <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Notified
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
