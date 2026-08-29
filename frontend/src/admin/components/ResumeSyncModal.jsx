import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;

async function extractTextFromPdf(arrayBuffer) {
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => item.str)
      .join(' ')
      .replace(/\s+/g, ' ');
    fullText += `\n--- Page ${pageNum} ---\n` + pageText;
  }
  return fullText.trim();
}

export default function ResumeSyncModal({ existingPortfolio, onApplyChanges }) {
  const [cvText, setCvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [diffResults, setDiffResults] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedItems, setSelectedItems] = useState({});

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccessMessage('');

    if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
      setIsExtractingPdf(true);
      try {
        const buffer = await file.arrayBuffer();
        const extractedText = await extractTextFromPdf(buffer);
        if (extractedText && extractedText.length > 20) {
          setCvText(extractedText);
          setSuccessMessage(`✓ Successfully extracted ${extractedText.length} characters from "${file.name}". You can review or edit before analyzing.`);
        } else {
          setError('Could not extract readable text from this PDF (it might be a scanned image). Please copy and paste the text directly.');
        }
      } catch (err) {
        console.error('PDF Extraction error:', err);
        setError('Failed to extract text from PDF: ' + err.message + '. Please copy and paste your resume text instead.');
      } finally {
        setIsExtractingPdf(false);
      }
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCvText(event.target?.result || '');
        setSuccessMessage(`✓ Loaded "${file.name}".`);
      };
      reader.readAsText(file);
    } else {
      setError('Please upload a .pdf, .txt, or .md file, or paste your resume text directly.');
    }
  };

  const handleAnalyze = async () => {
    if (!cvText || cvText.trim().length < 30) {
      setError('Please paste or upload at least 30 characters of readable resume text.');
      return;
    }

    // Safety check: Detect if raw binary PDF header was pasted
    if (cvText.trim().startsWith('%PDF-')) {
      setError('The text contains raw binary data. Please upload your PDF using the "Choose File" button so it can be extracted cleanly into readable text.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccessMessage('');

    try {
      // Call serverless or backend endpoint
      const endpoint = '/api/admin/sync';
      const fallbackEndpoint = '/api/admin/sync-cv';

      let res;
      try {
        res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cvText: cvText.trim(),
            existingPortfolioData: existingPortfolio || {},
          }),
        });
      } catch (err) {
        // Try fallback serverless endpoint
        res = await fetch(fallbackEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cvText: cvText.trim(),
            existingPortfolioData: existingPortfolio || {},
          }),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.diffs && Array.isArray(data.diffs)) {
        setDiffResults(data.diffs);
        setSummary(data.summary);

        // Pre-select all NEW items
        const initialSelected = {};
        data.diffs.forEach((d, idx) => {
          if (d.category === 'NEW') {
            initialSelected[idx] = true;
          }
        });
        setSelectedItems(initialSelected);
      } else {
        throw new Error('No diff structure returned by AI analyzer.');
      }
    } catch (err) {
      console.error('CV Sync Analysis Error:', err);
      setError(err.message || 'Failed to analyze resume with AI. Please verify API keys.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSelect = (idx) => {
    setSelectedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const selectAllNew = () => {
    const updated = { ...selectedItems };
    diffResults?.forEach((d, idx) => {
      if (d.category === 'NEW') updated[idx] = true;
    });
    setSelectedItems(updated);
  };

  const deselectAll = () => {
    setSelectedItems({});
  };

  const handleApply = () => {
    if (!diffResults) return;

    const approvedDiffs = diffResults.filter((_, idx) => selectedItems[idx]);
    if (approvedDiffs.length === 0) {
      setError('Please select at least one change to apply.');
      return;
    }

    if (onApplyChanges) {
      onApplyChanges(approvedDiffs);
    }

    setSuccessMessage(`Successfully applied ${approvedDiffs.length} updates to your portfolio database! Existing unmentioned data was 100% preserved.`);
    setDiffResults(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-amber-400/10 p-2 text-amber-300">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-white">AI-Powered Additive Resume Sync</h3>
            <p className="text-sm text-gray-300">
              Upload your PDF/TXT resume or paste the content below. Azure OpenAI (`gpt-4o-mini`) / Gemini extracts new skills, roles, and achievements with additive merging.
            </p>
            <p className="text-xs text-amber-300/90 font-medium pt-1">
              🛡️ <strong>Additive Merge Guarantee:</strong> Existing portfolio entries, code metrics, and evidence points will NEVER be deleted or downgraded.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {successMessage}
        </div>
      )}

      {/* Input Section */}
      {!diffResults && (
        <div className="rounded-xl border border-white/10 bg-[#12141a]/90 p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="text-sm font-semibold uppercase tracking-wider text-gray-300">
              Paste Resume Content or Upload File
            </label>
            <div className="flex items-center gap-2">
              {isExtractingPdf && (
                <span className="text-xs text-amber-300 font-mono animate-pulse">
                  Extracting PDF text...
                </span>
              )}
              <input
                type="file"
                accept=".pdf,.txt,.md"
                onChange={handleFileUpload}
                disabled={isExtractingPdf || isProcessing}
                className="text-xs text-gray-400 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20 cursor-pointer"
              />
            </div>
          </div>

          <textarea
            rows={10}
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Upload your PDF above or paste readable resume text here (summary, skills, experience, projects)..."
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-white font-mono placeholder:text-gray-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500 font-mono">
              {cvText.length} characters {cvText.length > 0 ? '(Clean text)' : ''}
            </span>
            <button
              onClick={handleAnalyze}
              disabled={isProcessing || isExtractingPdf || cvText.trim().length < 30}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-orange-500/20"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Extracting & Diffing with AI...</span>
                </>
              ) : (
                <>
                  <span>Analyze & Compute Diff</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Diff Review Section */}
      {diffResults && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
              <span className="text-xs text-emerald-400 uppercase font-semibold">New Additions</span>
              <p className="text-2xl font-bold text-emerald-300 mt-1">{summary?.newCount || 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">Found in CV, ready to add</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
              <span className="text-xs text-amber-400 uppercase font-semibold">Updated Info</span>
              <p className="text-2xl font-bold text-amber-300 mt-1">{summary?.updatedCount || 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">Different details found</p>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.06] p-4">
              <span className="text-xs text-blue-400 uppercase font-semibold">Portfolio Preserved</span>
              <p className="text-2xl font-bold text-blue-300 mt-1">{summary?.portfolioOnlyCount || 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">Untouched rich data</p>
            </div>
            <div className="rounded-xl border border-gray-500/20 bg-gray-500/[0.06] p-4">
              <span className="text-xs text-gray-400 uppercase font-semibold">Matching</span>
              <p className="text-2xl font-bold text-gray-300 mt-1">{summary?.unchangedCount || 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">Already in sync</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#12141a] p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={selectAllNew}
                className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition cursor-pointer"
              >
                Select All New
              </button>
              <button
                onClick={deselectAll}
                className="rounded-md bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white transition cursor-pointer"
              >
                Deselect All
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDiffResults(null)}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition cursor-pointer"
              >
                Cancel / Re-upload
              </button>
              <button
                onClick={handleApply}
                className="rounded-lg bg-emerald-500 px-5 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Apply Selected ({Object.values(selectedItems).filter(Boolean).length})
              </button>
            </div>
          </div>

          {/* Diff Cards */}
          <div className="space-y-3">
            {diffResults.map((item, idx) => {
              const isSelected = !!selectedItems[idx];
              const isNew = item.category === 'NEW';
              const isUpdated = item.category === 'UPDATED';
              const isPortfolioOnly = item.category === 'PORTFOLIO_ONLY';

              return (
                <div
                  key={idx}
                  onClick={() => !isPortfolioOnly && toggleSelect(idx)}
                  className={`rounded-xl border p-4 transition ${
                    isPortfolioOnly
                      ? 'border-blue-500/20 bg-blue-500/[0.02] opacity-80 cursor-default'
                      : isSelected
                      ? 'border-amber-400/50 bg-amber-400/[0.04] cursor-pointer'
                      : 'border-white/10 bg-[#12141a]/60 hover:border-white/20 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {!isPortfolioOnly && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(idx)}
                          className="mt-1 h-4 w-4 rounded border-gray-700 bg-black text-amber-400 focus:ring-0 cursor-pointer"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            {item.section}
                          </span>
                          {isNew && (
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                              NEW IN CV
                            </span>
                          )}
                          {isUpdated && (
                            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                              UPDATED INFO
                            </span>
                          )}
                          {isPortfolioOnly && (
                            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                              PRESERVED PORTFOLIO DATA
                            </span>
                          )}
                        </div>

                        {/* Content Display */}
                        <div className="mt-2 text-sm text-gray-200">
                          {item.displayLabel && (
                            <p className="font-semibold text-white">{item.displayLabel}</p>
                          )}
                          {item.cvValue && typeof item.cvValue === 'string' && (
                            <p className="text-emerald-300 font-medium">"{item.cvValue}"</p>
                          )}
                          {item.portfolioValue && typeof item.portfolioValue === 'string' && isUpdated && (
                            <p className="text-xs text-gray-400 mt-1 line-through">
                              Current: "{item.portfolioValue}"
                            </p>
                          )}
                          {item.note && (
                            <p className="text-xs text-gray-400 mt-1 italic">{item.note}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
