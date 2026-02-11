// src/app/[locale]/faq/FAQList.tsx
'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQListProps {
    questions: FAQItem[];
}

export default function FAQList({ questions }: FAQListProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default as in the image

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="space-y-4">
            {questions.map((item, index) => (
                <div
                    key={index}
                    className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => toggleAccordion(index)}
                        className="w-full flex items-center justify-between p-6 md:p-8 text-start h-auto min-h-0 rounded-none border-0 shadow-none">
                        <span className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-theme-primary transition-colors">
                            {item.question}
                        </span>
                        <div
                            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                                openIndex === index
                                    ? 'bg-theme-primary text-white shadow-lg shadow-theme-primary/20'
                                    : 'bg-gray-50 text-gray-400 group-hover:bg-theme-primary/10 group-hover:text-theme-primary'
                            }`}>
                            {openIndex === index ? (
                                <ChevronUp className="w-6 h-6" />
                            ) : (
                                <ChevronDown className="w-6 h-6" />
                            )}
                        </div>
                    </Button>

                    <div
                        className={`transition-all duration-300 ease-in-out ${
                            openIndex === index
                                ? 'max-h-[500px] opacity-100'
                                : 'max-h-0 opacity-0'
                        }`}>
                        <div className="px-8 pb-8 md:px-10 md:pb-10 pt-0">
                            <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
                                {item.answer}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
