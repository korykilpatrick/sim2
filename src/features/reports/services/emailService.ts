import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/api/types'
import { useReportQueueStore } from './reportQueue'
import { generatePDF, convertToReportData } from './pdfGenerator'
import { reportApi } from './reportService'
import { useAuthStore } from '@/features/auth/services/authStore'

interface EmailDeliveryRequest {
  reportId: string
  recipientEmail: string
  ccEmails?: string[]
  subject?: string
  message?: string
  includeAttachment?: boolean
}

interface EmailDeliveryResponse {
  success: boolean
  messageId?: string
  error?: string
}

export const emailService = {
  /**
   * Send report via email
   */
  sendReportEmail: async (
    request: EmailDeliveryRequest,
  ): Promise<EmailDeliveryResponse> => {
    const {
      reportId,
      recipientEmail,
      ccEmails,
      subject,
      message,
      includeAttachment = true,
    } = request

    try {
      // Get report data
      const report = await reportApi.getReport(reportId)
      const user = useAuthStore.getState().user

      // Determine report type
      const reportType =
        'riskAssessment' in report ? 'compliance' : 'chronology'

      // Generate subject if not provided
      const emailSubject =
        subject ||
        `Your ${reportType} report is ready - ${report.vessel.name || 'Report'}`

      // Generate message if not provided
      const emailMessage =
        message ||
        `
        Your ${reportType} report for ${report.vessel.name || 'the vessel'} has been generated successfully.
        
        Report Details:
        - Report ID: ${reportId}
        - Generated: ${new Date().toLocaleString()}
        - Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
        
        ${includeAttachment ? 'The report is attached to this email as a PDF file.' : 'You can download the report from your SIM dashboard.'}
        
        Thank you for using SynMax Intelligence Marketplace.
      `.trim()

      // Generate PDF if attachment is requested
      let attachmentData = null
      if (includeAttachment) {
        const reportData = convertToReportData(
          reportType,
          report,
          user?.email || 'Unknown',
        )
        const pdfBlob = await generatePDF({
          reportType,
          data: reportData,
        })

        // Convert blob to base64 for email attachment
        attachmentData = await blobToBase64(pdfBlob)
      }

      // Send email via API
      const response = await apiClient.post<ApiResponse<EmailDeliveryResponse>>(
        '/api/v1/reports/email',
        {
          reportId,
          to: recipientEmail,
          cc: ccEmails,
          subject: emailSubject,
          body: emailMessage,
          attachment: attachmentData
            ? {
                filename: `${reportType}-report-${reportId}.pdf`,
                content: attachmentData,
                type: 'application/pdf',
              }
            : undefined,
        },
      )

      return response.data.data
    } catch (error) {
      console.error('Failed to send report email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      }
    }
  },

  /**
   * Queue report for email delivery
   */
  queueReportEmail: (request: EmailDeliveryRequest): string => {
    const { addJob } = useReportQueueStore.getState()

    return addJob({
      reportId: request.reportId,
      type: 'email',
      status: 'pending',
      progress: 0,
      data: { ...request },
    })
  },

  /**
   * Send bulk report emails
   */
  sendBulkReportEmails: async (
    requests: EmailDeliveryRequest[],
  ): Promise<string[]> => {
    const jobIds: string[] = []

    for (const request of requests) {
      const jobId = emailService.queueReportEmail(request)
      jobIds.push(jobId)
    }

    return jobIds
  },

  /**
   * Get email templates
   */
  getEmailTemplates: async () => {
    const response = await apiClient.get<ApiResponse<EmailTemplate[]>>(
      '/api/v1/reports/email-templates',
    )
    return response.data.data
  },
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
}

/**
 * Convert blob to base64 string
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      // Remove data URL prefix
      const base64Content = base64.split(',')[1]
      resolve(base64Content)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Email notification service for report events
 */
export const reportNotificationService = {
  /**
   * Send notification when report is ready
   */
  notifyReportReady: async (reportId: string, userEmail: string) => {
    return emailService.sendReportEmail({
      reportId,
      recipientEmail: userEmail,
      subject: 'Your report is ready for download',
      includeAttachment: true,
    })
  },

  /**
   * Send notification when report generation fails
   */
  notifyReportFailed: async (
    reportId: string,
    userEmail: string,
    error: string,
  ) => {
    const response = await apiClient.post<ApiResponse<EmailDeliveryResponse>>(
      '/api/v1/reports/email',
      {
        to: userEmail,
        subject: 'Report generation failed',
        body: `
          We encountered an error while generating your report (ID: ${reportId}).
          
          Error: ${error}
          
          Please try generating the report again or contact support if the issue persists.
          
          Thank you for your patience.
        `.trim(),
      },
    )

    return response.data.data
  },
}
