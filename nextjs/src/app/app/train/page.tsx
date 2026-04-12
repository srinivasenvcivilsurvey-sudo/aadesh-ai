"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Train AI page now redirects to My References.
 * Both pages served the same purpose (upload reference orders).
 * My References is the canonical page with smarter features:
 *   - Text extraction + DB storage
 *   - Duplicate detection
 *   - Auto-prompt generation trigger
 *   - Smart reference scoring for order generation
 */
export default function TrainPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/app/my-references');
  }, [router]);

  return (
    <div className="flex items-center justify-center p-12">
      <p className="text-gray-500">Redirecting...</p>
    </div>
  );
}
