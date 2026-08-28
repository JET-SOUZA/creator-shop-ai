'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkles, UploadCloud, Image as ImageIcon, Video, UserRound, Clapperboard, Smartphone, Square, Monitor, CheckCircle2, CircleOff, Captions, Music2, Mic2, Palette, ChevronRight, ArrowLeft, Download, LoaderCircle, Zap, BrainCircuit, Play, RefreshCw, Folder, Home, Users, Library, Plus, AlertCircle } from 'lucide-react'

const styles=[['UGC Natural','Espontâneo e humano',UserRound],['Social Dinâmico','Rápido e envolvente',Sparkles],['Cinemático','Profundidade e acabamento premium',Clapperboard],['Demonstração','Detalhes, uso e contexto',Video]]
const formats=[['9:16','Vertical',Smartphone],['1:1','Quadrado',Square],['16:9','Horizontal',Monitor]]

export default function LegacyCreatorClient(){
  const input=useRef(null)
  const [mode,setMode]=useState('free')
  const [media,setMedia]=useState(null)
  const [idea,setIdea]=useState('')
  const [style,setStyle]=useState(2)
  const [format,setFormat]=useState('9:16')
  const [duration,setDuration]=useState('10s')
  const [presenter,setPresenter]=useState(false)
  const [captions,setCaptions]=useState(true)
  const [music,setMusic]=useState(true)
  const [voice,setVoice]=useState(false)
  const [brand,setBrand]=useState(false)
  const [tab,setTab]=useState('inicio')
  const [project,setProject]=useState(null)
  const [projects,setProjects]=useState([])
  const [creating,setCreating]=useState(false)
  const [rendering,setRendering]=useState(false)
  const [progress,setProgress]=useState(0)
  const [videoUrl,setVideoUrl]=useState('')
  const [error,setError]=useState('')

  useEffect(()=>{try{setProjects(JSON.parse(localStorage.getItem('legacyProjects')||'[]'))}catch{}},[])
  useEffect(()=>()=>{if(videoUrl)URL.revokeObjectURL(videoUrl)},[videoUrl])

  function pick(e){const f=e.target.files?.[0];if(!f)return;setMedia({file:f,name:f.name,type:f.type,url:URL.createObjectURL(f)})}
  function saveProject(p){const safe={...p,media:p.media?{name:p.media.name,type:p.media.type}:null};const list=[safe,...projects.filter(x=>x.id!==p.id)].slice(0,20);setProjects(list);try{localStorage.setItem('legacyProjects',JSON.stringify(list))}catch{}}

  async function create(){
    if(!media&&!idea.trim())return
    setCreating(true);setError('');setVideoUrl('')
    const p={id:Date.now(),mode,idea:idea.trim(),style:styles[style][0],format,duration,presenter,captions,music,voice,brand,media,createdAt:new Date().toLocaleString('pt-BR')}
    if(mode==='free'){
      p.plan=localPlan(p);p.title=p.plan.title;p.status='Pronto para render grátis';setProject(p);saveProject(p);setTab('studio');setCreating(false);return
    }
    try{
      const r=await fetch('/api/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)})
      const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.detail||d.error)
      p.plan=d.plan;p.title=d.plan.title;p.status='Storyboard criado pela IA'
      setProject(p);saveProject(p);setTab('studio')
    }catch(e){p.plan=localPlan(p);p.title=p.plan.title;p.status='Storyboard local — IA sem créditos';setProject(p);saveProject(p);setTab('studio');setError('A IA generativa está sem créditos. Você ainda pode trocar para o modo Gratuito e gerar o vídeo sem custo.')}
    setCreating(false)
  }

  async function render(){
    if(!project)return
    setRendering(true);setProgress(0);setError('');if(videoUrl){URL.revokeObjectURL(videoUrl);setVideoUrl('')}
    try{
      if(project.mode==='free'){
        if(!project.media?.file) throw new Error('No modo gratuito, adicione uma foto ou vídeo para renderizar.')
        const blob=await renderLocal(project,setProgress)
        setVideoUrl(URL.createObjectURL(blob));setRendering(false);setProgress(100);return
      }
      const prompt=project.plan?.finalPrompt||project.idea
      const seconds=Math.min(15,parseInt(project.duration)||10)
      const body={prompt,aspectRatio:project.format,duration:seconds}
      if(project.media?.file?.type?.startsWith('image/')) body.imageDataUrl=await fileToDataUrl(project.media.file)
      const r=await fetch('/api/video',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      const ct=r.headers.get('content-type')||''
      if(!r.ok||!ct.includes('video/')){let d={};try{d=await r.json()}catch{};throw new Error(d.detail||d.error||'A IA generativa não respondeu.')}
      const blob=await r.blob();setVideoUrl(URL.createObjectURL(blob));setProgress(100)
    }catch(e){setError(String(e.message||e))}
    setRendering(false)
  }

  if(tab==='studio'&&project)return <Studio project={project} back={()=>setTab('inicio')} render={render} rendering={rendering} progress={progress} videoUrl={videoUrl} error={error} setModeFree={()=>{const p={...project,mode:'free',plan:localPlan({...project,mode:'free'}),status:'Pronto para render grátis'};setProject(p);setError('')}}/>

  return <main className="app-shell v2-shell"><Header/>
    {tab==='inicio'&&<div className="content">
      <section className="hero v2-hero"><div><span className="eyebrow"><Sparkles/> LEGACY CREATOR</span><h1>Do material ao <em>vídeo pronto.</em></h1><p>Escolha o motor: gratuito no seu dispositivo ou IA generativa opcional.</p></div></section>

      <div className="mode-switch">
        <button className={mode==='free'?'active':''} onClick={()=>setMode('free')}><span>GRÁTIS</span><b>Creator Free</b><small>Sem créditos • render no aparelho</small></button>
        <button className={mode==='ai'?'active ai':''} onClick={()=>setMode('ai')}><span>IA</span><b>Generativo</b><small>Cria novas cenas • pode ter custo</small></button>
      </div>
      <div className={'mode-note '+mode}>{mode==='free'?<><CheckCircle2/><span><b>Modo gratuito ativo.</b> Zoom, pan, movimento, textos animados e exportação acontecem no seu aparelho.</span></>:<><BrainCircuit/><span><b>IA Generativa.</b> Storyboard e vídeo podem usar créditos do AI Gateway. Nada é cobrado sem você mandar gerar.</span></>}</div>

      <section className="actions"><button onClick={()=>input.current?.click()}><ImageIcon/><b>Foto → vídeo</b><small>Anime uma imagem</small></button><button onClick={()=>input.current?.click()}><Video/><b>Vídeo → edição</b><small>Use material próprio</small></button><button className={presenter?'active':''} onClick={()=>setPresenter(v=>!v)}><UserRound/><b>Apresentador</b><small>{presenter?'Ativado':'Opcional'}</small></button><button onClick={()=>setStyle(2)}><Clapperboard/><b>Cinemático</b><small>Acabamento premium</small></button></section>
      <input ref={input} type="file" accept="image/*,video/*" hidden onChange={pick}/>
      <button className="upload" onClick={()=>input.current?.click()}>{media?<><CheckCircle2/><div><b>{media.name}</b><span>Arquivo pronto • toque para trocar</span></div><ChevronRight/></>:<><UploadCloud/><div><b>Adicionar foto ou vídeo</b><span>{mode==='free'?'Necessário para render grátis':'Opcional no modo generativo'}</span></div><Plus/></>}</button>

      <div className="prompt-block"><div className="field-title"><div><Sparkles/><b>Descreva o resultado</b></div><span>Ex.: letras dançando, zoom suave, clima moderno</span></div><textarea value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Ex.: Quero essas letras dançando e se mexendo, com zoom suave e movimento moderno."/><div className="prompt-examples"><button onClick={()=>setIdea('Texto dançando com movimento suave, zoom aproximando e energia moderna.')}>Texto dançando</button><button onClick={()=>setIdea('Movimento cinematográfico lento, zoom suave e acabamento elegante.')}>Cinemático</button><button onClick={()=>setIdea('Movimento rápido, pulsação e energia para redes sociais.')}>Dinâmico</button></div></div>

      <Section title="Direção criativa" sub="Escolha um estilo"/><div className="styles">{styles.map(([n,d,I],i)=><button key={n} className={style===i?'selected':''} onClick={()=>setStyle(i)}><I/><div><b>{n}</b><small>{d}</small></div>{style===i?<CheckCircle2/>:<ChevronRight/>}</button>)}</div>
      <Section title="Formato" sub="Onde será publicado"/><div className="format-row">{formats.map(([f,n,I])=><button key={f} className={format===f?'selected':''} onClick={()=>setFormat(f)}><I/><b>{f}</b><small>{n}</small></button>)}</div>
      <Section title="Duração" sub={mode==='free'?'5 a 15s no render local':'até 15s por geração'}/><div className="duration-pills">{['5s','10s','15s'].map(d=><button key={d} className={duration===d?'selected':''} onClick={()=>setDuration(d)}>{d}</button>)}</div>
      <Section title="Apresentador IA" sub="Sempre opcional"/><div className={'presenter-box '+(presenter?'on':'')}><button className="presenter-toggle" onClick={()=>setPresenter(v=>!v)}><div>{presenter?<CheckCircle2/>:<CircleOff/>}</div><span><b>{presenter?'Incluir apresentador':'Criar sem apresentador'}</b><small>{mode==='free'?'No gratuito, usamos seu próprio material sem avatar gerado':'No generativo, avatar pode ser integrado depois'}</small></span><strong>{presenter?'ATIVO':'OFF'}</strong></button></div>
      <Section title="Acabamento" sub="Recursos do projeto"/><div className="tools-grid"><Tool I={Captions} t="Texto animado" on={captions} fn={()=>setCaptions(v=>!v)}/><Tool I={Music2} t="Ritmo visual" on={music} fn={()=>setMusic(v=>!v)}/><Tool I={Mic2} t="Voz IA" on={voice} fn={()=>setVoice(v=>!v)}/><Tool I={Palette} t="Marca" on={brand} fn={()=>setBrand(v=>!v)}/></div>
      <button className="create" disabled={creating||(!media&&!idea.trim())||(mode==='free'&&!media)} onClick={create}>{creating?<><LoaderCircle className="spin"/> Preparando…</>:<><Sparkles/> {mode==='free'?'Criar vídeo grátis':'Criar com IA'} <ChevronRight/></>}</button>
      <p className="note">No gratuito, nenhuma API paga é usada.</p>
    </div>}
    {tab==='projetos'&&<Projects projects={projects} open={p=>{setProject({...p,media:null});setTab('studio')}}/>}
    {tab==='personagens'&&<Empty title="Personagens são opcionais" text="O app funciona normalmente sem personagem. Esta área receberá avatares quando você quiser usar esse recurso."/>}
    {tab==='biblioteca'&&<Empty title="Biblioteca" text="Seus materiais reutilizáveis ficarão aqui em uma próxima etapa."/>}
    <nav><Nav I={Home} t="Início" a={tab==='inicio'} fn={()=>setTab('inicio')}/><Nav I={Folder} t="Projetos" a={tab==='projetos'} fn={()=>setTab('projetos')}/><button className="fab" onClick={()=>setTab('inicio')}><Plus/></button><Nav I={Users} t="Personagens" a={tab==='personagens'} fn={()=>setTab('personagens')}/><Nav I={Library} t="Biblioteca" a={tab==='biblioteca'} fn={()=>setTab('biblioteca')}/></nav>
  </main>
}

function Header(){return <header><div className="logo"><span>LS</span></div><div className="brand"><b>LEGACY</b><strong>CREATOR</strong><small>Studio de vídeo com IA + modo grátis</small></div><div className="credit"><Sparkles/> Studio</div></header>}
function Section({title,sub}){return <div className="title"><b>{title}</b><span>{sub}</span></div>}
function Tool({I,t,on,fn}){return <button className={on?'on':''} onClick={fn}><I/><span><b>{t}</b><small>{on?'Ativado':'Desativado'}</small></span><strong>{on?'ON':'OFF'}</strong></button>}
function Nav({I,t,a,fn}){return <button className={a?'active':''} onClick={fn}><I/><span>{t}</span></button>}
function Empty({title,text}){return <div className="empty"><Sparkles/><h2>{title}</h2><p>{text}</p></div>}
function Projects({projects,open}){return <div className="library-page"><div className="page-head"><div><small>PROJETOS</small><h2>Minhas criações</h2></div></div>{projects.length?projects.map(p=><button className="project-card" key={p.id} onClick={()=>open(p)}><Play/><div><b>{p.title||p.idea||'Projeto'}</b><small>{p.mode==='free'?'Grátis':'IA'} • {p.format} • {p.duration}</small></div><ChevronRight/></button>):<Empty title="Nenhum projeto ainda" text="Crie o primeiro vídeo na tela inicial."/>}</div>}

function Studio({project,back,render,rendering,progress,videoUrl,error,setModeFree}){
 const scenes=project.plan?.scenes||localPlan(project).scenes
 return <div className="studio-page"><div className="studio-top"><button onClick={back}><ArrowLeft/></button><div><small>LEGACY CREATOR STUDIO</small><h2>{project.title||'Novo vídeo'}</h2></div><span className={'studio-mode '+project.mode}>{project.mode==='free'?'GRÁTIS':'IA'}</span></div><div className="studio-body">
   <section className="preview-panel"><div className="video-preview">{videoUrl?<video src={videoUrl} controls playsInline/>:project.media?.url?(project.media.type?.startsWith('video')?<video src={project.media.url} muted playsInline/>:<img src={project.media.url} alt="prévia"/>):<div className="preview-empty"><Sparkles/><b>Pronto para criar</b></div>}<div className="preview-overlay"><span>{project.format} • {project.duration}</span><b>{project.mode==='free'?'RENDER LOCAL':'IA GENERATIVA'}</b></div></div>{videoUrl&&<a className="download-video" href={videoUrl} download={`legacy-creator-${Date.now()}.${videoUrl?'webm':'mp4'}`}><Download/> Baixar vídeo</a>}</section>
   <section className="studio-card"><div className="studio-card-head"><div><small>DIREÇÃO</small><h3>{project.mode==='free'?'Plano automático gratuito':'Storyboard do projeto'}</h3></div><BrainCircuit/></div><p className="concept">{project.plan?.concept||'Movimento, ritmo e acabamento aplicados ao seu material.'}</p><div className="chips"><span>{project.style}</span><span>{project.format}</span><span>{project.duration}</span><span>{project.presenter?'Com apresentador':'Sem apresentador'}</span></div></section>
   <section className="studio-card"><div className="studio-card-head"><div><small>STORYBOARD</small><h3>Cenas</h3></div><RefreshCw/></div><div className="scene-list">{scenes.map((s,i)=><div className="scene" key={i}><span>{String(i+1).padStart(2,'0')}</span><div><b>{s.title}</b><p>{s.visual}</p></div><strong>{s.seconds}s</strong></div>)}</div></section>
   {error&&<div className="error-box"><AlertCircle/><div><b>Não foi possível concluir</b><span>{error}</span></div>{project.mode==='ai'&&<button onClick={setModeFree}>Usar modo grátis</button>}</div>}
   {rendering&&<div className="render-progress"><div><span style={{width:`${progress}%`}}/></div><b>{progress}%</b><small>Renderizando no {project.mode==='free'?'seu aparelho':'motor de IA'}…</small></div>}
   <button className="render-button" onClick={render} disabled={rendering}>{rendering?<><LoaderCircle className="spin"/> Renderizando…</>:<><Zap/> {project.mode==='free'?'Gerar vídeo grátis':'Gerar vídeo com IA'}</>}</button>
   <p className="note">{project.mode==='free'?'Sem créditos, sem API paga. O processamento acontece no navegador.':'O modo generativo depende de créditos do provedor.'}</p>
 </div></div>
}

function localPlan(p){const total=Math.min(15,parseInt(p.duration)||10),a=Math.max(2,Math.round(total*.25)),b=Math.max(2,Math.round(total*.45)),c=Math.max(1,total-a-b);return{title:(p.idea||p.media?.name||'Criação Legacy').slice(0,52),concept:p.idea||'Vídeo animado com movimento de câmera e acabamento moderno.',scenes:[{title:'Entrada',seconds:a,visual:'Zoom suave e entrada do texto.'},{title:'Movimento',seconds:b,visual:'Pan, pulsação e movimento visual seguindo o estilo.'},{title:'Fechamento',seconds:c,visual:'Desaceleração e quadro final limpo.'}],finalPrompt:p.idea}}
function fileToDataUrl(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)})}

