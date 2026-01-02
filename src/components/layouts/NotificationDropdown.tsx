'use client';

import { Bell } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/DropdownMenu';

const NotificationDropdown = () => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors outline-none cursor-pointer">
                    <Bell size={24} strokeWidth={1.5} />
                    <span className="absolute bottom-1 left-1 bg-[#F3C450] text-[#030213] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white/20">
                        5
                    </span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[200px] p-4">
                <div className="text-center py-4">
                    <p className="text-sm font-medium text-muted-foreground">
                        لا توجد إشعارات جديدة
                    </p>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationDropdown;
