import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { ReportTemplateProps } from './types'

// Register fonts if needed
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf'
// });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 50,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #0066FF',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
  },
  metadata: {
    fontSize: 10,
    color: '#999999',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 25,
    marginBottom: 15,
  },
  sectionContent: {
    fontSize: 12,
    lineHeight: 1.6,
    color: '#333333',
    marginBottom: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 10,
    color: '#999999',
    textAlign: 'center',
    borderTop: '1px solid #e0e0e0',
    paddingTop: 10,
  },
  watermark: {
    position: 'absolute',
    fontSize: 60,
    color: '#f0f0f0',
    transform: 'rotate(-45deg)',
    opacity: 0.1,
    left: '25%',
    top: '40%',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 50,
    fontSize: 10,
    color: '#999999',
  },
  disclaimer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f5f5f5',
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.4,
  },
})

export const BaseReportTemplate: React.FC<ReportTemplateProps> = ({
  data,
  watermark = true,
}) => {
  const { metadata, summary, sections, disclaimer, appendix } = data

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        {watermark && <Text style={styles.watermark}>SYNMAX</Text>}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{metadata.title}</Text>
          {metadata.subtitle && (
            <Text style={styles.subtitle}>{metadata.subtitle}</Text>
          )}
          <Text style={styles.metadata}>
            Report ID: {metadata.reportId} | Generated:{' '}
            {metadata.generatedAt.toLocaleString()} | By: {metadata.generatedBy}
          </Text>
        </View>

        {/* Summary */}
        {summary && (
          <View>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <Text style={styles.sectionContent}>{summary}</Text>
          </View>
        )}

        {/* Main Sections */}
        {sections.map((section, index) => (
          <View key={index} break={section.pageBreak}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {typeof section.content === 'string' ? (
                <Text>{section.content}</Text>
              ) : (
                section.content
              )}
            </View>
          </View>
        ))}

        {/* Disclaimer */}
        {disclaimer && (
          <View style={styles.disclaimer}>
            <Text>{disclaimer}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            © {new Date().getFullYear()} SynMax Intelligence Marketplace. All
            rights reserved.
          </Text>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </Page>

      {/* Appendix Pages */}
      {appendix && appendix.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Appendix</Text>
          {appendix.map((section, index) => (
            <View key={index}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {typeof section.content === 'string' ? (
                  <Text>{section.content}</Text>
                ) : (
                  section.content
                )}
              </View>
            </View>
          ))}
        </Page>
      )}
    </Document>
  )
}
