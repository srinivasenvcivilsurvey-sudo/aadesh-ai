"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Upload, Download, Trash2, Loader2, FileIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { createSPASassClientAuthenticated as createSPASassClient } from '@/lib/supabase/client';
import { FileObject } from '@supabase/storage-js';
import strings, { t } from '@/lib/i18n';

export default function UploadOrdersPage() {
    const { user } = useGlobal();
    const [files, setFiles] = useState<FileObject[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const locale = 'kn';

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
            // Filter only .docx and .pdf files
            const orderFiles = (data || []).filter(f => {
                const ext = f.name.split('.').pop()?.toLowerCase();
                return ext === 'docx' || ext === 'pdf';
            });
            setFiles(orderFiles);
        } catch {
            setError(t(strings.upload.uploadFailed, locale));
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        // Validate file type
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['docx', 'pdf'].includes(ext || '')) {
            setError(t(strings.generate.acceptedFormats, locale));
            return;
        }
        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            setError('ಫೈಲ್ 50MB ಗಿಂತ ಚಿಕ್ಕದಾಗಿರಬೇಕು');
            return;
        }

        try {
            setUploading(true);
            setError('');
            const supabase = await createSPASassClient();
            const { error } = await supabase.uploadFile(user!.id!, file.name, file);
            if (error) throw error;
            await loadFiles();
            setSuccess(t(strings.upload.uploadSuccess, locale));
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError(t(strings.upload.uploadFailed, locale));
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        if (!fileList) return;
        // Support multiple file upload
        Array.from(fileList).forEach(f => handleFileUpload(f));
        event.target.value = '';
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        droppedFiles.forEach(f => handleFileUpload(f));
    }, [user]);

    const handleDelete = async () => {
        if (!fileToDelete) return;
        try {
            setError('');
            const supabase = await createSPASassClient();
            const { error } = await supabase.deleteFile(user!.id!, fileToDelete);
            if (error) throw error;
            await loadFiles();
            setSuccess('ಫೈಲ್ ಅಳಿಸಲಾಗಿದೆ');
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('ಫೈಲ್ ಅಳಿಸಲು ವಿಫಲವಾಯಿತು');
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
            setError('ಡೌನ್‌ಲೋಡ್ ವಿಫಲವಾಯಿತು');
        }
    };

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-6 w-6 text-primary-600" />
                        {t(strings.upload.title, locale)}
                    </CardTitle>
                    <CardDescription>
                        {t(strings.upload.description, locale)}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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

                    {/* Upload Zone */}
                    <label
                        className={`w-full flex flex-col items-center px-4 py-8 bg-white rounded-lg shadow-sm border-2 cursor-pointer transition-colors ${
                            isDragging
                                ? 'border-primary-500 border-dashed bg-primary-50'
                                : 'border-dashed border-gray-300 hover:border-primary-400'
                        }`}
                        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragOver={(e) => e.preventDefault()}
                        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                        onDrop={handleDrop}
                    >
                        <Upload className="w-10 h-10 text-gray-400" />
                        <span className="mt-3 text-base font-medium">
                            {uploading
                                ? t(strings.upload.uploading, locale)
                                : isDragging
                                    ? 'ಫೈಲ್ ಇಲ್ಲಿ ಬಿಡಿ'
                                    : t(strings.upload.dragDrop, locale)}
                        </span>
                        <span className="mt-1 text-sm text-gray-500">
                            {t(strings.upload.acceptedFormatsLong, locale)}
                        </span>
                        <input
                            type="file"
                            className="hidden"
                            accept=".docx,.pdf"
                            multiple
                            onChange={handleInputChange}
                            disabled={uploading}
                        />
                    </label>

                    {/* File List */}
                    <div className="space-y-3">
                        <h3 className="font-medium text-gray-700">
                            ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಆದೇಶಗಳು ({files.length})
                        </h3>
                        {loading && (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        )}
                        {!loading && files.length === 0 && (
                            <p className="text-center text-gray-500 py-4">
                                {t(strings.upload.noFiles, locale)}
                            </p>
                        )}
                        {files.map((file) => (
                            <div
                                key={file.name}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border"
                            >
                                <div className="flex items-center space-x-3">
                                    <FileIcon className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm font-medium">{file.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleDownload(file.name)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        title="ಡೌನ್‌ಲೋಡ್"
                                    >
                                        <Download className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setFileToDelete(file.name);
                                            setShowDeleteDialog(true);
                                        }}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        title="ಅಳಿಸಿ"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Delete Confirmation */}
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>ಫೈಲ್ ಅಳಿಸಿ</AlertDialogTitle>
                                <AlertDialogDescription>
                                    ಈ ಫೈಲ್ ಅನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತರಾಗಿದ್ದೀರಾ? ಇದನ್ನು ರದ್ದುಮಾಡಲಾಗುವುದಿಲ್ಲ.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>ರದ್ದುಮಾಡಿ</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                    ಅಳಿಸಿ
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
    );
}
