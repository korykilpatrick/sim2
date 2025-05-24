import { useState, useRef } from 'react'
import { Card } from '@/components/common/Card'
import Alert from '@/components/feedback/Alert'
import { InvestigationDocument } from '../types'

interface DocumentUploadProps {
  investigationId: string
  documents: InvestigationDocument[]
  onUpload: (files: File[]) => Promise<void>
  onDelete: (documentId: string) => void
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
]

export function DocumentUpload({
  investigationId: _investigationId,
  documents,
  onUpload,
  onDelete,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = async (files: File[]) => {
    setError(null)

    // Validate files
    const validFiles: File[] = []
    for (const file of files) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setError(`File type not allowed: ${file.name}`)
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`File too large: ${file.name} (max 50MB)`)
        return
      }
      validFiles.push(file)
    }

    if (validFiles.length > 0) {
      setUploading(true)
      try {
        await onUpload(validFiles)
      } catch (err) {
        setError('Failed to upload files. Please try again.')
      } finally {
        setUploading(false)
      }
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB'
    return Math.round(bytes / 1048576) + ' MB'
  }

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType === 'application/pdf') return '📄'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel') || mimeType === 'text/csv') return '📊'
    return '📎'
  }

  return (
    <Card>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Supporting Documents</h3>
      </div>
      <div className="p-4 space-y-4">
        {error && (
          <Alert
            type="error"
            message={error}
            dismissible
            onDismiss={() => setError(null)}
          />
        )}

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept={ALLOWED_FILE_TYPES.join(',')}
          />

          <div className="space-y-2">
            <div className="text-4xl">📁</div>
            <p className="text-gray-600">
              Drag and drop files here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                browse
              </button>
            </p>
            <p className="text-sm text-gray-500">
              PDF, Images, Word, Excel, CSV (max 50MB each)
            </p>
          </div>
        </div>

        {/* Uploaded Documents */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Uploaded Documents</h4>
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFileIcon(doc.mimeType)}</span>
                  <div>
                    <p className="font-medium text-sm">{doc.fileName}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.fileSize)} • {doc.category} •{' '}
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(doc.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Delete document"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Security Notice */}
        <Alert
          type="info"
          message="Security Notice: All documents are encrypted and stored securely. Only authorized SynMax analysts assigned to your investigation will have access to these files."
        />

        {uploading && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500" />
              <span className="text-sm text-gray-600">Uploading files...</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
