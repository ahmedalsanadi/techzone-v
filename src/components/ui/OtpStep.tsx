'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import OtpInput from './OtpInput';

interface OtpStepProps {
    otp: string;
    onOtpChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    maskedPhone: string;
    subtitle: string;
    continueLabel: string;
    resendLabel: string;
    timer?: string;
    onResend?: () => void;
    autoFocus?: boolean;
    loading?: boolean;
}

export default function OtpStep({
    otp,
    onOtpChange,
    onSubmit,
    maskedPhone,
    subtitle,
    continueLabel,
    resendLabel,
    timer,
    onResend,
    autoFocus = true,
    loading = false,
}: OtpStepProps) {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-4">
                <p className="text-xl font-bold text-[#2D3142] opacity-80">
                    {subtitle}
                </p>
                <p className="text-2xl font-black text-[#2D3142]" dir="ltr">
                    {maskedPhone}
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-12">
                <OtpInput
                    value={otp}
                    onChange={onOtpChange}
                    autoFocus={autoFocus}
                />

                <div className="space-y-6">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-16 rounded-2xl text-white font-black text-2xl shadow-xl transition-all active:scale-[0.98] bg-theme-primary shadow-theme-primary/20">
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            continueLabel
                        )}
                    </Button>

                    {(timer || onResend) && (
                        <div className="flex items-center justify-between h-18 px-8 rounded-2xl bg-theme-primary/5">
                            {timer ? (
                                <span
                                    className="text-theme-primary font-black text-2xl"
                                    dir="ltr">
                                    {timer}
                                </span>
                            ) : (
                                <span className="text-theme-primary font-black text-2xl opacity-60">
                                    {resendLabel}
                                </span>
                            )}
                            {onResend && (
                                <button
                                    type="button"
                                    onClick={onResend}
                                    disabled={!!timer}
                                    className="text-theme-primary font-black text-2xl opacity-60 hover:opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">
                                    {resendLabel}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
