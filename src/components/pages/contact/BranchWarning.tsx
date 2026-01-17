/**
 * Branch warning component for when branch fetch fails
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface BranchWarningProps {
    title: string;
    message: string;
}

export const BranchWarning: React.FC<BranchWarningProps> = ({
    title,
    message,
}) => {
    return (
        <div className="mb-6 p-4 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">{title}</p>
                <p className="text-xs text-yellow-700 mt-1">{message}</p>
            </div>
        </div>
    );
};
