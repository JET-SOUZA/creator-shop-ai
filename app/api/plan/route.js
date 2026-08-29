import { generateText, Output } from 'ai'
import { z } from 'zod'

export const maxDuration = 60

const sceneSchema = z.object({
  title: z.string(),
  seconds: z.number().int().min(1).max(20),
  visual: z.string(),
  camera: z.string(),
  text: z.string(),
  narration: z.string(),
  generationPrompt: z.string()
})

const planSchema = z.object({
  title: z.string(),
  concept: z.string(),
  openingHook: z.string(),
  visualDirection: z.string(),
  musicMood: z.string(),
  captionStyle: z.string(),
  scenes: z.array(sceneSchema).min(3).max(6),
  finalPrompt: z.string()
})

export async function POST(request) {
  try {
    const body = await request.json()
    const duration = Math.max(5, Math.min(60, Number.parseInt(body.duration) || 20))
    const presenter = body.presenter ? `Com apresentador IA: ${body.presenter}.` : 'Sem apresentador; não coloque uma pessoa falando para a câmera a menos que a ideia peça explicitamente.'

    const { output } = await generateText({
      model: 'openai/gpt-5.4-mini',
      output: Output.object({ schema: planSchema }),
      prompt: `Você é diretor criativo do Legacy Creator, um estúdio profissional de vídeo com IA. Crie um storyboard pronto para produção em português do Brasil.

IDEIA DO USUÁRIO:
${body.idea || 'Criar um vídeo visualmente marcante a partir do material enviado.'}

CONFIGURAÇÃO:
- Estilo: ${body.style || 'Cinemático'}
- Formato: ${body.format || '9:16'}
- Duração total desejada: ${duration} segundos
- ${presenter}
- Legendas: ${body.captions ? 'sim' : 'não'}
- Voz IA: ${body.voice ? 'sim' : 'não'}
- Trilha: ${body.music ? 'sim' : 'não'}
- Kit de marca: ${body.brand ? 'sim' : 'não'}

REGRAS:
- Seja sofisticado, atual e realista; evite linguagem genérica de anúncio.
- As cenas devem somar aproximadamente ${duration} segundos.
- Comece com uma abertura visual forte nos primeiros 2 segundos.
- O texto na tela deve ser curto e elegante.
- Se não houver apresentador, priorize movimento de câmera, detalhes, ambiente, tipografia e narrativa visual.
- O generationPrompt de cada cena deve descrever sujeito, ação, cenário, iluminação, câmera e atmosfera.
- Não invente fatos específicos sobre produto, pessoa ou marca que o usuário não informou.`
    })

    return Response.json({ ok: true, plan: output, model: 'openai/gpt-5.4-mini' })
  } catch (error) {
    console.error('legacy-plan-error', error)
    return Response.json({ ok:false, error:'Não foi possível gerar o roteiro com IA agora.', detail:error?.message || 'AI_GATEWAY_ERROR' }, { status:500 })
  }
}
