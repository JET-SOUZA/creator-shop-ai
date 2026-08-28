'use client'

import { useRef, useState } from 'react'
import { Home, Folder, Users, Package, Image as ImageIcon, Video, UserRound, Clapperboard, UploadCloud, Sparkles, CheckCircle2, ChevronRight, Plus, WandSparkles, Layers3 } from 'lucide-react'

const styles=[['UGC Natural','Apresentação espontânea e autêntica',UserRound],['Social Dinâmico','Ritmo rápido e visual envolvente',Layers3],['Comercial Premium','Visual refinado e cinematográfico',Clapperboard],['Demonstração','Mostre detalhes, uso e contexto',Video]]
const people=[['Bruno','Natural'],['Carla','Elegante'],['Jonas','Técnico'],['Juliana','Lifestyle']]

export default function Page(){
 const input=useRef(null); const [media,setMedia]=useState(null); const [style,setStyle]=useState(0); const [person,setPerson]=useState(0); const [tab,setTab]=useState('inicio');
 const pick=e=>{const f=e.target.files?.[0]; if(f)setMedia({name:f.name,url:URL.createObjectURL(f),type:f.type})}
 return <main>
  <header><div className="logo"><span>LS</span></div><div className="brand"><b>LEGACY</b><strong>CREATOR</strong><small>Seu estúdio criativo com IA</small></div><div className="credit">✦ 120</div></header>
  {tab==='inicio'&&<div className="content">
   <section className="hero"><div><h1>CRIE VÍDEOS<br/><em>PROFISSIONAIS</em><br/>COM IA</h1><p>Transforme fotos, vídeos e ideias em conteúdos marcantes, prontos para publicar.</p></div><div className="solar"><span>✦</span><b>Mais criatividade.<br/><em>Mais agilidade.</em><br/>Mais possibilidades.</b></div></section>
   <section className="actions"><button onClick={()=>input.current?.click()}><ImageIcon/><b>Criar com foto</b></button><button onClick={()=>input.current?.click()}><Video/><b>Criar com vídeo</b></button><button><UserRound/><b>Apresentador IA</b></button><button><Clapperboard/><b>Vídeo premium</b></button></section>
   <input ref={input} type="file" accept="image/*,video/*" hidden onChange={pick}/>
   <button className="upload" onClick={()=>input.current?.click()}>{media?<><CheckCircle2/><div><b>{media.name}</b><span>Arquivo carregado • toque para trocar</span></div></>:<><UploadCloud/><div><b>Adicione uma foto ou vídeo</b><span>Comece com qualquer imagem, produto, pessoa ou cena</span></div><Plus/></>}</button>
   <div className="prompt"><textarea placeholder="Descreva sua ideia. Ex.: Crie um vídeo moderno de 20 segundos com uma apresentadora, movimentos suaves, texto elegante e trilha inspiradora."/><WandSparkles/></div>
   <div className="title"><b>Escolha o estilo do vídeo</b><span>Explorar estilos</span></div>
   <div className="styles">{styles.map(([n,d,I],i)=><button className={style===i?'selected':''} onClick={()=>setStyle(i)} key={n}><I/><div><b>{n}</b><small>{d}</small></div>{style===i?<CheckCircle2/>:<ChevronRight/>}</button>)}</div>
   <div className="title"><b>Escolha um apresentador IA</b><span>Explorar personagens</span></div>
   <div className="people">{people.map(([n,r],i)=><button className={person===i?'selected':''} onClick={()=>setPerson(i)} key={n}><div className="avatar">{n[0]}</div><b>{n}</b><small>{r}</small></button>)}</div>
   <button className="create"><Sparkles/> Criar novo vídeo</button><p className="note">Roteiro, voz, cenas, legendas e acabamento em um único fluxo.</p>
  </div>}
  {tab==='projetos'&&<Empty icon={Folder} title="Seus projetos" text="Organize ideias, versões e vídeos finalizados em um só lugar."/>}
  {tab==='personagens'&&<Empty icon={Users} title="Seus personagens" text="Crie apresentadores recorrentes com aparência, voz e estilo próprios."/>}
  {tab==='produtos'&&<Empty icon={Package} title="Sua biblioteca" text="Salve imagens, referências e materiais para reutilizar em novas criações."/>}
  <nav><Nav on={()=>setTab('inicio')} active={tab==='inicio'} icon={Home} text="Início"/><Nav on={()=>setTab('projetos')} active={tab==='projetos'} icon={Folder} text="Projetos"/><button className="fab" onClick={()=>input.current?.click()}><Plus/></button><Nav on={()=>setTab('personagens')} active={tab==='personagens'} icon={Users} text="Personagens"/><Nav on={()=>setTab('produtos')} active={tab==='produtos'} icon={Package} text="Biblioteca"/></nav>
 </main>
}
function Nav({on,active,icon:I,text}){return <button onClick={on} className={active?'active':''}><I/><span>{text}</span></button>}
function Empty({icon:I,title,text}){return <div className="empty"><I/><h2>{title}</h2><p>{text}</p><button onClick={()=>location.reload()}><Plus/> Começar criação</button></div>}
