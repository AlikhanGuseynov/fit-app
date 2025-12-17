import { cn } from '@/lib/utils'

export const Skeleton = ({ className }: { className?: string }) => {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} aria-hidden />
}

export default Skeleton
