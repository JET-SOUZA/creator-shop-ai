import './globals.css'
import './studio.css'

export const metadata = {
  title: 'Legacy Creator',
  description: 'Transforme fotos, vídeos e ideias em conteúdos profissionais com IA.'
}

export default function RootLayout({ children }) {
  return <html lang="pt-BR"><body>{children}</body></html>
}