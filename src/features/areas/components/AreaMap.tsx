import React, { useRef, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import { Pencil, Save, X } from 'lucide-react'

interface AreaMapProps {
  area?: GeoJSON.Polygon | GeoJSON.MultiPolygon
  onAreaCreate?: (area: GeoJSON.Polygon) => void
  onAreaUpdate?: (area: GeoJSON.Polygon) => void
  isEditing?: boolean
  vesselsInArea?: Array<{ lat: number; lng: number; name: string }>
}

export const AreaMap: React.FC<AreaMapProps> = ({
  area,
  onAreaCreate,
  onAreaUpdate,
  isEditing = false,
  vesselsInArea = [],
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPolygon, setCurrentPolygon] = useState<any[]>([])

  useEffect(() => {
    // Note: In a real implementation, you would integrate with a mapping library
    // like Mapbox, Google Maps, or Leaflet here
    // For now, we'll create a placeholder
  }, [area, vesselsInArea])

  const handleStartDrawing = () => {
    setIsDrawing(true)
    setCurrentPolygon([])
  }

  const handleCancelDrawing = () => {
    setIsDrawing(false)
    setCurrentPolygon([])
  }

  const handleSaveArea = () => {
    if (currentPolygon.length >= 3) {
      // Convert to GeoJSON polygon
      const polygon: GeoJSON.Polygon = {
        type: 'Polygon',
        coordinates: [currentPolygon.map((p) => [p.lng, p.lat])],
      }
      
      if (isEditing && onAreaUpdate) {
        onAreaUpdate(polygon)
      } else if (onAreaCreate) {
        onAreaCreate(polygon)
      }
      
      setIsDrawing(false)
      setCurrentPolygon([])
    }
  }

  return (
    <Card className="h-full">
      <CardContent className="p-0 h-full">
        <div className="relative h-full min-h-[500px]">
          {/* Map placeholder */}
          <div
            ref={mapRef}
            className="absolute inset-0 bg-gray-100 flex items-center justify-center"
          >
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                Map integration pending
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Mapbox/Google Maps/Leaflet to be integrated
              </p>
            </div>
          </div>

          {/* Drawing controls */}
          <div className="absolute top-4 right-4 z-10">
            {!isDrawing ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartDrawing}
              >
                <Pencil className="h-4 w-4 mr-2" />
                {isEditing ? 'Edit Area' : 'Draw Area'}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveArea}
                  disabled={currentPolygon.length < 3}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelDrawing}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Area info overlay */}
          {area && !isDrawing && (
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
              <h4 className="font-medium text-gray-900 mb-2">Area Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Type: {area.type}</p>
                {vesselsInArea.length > 0 && (
                  <p>Vessels in area: {vesselsInArea.length}</p>
                )}
              </div>
            </div>
          )}

          {/* Drawing instructions */}
          {isDrawing && (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
              <p className="text-sm">
                Click on the map to define area boundaries
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}