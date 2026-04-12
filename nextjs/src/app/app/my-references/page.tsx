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
  const [trainingProgress, setTrainingProgress] = useState(0);
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

  // Accuracy score based on file count (20 files = 100%)
  const getAccuracyPercent = (count: number) => Math.min(100, Math.round((count / 20) * 100));

  const getStatusMessage = () => {
    const count = files.length;
    const accuracy = getAccuracyPercent(count);
    const remaining = Math.max(0, 20 - count);

    if (count === 0) return {
      text: kn ? 'ಇನ್ನೂ ಯಾವ ಆದೇಶಗಳನ್ನೂ ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿಲ್ಲ. ಕನಿಷ್ಠ 5 ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ.'
            : 'No orders uploaded yet. Upload at least 5 to start training.',
      accuracy, color: 'text-gray-500', bg: 'bg-gray-50',
    };
    if (count < 5) return {
      text: kn ? `${accuracy}% — ಇನ್ನು ${5 - count} ಫೈಲ್\u200Cಗಳು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ (ಕನಿಷ್ಠ 5 ಬೇಕು)`
            : `${accuracy}% — Upload ${5 - count} more files (minimum 5 needed to start)`,
      accuracy, color: 'text-red-600', bg: 'bg-red-50',
    };
    if (count < 10) return {
      text: kn ? `${accuracy}% ನಿಖರತೆ — ಇನ್ನು ${remaining} ಫೈಲ್\u200Cಗಳು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ 100% ತಲುಪಲು`
            : `${accuracy}% accuracy — Upload ${remaining} more files to reach 100%`,
      accuracy, color: 'text-amber-600', bg: 'bg-amber-50',
    };
    if (count < 20) return {
      text: kn ? `${accuracy}% ನಿಖರತೆ — ಇನ್ನು ${remaining} ಫೈಲ್\u200Cಗಳು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ 100% ತಲುಪಲು`
            : `${accuracy}% accuracy — Upload ${remaining} more files to reach 100%`,
      accuracy, color: 'text-blue-600', bg: 'bg-blue-50',
    };
    return {
      text: kn ? '100% ನಿಖರತೆ! AI ನಿಮ್ಮ ಶೈಲಿ ಸಂಪೂರ್ಣವಾಗಿ ಕಲಿತಿದೆ.'
            : '100% accuracy! AI has fully learned your writing style.',
      accuracy: 100, color: 'text-green-700', bg: 'bg-green-100',
    };
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
    setTrainingProgress(0);

    // Simulate progress: ramp up to 90% over ~30 seconds, then jump to 100% on completion
    const progressTimer = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 90) { clearInterval(progressTimer); return 90; }
        return prev + 3;
      });
    }, 1000);

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

      clearInterval(progressTimer);
      setTrainingProgress(100);

      setSuccess(kn
        ? 'AI ನಿಮ್ಮ ಶೈಲಿ ಕಲಿತಿದೆ!'
        : 'AI has learned your style!');
      setTimeout(() => setSuccess(''), 5000);
    } catch {
      clearInterval(progressTimer);
      console.error('Prompt generation failed');
    } finally {
      setTimeout(() => {
        setGenerating(false);
        setTrainingProgress(0);
      }, 2000);
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Brain className="h-7 w-7 text-primary-600" />
          {kn ? 'AI ತರಬೇತಿ' : 'Train AI'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {kn
            ? 'ನಿಮ್ಮ ಅತ್ಯುತ್ತಮ ಅಂತಿಮ ಆದೇಶಗಳನ್ನು ಅಪ್\u200Cಲೋಡ್ ಮಾಡಿ — AI ನಿಮ್ಮ ಶೈಲಿ ಕಲಿಯುತ್ತದೆ'
            : 'Upload your best finalized orders — AI will learn your writing style'}
        </p>
      </div>

      {/* AI Accuracy Status Banner */}
      <div className={`rounded-lg p-4 ${status.bg}`}>
        <div className="flex items-center justify-between mb-1">
          <p className={`font-medium ${status.color}`}>{status.text}</p>
          <span className={`text-lg font-bold ${status.color}`}>{status.accuracy}%</span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              status.accuracy >= 100 ? 'bg-green-500' : status.accuracy >= 50 ? 'bg-blue-500' : status.accuracy >= 25 ? 'bg-amber-500' : 'bg-red-400'
            }`}
            style={{ width: `${status.accuracy}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {files.length} / 20 {kn ? 'ಫೈಲ್\u200Cಗಳು ಅಪ್\u200Cಲೋಡ್ ಆಗಿವೆ' : 'files uploaded'}{' '}
          {files.length >= 20
            ? (kn ? '— ಸಂಪೂರ್ಣ!' : '— Complete!')
            : (kn ? `— ಇನ್ನೂ ${20 - files.length} ಬೇಕು` : `— ${20 - files.length} more needed`)}
        </p>
      </div>

      {/* AI Training Progress (with percentage) */}
      {generating && (
        <div className="rounded-lg border border-purple-300 bg-purple-50 p-4">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
            <span className="font-medium text-purple-800">
              {kn ? 'AI ನಿಮ್ಮ ಆದೇಶಗಳನ್ನು ಅಧ್ಯಯನ ಮಾಡುತ್ತಿದೆ...' : 'AI is learning your style...'}
            </span>
            <span className="ml-auto text-lg font-bold text-purple-700">{trainingProgress}%</span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2.5">
            <div
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-1000"
              style={{ width: `${trainingProgress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-purple-600">
            {trainingProgress < 30
              ? (kn ? 'ಆದೇಶಗಳನ್ನು ಓದುತ್ತಿದೆ...' : 'Reading your orders...')
              : trainingProgress < 70
                ? (kn ? 'ಶೈಲಿ ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...' : 'Analyzing your writing style...')
                : trainingProgress < 100
                  ? (kn ? 'AI ಮಾದರಿ ನಿರ್ಮಿಸುತ್ತಿದೆ...' : 'Building AI model...')
                  : (kn ? 'ಮುಗಿದಿದೆ!' : 'Complete!')}
          </p>
        </div>
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
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs text-gray-400 w-5 shrink-0">{idx + 1}</span>
                    <FileIcon className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-sm break-all" title={file.file_name}>{file.file_name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-400 whitespace-nowrap">
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
