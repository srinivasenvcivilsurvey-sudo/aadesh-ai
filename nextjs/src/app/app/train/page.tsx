"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Upload, Download, Trash2, Loader2, FileIcon, AlertCircle, CheckCircle,
  Brain, ArrowRight, Eye,
} from 'lucide-react';
import { createSPASassClientAuthenticated as createSPASassClient } from '@/lib/supabase/client';
import { FileObject } from '@supabase/storage-js';
import strings, { t } from '@/lib/i18n';
import TrainingStatusBar from '@/components/TrainingStatusBar';
import Link from 'next/link';

interface FileProcessingStatus {
  fileName: string;
  fileSize?: number;
  status: 'uploading' | 'processing' | 'done' | 'error';
  uploadProgress: number; // 0-100
  estimatedSeconds?: number;
  steps: {
    received: boolean;
    textExtracted: boolean;
    typeDetected: boolean;
    stored: boolean;
  };
  detectedType?: string;
  wordCount?: number;
  error?: string;
}

export default function TrainPage() {
  const { user } = useGlobal();
  const { locale } = useLanguage();
  const [files, setFiles] = useState<FileObject[]>([]);
  const [uploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [processingFiles, setProcessingFiles] = useState<FileProcessingStatus[]>([]);

  useEffect(() => {
    if (user?.id) loadFiles();
  }, [user]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = await createSPASassClient();
      const { data, error } = await supabase.getFiles(user!.id);
      if (error) throw error;
      const orderFiles = (data || []).filter(f => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        return ['docx', 'pdf', 'jpg', 'png', 'doc'].includes(ext || '');
      });
      setFiles(orderFiles);
    } catch {
      setError(t(strings.upload.uploadFailed, locale));
    } finally {
      setLoading(false);
    }
  };

  const detectOrderType = (fileName: string): string => {
    const lower = fileName.toLowerCase();
    if (lower.includes('appeal') || lower.includes('ಮೇಲ್ಮನವಿ')) return 'appeal';
    if (lower.includes('suo') || lower.includes('ಸ್ವಯಂಪ್ರೇರಿತ')) return 'suo_motu';
    if (lower.includes('dismiss') || lower.includes('ವಜಾ')) return 'dismissed';
    if (lower.includes('review') || lower.includes('ಪುನರ್ವಿಮರ್ಶೆ')) return 'review';
    return 'other';
  };

  const handleFileUpload = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['docx', 'pdf', 'doc', 'jpg', 'png'].includes(ext || '')) {
      setError(locale === 'kn'
        ? '.docx, .pdf, .jpg, .png ಫೈಲ್\u200Cಗಳು ಮಾತ್ರ'
        : '.docx, .pdf, .jpg, .png files only');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(locale === 'kn'
        ? 'ಫೈಲ್ 10MB ಗಿಂತ ಚಿಕ್ಕದಾಗಿರಬೇಕು'
        : 'File must be smaller than 10MB');
      return;
    }
    if (files.length >= 50) {
      setError(t(strings.upload.maxReached, locale));
      return;
    }

    // Check for duplicate
    const sanitizedName = file.name.replace(/[^0-9a-zA-Z!\-_.*'()]/g, '_');
    if (files.some(f => f.name === sanitizedName)) {
      setError(t(strings.upload.duplicate, locale));
      return;
    }

    // Estimate upload time: KSWAN ~3-5 Mbps = ~400 KB/s avg
    const estSeconds = Math.max(2, Math.ceil(file.size / (400 * 1024)));

    const processingEntry: FileProcessingStatus = {
      fileName: file.name,
      fileSize: file.size,
      status: 'uploading',
      uploadProgress: 0,
      estimatedSeconds: estSeconds,
      steps: { received: false, textExtracted: false, typeDetected: false, stored: false },
    };
    setProcessingFiles(prev => [processingEntry, ...prev]);

    // Simulate upload progress (real progress not available from Supabase Storage SDK)
    const progressInterval = setInterval(() => {
      setProcessingFiles(prev => prev.map(p =>
        p.fileName === file.name && p.uploadProgress < 90
          ? { ...p, uploadProgress: p.uploadProgress + Math.floor(90 / estSeconds) }
          : p
      ));
    }, 1000);

    try {
      setError('');

      // Step 1: Upload
      setProcessingFiles(prev => prev.map(p =>
        p.fileName === file.name
          ? { ...p, status: 'processing', uploadProgress: 95, steps: { ...p.steps, received: true } }
          : p
      ));
      clearInterval(progressInterval);

      const supabase = await createSPASassClient();
      const { error: uploadError } = await supabase.uploadFile(user!.id!, file.name, file);
      if (uploadError) throw uploadError;

      // Step 2: Simulate text extraction (actual extraction would be server-side)
      await new Promise(r => setTimeout(r, 500));
      setProcessingFiles(prev => prev.map(p =>
        p.fileName === file.name
          ? { ...p, steps: { ...p.steps, textExtracted: true } }
          : p
      ));

      // Step 3: Auto-detect order type
      await new Promise(r => setTimeout(r, 300));
      const detectedType = detectOrderType(file.name);
      setProcessingFiles(prev => prev.map(p =>
        p.fileName === file.name
          ? { ...p, steps: { ...p.steps, typeDetected: true }, detectedType }
          : p
      ));

      // Step 4: Mark as stored
      await new Promise(r => setTimeout(r, 300));
      setProcessingFiles(prev => prev.map(p =>
        p.fileName === file.name
          ? { ...p, status: 'done', steps: { ...p.steps, stored: true } }
          : p
      ));

      await loadFiles();
      setSuccess(t(strings.upload.uploadSuccess, locale));
      setTimeout(() => setSuccess(''), 3000);

      // Clear processing status after 5 seconds
      setTimeout(() => {
        setProcessingFiles(prev => prev.filter(p => p.fileName !== file.name));
      }, 5000);

    } catch {
      clearInterval(progressInterval);
      setProcessingFiles(prev => prev.map(p =>
        p.fileName === file.name
          ? { ...p, status: 'error', uploadProgress: 0, error: t(strings.upload.uploadFailed, locale) }
          : p
      ));
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;
    Array.from(fileList).forEach(f => handleFileUpload(f));
    event.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(f => handleFileUpload(f));
  }, [user, files.length]);

  const handleDelete = async () => {
    if (!fileToDelete) return;
    try {
      setError('');
      const supabase = await createSPASassClient();
      const { error } = await supabase.deleteFile(user!.id!, fileToDelete);
      if (error) throw error;
      await loadFiles();
      setSuccess(locale === 'kn' ? 'ಫೈಲ್ ಅಳಿಸಲಾಗಿದೆ' : 'File deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError(locale === 'kn' ? 'ಫೈಲ್ ಅಳಿಸಲು ವಿಫಲವಾಯಿತು' : 'Failed to delete file');
    } finally {
      setShowDeleteDialog(false);
      setFileToDelete(null);
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      const supabase = await createSPASassClient();
      const { data, error } = await supabase.shareFile(user!.id!, filename, 60, true);
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch {
      setError(locale === 'kn' ? 'ಡೌನ್\u200Cಲೋಡ್ ವಿಫಲವಾಯಿತು' : 'Download failed');
    }
  };

  // Calculate type breakdown from file names
  const typeBreakdown: Record<string, number> = {};
  files.forEach(f => {
    const type = detectOrderType(f.name);
    typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;
  });

  const canGenerate = files.length >= 5;

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary-600" />
            {t(strings.training.title, locale)}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t(strings.training.subtitle, locale)}
          </p>
        </div>
        {canGenerate && (
          <Link
            href="/app/generate"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            {t(strings.training.goToGenerate, locale)}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Training Status Bar */}
      <TrainingStatusBar fileCount={files.length} typeBreakdown={typeBreakdown} />

      {/* Cannot Generate Warning */}
      {!canGenerate && files.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t(strings.training.cannotGenerate, locale)}
            {' — '}
            {locale === 'kn'
              ? `ಇನ್ನು ${5 - files.length} ಫೈಲ್\u200Cಗಳು ಬೇಕು`
              : `${5 - files.length} more files needed`}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Drag-and-Drop Upload Zone */}
      <Card>
        <CardContent className="pt-6">
          <label
            className={`w-full flex flex-col items-center px-4 py-10 bg-white rounded-xl border-2 cursor-pointer transition-all ${
              isDragging
                ? 'border-primary-500 border-dashed bg-primary-50 scale-[1.01]'
                : 'border-dashed border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={handleDrop}
          >
            <div className="p-4 rounded-full bg-primary-50 mb-4">
              <Upload className="w-8 h-8 text-primary-600" />
            </div>
            <span className="text-base font-medium text-gray-700">
              {uploading
                ? t(strings.upload.uploading, locale)
                : isDragging
                  ? t(strings.upload.dropHere, locale)
                  : t(strings.upload.dragDrop, locale)}
            </span>
            <span className="mt-2 text-sm text-gray-500">
              {t(strings.upload.acceptedFormatsLong, locale)}
            </span>
            <input
              type="file"
              className="hidden"
              accept=".docx,.pdf,.doc,.jpg,.png"
              multiple
              onChange={handleInputChange}
              disabled={uploading || files.length >= 50}
            />
          </label>
        </CardContent>
      </Card>

      {/* File Processing Pipeline Status */}
      {processingFiles.length > 0 && (
        <div className="space-y-3">
          {processingFiles.map((pf) => (
            <div key={pf.fileName} className={`rounded-lg border p-4 ${
              pf.status === 'done' ? 'bg-green-50 border-green-200' :
              pf.status === 'error' ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <FileIcon className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-sm truncate">{pf.fileName}</span>
                {pf.fileSize && (
                  <span className="text-xs text-gray-400 ml-auto">
                    {(pf.fileSize / 1024).toFixed(0)} KB
                  </span>
                )}
              </div>

              {/* Upload progress bar */}
              {pf.status === 'uploading' && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>{locale === 'kn' ? 'ಅಪ್\u200Cಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Uploading...'}</span>
                    <span>
                      {pf.uploadProgress}%
                      {pf.estimatedSeconds && pf.uploadProgress < 90 && (
                        <> — {Math.max(1, pf.estimatedSeconds - Math.floor(pf.uploadProgress / (90 / pf.estimatedSeconds)))} {locale === 'kn' ? 'ಸೆಕೆಂಡ್ ಉಳಿದಿದೆ' : 's left'}</>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(pf.uploadProgress, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Processing steps */}
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span>{pf.steps.received ? '\u2705' : '\u23F3'} {t(strings.training.fileReceived, locale)}</span>
                <span>{pf.steps.textExtracted ? '\u2705' : '\u23F3'} {t(strings.training.textExtracted, locale)}</span>
                <span>{pf.steps.typeDetected ? '\u2705' : '\u23F3'} {t(strings.training.typeDetected, locale)}{pf.detectedType ? `: ${pf.detectedType}` : ''}</span>
                <span>{pf.steps.stored ? '\u2705' : '\u23F3'} {t(strings.training.stored, locale)}</span>
              </div>
              {pf.status === 'error' && (
                <p className="mt-2 text-xs text-red-600">{pf.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t(strings.training.uploadedOrders, locale)} ({files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          )}

          {!loading && files.length === 0 && (
            <div className="text-center py-12">
              <Upload className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">{t(strings.upload.noFiles, locale)}</p>
              <p className="text-sm text-gray-400 mt-1">
                {t(strings.training.subtitle, locale)}
              </p>
            </div>
          )}

          {!loading && files.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-2 pr-4">#</th>
                    <th className="py-2 pr-4">{locale === 'kn' ? 'ಫೈಲ್ ಹೆಸರು' : 'File Name'}</th>
                    <th className="py-2 pr-4">{locale === 'kn' ? 'ಪ್ರಕಾರ' : 'Type'}</th>
                    <th className="py-2 text-right">{locale === 'kn' ? 'ಕ್ರಿಯೆಗಳು' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, index) => {
                    const type = detectOrderType(file.name);
                    const typeLabels: Record<string, { kn: string; en: string }> = {
                      appeal: { kn: 'ಮೇಲ್ಮನವಿ', en: 'Appeal' },
                      suo_motu: { kn: 'ಸ್ವಯಂಪ್ರೇರಿತ', en: 'Suo Motu' },
                      dismissed: { kn: 'ವಜಾ', en: 'Dismissed' },
                      review: { kn: 'ಪುನರ್ವಿಮರ್ಶೆ', en: 'Review' },
                      other: { kn: 'ಇತರೆ', en: 'Other' },
                    };
                    return (
                      <tr key={file.name} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 pr-4 text-gray-400">{index + 1}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <FileIcon className="h-4 w-4 text-gray-400 shrink-0" />
                            <span className="truncate max-w-[200px]">{file.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {typeLabels[type]?.[locale] || type}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleDownload(file.name)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              title={locale === 'kn' ? 'ನೋಡಿ' : 'View'}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(file.name)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                              title={locale === 'kn' ? 'ಡೌನ್\u200Cಲೋಡ್' : 'Download'}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setFileToDelete(file.name);
                                setShowDeleteDialog(true);
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title={locale === 'kn' ? 'ಅಳಿಸಿ' : 'Delete'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {locale === 'kn' ? 'ಫೈಲ್ ಅಳಿಸಿ' : 'Delete File'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {locale === 'kn'
                ? 'ಈ ಫೈಲ್ ಅನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತರಾಗಿದ್ದೀರಾ? ಇದನ್ನು ರದ್ದುಮಾಡಲಾಗುವುದಿಲ್ಲ.'
                : 'Are you sure you want to delete this file? This cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t(strings.common.cancel, locale)}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {t(strings.common.delete, locale)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
