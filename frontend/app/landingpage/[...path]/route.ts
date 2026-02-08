import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const ALLOWED = new Set([
  'hero_sec.png',
  'intelegentfac.png',
  'shadow-mode-dashboard.png.png',
  'shield-of-compliance.png.png.png',
  'Api_and_M2M_integration.png',
]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const filename = pathSegments?.join('/') ?? '';
  const base = path.join(process.cwd(), 'public', 'landingpage');
  const resolved = path.resolve(base, filename);
  if (!resolved.startsWith(base) || path.relative(base, resolved).startsWith('..')) {
    return new NextResponse(null, { status: 404 });
  }
  const name = path.basename(filename);
  if (!ALLOWED.has(name)) {
    return new NextResponse(null, { status: 404 });
  }
  try {
    const buf = fs.readFileSync(resolved);
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
