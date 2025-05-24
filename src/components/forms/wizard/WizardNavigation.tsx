import Button from '@/components/common/Button'
import { cn } from '@/utils/cn'

interface WizardNavigationProps {
  onPrevious?: () => void
  onNext?: () => void
  onComplete?: () => void
  isFirstStep?: boolean
  isLastStep?: boolean
  isPreviousDisabled?: boolean
  isNextDisabled?: boolean
  previousLabel?: string
  nextLabel?: string
  completeLabel?: string
  className?: string
}

export function WizardNavigation({
  onPrevious,
  onNext,
  onComplete,
  isFirstStep = false,
  isLastStep = false,
  isPreviousDisabled = false,
  isNextDisabled = false,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  completeLabel = 'Complete',
  className,
}: WizardNavigationProps) {
  return (
    <div className={cn('flex items-center justify-between pt-6', className)}>
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isPreviousDisabled}
        className={cn(isFirstStep && 'invisible')}
      >
        {previousLabel}
      </Button>

      {isLastStep ? (
        <Button type="button" onClick={onComplete} disabled={isNextDisabled}>
          {completeLabel}
        </Button>
      ) : (
        <Button type="button" onClick={onNext} disabled={isNextDisabled}>
          {nextLabel}
        </Button>
      )}
    </div>
  )
}
