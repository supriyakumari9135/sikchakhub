import React from 'react';
import { X, Download, FileText, ExternalLink, Sparkles } from 'lucide-react';
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
  if (!isOpen || !document) return null;

  const rawUrl = document.fileUrl.startsWith('http') 
    ? document.fileUrl 
    : apiUrl(document.fileUrl);

  const getScoreColor = (score: number = 0) => {
    if (score >= 75) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-4xl h-[88vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 font-serif">{document.candidateName}</h3>
                {document.atsScore !== undefined && (
                  <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border flex items-center gap-1 ${getScoreColor(document.atsScore)}`}>
                    <Sparkles className="w-3 h-3" />
                    {document.atsScore}% ATS Match
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {document.fileName} • {document.candidateEmail || 'Candidate CV'} {document.jobTitle ? `• Applied for ${document.jobTitle}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={rawUrl}
              download={document.fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
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
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF / Document Body */}
        <div className="flex-1 bg-slate-100 relative p-2 overflow-hidden flex flex-col">
          <object
            data={`${rawUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            type="application/pdf"
            className="w-full h-full rounded-xl bg-white border border-slate-200 shadow-inner"
          >
            <iframe
              src={`${rawUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              title={`Resume Preview - ${document.candidateName}`}
              className="w-full h-full rounded-xl bg-white border border-slate-200"
            >
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 h-full bg-white">
                <FileText className="w-10 h-10 text-brand-600 mx-auto" />
                <p className="text-sm font-bold text-slate-800">Previewing {document.fileName}</p>
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
                >
                  Open CV in New Window
                </a>
              </div>
            </iframe>
          </object>
        </div>
      </div>
    </div>
  );
};

