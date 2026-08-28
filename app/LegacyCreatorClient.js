'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Home, Folder, Users, Library, Image as ImageIcon, Video, UserRound, Clapperboard,
  UploadCloud, Sparkles, CheckCircle2, ChevronRight, Plus, WandSparkles, Layers3,
  Captions, Music2, Mic2, Palette, Smartphone, Square, Monitor, Clock3,
  ArrowLeft, Play, Settings2, Film, Copy, RefreshCw, Download,
  CircleOff, X, BrainCircuit, LoaderCircle, RotateCcw, Zap, AlertCircle, ExternalLink
} from 'lucide-react'

const styles = [
  ['UGC Natural','Apresentação espontânea e autêntica',UserRound],
  ['Social Dinâmico','Ritmo rápido e visual envolvente',Layers3],
  ['Cinemático','Movimento, profundidade e acabamento premium',Clapperboard],
  ['Demonstração','Mostre detalhes, uso e contexto',Video]
]
const people = [['Bruno','Natural'],['Carla','Elegante'],['Jonas','Técnico'],['Juliana','Lifestyle']]
const formats = [['9:16','Vertical',Smartphone],['1:1','Quadrado',Square],['16:9','Horizontal',Monitor]]

export default function LegacyCreatorClient(){
  const input = useRef(null)
  const [media,setMedia] = useState(null)
  const [idea,setIdea] = useState('')
  const [style,setStyle] = useState(2)
  const [usePresenter,setUsePresenter] = useState(false)
  const [person,setPerson] = useState(0)
  const [tab,setTab] = useState('inicio')
  const [format,setFormat] = useState('9:16')
  const [duration,setDuration] = useState('20s')
  const [captions,setCaptions] = useState(true)
  const [music,setMusic] = useState(true)
  const [voice,setVoice] = useState(true)
  const [brand,setBrand] = useState(false)
  const [projects,setProjects] = useState([])
  const [activeProject,setActiveProject] = useState(null)
  const [planLoading,setPlanLoading] = useState(false)
  const [planError,setPlanError] = useState('')
  const [rendering,setRendering] = useState(false)
  const [renderError,setRenderError] = useState('')
  const [generatedUrl,setGeneratedUrl] = useState('')
  const [showInfo,setShowInfo] = useState(false)

  useEffect(()=>{
    try { setProjects(JSON.parse(localStorage.getItem('legacyCreatorProjects') || '[]')) } catch {}
  },[])

  useEffect(()=>()=>{ if(generatedUrl) URL.revokeObjectURL(generatedUrl) },[generatedUrl])

  async function pick(e){
    const f = e.target.files?.[0]
    if(!f) return
    const url = URL.createObjectURL(f)
    let dataUrl = null
    if(f.type.startsWith('image/')){
      try { dataUrl = await imageForAI(f) } catch {}
    }
    setMedia({ name:f.name, url, type:f.type, dataUrl, size:f.size })
  }

  function saveProjects(list){
    setProjects(list)
    try {
      const safe = list.map(p=>({
        ...p,
        media:p.media ? { name:p.media.name, type:p.media.type, size:p.media.size } : null
      }))
      localStorage.setItem('legacyCreatorProjects', JSON.stringify(safe))
    } catch {}
  }

  function upsertProject(project){
    const list = projects.some(p=>p.id===project.id)
      ? projects.map(p=>p.id===project.id?project:p)
      : [project,...projects]
    saveProjects(list)
    setActiveProject(project)
  }

  async function createProject(){
    if(!idea.trim() && !media) return
    const p = {
      id:Date.now(),
      title:(idea.trim() || media?.name || 'Nova criação').slice(0,56),
      idea:idea.trim(),
      style:styles[style][0], format, duration, captions, music, voice, brand,
      presenter:usePresenter ? people[person][0] : null,
      media,
      plan:null,
      status:'Criando direção com IA',
      createdAt:'agora'
    }
    upsertProject(p)
    setGeneratedUrl('')
    setRenderError('')
    setTab('studio')
    await requestPlan(p)
  }

  async function requestPlan(project=activeProject){
    if(!project) return
    setPlanLoading(true)
    setPlanError('')
    try {
      const res = await fetch('/api/plan',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(project)
      })
      const data = await res.json()
      if(!res.ok || !data.ok) throw new Error(data.detail || data.error || 'Falha ao criar plano')
      const updated = {...project, title:data.plan.title || project.title, plan:data.plan, status:'Plano criado pela IA'}
      upsertProject(updated)
    } catch(err){
      setPlanError(humanAIError(err?.message))
      const updated = {...project,status:'Projeto preparado'}
      upsertProject(updated)
    } finally {
      setPlanLoading(false)
    }
  }

  function openProject(p){
    setActiveProject(p)
    setGeneratedUrl('')
    setRenderError('')
    setPlanError('')
    setTab('studio')
  }

  async function renderClip(){
    const p = activeProject
    if(!p) return
    setRendering(true)
    setRenderError('')
    try {
      const prompt = p.plan?.finalPrompt || p.idea || `Vídeo ${p.style}, visual profissional, movimento de câmera suave, iluminação cinematográfica.`
      const payload = {
        prompt,
        aspectRatio:p.format,
        duration:5,
        imageDataUrl:p.media?.type?.startsWith('image/') ? p.media?.dataUrl || null : null
      }
      const res = await fetch('/api/video',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      })
      const contentType = res.headers.get('content-type') || ''
      if(!res.ok || !contentType.includes('video/')){
        let data={}
        try { data=await res.json() } catch {}
        throw new Error([data.error,data.detail,data.hint].filter(Boolean).join(' '))
      }
      const blob = await res.blob()
      if(generatedUrl) URL.revokeObjectURL(generatedUrl)
      const url = URL.createObjectURL(blob)
      setGeneratedUrl(url)
      upsertProject({...p,status:'Clipe IA gerado'})
    } catch(err){
      setRenderError(humanVideoError(err?.message))
    } finally {
      setRendering(false)
    }
  }

  return <main className="app-shell">
    {tab!=='studio' && <Header/>}

    {tab==='inicio' && <div className="content">
      <section className="hero">
        <div><span className="eyebrow"><Sparkles/> LEGACY CREATOR</span><h1>Transforme uma ideia em um <em>vídeo profissional.</em></h1><p>Planeje, crie cenas com IA e desenvolva conteúdo em um fluxo simples — com ou sem apresentador.</p></div>
        <div className="hero-badge"><BrainCircuit/><b>Studio inteligente</b><span>Roteiro • cenas • vídeo IA</span></div>
      </section>

      <section className="actions">
        <button onClick={()=>input.current?.click()}><ImageIcon/><b>Foto → vídeo</b><small>Anime uma imagem</small></button>
        <button onClick={()=>input.current?.click()}><Video/><b>Usar vídeo</b><small>Comece com material seu</small></button>
        <button className={usePresenter?'active':''} onClick={()=>setUsePresenter(v=>!v)}><UserRound/><b>Apresentador</b><small>{usePresenter?'Ativado':'Opcional'}</small></button>
        <button onClick={()=>setStyle(2)}><Clapperboard/><b>Cinemático</b><small>Acabamento premium</small></button>
      </section>

      <input ref={input} type="file" accept="image/*,video/*" hidden onChange={pick}/>
      <button className="upload" onClick={()=>input.current?.click()}>
        {media ? <><CheckCircle2/><div><b>{media.name}</b><span>{media.type.startsWith('image')?'Imagem pronta para IA':'Vídeo carregado para o projeto'} • toque para trocar</span></div><ChevronRight/></>
          : <><UploadCloud/><div><b>Adicionar foto ou vídeo</b><span>Opcional — você também pode começar apenas descrevendo sua ideia</span></div><Plus/></>}
      </button>

      <div className="prompt-block">
        <div className="field-title"><div><WandSparkles/><b>Descreva o vídeo</b></div><span>A IA transforma isso em direção e cenas</span></div>
        <textarea value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Ex.: Um vídeo elegante de um relógio sobre uma mesa escura, luz lateral quente, câmera aproximando lentamente, clima sofisticado e trilha discreta."/>
        <div className="prompt-examples"><button onClick={()=>setIdea('Vídeo cinematográfico com movimentos suaves, detalhes em close, luz quente e atmosfera sofisticada.')}>Cinemático</button><button onClick={()=>setIdea('Vídeo dinâmico para redes sociais, cortes rápidos, enquadramentos variados e textos curtos na tela.')}>Social</button><button onClick={()=>setIdea('Vídeo de demonstração mostrando detalhes, funcionamento e diferentes ângulos de forma clara e moderna.')}>Demonstração</button></div>
      </div>

      <SectionTitle title="Direção criativa" subtitle="Escolha o ponto de partida"/>
      <div className="styles">{styles.map(([n,d,I],i)=><button className={style===i?'selected':''} onClick={()=>setStyle(i)} key={n}><I/><div><b>{n}</b><small>{d}</small></div>{style===i?<CheckCircle2/>:<ChevronRight/>}</button>)}</div>

      <SectionTitle title="Formato e duração" subtitle="Ajuste ao canal de publicação"/>
      <div className="format-row">{formats.map(([f,n,I])=><button key={f} className={format===f?'selected':''} onClick={()=>setFormat(f)}><I/><b>{f}</b><small>{n}</small></button>)}</div>
      <div className="duration-row"><Clock3/><span>Duração do projeto</span>{['10s','20s','30s','60s'].map(d=><button key={d} className={duration===d?'selected':''} onClick={()=>setDuration(d)}>{d}</button>)}</div>

      <SectionTitle title="Apresentador IA" subtitle="Opcional e desligado por padrão"/>
      <div className={'presenter-box '+(usePresenter?'on':'')}>
        <button className="presenter-toggle" onClick={()=>setUsePresenter(v=>!v)}><div>{usePresenter?<CheckCircle2/>:<CircleOff/>}</div><span><b>{usePresenter?'Incluir apresentador':'Criar sem apresentador'}</b><small>{usePresenter?'A direção de IA considerará uma pessoa no vídeo':'Cenas, objetos, ambientes, textos e narração podem criar o vídeo completo'}</small></span><strong>{usePresenter?'ATIVO':'OFF'}</strong></button>
        {usePresenter && <div className="people">{people.map(([n,r],i)=><button className={person===i?'selected':''} onClick={()=>setPerson(i)} key={n}><div className="avatar">{n[0]}</div><b>{n}</b><small>{r}</small></button>)}</div>}
      </div>

      <SectionTitle title="Acabamento" subtitle="Defina o que a IA deve preparar"/>
      <div className="tools-grid"><Tool icon={Captions} title="Legendas" on={captions} click={()=>setCaptions(v=>!v)}/><Tool icon={Music2} title="Trilha" on={music} click={()=>setMusic(v=>!v)}/><Tool icon={Mic2} title="Voz IA" on={voice} click={()=>setVoice(v=>!v)}/><Tool icon={Palette} title="Kit de marca" on={brand} click={()=>setBrand(v=>!v)}/></div>

      <button className="create" disabled={!idea.trim()&&!media} onClick={createProject}><Sparkles/> Criar com IA <ChevronRight/></button>
      <p className="note">O primeiro passo cria automaticamente o conceito, storyboard e prompts das cenas.</p>
    </div>}

    {tab==='studio' && activeProject && <Studio project={activeProject} planLoading={planLoading} planError={planError} retryPlan={()=>requestPlan(activeProject)} generatedUrl={generatedUrl} rendering={rendering} renderError={renderError} renderClip={renderClip} back={()=>setTab('inicio')} info={()=>setShowInfo(true)}/>} 

    {tab==='projetos' && <Projects projects={projects} open={openProject} create={()=>setTab('inicio')}/>} 
    {tab==='personagens' && <Characters/>}
    {tab==='produtos' && <Empty icon={Library} title="Biblioteca criativa" text="Aqui ficarão fotos, vídeos, logos, trilhas e referências que você quiser reutilizar em vários projetos." go={()=>setTab('inicio')}/>} 

    {tab!=='studio' && <BottomNav tab={tab} setTab={setTab}/>} 

    {showInfo && <div className="modal" onClick={()=>setShowInfo(false)}><div className="sheet" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setShowInfo(false)}><X/></button><Zap className="sheet-icon"/><h3>Render real por IA</h3><p>O clipe beta usa um modelo de vídeo através do AI Gateway. A geração pode levar alguns minutos e pode consumir créditos da sua conta Vercel.</p><div className="engine-options"><div><b>Agora</b><small>Clipe real de até 5 segundos, 480p, com geração a partir de texto ou imagem.</small></div><div><b>Próxima camada</b><small>Várias cenas, armazenamento em nuvem, montagem automática e exportação do vídeo completo.</small></div></div><button className="sheet-main" onClick={()=>setShowInfo(false)}>Entendi</button></div></div>}
  </main>
}

