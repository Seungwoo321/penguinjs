import { CallStackLibraryGame } from '@/games/callstack-library'
import { CallStackLibraryProvider } from '@/games/callstack-library/contexts/CallStackLibraryContext'
import { DesignSystemProvider } from '@/games/callstack-library/components/ui/DesignSystemProvider'

interface CallStackLibraryPageProps {
  searchParams: Promise<{
    difficulty?: string
    stage?: string
  }>
}

export default async function CallStackLibraryPage({ searchParams }: CallStackLibraryPageProps) {
  const params = await searchParams
  return (
    <DesignSystemProvider>
      <CallStackLibraryProvider>
        <CallStackLibraryGame searchParams={params} />
      </CallStackLibraryProvider>
    </DesignSystemProvider>
  )
}