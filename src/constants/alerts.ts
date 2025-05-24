/**
 * Alert type definition for maritime monitoring
 */
export interface AlertType {
  id: string
  name: string
  description: string
  active: boolean
}

/**
 * Available alert types for maritime monitoring.
 * These define the different categories of alerts users can create.
 */
export const MARITIME_ALERT_TYPES: AlertType[] = [
  {
    id: 'ship',
    name: 'Ship Alert',
    description:
      'Monitor specific vessels and receive alerts on their activities and movements.',
    active: true,
  },
  {
    id: 'area',
    name: 'Area Alert',
    description:
      'Monitor geographic areas for vessel traffic and maritime events.',
    active: false,
  },
  {
    id: 'ship-area',
    name: 'Ship & Area Alert',
    description:
      'Combine vessel and area monitoring for comprehensive maritime intelligence.',
    active: false,
  },
]