async function renderLocal(p,onProgress){
 const seconds=Math.min(15,parseInt(p.duration)||10),fps=30
 const [w,h]=p.format==='1:1'?[720,720]:p.format==='16:9'?[960,540]:[540,960]
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d')
 const source=await loadSource(p.media.file,p.media.url)
 if(!canvas.captureStream||!window.MediaRecorder)throw new Error('Este navegador não oferece o gravador necessário. Tente no Chrome/Safari atualizado ou no computador.')
 const stream=canvas.captureStream(fps)
 const types=['video/mp4;codecs=h264','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm']
 const mime=types.find(t=>MediaRecorder.isTypeSupported?.(t))||''
 const chunks=[];const rec=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:5000000}:{videoBitsPerSecond:5000000})
 rec.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)}
 const done=new Promise((res,rej)=>{rec.onstop=()=>res(new Blob(chunks,{type:rec.mimeType||'video/webm'}));rec.onerror=()=>rej(new Error('Falha ao finalizar o vídeo.'))})
 rec.start(250)
 const start=performance.now(),duration=seconds*1000
 if(source.kind==='video'){source.el.currentTime=0;source.el.muted=true;source.el.loop=true;try{await source.el.play()}catch{}}
 await new Promise(resolve=>{function frame(now){const t=Math.min(1,(now-start)/duration);drawFrame(ctx,source,w,h,t,p);onProgress(Math.round(t*100));if(t<1)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)})
 if(source.kind==='video')source.el.pause();rec.stop();return await done
}

