'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Home, Folder, Users, Library, Image as ImageIcon, Video, UserRound, Clapperboard,
  UploadCloud, Sparkles, CheckCircle2, ChevronRight, Plus, WandSparkles, Layers3,
  Captions, Music2, Mic2, Palette, Smartphone, Square, Monitor, Clock3,
  ArrowLeft, Film, Download, RefreshCw, CircleOff, BrainCircuit, LoaderCircle,
  Zap, AlertCircle, Play, Settings2
} from 'lucide-react'

const styles = [
  ['UGC Natural','Espontâneo e humano',UserRound],
  ['Social Dinâmico','Rápido e envolvente',Layers3],
  ['Cinemático','Profundidade e acabamento premium',Clapperboard],
  ['Demonstração','Detalhes, uso e contexto',Video]
]
const people = [['Bruno','Natural'],['Carla','Elegante'],['Jonas','Técnico'],['Juliana','Lifestyle']]
const formats = [['9:16','Vertical',Smartphone],['1:1','Quadrado',Square],['16:9','Horizontal',Monitor]]
const durations = ['5s','10s','15s','20s','30s','60s']

export default function LegacyCreatorClientV2(){
  const input = useRef(null)
  const [media,setMedia] = useState(null)
  const [idea,setIdea] = useState('')
  const [style,setStyle] = useState(2)
  const [usePresenter,setUsePresenter] = useState(false)
  const [person,setPerson] = useState(0)
  const [tab,setTab] = useState('inicio')
  const [format,setFormat] = useState('9:16')
  const [duration,setDuration] = useState('15s')
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

  useEffect(()=>{
    try { setProjects(JSON.parse(localStorage.getItem('legacyCreatorProjectsV2') || '[]')) } catch {}
  },[])

  useEffect(()=>()=>{ if(generatedUrl) URL.revokeObjectURL(generatedUrl) },[generatedUrl])

  async function pick(e){
    const f=e.target.files?.[0]
    if(!f) return
    const url=URL.createObjectURL(f)
    let dataUrl=null
    if(f.type.startsWith('image/')){
      try { dataUrl=await imageForAI(f) } catch {}
    }
    setMedia({name:f.name,url,type:f.type,dataUrl,size:f.size})
  }

  function persist(list){
    setProjects(list)
    try {
      localStorage.setItem('legacyCreatorProjectsV2',JSON.stringify(list.map(p=>({
        ...p,
        media:p.media?{name:p.media.name,type:p.media.type,size:p.media.size}:null
      }))))
    } catch {}
  }

  function upsert(project){
    const list=projects.some(p=>p.id===project.id)
      ? projects.map(p=>p.id===project.id?project:p)
      : [project,...projects]
    persist(list)
    setActiveProject(project)
  }

  async function createProject(){
    if(!idea.trim()&&!media) return
    const project={
      id:Date.now(),
      title:(idea.trim()||media?.name||'Nova criação').slice(0,58),
      idea:idea.trim(),style:styles[style][0],format,duration,captions,music,voice,brand,
      presenter:usePresenter?people[person][0]:null,
      media,plan:null,status:'Criando direção com IA',createdAt:'agora'
    }
    upsert(project)
    setGeneratedUrl('')
    setRenderError('')
    setTab('studio')
    await createPlan(project)
  }

  async function createPlan(project=activeProject){
    if(!project) return
    setPlanLoading(true);setPlanError('')
    try{
      const res=await fetch('/api/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(project)})
      const data=await res.json()
      if(!res.ok||!data.ok) throw new Error(data.detail||data.error||'Falha ao criar direção')
      upsert({...project,title:data.plan.title||project.title,plan:data.plan,status:'Storyboard criado pela IA'})
    }catch(err){
      setPlanError(humanAIError(err?.message))
      upsert({...project,status:'Projeto preparado'})
    }finally{setPlanLoading(false)}
  }

  function openProject(project){
    setActiveProject(project);setGeneratedUrl('');setRenderError('');setPlanError('');setTab('studio')
  }

  async function renderVideo(){
    const p=activeProject
    if(!p) return
    const seconds=Math.min(15,Math.max(1,parseInt(p.duration)||15))
    setRendering(true);setRenderError('')
    try{
      const sceneText=(p.plan?.scenes||[]).map((s,i)=>`Cena ${i+1}: ${s.generationPrompt||s.visual||''}`).join('\n')
      const prompt=[
        p.plan?.finalPrompt||p.idea||`Vídeo ${p.style} profissional.`,
        sceneText?`Storyboard a seguir; crie transições naturais e continuidade visual:\n${sceneText}`:'',
        p.presenter?`Inclua apresentador ${p.presenter} de forma natural.`:'Não inclua apresentador falando para a câmera, salvo se a ideia exigir.',
        `Duração total: ${seconds} segundos. Formato ${p.format}. Visual coerente, movimento de câmera profissional, sem cortes aleatórios.`
      ].filter(Boolean).join('\n\n')

      const payload={
        prompt,aspectRatio:p.format,duration:seconds,
        imageDataUrl:p.media?.type?.startsWith('image/')?p.media.dataUrl||null:null
      }
      const res=await fetch('/api/video',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      const type=res.headers.get('content-type')||''
      if(!res.ok||!type.includes('video/')){
        let data={};try{data=await res.json()}catch{}
        throw new Error([data.error,data.detail,data.hint].filter(Boolean).join(' '))
      }
      const blob=await res.blob()
      if(generatedUrl) URL.revokeObjectURL(generatedUrl)
      const url=URL.createObjectURL(blob)
      setGeneratedUrl(url)
      upsert({...p,status:`Vídeo IA de ${seconds}s gerado`})
    }catch(err){setRenderError(humanVideoError(err?.message))}
    finally{setRendering(false)}
  }

  return <main className="app-shell v2-shell">
    {tab!=='studio'&&<Header/>}

    {tab==='inicio'&&<div className="content">
      <section className="hero v2-hero"><div><span className="eyebrow"><Sparkles/> LEGACY CREATOR</span><h1>Da ideia ao <em>vídeo pronto.</em></h1><p>Crie direção, cenas e vídeo com IA em um único Studio. O apresentador é opcional.</p></div><div className="hero-badge"><BrainCircuit/><b>IA criativa</b><span>Storyboard → vídeo → MP4</span></div></section>

      <section className="actions">
        <button onClick={()=>input.current?.click()}><ImageIcon/><b>Foto → vídeo</b><small>Anime uma imagem</small></button>
        <button onClick={()=>input.current?.click()}><Video/><b>Usar vídeo</b><small>Material próprio</small></button>
        <button className={usePresenter?'active':''} onClick={()=>setUsePresenter(v=>!v)}><UserRound/><b>Apresentador</b><small>{usePresenter?'Ativado':'Opcional'}</small></button>
        <button onClick={()=>setStyle(2)}><Clapperboard/><b>Cinemático</b><small>Acabamento premium</small></button>
      </section>

      <input ref={input} type="file" accept="image/*,video/*" hidden onChange={pick}/>
      <button className="upload" onClick={()=>input.current?.click()}>{media?<><CheckCircle2/><div><b>{media.name}</b><span>Material adicionado • toque para trocar</span></div><ChevronRight/></>:<><UploadCloud/><div><b>Adicionar foto ou vídeo</b><span>Opcional — também funciona só com uma ideia em texto</span></div><Plus/></>}</button>

      <div className="prompt-block"><div className="field-title"><div><WandSparkles/><b>O que você quer criar?</b></div><span>Escreva naturalmente</span></div><textarea value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Ex.: Um vídeo cinematográfico de um perfume preto sobre uma mesa escura, luz quente lateral, câmera aproximando devagar e clima sofisticado."/><div className="prompt-examples"><button onClick={()=>setIdea('Vídeo cinematográfico com movimentos suaves, detalhes em close, luz quente e atmosfera sofisticada.')}>Cinemático</button><button onClick={()=>setIdea('Vídeo social moderno, dinâmico, com enquadramentos variados, ritmo forte e textos curtos.')}>Social</button><button onClick={()=>setIdea('Vídeo de demonstração mostrando detalhes, funcionamento e diferentes ângulos de forma clara e profissional.')}>Demonstração</button></div></div>

      <SectionTitle title="Direção criativa" subtitle="Escolha um ponto de partida"/>
      <div className="styles">{styles.map(([n,d,I],i)=><button key={n} className={style===i?'selected':''} onClick={()=>setStyle(i)}><I/><div><b>{n}</b><small>{d}</small></div>{style===i?<CheckCircle2/>:<ChevronRight/>}</button>)}</div>

      <SectionTitle title="Formato" subtitle="Onde o vídeo será usado"/>
      <div className="format-row">{formats.map(([f,n,I])=><button key={f} className={format===f?'selected':''} onClick={()=>setFormat(f)}><I/><b>{f}</b><small>{n}</small></button>)}</div>

      <SectionTitle title="Duração do projeto" subtitle="Render direto de até 15s"/>
      <div className="duration-pills"><Clock3/>{durations.map(d=><button key={d} className={duration===d?'selected':''} onClick={()=>setDuration(d)}>{d}</button>)}</div>
      {parseInt(duration)>15&&<div className="duration-note"><AlertCircle/><span>O storyboard será criado para {duration}; nesta fase o render direto gera uma versão de 15s.</span></div>}

      <SectionTitle title="Apresentador IA" subtitle="Opcional e desligado por padrão"/>
      <div className={'presenter-box '+(usePresenter?'on':'')}><button className="presenter-toggle" onClick={()=>setUsePresenter(v=>!v)}><div>{usePresenter?<CheckCircle2/>:<CircleOff/>}</div><span><b>{usePresenter?'Incluir apresentador':'Criar sem apresentador'}</b><small>{usePresenter?'Escolha abaixo quem participa':'Cenas, objetos, ambientes, textos e narração podem formar o vídeo completo'}</small></span><strong>{usePresenter?'ATIVO':'OFF'}</strong></button>{usePresenter&&<div className="people">{people.map(([n,r],i)=><button key={n} className={person===i?'selected':''} onClick={()=>setPerson(i)}><div className="avatar">{n[0]}</div><b>{n}</b><small>{r}</small></button>)}</div>}</div>

      <SectionTitle title="Acabamento" subtitle="Defina a direção do projeto"/>
      <div className="tools-grid"><Tool icon={Captions} title="Legendas" on={captions} click={()=>setCaptions(v=>!v)}/><Tool icon={Music2} title="Trilha" on={music} click={()=>setMusic(v=>!v)}/><Tool icon={Mic2} title="Voz IA" on={voice} click={()=>setVoice(v=>!v)}/><Tool icon={Palette} title="Kit de marca" on={brand} click={()=>setBrand(v=>!v)}/></div>

      <button className="create" disabled={!idea.trim()&&!media} onClick={createProject}><Sparkles/> Criar projeto com IA <ChevronRight/></button><p className="note">Primeiro a IA cria a direção e o storyboard. Você revisa antes de gastar créditos com o vídeo.</p>
    </div>}

    {tab==='studio'&&activeProject&&<Studio project={activeProject} planLoading={planLoading} planError={planError} retry={()=>createPlan(activeProject)} generatedUrl={generatedUrl} rendering={rendering} renderError={renderError} render={renderVideo} back={()=>setTab('inicio')}/>} 
    {tab==='projetos'&&<Projects projects={projects} open={openProject} create={()=>setTab('inicio')}/>} 
    {tab==='personagens'&&<Characters/>}
    {tab==='produtos'&&<Empty icon={Library} title="Biblioteca criativa" text="Fotos, vídeos, logos, trilhas e referências reutilizáveis poderão ficar organizados aqui." go={()=>setTab('inicio')}/>} 
    {tab!=='studio'&&<BottomNav tab={tab} setTab={setTab}/>} 
  </main>
}

function Header(){return <header><div className="logo"><span>LS</span></div><div className="brand"><b>LEGACY</b><strong>CREATOR</strong><small>Seu estúdio criativo com IA</small></div><div className="credit"><Sparkles/> AI Studio</div></header>}

function Studio({project,planLoading,planError,retry,generatedUrl,rendering,renderError,render,back}){
  const scenes=project.plan?.scenes||fallbackScenes(parseInt(project.duration)||15)
  const renderSeconds=Math.min(15,parseInt(project.duration)||15)
  return <div className="studio-page">
    <div className="studio-top"><button onClick={back}><ArrowLeft/></button><div><small>LEGACY CREATOR STUDIO</small><h2>{project.plan?.title||project.title}</h2></div><button><Settings2/></button></div>
    <div className="studio-body">
      <section className="preview-panel"><div className={'video-preview '+(generatedUrl?'has-video':'')} data-format={project.format}>{generatedUrl?<video src={generatedUrl} controls playsInline/>:project.media?.url?(project.media.type?.startsWith('video')?<video src={project.media.url} muted playsInline/>:<img src={project.media.url} alt="Material"/>):<div className="preview-empty"><Sparkles/><b>{planLoading?'Criando direção…':'Pronto para criar'}</b><span>{project.style}</span></div>}{!generatedUrl&&<div className="preview-overlay"><span>{project.format} • {project.duration}</span><b>{project.presenter?'COM APRESENTADOR':'SEM APRESENTADOR'}</b></div>}</div>{generatedUrl&&<a className="download-video" href={generatedUrl} download="legacy-creator-video.mp4"><Download/> Baixar vídeo MP4</a>}</section>

      <section className="studio-card ai-direction"><div className="studio-card-head"><div><small>DIREÇÃO CRIATIVA</small><h3>{planLoading?'Criando com IA…':project.plan?'Plano gerado pela IA':'Direção do projeto'}</h3></div>{planLoading?<LoaderCircle className="spin"/>:<BrainCircuit/>}</div>{planLoading&&<div className="ai-progress"><span/><span/><span/><p>Analisando ideia, estilo, duração e cenas…</p></div>}{planError&&<div className="error-box"><AlertCircle/><div><b>A IA não respondeu</b><span>{planError}</span></div><button onClick={retry}><RefreshCw/> Tentar novamente</button></div>}{project.plan?<><p className="concept">{project.plan.concept}</p><div className="chips"><span>{project.style}</span><span>{project.format}</span><span>{project.duration}</span><span>{project.presenter?'Com '+project.presenter:'Sem apresentador'}</span></div><div className="plan-meta"><div><small>ABERTURA</small><b>{project.plan.openingHook}</b></div><div><small>DIREÇÃO VISUAL</small><b>{project.plan.visualDirection}</b></div><div><small>TRILHA</small><b>{project.plan.musicMood}</b></div></div></>:!planLoading&&<p>{project.idea||'Criação baseada no material enviado.'}</p>}</section>

      <section className="studio-card"><div className="studio-card-head"><div><small>STORYBOARD</small><h3>{project.plan?'Cenas criadas pela IA':'Cenas sugeridas'}</h3></div><button onClick={retry} disabled={planLoading}><RefreshCw/> Recriar</button></div><div className="scene-list">{scenes.map((s,i)=><Scene key={i} n={String(i+1).padStart(2,'0')} scene={s}/>)}</div></section>

      <section className="studio-card render-card"><div className="render-copy"><small>GERAÇÃO REAL</small><h3>Gerar vídeo de {renderSeconds}s</h3><p>O Studio usa o storyboard acima para criar um único MP4 com continuidade visual. Não precisa de Cloudinary nem de outro login.</p></div>{renderError&&<div className="error-box compact"><AlertCircle/><div><b>Não foi possível gerar</b><span>{renderError}</span></div></div>}<button className="render-button" onClick={render} disabled={rendering||planLoading}>{rendering?<><LoaderCircle className="spin"/> Gerando vídeo… pode levar alguns minutos</>:<><Zap/> Gerar vídeo real de {renderSeconds}s</>}</button><p className="render-foot">A geração só consome créditos quando você tocar no botão.</p></section>
    </div>
  </div>
}

function Scene({n,scene}){return <div className="scene"><span>{n}</span><div><b>{scene.title}</b><p>{scene.visual||scene.text}</p>{scene.camera&&<em>{scene.camera}</em>}{scene.narration&&<small>Voz: “{scene.narration}”</small>}</div><strong>{scene.seconds}s</strong></div>}
function Tool({icon:I,title,on,click}){return <button className={on?'on':''} onClick={click}><I/><span><b>{title}</b><small>{on?'Ativado':'Desativado'}</small></span><strong>{on?'ON':'OFF'}</strong></button>}
function SectionTitle({title,subtitle}){return <div className="title"><b>{title}</b><span>{subtitle}</span></div>}
function BottomNav({tab,setTab}){return <nav><Nav on={()=>setTab('inicio')} active={tab==='inicio'} icon={Home} text="Início"/><Nav on={()=>setTab('projetos')} active={tab==='projetos'} icon={Folder} text="Projetos"/><button className="fab" onClick={()=>setTab('inicio')}><Plus/></button><Nav on={()=>setTab('personagens')} active={tab==='personagens'} icon={Users} text="Personagens"/><Nav on={()=>setTab('produtos')} active={tab==='produtos'} icon={Library} text="Biblioteca"/></nav>}
function Nav({on,active,icon:I,text}){return <button onClick={on} className={active?'active':''}><I/><span>{text}</span></button>}
function Projects({projects,open,create}){return <div className="library-page"><div className="page-head"><div><small>PROJETOS</small><h2>Minhas criações</h2></div><button onClick={create}><Plus/> Novo</button></div>{projects.length?<div className="project-list">{projects.map(p=><button key={p.id} className="project-card" onClick={()=>open(p)}><div className="project-thumb"><Film/><span><Play/></span></div><div><b>{p.plan?.title||p.title}</b><small>{p.style} • {p.format} • {p.duration}</small><em>{p.status||'Projeto'}</em></div><ChevronRight/></button>)}</div>:<Empty icon={Folder} title="Nenhum projeto ainda" text="Crie sua primeira ideia e a IA monta o storyboard para você." go={create}/>}</div>}
function Characters(){return <div className="library-page"><div className="page-head"><div><small>PERSONAGENS</small><h2>Apresentadores IA</h2></div><span className="optional-pill">Opcional</span></div><div className="character-info"><CircleOff/><div><b>Personagem não é obrigatório</b><p>Você pode produzir vídeos inteiros apenas com cenas, produtos, ambientes, narração e textos.</p></div></div><div className="people character-page">{people.map(([n,r])=><button key={n}><div className="avatar">{n[0]}</div><b>{n}</b><small>{r}</small></button>)}</div></div>}
function Empty({icon:I,title,text,go}){return <div className="empty"><I/><h2>{title}</h2><p>{text}</p>{go&&<button onClick={go}><Plus/> Começar criação</button>}</div>}
function fallbackScenes(total){const a=Math.max(2,Math.round(total*.25)),b=Math.max(3,Math.round(total*.5)),c=Math.max(2,total-a-b);return [{title:'Abertura',seconds:a,visual:'Plano forte para estabelecer assunto e atmosfera.',camera:'Aproximação suave'},{title:'Desenvolvimento',seconds:b,visual:'Detalhes, contexto e variação de enquadramentos.',camera:'Close e plano médio'},{title:'Fechamento',seconds:c,visual:'Conclusão limpa e memorável.',camera:'Movimento desacelerando'}]}
async function imageForAI(file){if(file.size<=2200000)return await readDataUrl(file);const source=await readDataUrl(file);const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=source});const max=1280,scale=Math.min(1,max/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.78)}
function readDataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}
function humanAIError(msg=''){if(/credit|billing|payment|gateway/i.test(msg))return 'A criação do storyboard precisa de créditos habilitados no AI Gateway da Vercel.';return msg||'A direção não foi criada agora. Tente novamente.'}
function humanVideoError(msg=''){if(/credit|billing|payment|paid|gateway|402|403/i.test(msg))return 'A geração de vídeo exige créditos/faturamento do AI Gateway habilitados na Vercel.';if(/timeout/i.test(msg))return 'A geração demorou além do limite. Tente novamente em alguns minutos.';return msg||'A geração não foi concluída. Tente novamente.'}