function Header(){return <header><div className="logo"><span>LS</span></div><div className="brand"><b>LEGACY</b><strong>CREATOR</strong><small>Seu estúdio criativo com IA</small></div><div className="credit"><Sparkles/> AI Studio</div></header>}

function Studio({project,planLoading,planError,retryPlan,generatedUrl,rendering,renderError,renderClip,back,info}){
  const scenes = project.plan?.scenes || fallbackScenes(parseInt(project.duration)||20)
  return <div className="studio-page">
    <div className="studio-top"><button onClick={back}><ArrowLeft/></button><div><small>LEGACY CREATOR STUDIO</small><h2>{project.plan?.title || project.title}</h2></div><button onClick={info}><Settings2/></button></div>
    <div className="studio-body">
      <section className="preview-panel">
        <div className={'video-preview '+(generatedUrl?'has-video':'')} data-format={project.format}>
          {generatedUrl ? <video src={generatedUrl} controls playsInline/> : project.media?.url ? (project.media.type?.startsWith('video') ? <video src={project.media.url} muted playsInline/> : <img src={project.media.url} alt="Material do projeto"/>) : <div className="preview-empty"><Sparkles/><b>{planLoading?'A IA está dirigindo seu vídeo':'Sua criação começa aqui'}</b><span>{project.style}</span></div>}
          {!generatedUrl && <div className="preview-overlay"><span>{project.format} • {project.duration}</span><b>{project.presenter?'COM APRESENTADOR':'SEM APRESENTADOR'}</b></div>}
        </div>
        {generatedUrl && <a className="download-video" href={generatedUrl} download="legacy-creator-clip.mp4"><Download/> Baixar clipe MP4</a>}
      </section>

      <section className="studio-card ai-direction">
        <div className="studio-card-head"><div><small>DIREÇÃO CRIATIVA</small><h3>{planLoading?'Criando com IA…':project.plan?'Plano gerado pela IA':'Direção do projeto'}</h3></div>{planLoading?<LoaderCircle className="spin"/>:<BrainCircuit/>}</div>
        {planLoading && <div className="ai-progress"><span/><span/><span/><p>Analisando ideia, estilo, duração e estrutura das cenas…</p></div>}
        {planError && <div className="error-box"><AlertCircle/><div><b>A direção automática não respondeu</b><span>{planError}</span></div><button onClick={retryPlan}><RotateCcw/> Tentar novamente</button></div>}
        {project.plan ? <><p className="concept">{project.plan.concept}</p><div className="chips"><span>{project.style}</span><span>{project.format}</span><span>{project.duration}</span><span>{project.presenter?'Apresentador: '+project.presenter:'Sem apresentador'}</span></div><div className="plan-meta"><div><small>ABERTURA</small><b>{project.plan.openingHook}</b></div><div><small>DIREÇÃO VISUAL</small><b>{project.plan.visualDirection}</b></div><div><small>TRILHA</small><b>{project.plan.musicMood}</b></div></div></> : !planLoading && <><p>{project.idea || 'Criação baseada no material enviado.'}</p><div className="chips"><span>{project.style}</span><span>{project.format}</span><span>{project.duration}</span></div></>}
      </section>

      <section className="studio-card"><div className="studio-card-head"><div><small>STORYBOARD</small><h3>{project.plan?'Cenas criadas pela IA':'Cenas sugeridas'}</h3></div><button onClick={retryPlan} disabled={planLoading}><RefreshCw/> Recriar</button></div><div className="scene-list">{scenes.map((s,i)=><Scene key={i} n={String(i+1).padStart(2,'0')} scene={s}/>)}</div></section>

      <section className="studio-card"><div className="studio-card-head"><div><small>RECURSOS</small><h3>Configuração do projeto</h3></div></div><div className="resource-grid"><Resource icon={Captions} name="Legendas" on={project.captions}/><Resource icon={Music2} name="Trilha" on={project.music}/><Resource icon={Mic2} name="Voz IA" on={project.voice}/><Resource icon={Palette} name="Kit de marca" on={project.brand}/><Resource icon={UserRound} name="Apresentador" on={!!project.presenter}/><Resource icon={BrainCircuit} name="Direção IA" on={!!project.plan}/></div></section>

      <section className="studio-card render-card"><div className="render-copy"><small>GERAÇÃO REAL • BETA</small><h3>Transformar em vídeo agora</h3><p>Gere um clipe real de até 5 segundos para validar a direção visual. O render usa IA de vídeo e pode consumir créditos do AI Gateway.</p></div>{renderError && <div className="error-box compact"><AlertCircle/><div><b>Não foi possível gerar o clipe</b><span>{renderError}</span></div></div>}<button className="render-button" onClick={renderClip} disabled={rendering||planLoading}>{rendering?<><LoaderCircle className="spin"/> Gerando clipe… pode levar alguns minutos</>:<><Zap/> Gerar clipe real de 5s</>}</button><button className="render-info" onClick={info}><ExternalLink/> Como funciona e custos</button></section>

      <div className="studio-actions"><button onClick={()=>navigator.clipboard?.writeText(JSON.stringify(project.plan||project,null,2))}><Copy/> Copiar plano</button>{generatedUrl?<a href={generatedUrl} download="legacy-creator-clip.mp4"><Download/> Exportar clipe</a>:<button onClick={retryPlan}><RefreshCw/> Nova direção</button>}</div>
    </div>
  </div>
}

