import React from 'react';
import { X, Download, Trash2, CheckCircle2, Inbox, AlertCircle, PlusCircle } from 'lucide-react';
import { UserFeedback } from '../types/resource';

interface SubmissionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: UserFeedback[];
  onClearSubmissions: () => void;
  onDeleteSubmission: (index: number) => void;
}

export const SubmissionsDrawer: React.FC<SubmissionsDrawerProps> = ({
  isOpen,
  onClose,
  submissions,
  onClearSubmissions,
  onDeleteSubmission,
}) => {
  if (!isOpen) return null;

  const handleExportCSV = () => {
    if (submissions.length === 0) return;

    const headers = [
      'Type',
      'Resource Name / Suggested',
      'Category',
      'Details / Correction',
      'Address',
      'Phone',
      'Hours',
      'Submitter Name',
      'Submitter Contact',
      'Submitted At'
    ];

    const rows = submissions.map(s => [
      `"${s.feedbackType}"`,
      `"${(s.resourceName || s.suggestedName || '').replace(/"/g, '""')}"`,
      `"${(s.category || '').replace(/"/g, '""')}"`,
      `"${(s.details || '').replace(/"/g, '""')}"`,
      `"${(s.address || '').replace(/"/g, '""')}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      `"${(s.hours || '').replace(/"/g, '""')}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.contactEmail || '').replace(/"/g, '""')}"`,
      `"${s.submittedAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chillicothe_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base">Community Submissions Inbox</h3>
              <p className="text-xs text-slate-400">
                {submissions.length} user corrections & suggestions recorded
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={handleExportCSV}
            disabled={submissions.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg disabled:opacity-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to CSV / Excel</span>
          </button>

          <button
            onClick={onClearSubmissions}
            disabled={submissions.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>

        {/* Submissions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {submissions.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Your inbox is clear!</p>
              <p className="text-xs text-slate-400 mt-1">
                New user suggestions and corrections submitted through the site will appear here.
              </p>
            </div>
          ) : (
            submissions.map((sub, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative group hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                    sub.feedbackType === 'correction' 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {sub.feedbackType === 'correction' ? (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        Correction
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3 h-3" />
                        New Service
                      </>
                    )}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => onDeleteSubmission(idx)}
                      className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900">
                  {sub.resourceName || sub.suggestedName}
                </h4>

                <p className="text-xs text-slate-700 mt-1.5 whitespace-pre-wrap bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {sub.details}
                </p>

                {(sub.phone || sub.address || sub.hours) && (
                  <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                    {sub.address && <div><strong>Address:</strong> {sub.address}</div>}
                    {sub.phone && <div><strong>Phone:</strong> {sub.phone}</div>}
                    {sub.hours && <div><strong>Hours:</strong> {sub.hours}</div>}
                  </div>
                )}

                {(sub.name || sub.contactEmail) && (
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    Submitted by: <strong>{sub.name || 'Anonymous'}</strong> {sub.contactEmail && `(${sub.contactEmail})`}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close Inbox
          </button>
        </div>

      </div>
    </div>
  );
};
