import React, { useState, useEffect } from 'react';
import { X, Download, FileText, ExternalLink, Sparkles, Eye, Globe, AlertCircle, Loader2 } from 'lucide-react';
import { apiUrl } from '../../config/api';

interface AdminCvPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    candidateName: string;
    candidateEmail?: string;
    fileName: string;
    fileUrl: string;
    jobTitle?: string;
    atsScore?: number;
    parsedDegree?: string;
  } | null;
}

export const AdminCvPreviewModal: React.FC<AdminCvPreviewModalProps> = ({ isOpen, onClose, document }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [useCloudViewer, setUseCloudViewer] = useState<boolean>(false);

  const rawUrl = document?.fileUrl
    ? (document.fileUrl.startsWith('http') || document.fileUrl.startsWith('data:')
        ? document.fileUrl
        : apiUrl(document.fileUrl))
    : '';

  useEffect(() => {
    if (!isOpen || !document || !rawUrl) {
      setBlobUrl(null);
      setIsLoading(false);
      setFetchError(null);
      return;
    }

    // If data URI (base64)
    if (rawUrl.startsWith('data:application/pdf;base64,')) {
      try {
        const base64Data = rawUrl.replace(/^data:application\/pdf;base64,/, '');
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setIsLoading(false);
        setFetchError(null);
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err: any) {
        setFetchError('Failed to decode candidate CV data.');
        setIsLoading(false);
        return;
      }
    }

    // If already a blob URL
    if (rawUrl.startsWith('blob:')) {
      setBlobUrl(rawUrl);
      setIsLoading(false);
      setFetchError(null);
      return;
    }

    // Fetch binary PDF and convert into local blob: URL to prevent X-Frame-Options blocking
    const controller = new AbortController();
    setIsLoading(true);
    setFetchError(null);

    fetch(rawUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/pdf,application/octet-stream,*/*',
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }
        const blob = await res.blob();
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        setBlobUrl(url);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.warn('PDF fetch error in AdminCvPreviewModal:', err.message);
          setFetchError(err.message || 'Failed to stream document');
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
      setBlobUrl((prev) => {
        if (prev && prev.startsWith('blob:')) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
    };
  }, [isOpen, rawUrl]);

  if (!isOpen || !document) return null;

  const handleDownload = () => {
    const targetUrl = blobUrl || rawUrl;
    if (!targetUrl) return;
    const a = window.document.createElement('a');
    a.href = targetUrl;
    a.download = document.fileName || 'Candidate_CV.pdf';
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const getScoreColor = (score: number = 0) => {
    if (score >= 75) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Google Docs Cloud Viewer URL as fallback
  const cloudViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 font-serif truncate">{document.candidateName}</h3>
                {document.atsScore !== undefined && (
                  <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border flex items-center gap-1 ${getScoreColor(document.atsScore)}`}>
                    <Sparkles className="w-3 h-3" />
                    {document.atsScore}% ATS Match
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate">
                {document.fileName} • {document.candidateEmail || 'Candidate CV'} {document.jobTitle ? `• Applied for ${document.jobTitle}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Viewer Switcher */}
            <button
              type="button"
              onClick={() => setUseCloudViewer(!useCloudViewer)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition shadow-xs cursor-pointer ${
                useCloudViewer 
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Toggle between Native PDF and Cloud Google Docs viewer"
            >
              {useCloudViewer ? <Eye className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5 text-sky-600" />}
              <span>{useCloudViewer ? 'Use Native Viewer' : 'Cloud Viewer'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>New Tab</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF / Document Body */}
        <div className="flex-1 bg-slate-100 relative p-2 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-slate-200">
              <div className="relative flex items-center justify-center w-12 h-12 mb-3">
                <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-slate-800">Loading Candidate CV Document...</p>
              <p className="text-xs text-slate-400 mt-1">Preparing verified PDF preview for HR & Governance Desk</p>
            </div>
          ) : fetchError && !useCloudViewer ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Direct Document Stream Paused</h4>
                <p className="text-xs text-slate-500 max-w-md mt-1">
                  The document stream encountered a network issue ({fetchError}). You can view the document using the Cloud Viewer or open it directly in a new tab.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setUseCloudViewer(true)}
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Open in Cloud Viewer</span>
                </button>
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in New Tab</span>
                </a>
              </div>
            </div>
          ) : useCloudViewer ? (
            <iframe
              src={cloudViewerUrl}
              title={`Cloud Preview - ${document.candidateName}`}
              className="w-full h-full rounded-xl bg-white border border-slate-200 shadow-inner"
            />
          ) : blobUrl ? (
            <iframe
              src={`${blobUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              title={`Resume Preview - ${document.candidateName}`}
              className="w-full h-full rounded-xl bg-white border border-slate-200 shadow-inner"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-slate-200 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No document attached or invalid URL</p>
              <a
                href={rawUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                Try Direct Link
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
