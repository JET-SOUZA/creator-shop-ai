'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Home, Folder, Users, Library, Image as ImageIcon, Video, UserRound, Clapperboard,
  UploadCloud, Sparkles, CheckCircle2, ChevronRight, Plus, WandSparkles, Layers3,
  Captions, Music2, Mic2, Palette, Smartphone, Square, Monitor, Clock3,
  SlidersHorizontal, ArrowLeft, Play, Settings2, Film, Copy, RefreshCw, Download,
  CircleOff, X
} from 'lucide-react'

const styles=[
  ['UGC Natural','Apresentação espontânea e autêntica',UserRound],
  ['Social Dinâmico','Ritmo rápido e visual envolvente',Layers3],
  ['Cinemático','Movimento, profundidade e acabamento premium',Clapperboard],
  ['Demonstração','Mostre detalhes, uso e contexto',Video]
]
const people=[['Bruno','Natural'],['Carla','Elegante'],['Jonas','Técnico'],['Juliana','Lifestyle']]
const formats=[['9:16','Vertical',Smartphone],['1:1','Quadrado',Square],['16:9','Horizontal',Monitor]]

export default function Page(){
 const input=useRef(null)
 const [media,setMedia]=useState(null)
 const [idea,setIdea]=useState('')
 const [style,setStyle]=useState(0)
 const [usePresenter,setUsePresenter]=useState(false)
 const [person,setPerson]=useState(0)
 const [tab,setTab]=useState('inicio')
 const [format,setFormat]=useState('9:16')
 const [duration,setDuration]=useState('20s')
 const [captions,setCaptions]=useState(true)
 const [music,setMusic]=useState(true)
 const [voice,setVoice]=useState(true)
 const [brand,setBrand]=useState(false)
 const [projects,setProjects]=useState([])
 const [activeProject,setActiveProject]=useState(null)
 const [previewing,setPreviewing]=useState(false)
 const [previewReady,setPreviewReady]=useState(false)
 const [showEngine,setShowEngine]=useState(false)

 useEffect(()=>{
   try{setProjects(JSON.parse(localStorage.getItem('legacyCreatorProjects')||'[]'))}catch{}
 },[])

 const pick=e=>{
   const f=e.target.files?.[0]
   if(f)setMedia({name:f.name,url:URL.createObjectURL(f),type:f.type})
 }

 function persist(list){setProjects(list);try{localStorage.setItem('legacyCreatorProjects',JSON.stringify(list.map(p=>({...p,media:p.media?{...p.media,url:null}:null}))))}catch{}}

 function createProject(){
   if(!idea.trim() && !media) return
   const chosen=styles[style]
   const p={
     id:Date.now(),
     title:(idea.trim()||media?.name||'Novo vídeo').slice(0,52),
     idea:idea.trim(),style:chosen[0],format,duration,captions,music,voice,brand,
     presenter:usePresenter?people[person][0]:null,
     media,
     status:'Projeto preparado',
     createdAt:'agora'
   }
   persist([p,...projects])
   setActiveProject(p);setPreviewReady(false);setTab('studio')
 }

 function openProject(p){setActiveProject(p);setPreviewReady(false);setTab('studio')}

 async function generatePreview(){
   setPreviewing(true);setPreviewReady(false)
   await new Promise(r=>setTimeout(r,1800))
   setPreviewing(false);setPreviewReady(true)
 }

 return <main>
  <header>
    <div className="logo"><span>LS</span></div>
    <div className="brand"><b>LEGACY</b><strong>CREATOR</strong><small>Seu estúdio criativo com IA</small></div>
    <div className="credit">✦ 120</div>
  </header>

  {tab==='inicio'&&<div className="content">
   <section className="hero"><div><h1>CRIE VÍDEOS<br/><em>PROFISSIONAIS</em><br/>COM IA</h1><p>Transforme fotos, vídeos e ideias em conteúdos marcantes, prontos para publicar.</p></div><div className="solar"><span>✦</span><b>Mais criatividade.<br/><em>Mais agilidade.</em><br/>Mais possibilidades.</b></div></section>

   <section className="actions">
    <button onClick={()=>input.current?.click()}><ImageIcon/><b>Criar com foto</b></button>
    <button onClick={()=>input.current?.click()}><Video/><b>Criar com vídeo</b></button>
    <button onClick={()=>setUsePresenter(v=>!v)}><UserRound/><b>Apresentador IA</b><small>{usePresenter?'Ativado':'Opcional'}</small></button>
    <button onClick={()=>setStyle(2)}><Clapperboard/><b>Vídeo premium</b></button>
   </section>

   <input ref={input} type="file" accept="image/*,video/*" hidden onChange={pick}/>
   <button className="upload" onClick={()=>input.current?.click()}>{media?<><CheckCircle2/><div><b>{media.name}</b><span>Arquivo carregado • toque para trocar</span></div></>:<><UploadCloud/><div><b>Adicione uma foto ou vídeo</b><span>Imagem, produto, pessoa ou cena — opcional</span></div><Plus/></>}</button>

   <div className="prompt"><textarea value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Descreva sua ideia. Ex.: Crie um vídeo moderno de 20 segundos, movimentos suaves, texto elegante, cenas realistas e trilha inspiradora."/><WandSparkles/></div>

   <div className="title"><b>Estilo</b><span>Escolha a direção criativa</span></div>
   <div className="styles">{styles.map(([n,d,I],i)=><button className={style===i?'selected':''} onClick={()=>setStyle(i)} key={n}><I/><div><b>{n}</b><small>{d}</small></div>{style===i?<CheckCircle2/>:<ChevronRight/>}</button>)}</div>

   <div className="title"><b>Formato e duração</b><span>Pronto para cada plataforma</span></div>
   <div className="format-row">{formats.map(([f,n,I])=><button key={f} className={format===f?'selected':''} onClick={()=>setFormat(f)}><I/><b>{f}</b><small>{n}</small></button>)}</div>
   <div className="duration-row"><Clock3/><span>Duração</span>{['10s','20s','30s','60s'].map(d=><button key={d} className={duration===d?'selected':''} onClick={()=>setDuration(d)}>{d}</button>)}</div>

   <div className="title"><b>Apresentador IA</b><span>Opcional</span></div>
   <div className={'presenter-box '+(usePresenter?'on':'')}>
    <button className="presenter-toggle" onClick={()=>setUsePresenter(v=>!v)}><div>{usePresenter?<CheckCircle2/>:<CircleOff/>}</div><span><b>{usePresenter?'Usar apresentador':'Sem apresentador'}</b><small>{usePresenter?'O personagem fará parte do vídeo':'O vídeo será criado só com cenas, imagens, textos e voz opcional'}</small></span><strong>{usePresenter?'ATIVO':'DESLIGADO'}</strong></button>
    {usePresenter&&<div className="people">{people.map(([n,r],i)=><button className={person===i?'selected':''} onClick={()=>setPerson(i)} key={n}><div className="avatar">{n[0]}</div><b>{n}</b><small>{r}</small></button>)}</div>}
   </div>

   <div className="title"><b>Acabamento</b><span>Personalize antes de criar</span></div>
   <div className="tools-grid">
    <Tool icon={Captions} title="Legendas" on={captions} click={()=>setCaptions(v=>!v)}/>
    <Tool icon={Music2} title="Trilha" on={music} click={()=>setMusic(v=>!v)}/>
    <Tool icon={Mic2} title="Voz IA" on={voice} click={()=>setVoice(v=>!v)}/>
    <Tool icon={Palette} title="Kit de marca" on={brand} click={()=>setBrand(v=>!v)}/>
   </div>

   <button className="create" disabled={!idea.trim()&&!media} onClick={createProject}><Sparkles/> Criar projeto de vídeo</button>
   <p className="note">Você revisa tudo no Studio antes da geração final.</p>
  </div>}

  {tab==='studio'&&activeProject&&<Studio project={activeProject} previewing={previewing} previewReady={previewReady} back={()=>setTab('inicio')} generatePreview={generatePreview} openEngine={()=>setShowEngine(true)}/>} 

  {tab==='projetos'&&<div className="library-page"><div className="page-head"><div><small>BIBLIOTECA</small><h2>Meus projetos</h2></div><button onClick={()=>setTab('inicio')}><Plus/> Novo</button></div>{projects.length?<div className="project-list">{projects.map(p=><button key={p.id} className="project-card" onClick={()=>openProject(p)}><div className="project-thumb">{p.media?.url?<img src={p.media.url} alt=""/>:<Film/>}<span><Play/></span></div><div><b>{p.title}</b><small>{p.style} • {p.format} • {p.duration}</small><em>{p.presenter?'Com '+p.presenter:'Sem apresentador'}</em></div><ChevronRight/></button>)}</div>:<Empty icon={Folder} title="Seus projetos" text="Crie seu primeiro projeto e ele ficará salvo aqui para continuar depois." go={()=>setTab('inicio')}/>}</div>}

  {tab==='personagens'&&<div className="library-page"><div className="page-head"><div><small>PERSONAGENS</small><h2>Apresentadores IA</h2></div><button><Plus/> Criar</button></div><div className="character-info"><UserRound/><div><b>Totalmente opcional</b><p>Use personagens apenas quando fizer sentido. Você também pode criar vídeos completos sem nenhuma pessoa aparecendo.</p></div></div><div className="people character-page">{people.map(([n,r],i)=><button key={n}><div className="avatar">{n[0]}</div><b>{n}</b><small>{r}</small></button>)}</div></div>}

  {tab==='produtos'&&<Empty icon={Library} title="Sua biblioteca criativa" text="Guarde imagens, vídeos, logos, músicas, referências e materiais para reutilizar em novos projetos." go={()=>setTab('inicio')}/>} 

  {tab!=='studio'&&<nav><Nav on={()=>setTab('inicio')} active={tab==='inicio'} icon={Home} text="Início"/><Nav on={()=>setTab('projetos')} active={tab==='projetos'} icon={Folder} text="Projetos"/><button className="fab" onClick={()=>setTab('inicio')}><Plus/></button><Nav on={()=>setTab('personagens')} active={tab==='personagens'} icon={Users} text="Personagens"/><Nav on={()=>setTab('produtos')} active={tab==='produtos'} icon={Library} text="Biblioteca"/></nav>}

  {showEngine&&<div className="modal" onClick={()=>setShowEngine(false)}><div className="sheet" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setShowEngine(false)}><X/></button><Sparkles className="sheet-icon"/><h3>Geração final por IA</h3><p>O Studio já prepara cenas, formato, duração, legenda, trilha e apresentador. Para renderizar um MP4 real, falta conectar o motor de vídeo do app.</p><div className="engine-options"><div><b>Sem apresentador</b><small>Imagem/vídeo → cenas geradas por IA</small></div><div><b>Com apresentador</b><small>Avatar + roteiro + voz sincronizada</small></div></div><button className="sheet-main" onClick={()=>setShowEngine(false)}>Entendi</button></div></div>}
 </main>
}

