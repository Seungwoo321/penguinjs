import { CallStackLibraryGame } from '@/games/callstack-library'

interface CallStackLibraryPageProps {
  searchParams: Promise<{
    difficulty?: string
    stage?: string
  }>
}

export default async function CallStackLibraryPage({ searchParams }: CallStackLibraryPageProps) {
  const params = await searchParams
  return <CallStackLibraryGame searchParams={params} />
}