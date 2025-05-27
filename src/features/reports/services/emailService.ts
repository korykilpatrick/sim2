/**
 * @module emailService
 * @description Email delivery service for sending reports via email with PDF attachments.
 * Handles email template management, bulk sending, and notification services for report events.
 */

import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/api/types'
import { useReportQueueStore } from './reportQueue'
import { generatePDF, convertToReportData } from './pdfGenerator'
import { reportApi } from './reportService'
import { useAuthStore } from '@/features/auth/services/authStore'

/**
 * Email delivery request configuration
 * @interface EmailDeliveryRequest
 */
interface EmailDeliveryRequest {
  /** ID of the report to send */
  reportId: string
  /** Primary recipient email address */
  recipientEmail: string
  /** Additional CC recipients */
  ccEmails?: string[]
  /** Custom email subject (auto-generated if not provided) */
  subject?: string
  /** Custom email message body (auto-generated if not provided) */
  message?: string
  /** Whether to include PDF attachment (default: true) */
  includeAttachment?: boolean
}

/**
 * Email delivery response from server
 * @interface EmailDeliveryResponse
 */
interface EmailDeliveryResponse {
  /** Whether the email was sent successfully */
  success: boolean
  /** Message ID from email provider */
  messageId?: string
  /** Error message if sending failed */
  error?: string
}

/**
 * Email service for report delivery and notifications
 */
export const emailService = {
  /**
   * Send report via email with optional PDF attachment
   * @param {EmailDeliveryRequest} request - Email delivery configuration
   * @returns {Promise<EmailDeliveryResponse>} Email delivery response with success status
   * @example
   * ```typescript
   * const result = await emailService.sendReportEmail({
   *   reportId: 'report123',
   *   recipientEmail: 'user@example.com',
   *   ccEmails: ['manager@example.com'],
   *   includeAttachment: true
   * })
   *
   * if (result.success) {
   *   console.log('Email sent:', result.messageId)
   * }
   * ```
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
   * Queue report for email delivery in background job processor
   * @param {EmailDeliveryRequest} request - Email delivery configuration
   * @returns {string} Job ID for tracking email delivery status
   * @example
   * ```typescript
   * const jobId = emailService.queueReportEmail({
   *   reportId: 'report123',
   *   recipientEmail: 'user@example.com'
   * })
   *
   * // Track job status
   * const status = useReportQueueStore.getState().jobs.get(jobId)
   * ```
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
   * Send bulk report emails by queuing multiple delivery requests
   * @param {EmailDeliveryRequest[]} requests - Array of email delivery configurations
   * @returns {Promise<string[]>} Array of job IDs for tracking delivery status
   * @example
   * ```typescript
   * const jobIds = await emailService.sendBulkReportEmails([
   *   { reportId: 'report1', recipientEmail: 'user1@example.com' },
   *   { reportId: 'report2', recipientEmail: 'user2@example.com' },
   *   { reportId: 'report3', recipientEmail: 'user3@example.com' }
   * ])
   *
   * console.log(`Queued ${jobIds.length} emails for delivery`)
   * ```
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
   * Get available email templates for report delivery
   * @returns {Promise<EmailTemplate[]>} Array of email templates
   * @example
   * ```typescript
   * const templates = await emailService.getEmailTemplates()
   *
   * const welcomeTemplate = templates.find(t => t.name === 'report-ready')
   * console.log('Variables:', welcomeTemplate.variables) // ['reportType', 'vesselName']
   * ```
   */
  getEmailTemplates: async (): Promise<EmailTemplate[]> => {
    const response = await apiClient.get<ApiResponse<EmailTemplate[]>>(
      '/api/v1/reports/email-templates',
    )
    return response.data.data
  },
}

/**
 * Email template configuration
 * @interface EmailTemplate
 */
interface EmailTemplate {
  /** Unique template identifier */
  id: string
  /** Template name for identification */
  name: string
  /** Email subject line template */
  subject: string
  /** Email body template with variable placeholders */
  body: string
  /** Available variables for template substitution */
  variables: string[]
}

/**
 * Convert blob to base64 string for email attachments
 * @param {Blob} blob - Binary data to convert
 * @returns {Promise<string>} Base64 encoded string
 * @example
 * ```typescript
 * const pdfBlob = await generatePDF(reportData)
 * const base64 = await blobToBase64(pdfBlob)
 * // base64 can now be sent as email attachment
 * ```
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
 * Email notification service for report-related events and alerts
 */
export const reportNotificationService = {
  /**
   * Send notification when report is ready for download
   * @param {string} reportId - ID of the completed report
   * @param {string} userEmail - Recipient email address
   * @returns {Promise<EmailDeliveryResponse>} Email delivery response
   * @example
   * ```typescript
   * // In report generation completion handler
   * await reportNotificationService.notifyReportReady(
   *   'report123',
   *   'user@example.com'
   * )
   * ```
   */
  notifyReportReady: async (
    reportId: string,
    userEmail: string,
  ): Promise<EmailDeliveryResponse> => {
    return emailService.sendReportEmail({
      reportId,
      recipientEmail: userEmail,
      subject: 'Your report is ready for download',
      includeAttachment: true,
    })
  },

  /**
   * Send notification when report generation fails
   * @param {string} reportId - ID of the failed report
   * @param {string} userEmail - Recipient email address
   * @param {string} error - Error message describing the failure
   * @returns {Promise<EmailDeliveryResponse>} Email delivery response
   * @example
   * ```typescript
   * // In report generation error handler
   * await reportNotificationService.notifyReportFailed(
   *   'report123',
   *   'user@example.com',
   *   'Insufficient data for the selected date range'
   * )
   * ```
   */
  notifyReportFailed: async (
    reportId: string,
    userEmail: string,
    error: string,
  ): Promise<EmailDeliveryResponse> => {
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
