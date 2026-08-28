import { experimental_generateVideo as generateVideo, NoVideoGeneratedError } from 'ai'

export const maxDuration = 300

function streamBytes(bytes) {
  const chunk = 64 * 1024
  let offset = 0
  return new ReadableStream({
    pull(controller) {
      if (offset >= bytes.length) {
        controller.close()
        return
      }
      controller.enqueue(bytes.slice(offset, Math.min(offset + chunk, bytes.length)))
      offset += chunk
    }
  })
}

export async function POST(request) {
  try {
    const body = await request.json()
    const duration = Math.max(1, Math.min(15, Number(body.duration) || 5))
    const aspectRatio = ['9:16','1:1','16:9'].includes(body.aspectRatio) ? body.aspectRatio : '9:16'
    const promptText = String(body.prompt || '').trim()
    if (!promptText) return Response.json({ ok:false, error:'Descreva a ideia antes de gerar o vídeo.' }, { status:400 })

    const prompt = body.imageDataUrl ? { image: body.imageDataUrl, text: promptText } : promptText

    const result = await generateVideo({
      model: 'xai/grok-imagine-video',
      prompt,
      duration,
      aspectRatio,
      providerOptions: {
        xai: {
          resolution: '480p',
          pollIntervalMs: 5000,
          pollTimeoutMs: 600000
        }
      },
      abortSignal: AbortSignal.timeout(610000)
    })

    const video = result.videos?.[0] || result.video
    if (!video?.uint8Array) throw new Error('VIDEO_EMPTY')

    return new Response(streamBytes(video.uint8Array), {
      headers: {
        'Content-Type':'video/mp4',
        'Content-Disposition':'inline; filename="legacy-creator-video.mp4"',
        'Cache-Control':'no-store',
        'X-Legacy-Model':'xai/grok-imagine-video',
        'X-Legacy-Duration':String(duration)
      }
    })
  } catch (error) {
    console.error('legacy-video-error', error)
    const detail = NoVideoGeneratedError?.isInstance?.(error)
      ? 'O provedor não conseguiu gerar o vídeo.'
      : (error?.message || 'VIDEO_GENERATION_ERROR')
    return Response.json({
      ok:false,
      error:'Não foi possível gerar o vídeo agora.',
      detail,
      hint:'A geração usa créditos do AI Gateway e pode exigir faturamento habilitado.'
    }, { status:500 })
  }
}
