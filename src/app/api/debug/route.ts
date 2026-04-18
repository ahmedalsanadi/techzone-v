import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    // Check if page.tsx exists
    const pagePath = path.join(process.cwd(), 'src/app/page.tsx');
    const pageExists = fs.existsSync(pagePath);
    
    // Check the built output
    const buildPath = path.join(process.cwd(), '.next');
    const buildExists = fs.existsSync(buildPath);
    
    return NextResponse.json({
        pageExists,
        buildExists,
        cwd: process.cwd(),
        nodeEnv: process.env.NODE_ENV,
    });
}