import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WizardStep } from './useWizard';

interface WizardProgressProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export function WizardProgress({
  steps,
  currentStep,
  onStepClick,
  className,
}: WizardProgressProps) {
  return (
    <div className={cn('mb-8', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = step.isComplete;
          const isPast = index < currentStep;
          const isClickable = onStepClick && (isPast || isComplete);

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  'flex items-center',
                  isClickable && 'cursor-pointer'
                )}
                onClick={() => isClickable && onStepClick(index)}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                    isComplete && 'border-green-600 bg-green-600 text-white',
                    isActive && !isComplete && 'border-blue-600 bg-blue-600 text-white',
                    !isActive && !isComplete && 'border-gray-300 bg-white text-gray-400'
                  )}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      (isActive || isComplete) ? 'text-gray-900' : 'text-gray-400'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-500">{step.description}</p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'ml-2 h-0.5 w-12 transition-colors sm:w-20',
                    isPast || isComplete ? 'bg-green-600' : 'bg-gray-300'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}