function Scene({n,scene}){return <div className="scene"><span>{n}</span><div><b>{scene.title}</b><p>{scene.visual || scene.text}</p>{scene.camera && <em>{scene.camera}</em>}{scene.narration && <small>Voz: “{scene.narration}”</small>}</div><strong>{scene.seconds}s</strong></div>}
function Resource({icon:I,name,on}){return <div className={on?'on':''}><I/><b>{name}</b><span>{on?'Ativo':'Off'}</span></div>}
function Tool({icon:I,title,on,click}){return <button className={on?'on':''} onClick={click}><I/><span><b>{title}</b><small>{on?'Ativado':'Desativado'}</small></span><strong>{on?'ON':'OFF'}</strong></button>}
function SectionTitle({title,subtitle}){return <div className="title"><b>{title}</b><span>{subtitle}</span></div>}
function BottomNav({tab,setTab}){return <nav><Nav on={()=>setTab('inicio')} active={tab==='inicio'} icon={Home} text="Início"/><Nav on={()=>setTab('projetos')} active={tab==='projetos'} icon={Folder} text="Projetos"/><button className="fab" onClick={()=>setTab('inicio')}><Plus/></button><Nav on={()=>setTab('personagens')} active={tab==='personagens'} icon={Users} text="Personagens"/><Nav on={()=>setTab('produtos')} active={tab==='produtos'} icon={Library} text="Biblioteca"/></nav>}
function Nav({on,active,icon:I,text}){return <button onClick={on} className={active?'active':''}><I/><span>{text}</span></button>}
function Projects({projects,open,create}){return <div className="library-page"><div className="page-head"><div><small>PROJETOS</small><h2>Minhas criações</h2></div><button onClick={create}><Plus/> Novo</button></div>{projects.length?<div className="project-list">{projects.map(p=><button key={p.id} className="project-card" onClick={()=>open(p)}><div className="project-thumb"><Film/><span><Play/></span></div><div><b>{p.plan?.title||p.title}</b><small>{p.style} • {p.format} • {p.duration}</small><em>{p.status||'Projeto'}</em></div><ChevronRight/></button>)}</div>:<Empty icon={Folder} title="Nenhum projeto ainda" text="Crie uma ideia e o Legacy Creator vai montar a primeira direção com IA para você." go={create}/>}</div>}
function Characters(){return <div className="library-page"><div className="page-head"><div><small>PERSONAGENS</small><h2>Apresentadores IA</h2></div><span className="optional-pill">Opcional</span></div><div className="character-info"><CircleOff/><div><b>Você não precisa usar personagem</b><p>O Legacy Creator funciona normalmente com cenas, objetos, ambientes, voz e textos. Apresentadores são apenas mais uma possibilidade criativa.</p></div></div><div className="people character-page">{people.map(([n,r])=><button key={n}><div className="avatar">{n[0]}</div><b>{n}</b><small>{r}</small></button>)}</div><div className="coming-card"><UserRound/><div><b>Personagem próprio</b><p>Uma próxima etapa permitirá cadastrar aparência, voz e identidade visual recorrentes.</p></div></div></div>}
function Empty({icon:I,title,text,go}){return <div className="empty"><I/><h2>{title}</h2><p>{text}</p>{go&&<button onClick={go}><Plus/> Começar criação</button>}</div>}