function drawFrame(ctx,source,w,h,t,p){ctx.fillStyle='#050505';ctx.fillRect(0,0,w,h);const el=source.el,sw=el.videoWidth||el.naturalWidth,sh=el.videoHeight||el.naturalHeight;const pulse=.025*Math.sin(t*Math.PI*6),zoom=1.02+t*.10+pulse;const scale=Math.max(w/sw,h/sh)*zoom,dw=sw*scale,dh=sh*scale;const panX=Math.sin(t*Math.PI*2)*w*.025,panY=Math.cos(t*Math.PI*2)*h*.018;ctx.save();ctx.translate(w/2+panX,h/2+panY);ctx.drawImage(el,-dw/2,-dh/2,dw,dh);ctx.restore();const g=ctx.createLinearGradient(0,h*.55,0,h);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.72)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);if(p.captions&&p.idea){const dance=1+.04*Math.sin(t*Math.PI*10);ctx.save();ctx.translate(w/2,h*.78+Math.sin(t*Math.PI*8)*8);ctx.scale(dance,dance);ctx.textAlign='center';ctx.fillStyle='white';ctx.font=`800 ${Math.max(26,w*.055)}px system-ui`;wrapText(ctx,p.idea,w*.82,Math.max(30,w*.065));ctx.restore()}ctx.fillStyle='#ff7900';ctx.fillRect(w*.08,h*.94,w*.18,5)}
function wrapText(ctx,text,maxWidth,lineHeight){const words=text.split(/\s+/);let line='',lines=[];for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);lines.slice(0,3).forEach((l,i)=>ctx.fillText(l,0,(i-(Math.min(lines.length,3)-1)/2)*lineHeight))}
function loadSource(file,url){return new Promise((res,rej)=>{if(file.type.startsWith('video/')){const v=document.createElement('video');v.src=url;v.playsInline=true;v.muted=true;v.onloadedmetadata=()=>res({kind:'video',el:v});v.onerror=()=>rej(new Error('Não foi possível ler o vídeo.'))}else{const i=new Image();i.src=url;i.onload=()=>res({kind:'image',el:i});i.onerror=()=>rej(new Error('Não foi possível ler a imagem.'))}})}