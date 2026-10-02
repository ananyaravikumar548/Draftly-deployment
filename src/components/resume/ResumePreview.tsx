'use client';
import { useEffect, useState } from 'react';
import type { ResumeData } from '@/src/lib/application-types';

export function ResumePreview({ data }: { data: ResumeData }) {
  const [pdfUrl, setPdfUrl] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let objectUrl = '';
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch('/api/resume-preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: controller.signal });
        if (!response.ok) throw new Error('Could not render the resume preview.');
        objectUrl = URL.createObjectURL(await response.blob());
        setPdfUrl(objectUrl);
        setError('');
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Could not render the resume preview.');
      }
    }, 450);
    return () => { window.clearTimeout(timer); controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [data]);

  if (error) return <div className="resume-loading" role="alert">{error}</div>;
  if (!pdfUrl) return <div className="resume-loading">Preparing resume preview…</div>;
  return <iframe className="resume-pdf-viewer" src={`${pdfUrl}#zoom=70`} title="Live resume PDF preview" />;
}
