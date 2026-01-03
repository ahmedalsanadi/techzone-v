import React from 'react';
import Link from 'next/link';

interface FooterColumnProps {
    title: string;
    links: { label: string; href: string }[];
}

const FooterColumn = ({ title, links }: FooterColumnProps) => (
    <div>
        <h4 className="font-black text-gray-900 mb-8 text-xl">{title}</h4>
        <ul className="space-y-4 text-gray-500 font-bold text-sm">
            {links.map((link, idx) => (
                <li key={idx}>
                    <Link
                        href={link.href}
                        className="hover:text-[#B44734] transition-colors">
                        {link.label}
                    </Link>
                </li>
            ))}
        </ul>
    </div>
);

export default FooterColumn;
