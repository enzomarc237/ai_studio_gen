import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Download, Check, FileText, FileDown } from 'lucide-react';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

interface MarkdownViewerProps {
  content: string;
  title?: string;
  className?: string;
  innerClassName?: string;
}

export default function MarkdownViewer({ content, title = 'Document', className = '', innerClassName = 'p-6 bg-white rounded-xl border border-zinc-200' }: MarkdownViewerProps) {
  const [copied, setCopied] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${title}.md`);
    setShowExport(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(content.replace(/#/g, ''), 180);
    doc.text(lines, 10, 10);
    doc.save(`${title}.pdf`);
    setShowExport(false);
  };

  const exportDOCX = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: content.split('\n').map(line => new Paragraph({ children: [new TextRun(line)] })),
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title}.docx`);
    setShowExport(false);
  };

  return (
    <div className={`flex flex-col h-full relative group ${className}`}>
      <div className="absolute top-2 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={handleCopy}
          className="p-2 bg-white border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 text-zinc-600 transition-colors"
          title="Copy Markdown"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className="p-2 bg-white border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 text-zinc-600 transition-colors"
            title="Export"
          >
            <Download className="h-4 w-4" />
          </button>
          
          {showExport && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 z-20">
              <button onClick={exportMarkdown} className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center">
                <FileText className="h-4 w-4 mr-2" /> Markdown (.md)
              </button>
              <button onClick={exportPDF} className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center">
                <FileDown className="h-4 w-4 mr-2" /> PDF (.pdf)
              </button>
              <button onClick={exportDOCX} className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center">
                <FileText className="h-4 w-4 mr-2" /> Word (.docx)
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`prose prose-zinc max-w-none w-full flex-1 overflow-y-auto ${innerClassName}`}>
        {content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-400 italic">
            No content yet.
          </div>
        )}
      </div>
    </div>
  );
}
