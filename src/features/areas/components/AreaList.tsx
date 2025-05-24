import React from 'react'
import { Area } from '../types'
import { AreaCard } from './AreaCard'
import { AreaEmptyState } from './AreaEmptyState'

interface AreaListProps {
  areas: Area[]
  onSelectArea: (area: Area) => void
  onEditArea: (area: Area) => void
  onDeleteArea: (area: Area) => void
  selectedAreaId?: string
}

export const AreaList: React.FC<AreaListProps> = ({
  areas,
  onSelectArea,
  onEditArea,
  onDeleteArea,
  selectedAreaId,
}) => {
  if (areas.length === 0) {
    return <AreaEmptyState />
  }

  return (
    <div className="space-y-4">
      {areas.map((area) => (
        <AreaCard
          key={area.id}
          area={area}
          isSelected={selectedAreaId === area.id}
          onSelect={() => onSelectArea(area)}
          onEdit={() => onEditArea(area)}
          onDelete={() => onDeleteArea(area)}
        />
      ))}
    </div>
  )
}
