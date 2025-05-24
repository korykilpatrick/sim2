import { Children, ReactElement, cloneElement } from 'react'
import { cn } from '@/utils/cn'
import { WizardProgress } from './WizardProgress'
import { WizardNavigation } from './WizardNavigation'
import type { UseWizardReturn } from './useWizard'

interface FormWizardProps<T = Record<string, unknown>> {
  wizard: UseWizardReturn<T>
  children: ReactElement[]
  showProgress?: boolean
  showNavigation?: boolean
  className?: string
  progressClassName?: string
  navigationClassName?: string
  contentClassName?: string
  onStepValidate?: (stepIndex: number) => boolean | Promise<boolean>
}

export function FormWizard<T = Record<string, unknown>>({
  wizard,
  children,
  showProgress = true,
  showNavigation = true,
  className,
  progressClassName,
  navigationClassName,
  contentClassName,
  onStepValidate,
}: FormWizardProps<T>) {
  const {
    currentStep,
    steps,
    isFirstStep,
    isLastStep,
    goToStep,
    goToNext,
    goToPrevious,
    handleComplete,
    canGoToStep,
  } = wizard

  const handleNext = async () => {
    if (onStepValidate) {
      const isValid = await onStepValidate(currentStep)
      if (!isValid) return
    }
    goToNext()
  }

  const handleStepClick = (index: number) => {
    if (canGoToStep(index)) {
      goToStep(index)
    }
  }

  const activeChild = Children.toArray(children)[currentStep] as ReactElement

  return (
    <div className={cn('w-full', className)}>
      {showProgress && (
        <WizardProgress
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          className={progressClassName}
        />
      )}

      <div className={cn('min-h-[300px]', contentClassName)}>
        {activeChild && cloneElement(activeChild, { isActive: true })}
      </div>

      {showNavigation && (
        <WizardNavigation
          onPrevious={goToPrevious}
          onNext={handleNext}
          onComplete={handleComplete}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          className={navigationClassName}
        />
      )}
    </div>
  )
}
