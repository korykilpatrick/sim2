import { Card, CardContent } from '@/components/common/Card'
import Input from '@/components/forms/Input'

interface VesselSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function VesselSearchBar({
  value,
  onChange,
}: VesselSearchBarProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="max-w-md">
          <Input
            type="search"
            placeholder="Search by vessel name, IMO, or MMSI..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
