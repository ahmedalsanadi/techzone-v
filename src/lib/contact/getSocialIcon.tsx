/**
 * Utility to get social media icon component
 */

import React from 'react';
import {
    Mail,
    Phone,
    Instagram,
    Facebook,
    Twitter,
    MessageSquareText,
    MessageCircle, // WhatsApp
    Ghost, // Snapchat
    Youtube,
    Music2, // TikTok
    Linkedin,
    Send, // Telegram
} from 'lucide-react';

export function getSocialIcon(type: string): React.ReactNode {
    const key = type?.toLowerCase() || '';
    switch (key) {
        case 'facebook':
            return <Facebook className="w-5 h-5 text-blue-600" />;
        case 'instagram':
            return <Instagram className="w-5 h-5 text-pink-600" />;
        case 'twitter':
        case 'x':
            return <Twitter className="w-5 h-5 text-blue-400" />;
        case 'whatsapp':
            return <MessageCircle className="w-5 h-5 text-green-500" />;
        case 'snapchat':
            return <Ghost className="w-5 h-5 text-yellow-500" />;
        case 'telegram':
            return <Send className="w-5 h-5 text-blue-500" />;
        case 'youtube':
            return <Youtube className="w-5 h-5 text-red-600" />;
        case 'tiktok':
            return <Music2 className="w-5 h-5 text-gray-900" />;
        case 'linkedin':
            return <Linkedin className="w-5 h-5 text-blue-700" />;
        default:
            return <MessageSquareText className="w-5 h-5 text-theme-primary" />;
    }
}
