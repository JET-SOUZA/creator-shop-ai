export async function GET() {
  const configured = Boolean(process.env.CLOUDINARY_URL)
  let cloudName = null
  if (configured) {
    try { cloudName = new URL(process.env.CLOUDINARY_URL).hostname || null } catch {}
  }
  return Response.json({
    ok: true,
    configured,
    provider: 'cloudinary',
    cloudName,
    capabilities: configured
      ? ['upload','multi-scene-storage','concat','download']
      : ['local-preview']
  }, { headers: { 'Cache-Control': 'no-store' } })
}
