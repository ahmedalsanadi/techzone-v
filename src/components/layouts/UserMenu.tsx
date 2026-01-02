'use client';

import { User, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/DropdownMenu';

const UserMenu = () => {
    return (
        <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
                <button className="bg-white flex items-center gap-2 px-1 py-1 pr-3 rounded-full border border-black/5 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors outline-none h-[36px]">
                    <ChevronDown size={14} className="text-[#b44734]/60" />
                    <span className="text-[#b44734] font-bold text-[12px] whitespace-nowrap">
                        فهد عبدالله
                    </span>
                    <div className="size-[28px] bg-[#b44734]/10 rounded-full flex items-center justify-center">
                        <User
                            size={18}
                            className="text-[#b44734]"
                            strokeWidth={2}
                        />
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
                <DropdownMenuItem>الملف الشخصي</DropdownMenuItem>
                <DropdownMenuItem>طلباتي</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                    تسجيل الخروج
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserMenu;
