import { getTimingStageLabel, getTimingStageColor, type TimingStage } from '@/lib/types'

interface TimingBadgeProps {
  stage: TimingStage
  size?: 'sm' | 'md'
}

export function TimingBadge({ stage, size = 'md' }: TimingBadgeProps) {
  const label = getTimingStageLabel(stage)
  const colorClass = getTimingStageColor(stage)

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${colorClass} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {label}
    </span>
  )
}
