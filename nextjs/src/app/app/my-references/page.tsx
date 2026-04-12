"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload, Trash2, Loader2, FileIcon, AlertCircle, CheckCircle, Brain,
} from 'lucide-react';
import { getAuthToken } from '@/lib/pipeline/getAuthToken';
import { createSPAClient } from '@/lib/supabase/client';

interface ReferenceFile {
  id: string;
  file_name: string;
  uploaded_at: string;
}

export default function MyReferencesPage() {
  const { user } = useGlobal();
  const { locale } = useLanguage();
  const [files, setFiles] = useState<ReferenceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [duplicateWarning, setDuplicateWarning] = useState('');

  const kn = locale === 'kn';

  useEffect(() => {
    if (user?.id) loadFiles();
  }, [user]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const supabase = createSPAClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error: fetchErr } = await supabase
        .from('references')
        .select('id, file_name, uploaded_at')
        .eq('user_id', user!.id)
        .order('uploaded_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setFiles(data ?? []);
    } catch {
      setError(kn ? 'ಫೈಲ್\u200Cಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲ' : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    const count = files.length;
    if (count === 0) return { text: kn ? 'ಇನ್ನೂ ಯಾವ ಆದೇಶಗಳನ್ನೂ ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿಲ್ಲ' : 'No orders uploaded yet', color: 'text-gray-500', bg: 'bg-gray-50' };
    if (count < 5) return { text: kn ? `ಪ್ರಾರಂಭ — ಇನ್ನು ${5 - count} ಫೈಲ್\u200Cಗಳನ್ನು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ` : `Getting started — upload at least ${5 - count} more`, color: 'text-amber-600', bg: 'bg-amber-50' };
    if (count < 10) return { text: kn ? 'ಉತ್ತಮ — ಸುಮಾರು 85% ನಿಖರತೆ' : 'Good — approximately 85% accuracy', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (count < 20) return { text: kn ? 'ಬಲವಾದ — ಸುಮಾರು 90% ನಿಖರತೆ' : 'Strong — approximately 90% accuracy', color: 'text-green-600', bg: 'bg-green-50' };
    return { text: kn ? 'ಅತ್ಯುತ್ತಮ — 95%+ ನಿಖರತೆ. AI ಸಿದ್ಧವಾಗಿದೆ.' : 'Excellent — 95%+ accuracy. AI is ready.', color: 'text-green-700', bg: 'bg-green-100' };
  };

  const handleFileUpload = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext ?? '')) {
      setError(kn ? 'PDF, DOCX, TXT ಫೈಲ್\u200Cಗಳು ಮಾತ್ರ' : 'Only PDF, DOCX, TXT files accepted');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(kn ? 'ಫೈಲ್ 10MB ಗಿಂತ ಚಿಕ್ಕದಾಗಿರಬೇಕು' : 'File must be smaller than 10MB');
      return;
    }
    if (files.length >= 30) {
      setError(kn ? 'ಗರಿಷ್ಠ 30 ಫೈಲ್\u200Cಗಳು' : 'Maximum 30 files');
      return;
    }

    setUploadProgress(prev => ({ ...prev, [file.name]: 10 }));
    setUploading(true);
    setError('');

    try {
      const token = await getAuthToken();
      if (!token) return;

      // Simulate progress
      const progressTimer = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: Math.min((prev[file.name] ?? 10) + 15, 85),
        }));
      }, 500);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/references/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      clearInterval(progressTimer);
      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await response.json();
      setSuccess(kn ? `${file.name} ಅಪ್\u200Cಲೋಡ್ ಆಗಿದೆ` : `${file.name} uploaded`);
      setTimeout(() => setSuccess(''), 3000);

      await loadFiles();

      // Auto-trigger prompt generation when 5+ files
      if (data.total_count >= 5) {
        triggerPromptGeneration();
      }

      // Clear progress after delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const next = { ...prev };
          delete next[file.name];
          return next;
        });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : (kn ? 'ಅಪ್\u200Cಲೋಡ್ ವಿಫಲ' : 'Upload failed'));
      setUploadProgress(prev => {
        const next = { ...prev };
        delete next[file.name];
        return next;
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerPromptGeneration = async () => {
    setGenerating(true);
    try {
      const token = await getAuthToken();
      if (!token) return;

      await fetch('/api/references/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      setSuccess(kn
        ? 'AI ನಿಮ್ಮ ಶೈಲಿ ಕಲಿತಿದೆ!'
        : 'AI has learned your style!');
      setTimeout(() => setSuccess(''), 5000);
    } catch {
      // Non-critical — prompt generation can be retried
      console.error('Prompt generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (refId: string) => {
    try {
      setError('');
      const supabase = createSPAClient();
      const { error: delError } = await supabase
        .from('references')
        .delete()
        .eq('id', refId)
        .eq('user_id', user!.id);

      if (delError) throw delError;
      await loadFiles();
      setSuccess(kn ? 'ಫೈಲ್ ಅಳಿಸಲಾಗಿದೆ' : 'File deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError(kn ? 'ಅಳಿಸಲು ವಿಫಲ' : 'Failed to delete');
    }
  };

  // ── Duplicate detection: filter out already-uploaded file names ─────────
  const uploadBatch = useCallback((incoming: File[]) => {
    setDuplicateWarning('');
    const existingNames = new Set(files.map(f => f.file_name.toLowerCase()));
    const seenInBatch = new Set<string>();
    const toUpload: File[] = [];
    const duplicates: string[] = [];

    for (const file of incoming) {
      const nameLower = file.name.toLowerCase();
      if (existingNames.has(nameLower) || seenInBatch.has(nameLower)) {
        duplicates.push(file.name);
      } else {
        seenInBatch.add(nameLower);
        toUpload.push(file);
      }
    }

    if (duplicates.length > 0) {
      const names = duplicates.join(', ');
      setDuplicateWarning(
        kn
          ? `ಈ ಫೈಲ್\u200Cಗಳು ಈಗಾಗಲೇ ಅಪ್\u200Cಲೋಡ್ ಆಗಿವೆ (ಬಿಟ್ಟಿದೆ): ${names}`
          : `Already uploaded (skipped): ${names}`
      );
      setTimeout(() => setDuplicateWarning(''), 8000);
    }

    toUpload.forEach(f => handleFileUpload(f));
  }, [files, kn]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;
    uploadBatch(Array.from(fileList));
    event.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    uploadBatch(Array.from(e.dataTransfer.files));
  }, [uploadBatch]);

  const status = getStatusMessage();

  return (
    <div className="space-y-6 p-6">
      {/* Header with Status */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Brain className="h-7 w-7 text-primary-600" />
          {kn ? 'ನನ್ನ ಉಲ್ಲೇಖ ಆದೇಶಗಳು' : 'My Reference Orders'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {files.length} {kn ? 'ಫೈಲ್\u200Cಗಳು ಅಪ್\u200Cಲೋಡ್ ಆಗಿವೆ' : 'files uploaded'}
        </p>
      </div>

      {/* Status Banner */}
      <div className={`rounded-lg p-4 ${status.bg}`}>
        <p className={`font-medium ${status.color}`}>{status.text}</p>
        {files.length > 0 && files.length < 20 && (
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, (files.length / 20) * 100)}%` }}
            />
          </div>
        )}
        {files.length >= 20 && (
          <p className="mt-1 text-sm text-green-600">
            {kn ? 'AI ನಿಮ್ಮ ಶೈಲಿ ಕಲಿತಿದೆ ✓' : 'AI has learned your style ✓'}
          </p>
        )}
      </div>

      {/* Generating indicator */}
      {generating && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            {kn ? 'AI ನಿಮ್ಮ ಆದೇಶಗಳನ್ನು ಅಧ್ಯಯನ ಮಾಡುತ್ತಿದೆ... (30-60 ಸೆಕೆಂಡ್)' : 'AI is studying your orders... (30-60 seconds)'}
          </AlertDescription>
        </Alert>
      )}

      {duplicateWarning && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">{duplicateWarning}</p>
        </div>
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

      {/* Instruction Text */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2 mb-6">
            <p className="text-sm text-gray-700 font-medium" style={{ fontFamily: "'Noto Sans Kannada', system-ui, sans-serif" }}>
              ನಿಮ್ಮ ಸ್ವಂತ ಅಂತಿಮ ಆದೇಶಗಳನ್ನು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ.
              AI ನಿಮ್ಮ ಶೈಲಿ ಕಲಿತು ನಿಮ್ಮಂತೆಯೇ ಬರೆಯುತ್ತದೆ.
            </p>
            <p className="text-sm text-gray-500">
              Upload your own finalized orders. AI learns your style and drafts exactly like you.
            </p>
          </div>

          {/* Drag-and-Drop Upload Zone */}
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
                ? (kn ? 'ಅಪ್\u200Cಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Uploading...')
                : isDragging
                  ? (kn ? 'ಇಲ್ಲಿ ಬಿಡಿ' : 'Drop here')
                  : (kn ? 'ಫೈಲ್ ಎಳೆದು ಬಿಡಿ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ' : 'Drag & drop files or click to select')}
            </span>
            <span className="mt-2 text-sm text-gray-500">
              PDF, DOCX, TXT — {kn ? 'ಗರಿಷ್ಠ 10MB, 30 ಫೈಲ್\u200Cಗಳು' : 'Max 10MB, 30 files'}
            </span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx,.txt"
              multiple
              onChange={handleInputChange}
              disabled={uploading || files.length >= 30}
            />
          </label>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {Object.entries(uploadProgress).map(([name, progress]) => (
        <div key={name} className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <FileIcon className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium truncate">{name}</span>
            <span className="text-xs text-blue-500 ml-auto">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ))}

      {/* Uploaded Files List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {kn ? 'ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿದ ಆದೇಶಗಳು' : 'Uploaded Orders'} ({files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                {kn ? 'ಇನ್ನೂ ಯಾವ ಫೈಲ್\u200Cಗಳನ್ನೂ ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿಲ್ಲ' : 'No files uploaded yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-gray-400 w-5">{idx + 1}</span>
                    <FileIcon className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-sm truncate max-w-[200px]">{file.file_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {new Date(file.uploaded_at).toLocaleDateString(kn ? 'kn-IN' : 'en-IN', {
                        month: 'short', day: 'numeric',
                      })}
                    </span>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title={kn ? 'ಅಳಿಸಿ' : 'Delete'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