function Studio({project,previewing,previewReady,back,generatePreview,openEngine}){
 const secs=parseInt(project.duration)||20
 const s1=Math.max(2,Math.round(secs*.2)),s2=Math.max(4,Math.round(secs*.55)),s3=Math.max(2,secs-s1-s2)
 return <div className="studio-page">
   <div className="studio-top"><button onClick={back}><ArrowLeft/></button><div><small>LEGACY CREATOR STUDIO</small><h2>{project.title}</h2></div><button><Settings2/></button></div>
   <div className="studio-body">
    <section className="preview-panel">
     <div className={'video-preview '+(previewReady?'playing':'')} data-format={project.format}>
      {project.media?.url?(project.media.type?.startsWith('video')?<video src={project.media.url} muted playsInline/>:<img src={project.media.url} alt="Prévia"/>):<div className="preview-empty"><Sparkles/><b>Sua criação começa aqui</b><span>{project.style}</span></div>}
      <div className="preview-overlay"><span>{project.style}</span><b>{previewReady?'PRÉVIA DO PROJETO':'STUDIO'}</b></div>
     </div>
     <button className="preview-btn" onClick={generatePreview} disabled={previewing}>{previewing?<><span className="spinner"/> Preparando prévia…</>:<><Play/> {previewReady?'Recriar prévia':'Gerar prévia do projeto'}</>}</button>
    </section>

    <section className="studio-card"><div className="studio-card-head"><div><small>CONFIGURAÇÃO</small><h3>Direção do vídeo</h3></div><SlidersHorizontal/></div><div className="chips"><span>{project.format}</span><span>{project.duration}</span><span>{project.style}</span><span>{project.presenter?'Apresentador: '+project.presenter:'Sem apresentador'}</span></div><p>{project.idea||'Criação baseada no material enviado.'}</p></section>

    <section className="studio-card"><div className="studio-card-head"><div><small>ESTRUTURA</small><h3>Cenas sugeridas</h3></div><button><RefreshCw/> Reorganizar</button></div><div className="scene-list"><Scene n="01" title="Abertura" time={`${s1}s`} text="Apresentação visual forte para estabelecer clima, assunto e identidade."/><Scene n="02" title="Desenvolvimento" time={`${s2}s`} text="Movimento principal, detalhes, contexto e ritmo de acordo com o estilo escolhido."/><Scene n="03" title="Fechamento" time={`${s3}s`} text="Conclusão visual limpa, com texto final e acabamento consistente."/></div></section>

    <section className="studio-card"><div className="studio-card-head"><div><small>RECURSOS</small><h3>O que entra no render</h3></div></div><div className="resource-grid"><Resource icon={Captions} name="Legendas" on={project.captions}/><Resource icon={Music2} name="Trilha" on={project.music}/><Resource icon={Mic2} name="Voz IA" on={project.voice}/><Resource icon={Palette} name="Kit de marca" on={project.brand}/><Resource icon={UserRound} name="Apresentador" on={!!project.presenter}/><Resource icon={Film} name="Cenas IA" on/></div></section>

    <section className="studio-card engine-card"><div><small>RENDERIZAÇÃO</small><h3>Pronto para o motor de vídeo</h3><p>O projeto já está estruturado. A geração final transforma essas escolhas em cenas reais e monta o vídeo completo.</p></div><button onClick={openEngine}><Sparkles/> Gerar vídeo com IA</button></section>

    <div className="studio-actions"><button><Copy/> Duplicar</button><button><Download/> Exportar projeto</button></div>
   </div>
 </div>
}

function Scene({n,title,time,text}){return <div className="scene"><span>{n}</span><div><b>{title}</b><p>{text}</p></div><small>{time}</small></div>}
function Resource({icon:I,name,on}){return <div className={on?'on':''}><I/><b>{name}</b><span>{on?'Ativo':'Desligado'}</span></div>}
function Tool({icon:I,title,on,click}){return <button className={on?'on':''} onClick={click}><I/><span><b>{title}</b><small>{on?'Ativado':'Desativado'}</small></span><strong>{on?'ON':'OFF'}</strong></button>}
function Nav({on,active,icon:I,text}){return <button onClick={on} className={active?'active':''}><I/><span>{text}</span></button>}
function Empty({icon:I,title,text,go}){return <div className="empty"><I/><h2>{title}</h2><p>{text}</p><button onClick={go}><Plus/> Começar criação</button></div>}
