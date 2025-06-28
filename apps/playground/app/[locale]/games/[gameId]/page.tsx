import { GamePlayer } from '@/components/GamePlayer'

interface GamePageProps {
  params: Promise<{
    gameId: string
    locale: string
  }>
}

export default async function GamePage({ params }: GamePageProps) {
  const { gameId, locale } = await params
  
  return <GamePlayer gameId={gameId} locale={locale} />
}