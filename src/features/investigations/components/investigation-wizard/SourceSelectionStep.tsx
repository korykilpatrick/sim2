import { Card } from '@/components/common/Card'
import { InvestigationRequest, IntelligenceSources } from '../../types'

interface SourceSelectionStepProps {
  data: Partial<InvestigationRequest>
  onUpdate: (data: Partial<InvestigationRequest>) => void
}

const sourceOptions = [
  {
    key: 'satelliteImagery' as keyof IntelligenceSources,
    title: 'Satellite Imagery',
    description:
      'High-resolution satellite analysis for vessel positioning and verification',
    icon: '🛰️',
  },
  {
    key: 'osint' as keyof IntelligenceSources,
    title: 'OSINT',
    description:
      'Open-Source Intelligence from news, social media, and public records',
    icon: '🌐',
  },
  {
    key: 'sigint' as keyof IntelligenceSources,
    title: 'SIGINT',
    description: 'Signals Intelligence including AIS and RF data analysis',
    icon: '📡',
  },
  {
    key: 'webcams' as keyof IntelligenceSources,
    title: 'Webcams & Sensors',
    description: 'Live feeds from coastal monitoring stations and port cameras',
    icon: '📹',
  },
  {
    key: 'humint' as keyof IntelligenceSources,
    title: 'HUMINT',
    description:
      'Human Intelligence from trusted industry and regional sources',
    icon: '👥',
  },
  {
    key: 'proprietaryTools' as keyof IntelligenceSources,
    title: 'Proprietary Tools',
    description: 'Exclusive SynMax algorithms and risk assessment models',
    icon: '🔧',
  },
]

export function SourceSelectionStep({
  data,
  onUpdate,
}: SourceSelectionStepProps) {
  const toggleSource = (sourceKey: keyof IntelligenceSources) => {
    const currentSources = data.requestedSources || {
      satelliteImagery: false,
      osint: false,
      sigint: false,
      webcams: false,
      humint: false,
      proprietaryTools: false,
    }
    onUpdate({
      requestedSources: {
        ...currentSources,
        [sourceKey]: !currentSources[sourceKey],
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Intelligence Sources</h3>
        <p className="text-gray-600">
          Select the intelligence sources you want our analysts to utilize. More
          sources provide deeper insights but may increase investigation time
          and cost.
        </p>
      </div>

      <div className="grid gap-4">
        {sourceOptions.map((source) => (
          <Card
            key={source.key}
            className={`cursor-pointer transition-all ${
              data.requestedSources?.[source.key]
                ? 'ring-2 ring-primary-500 border-primary-500'
                : 'hover:border-gray-400'
            }`}
            onClick={() => toggleSource(source.key)}
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                <div className="text-2xl">{source.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{source.title}</h4>
                  <p className="text-sm text-gray-600">{source.description}</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.requestedSources?.[source.key] || false}
                    onChange={() => toggleSource(source.key)}
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-yellow-50 border-yellow-200">
        <div className="p-4">
          <div className="flex gap-3">
            <div className="text-yellow-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-yellow-800">
                <strong>Recommended:</strong> For most investigations, we
                recommend enabling Satellite Imagery, OSINT, SIGINT, and
                Proprietary Tools for comprehensive analysis.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h4 className="font-semibold">Additional Requests</h4>
        <textarea
          value={data.additionalRequests || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onUpdate({ additionalRequests: e.target.value })
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Any specific data, imagery, or analysis requests..."
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Contact Preferences</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.contactPreferences?.email || false}
              onChange={(e) =>
                onUpdate({
                  contactPreferences: {
                    ...data.contactPreferences,
                    email: e.target.checked,
                    phone: data.contactPreferences?.phone || false,
                    platformMessage:
                      data.contactPreferences?.platformMessage || false,
                  },
                })
              }
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span>Email notifications</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.contactPreferences?.phone || false}
              onChange={(e) =>
                onUpdate({
                  contactPreferences: {
                    ...data.contactPreferences,
                    phone: e.target.checked,
                    email: data.contactPreferences?.email || false,
                    platformMessage:
                      data.contactPreferences?.platformMessage || false,
                  },
                })
              }
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span>Phone updates</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.contactPreferences?.platformMessage || false}
              onChange={(e) =>
                onUpdate({
                  contactPreferences: {
                    ...data.contactPreferences,
                    platformMessage: e.target.checked,
                    email: data.contactPreferences?.email || false,
                    phone: data.contactPreferences?.phone || false,
                  },
                })
              }
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span>Platform messages</span>
          </label>
        </div>
      </div>
    </div>
  )
}