function fallbackScenes(total){const a=Math.max(2,Math.round(total*.2)),b=Math.max(3,Math.round(total*.55)),c=Math.max(2,total-a-b);return [{title:'Abertura',seconds:a,visual:'Plano visual forte para estabelecer assunto, atmosfera e identidade.',camera:'Movimento suave de aproximação'},{title:'Desenvolvimento',seconds:b,visual:'Detalhes, contexto e variedade de enquadramentos seguindo o estilo escolhido.',camera:'Alternar close e plano médio'},{title:'Fechamento',seconds:c,visual:'Conclusão limpa e memorável, com espaço para texto final.',camera:'Movimento desacelerando até o quadro final'}]}
async function imageForAI(file){if(file.size<=2200000)return await readDataUrl(file);const source=await readDataUrl(file);const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=source});const max=1280,scale=Math.min(1,max/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.78)}
function readDataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}
function humanAIError(msg=''){if(/credit|billing|payment|gateway/i.test(msg))return 'A IA do projeto precisa de créditos habilitados no AI Gateway da Vercel.';return 'O projeto continua disponível; tente gerar a direção novamente em alguns instantes.'}
function humanVideoError(msg=''){if(/credit|billing|payment|paid|gateway|402|403/i.test(msg))return 'A geração de vídeo exige créditos/faturamento do AI Gateway habilitados na Vercel.';if(/timeout/i.test(msg))return 'A geração demorou além do limite. Tente novamente; vídeos podem levar alguns minutos.';return msg||'A geração não foi concluída. Tente novamente.'}
