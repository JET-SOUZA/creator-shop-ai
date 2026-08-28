import { experimental_generateVideo as generateVideo, NoVideoGeneratedError } from 'ai'
import { v2 as cloudinary } from 'cloudinary'

export const maxDuration = 300

function configureCloudinary() {
  const raw = process.env.CLOUDINARY_URL
  if (!raw) return null
  try {
    const u = new URL(raw)
    cloudinary.config({
      cloud_name: u.hostname,
      api_key: decodeURIComponent(u.username),
      api_secret: decodeURIComponent(u.password),
      secure: true
    })
    return u.hostname
  } catch {
    return null
  }
}

function uploadVideo(bytes, index) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      resource_type: 'video',
      folder: 'legacy-creator/renders',
      public_id: `scene-${Date.now()}-${index}`,
      overwrite: false
    }, (error, result) => error ? reject(error) : resolve(result))
    stream.end(Buffer.from(bytes))
  })
}

function dimensions(aspectRatio) {
  if (aspectRatio === '1:1') return [480,480]
  if (aspectRatio === '16:9') return [854,480]
  return [480,854]
}

function layerId(publicId) {
  return String(publicId).replaceAll('/', ':')
}

function buildConcatUrl(cloudName, uploads, aspectRatio) {
  const [w,h] = dimensions(aspectRatio)
  const base = uploads[0].public_id
  const layers = uploads.slice(1).map(item =>
    `l_video:${layerId(item.public_id)}/c_fill,w_${w},h_${h}/fl_splice,fl_layer_apply`
  ).join('/')
  return `https://res.cloudinary.com/${cloudName}/video/upload/c_fill,w_${w},h_${h},q_auto/${layers ? layers + '/' : ''}${base}.mp4`
}

export async function POST(request) {
  try {
    const body = await request.json()
    const aspectRatio = ['9:16','1:1','16:9'].includes(body.aspectRatio) ? body.aspectRatio : '9:16'
    const scenePrompts = Array.isArray(body.scenes)
      ? body.scenes.map(s => String(s.prompt || s.visual || s.text || '').trim()).filter(Boolean).slice(0,3)
      : []

    if (!scenePrompts.length) {
      return Response.json({ ok:false, error:'Nenhuma cena válida para renderizar.' }, { status:400 })
    }

    const cloudName = configureCloudinary()
    if (!cloudName) {
      return Response.json({
        ok:false,
        code:'STORAGE_NOT_CONFIGURED',
        error:'O armazenamento de mídia ainda não está conectado ao deploy.',
        hint:'Adicione CLOUDINARY_URL ao projeto Vercel para ativar montagem final e download.'
      }, { status:503 })
    }

    const uploads = []
    for (let i=0; i<scenePrompts.length; i++) {
      const result = await generateVideo({
        model: 'spacexai/grok-imagine-video',
        prompt: scenePrompts[i],
        duration: 5,
        aspectRatio,
        providerOptions: {
          xai: {
            resolution: '480p',
            pollIntervalMs: 5000,
            pollTimeoutMs: 240000
          }
        },
        abortSignal: AbortSignal.timeout(250000)
      })
      const video = result.videos?.[0] || result.video
      if (!video?.uint8Array) throw new Error(`SCENE_${i+1}_EMPTY`)
      uploads.push(await uploadVideo(video.uint8Array, i+1))
    }

    const finalUrl = buildConcatUrl(cloudName, uploads, aspectRatio)
    return Response.json({
      ok:true,
      sceneCount: uploads.length,
      scenes: uploads.map((u,i)=>({ index:i+1, publicId:u.public_id, url:u.secure_url })),
      finalUrl,
      provider:'cloudinary',
      model:'spacexai/grok-imagine-video'
    }, { headers:{'Cache-Control':'no-store'} })
  } catch (error) {
    console.error('legacy-render-project-error', error)
    const detail = NoVideoGeneratedError?.isInstance?.(error)
      ? 'O provedor não conseguiu gerar uma das cenas.'
      : (error?.message || 'PROJECT_RENDER_ERROR')
    return Response.json({
      ok:false,
      error:'Não foi possível montar o vídeo completo agora.',
      detail,
      hint:'A montagem completa usa créditos do AI Gateway e armazenamento Cloudinary.'
    }, { status:500 })
  }
}
