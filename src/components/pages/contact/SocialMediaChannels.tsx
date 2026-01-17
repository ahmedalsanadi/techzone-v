/**
 * Social media channels component
 */

import React from 'react';
import { getSocialIcon } from '@/lib/contact/getSocialIcon';

interface SocialChannel {
    type: string;
    title: string;
    link: string;
}

interface SocialMediaChannelsProps {
    channels: SocialChannel[] | null | undefined;
    title: string;
    emptyMessage?: string;
}

export const SocialMediaChannels: React.FC<SocialMediaChannelsProps> = ({
    channels,
    title,
    emptyMessage = 'لا توجد قنوات تواصل اجتماعي',
}) => {
    return (
        <div className="bg-[#F8F9FA] rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-start">
                {title}
            </h2>

            <div className="space-y-4">
                {channels && channels.length > 0 ? (
                    channels.map((channel, idx) => (
                        <a
                            key={idx}
                            href={channel.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-start gap-4 p-2 rounded-2xl hover:bg-white transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100">
                                {getSocialIcon(channel.type)}
                            </div>
                            <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                                @{channel.title}
                            </span>
                        </a>
                    ))
                ) : (
                    <p className="text-sm text-gray-400 text-center py-4">
                        {emptyMessage}
                    </p>
                )}
            </div>
        </div>
    );
};
