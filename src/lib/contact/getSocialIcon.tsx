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
} from 'lucide-react';

export function getSocialIcon(type: string): React.ReactNode {
    switch (type.toLowerCase()) {
        case 'facebook':
            return <Facebook className="w-5 h-5 text-blue-600" />;
        case 'instagram':
            return <Instagram className="w-5 h-5 text-pink-600" />;
        case 'twitter':
            return <Twitter className="w-5 h-5 text-blue-400" />;
        case 'whatsapp':
            return <Phone className="w-5 h-5 text-green-500" />;
        default:
            return <MessageSquareText className="w-5 h-5 text-theme-primary" />;
    }
}
