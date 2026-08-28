'use client'

import { useRef, useState } from 'react'
import { Home, Folder, Users, Package, Image as ImageIcon, Video, UserRound, TrendingUp, UploadCloud, Sparkles, CheckCircle2, ChevronRight, Plus, WandSparkles } from 'lucide-react'

const styles=[['UGC Natural','Pessoa apresentando o produto',UserRound],['TikTok Viral','Rápido, dinâmico e chamativo',TrendingUp],['Comercial Premium','Visual elegante de campanha',Sparkles],['Demonstração','Produto em uso e benefícios',Video]]
const people=[['Bruno','Especialista'],['Carla','Consultora'],['Jonas','Técnico'],['Juliana','Apresentadora']]

export default function Page(){
 const input=useRef(null); const [media,setMedia]=useState(null); const [style,setStyle]=useState(0); const [person,setPerson]=useState(0); const [tab,setTab]=useState('inicio');
 const pick=e=>{const f=e.target.files?.[0]; if(f)setMedia({name:f.name,url:URL.createObjectURL(f),type:f.type})}
 return <main>
  <header><div className="logo"><span>LS</span></div><div className="brand"><b>LEGACY</b><strong>CREATOR</strong><small>Powered by Legacy Solar</small></div><div className="credit">⚡ 120</div></header>
  {tab==='inicio'&&<div className="content">
   <section className="hero"><div><h1>CRIE VÍDEOS<br/><em>DE VENDAS</em><br/>COM IA</h1><p>Para TikTok Shop, Reels e Shorts que vendem mais.</p></div><div className="solar"><span>⚡</span><b>Mais visibilidade.<br/><em>Mais autoridade.</em><br/>Mais vendas.</b></div></section>
   <section className="actions"><button onClick={()=>input.current?.click()}><ImageIcon/><b>Criar com foto</b></button><button onClick={()=>input.current?.click()}><Video/><b>Criar com vídeo</b></button><button><UserRound/><b>Apresentador IA</b></button><button><TrendingUp/><b>Anúncio viral</b></button></section>
   <input ref={input} type="file" accept="image/*,video/*" hidden onChange={pick}/>
   <button className="upload" onClick={()=>input.current?.click()}>{media?<><CheckCircle2/><div><b>{media.name}</b><span>Produto carregado • toque para trocar</span></div></>:<><UploadCloud/><div><b>Envie a foto ou o vídeo do produto</b><span>Toque para selecionar no celular</span></div><Plus/></>}</button>
   <div className="prompt"><textarea placeholder="O que você quer criar? Ex.: Faça um vídeo de 25 segundos para vender este produto, com uma apresentadora mostrando os benefícios e uma chamada forte para comprar."/><WandSparkles/></div>
   <div className="title"><b>Escolha o estilo do vídeo</b><span>Ver todos</span></div>
   <div className="styles">{styles.map(([n,d,I],i)=><button className={style===i?'selected':''} onClick={()=>setStyle(i)} key={n}><I/><div><b>{n}</b><small>{d}</small></div>{style===i?<CheckCircle2/>:<ChevronRight/>}</button>)}</div>
   <div className="title"><b>Escolha seu apresentador IA</b><span>Ver todos</span></div>
   <div className="people">{people.map(([n,r],i)=><button className={person===i?'selected':''} onClick={()=>setPerson(i)} key={n}><div className="avatar">{n[0]}</div><b>{n}</b><small>{r}</small></button>)}</div>
   <button className="create"><Sparkles/> Criar meu vídeo</button><p className="note">A próxima etapa conecta roteiro, voz, avatar e renderização real do vídeo.</p>
  </div>}
  {tab==='projetos'&&<Empty icon={Folder} title="Seus projetos" text="Os vídeos criados aparecerão aqui, com versões, status e exportações."/>}
  {tab==='personagens'&&<Empty icon={Users} title="Meus apresentadores" text="Crie personagens recorrentes para apresentar produtos com a mesma identidade."/>}
  {tab==='produtos'&&<Empty icon={Package} title="Biblioteca de produtos" text="Salve fotos, benefícios, preços e informações para reutilizar em novos vídeos."/>}
  <nav><Nav on={()=>setTab('inicio')} active={tab==='inicio'} icon={Home} text="Início"/><Nav on={()=>setTab('projetos')} active={tab==='projetos'} icon={Folder} text="Projetos"/><button className="fab" onClick={()=>input.current?.click()}><Plus/></button><Nav on={()=>setTab('personagens')} active={tab==='personagens'} icon={Users} text="Personagens"/><Nav on={()=>setTab('produtos')} active={tab==='produtos'} icon={Package} text="Produtos"/></nav>
 </main>
}
function Nav({on,active,icon:I,text}){return <button onClick={on} className={active?'active':''}><I/><span>{text}</span></button>}
function Empty({icon:I,title,text}){return <div className="empty"><I/><h2>{title}</h2><p>{text}</p><button onClick={()=>location.reload()}><Plus/> Criar agora</button></div>}
