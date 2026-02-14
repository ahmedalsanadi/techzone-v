/**
 * Support channels component
 */

import React from 'react';
import { Mail, Phone } from 'lucide-react';
import type { BranchSupportChannel } from '@/types/branches';

interface SupportChannelsProps {
    channels: BranchSupportChannel[] | null | undefined;
    title: string;
}

export const SupportChannels: React.FC<SupportChannelsProps> = ({
    channels,
    title,
}) => {
    const displayChannels: BranchSupportChannel[] =
        channels && channels.length > 0
            ? channels
            : [
                  {
                      type: 'phone',
                      title: 'Phone',
                      value: '+966 55 123 9876',
                      status: true,
                  },
                  {
                      type: 'email',
                      title: 'Email',
                      value: 'contact@Fasto.sa',
                      status: true,
                  },
              ];

    return (
        <div className="bg-[#F8F9FA] rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-start">
                {title}
            </h2>

            <div className="space-y-6">
                {displayChannels.map((channel, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-start gap-4 group cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-gray-100 group-hover:border-theme-primary-border transition-all">
                            {channel.type === 'email' ? (
                                <Mail
                                    size={20}
                                    className="text-gray-400 group-hover:text-theme-primary"
                                />
                            ) : (
                                <Phone
                                    size={20}
                                    className="text-gray-400 group-hover:text-theme-primary"
                                />
                            )}
                        </div>
                        <span
                            className="text-gray-600 font-medium group-hover:text-theme-primary transition-colors"
                            dir={channel.type === 'phone' ? 'ltr' : undefined}>
                            {channel.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
