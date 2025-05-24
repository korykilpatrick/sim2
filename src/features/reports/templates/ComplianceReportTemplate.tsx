import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { BaseReportTemplate } from './BaseReportTemplate'
import type { ReportTemplateProps, ReportData } from './types'

const styles = StyleSheet.create({
  riskScore: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  low: { color: '#10b981' },
  medium: { color: '#f59e0b' },
  high: { color: '#ef4444' },
  critical: { color: '#991b1b' },
  complianceTable: {
    marginTop: 15,
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 10,
    fontSize: 11,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
    padding: 8,
    fontSize: 10,
  },
  tableCell: {
    flex: 1,
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
  passed: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  failed: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  warning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
})

interface ComplianceReportData extends ReportData {
  riskScore?: number
  complianceChecks?: Array<{
    category: string
    status: 'passed' | 'failed' | 'warning'
    details: string
  }>
  sanctions?: Array<{
    listName: string
    matched: boolean
    details?: string
  }>
}

export const ComplianceReportTemplate: React.FC<ReportTemplateProps> = ({
  data,
  theme,
  watermark,
}) => {
  const complianceData = data as ComplianceReportData
  const riskScore = complianceData.riskScore || 0

  const getRiskLevel = (score: number) => {
    if (score >= 80) return 'critical'
    if (score >= 60) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
  }

  const riskLevel = getRiskLevel(riskScore)

  // Transform compliance data into report sections
  const enhancedSections = [
    {
      title: 'Risk Assessment',
      content: (
        <View>
          <Text style={[styles.riskScore, styles[riskLevel]]}>
            Risk Score: {riskScore}/100
          </Text>
          <Text>Risk Level: {riskLevel.toUpperCase()}</Text>
        </View>
      ),
    },
    ...(complianceData.complianceChecks
      ? [
          {
            title: 'Compliance Checks',
            content: (
              <View style={styles.complianceTable}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>Category</Text>
                  <Text style={styles.tableCell}>Status</Text>
                  <Text style={[styles.tableCell, { flex: 3 }]}>Details</Text>
                </View>
                {complianceData.complianceChecks.map((check, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      {check.category}
                    </Text>
                    <View style={styles.tableCell}>
                      <Text style={[styles.statusBadge, styles[check.status]]}>
                        {check.status.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.tableCell, { flex: 3 }]}>
                      {check.details}
                    </Text>
                  </View>
                ))}
              </View>
            ),
          },
        ]
      : []),
    ...(complianceData.sanctions
      ? [
          {
            title: 'Sanctions Screening',
            content: (
              <View style={styles.complianceTable}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    Sanctions List
                  </Text>
                  <Text style={styles.tableCell}>Match Status</Text>
                  <Text style={[styles.tableCell, { flex: 3 }]}>Details</Text>
                </View>
                {complianceData.sanctions.map((sanction, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      {sanction.listName}
                    </Text>
                    <View style={styles.tableCell}>
                      <Text
                        style={[
                          styles.statusBadge,
                          sanction.matched ? styles.failed : styles.passed,
                        ]}
                      >
                        {sanction.matched ? 'MATCH' : 'CLEAR'}
                      </Text>
                    </View>
                    <Text style={[styles.tableCell, { flex: 3 }]}>
                      {sanction.details ||
                        (sanction.matched
                          ? 'Review required'
                          : 'No matches found')}
                    </Text>
                  </View>
                ))}
              </View>
            ),
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
      'This compliance report is generated based on available data at the time of generation. Risk scores and compliance status may change as new information becomes available. This report should not be used as the sole basis for making business decisions.',
  }

  return (
    <BaseReportTemplate
      data={enhancedData}
      theme={theme}
      watermark={watermark}
    />
  )
}
