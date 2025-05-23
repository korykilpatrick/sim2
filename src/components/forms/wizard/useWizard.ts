import { useState, useCallback, useMemo } from 'react';

export interface WizardStep {
  id: string;
  label: string;
  description?: string;
  isComplete?: boolean;
  isOptional?: boolean;
}

interface UseWizardOptions<T> {
  steps: WizardStep[];
  initialStep?: number;
  onComplete?: (data: T) => void | Promise<void>;
}

export interface UseWizardReturn<T> {
  currentStep: number;
  currentStepData: WizardStep;
  steps: WizardStep[];
  isFirstStep: boolean;
  isLastStep: boolean;
  goToStep: (step: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  markStepComplete: (stepId: string) => void;
  canGoToStep: (step: number) => boolean;
  formData: T;
  updateFormData: (data: Partial<T>) => void;
  handleComplete: () => void | Promise<void>;
  progress: number;
}

export function useWizard<T = Record<string, unknown>>({
  steps,
  initialStep = 0,
  onComplete,
}: UseWizardOptions<T>): UseWizardReturn<T> {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState<T>({} as T);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const stepsWithCompletion = useMemo(() => {
    return steps.map((step) => ({
      ...step,
      isComplete: completedSteps.has(step.id),
    }));
  }, [steps, completedSteps]);

  const currentStepData = stepsWithCompletion[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const progress = useMemo(() => {
    const completedCount = stepsWithCompletion.filter((step) => step.isComplete).length;
    return (completedCount / steps.length) * 100;
  }, [stepsWithCompletion, steps.length]);

  const canGoToStep = useCallback(
    (step: number) => {
      if (step < 0 || step >= steps.length) return false;
      if (step <= currentStep) return true;
      
      // Can only go forward if all previous steps are complete (except optional ones)
      for (let i = 0; i < step; i++) {
        const stepData = stepsWithCompletion[i];
        if (!stepData.isComplete && !stepData.isOptional) {
          return false;
        }
      }
      return true;
    },
    [currentStep, steps.length, stepsWithCompletion]
  );

  const goToStep = useCallback(
    (step: number) => {
      if (canGoToStep(step)) {
        setCurrentStep(step);
      }
    },
    [canGoToStep]
  );

  const goToNext = useCallback(() => {
    if (!isLastStep) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, goToStep, isLastStep]);

  const goToPrevious = useCallback(() => {
    if (!isFirstStep) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep, isFirstStep]);

  const markStepComplete = useCallback((stepId: string) => {
    setCompletedSteps((prev) => new Set(prev).add(stepId));
  }, []);

  const updateFormData = useCallback((data: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const handleComplete = useCallback(async () => {
    if (onComplete) {
      await onComplete(formData);
    }
  }, [formData, onComplete]);

  return {
    currentStep,
    currentStepData,
    steps: stepsWithCompletion,
    isFirstStep,
    isLastStep,
    goToStep,
    goToNext,
    goToPrevious,
    markStepComplete,
    canGoToStep,
    formData,
    updateFormData,
    handleComplete,
    progress,
  };
}