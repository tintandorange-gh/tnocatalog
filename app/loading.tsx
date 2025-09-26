import { LoadingState } from '@/components/ui/loading-spinner'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingState message="Loading..." />
    </div>
  )
}