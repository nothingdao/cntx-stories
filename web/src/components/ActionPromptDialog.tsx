import React, { useState } from 'react';
import { ClipboardCopy, ClipboardCheck } from 'lucide-react';

interface ActionPromptDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  naturalText: string;
  cliCommand: string;
}

export const ActionPromptDialog: React.FC<ActionPromptDialogProps> = ({ open, onClose, title, naturalText, cliCommand }) => {
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cliCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85">
      <div className="bg-white dark:bg-black p-6 w-full max-w-md border border-gray-200 dark:border-gray-400 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">&times;</button>
        </div>
        <div className="mb-4">
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">Instruction</div>
          <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-gray-800 dark:text-gray-100 text-sm whitespace-pre-line mb-4 flex items-center justify-between">
            <span className="flex-1">{naturalText}</span>
            <button onClick={() => navigator.clipboard.writeText(naturalText)} className="ml-4 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xs">
              <ClipboardCopy className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">CLI Command</div>
          <div className="bg-gray-900 dark:bg-black border border-gray-700 dark:border-gray-600 text-gray-100 p-3 font-mono text-sm flex items-center justify-between">
            <span className="truncate">{cliCommand}</span>
            <button onClick={handleCopy} className="ml-4 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xs">
              {copied ? <ClipboardCheck className="w-4 h-4" /> : <ClipboardCopy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 
