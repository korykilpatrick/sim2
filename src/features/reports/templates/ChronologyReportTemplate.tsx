import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { BaseReportTemplate } from './BaseReportTemplate'
import type { ReportTemplateProps, ReportData } from './types'

const styles = StyleSheet.create({
  timeline: {
    marginTop: 20,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingLeft: 20,
    borderLeft: '2px solid #e5e7eb',
  },
  timelineDot: {
    position: 'absolute',
    left: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0066FF',
  },
  timelineDate: {
    width: 100,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 15,
  },
  timelineTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  timelineDescription: {
    fontSize: 11,
    color: '#4b5563',
    lineHeight: 1.4,
  },
  timelineLocation: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 3,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 5,
  },
})

interface VesselEvent {
  date: Date
  type: string
  description: string
  location?: string
  details?: Record<string, unknown>
}

interface ChronologyReportData extends ReportData {
  vesselInfo?: {
    name: string
    imo: string
    flag: string
    type: string
  }
  events?: VesselEvent[]
  statistics?: {
    totalEvents: number
    portsVisited: number
    daysTracked: number
    incidentsReported: number
  }
}

export const ChronologyReportTemplate: React.FC<ReportTemplateProps> = ({
  data,
  theme,
  watermark,
}) => {
  const chronologyData = data as ChronologyReportData

  // Transform chronology data into report sections
  const enhancedSections = [
    ...(chronologyData.vesselInfo
      ? [
          {
            title: 'Vessel Information',
            content: (
              <View>
                <Text>Vessel Name: {chronologyData.vesselInfo.name}</Text>
                <Text>IMO Number: {chronologyData.vesselInfo.imo}</Text>
                <Text>Flag State: {chronologyData.vesselInfo.flag}</Text>
                <Text>Vessel Type: {chronologyData.vesselInfo.type}</Text>
              </View>
            ),
          },
        ]
      : []),
    ...(chronologyData.statistics
      ? [
          {
            title: 'Activity Summary',
            content: (
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {chronologyData.statistics.totalEvents}
                  </Text>
                  <Text style={styles.statLabel}>Total Events</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {chronologyData.statistics.portsVisited}
                  </Text>
                  <Text style={styles.statLabel}>Ports Visited</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {chronologyData.statistics.daysTracked}
                  </Text>
                  <Text style={styles.statLabel}>Days Tracked</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {chronologyData.statistics.incidentsReported}
                  </Text>
                  <Text style={styles.statLabel}>Incidents</Text>
                </View>
              </View>
            ),
          },
        ]
      : []),
    ...(chronologyData.events && chronologyData.events.length > 0
      ? [
          {
            title: 'Vessel Activity Timeline',
            content: (
              <View style={styles.timeline}>
                {chronologyData.events.map((event, index) => (
                  <View key={index} style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <Text style={styles.timelineDate}>
                      {event.date.toLocaleDateString()}
                    </Text>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>{event.type}</Text>
                      <Text style={styles.timelineDescription}>
                        {event.description}
                      </Text>
                      {event.location && (
                        <Text style={styles.timelineLocation}>
                          📍 {event.location}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ),
            pageBreak: true, // Start timeline on new page if it's long
          },
        ]
      : []),
    ...data.sections,
  ]

  const enhancedData: ReportData = {
    ...data,
    sections: enhancedSections,
    disclaimer:
      data.disclaimer ||
      "This chronology report is compiled from various data sources and represents the vessel's known activities during the specified timeframe. Some events may be subject to verification and the timeline may not be exhaustive.",
  }

  return (
    <BaseReportTemplate
      data={enhancedData}
      theme={theme}
      watermark={watermark}
    />
  )
}
