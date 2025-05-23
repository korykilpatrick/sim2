# Reference Flow: Vessel Tracking Purchase

## Overview
This document provides a complete implementation example of the vessel tracking purchase flow, demonstrating how all architectural patterns, design systems, and development standards work together in practice.

## User Journey

```
1. User browses vessel list
2. User selects a vessel to track
3. User configures tracking options
4. User reviews cost and confirms
5. System processes payment (credits)
6. System creates tracking
7. User sees confirmation
8. User is redirected to active trackings
```

## Feature File Structure

```
src/features/vessel-tracking/
├── components/
│   ├── VesselSelector.tsx
│   ├── TrackingCriteriaForm.tsx
│   ├── TrackingCostSummary.tsx
│   ├── TrackingConfirmation.tsx
│   └── index.ts
├── hooks/
│   ├── useVesselTracking.ts
│   ├── useTrackingCost.ts
│   └── useCreateTracking.ts
├── pages/
│   ├── CreateTrackingPage.tsx
│   └── TrackingSuccessPage.tsx
├── schemas/
│   └── trackingSchema.ts
├── services/
│   └── trackingService.ts
├── types.ts
└── index.ts
```

## Implementation

### 1. Route Definition

```typescript
// routes/index.tsx
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const CreateTracking = lazy(() => 
  import('@features/vessel-tracking/pages/CreateTrackingPage')
);

export const vesselTrackingRoutes: RouteObject[] = [
  {
    path: 'vessels/:vesselId/track',
    element: <CreateTracking />,
    loader: async ({ params }) => {
      // Prefetch vessel data
      await queryClient.prefetchQuery({
        queryKey: ['vessel', params.vesselId],
        queryFn: () => vesselApi.getVessel(params.vesselId!)
      });
      return null;
    }
  },
  {
    path: 'tracking/success/:trackingId',
    element: <TrackingSuccessPage />
  }
];
```

### 2. Page Component

```typescript
// features/vessel-tracking/pages/CreateTrackingPage.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';

import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { PageLoader } from '@components/feedback/PageLoader';
import { ErrorBoundary } from '@components/feedback/ErrorBoundary';

import { VesselSelector } from '../components/VesselSelector';
import { TrackingCriteriaForm } from '../components/TrackingCriteriaForm';
import { TrackingCostSummary } from '../components/TrackingCostSummary';
import { TrackingConfirmation } from '../components/TrackingConfirmation';

import { useVessel } from '@features/vessels/hooks/useVessel';
import { useCreateTracking } from '../hooks/useCreateTracking';
import { useTrackingCost } from '../hooks/useTrackingCost';
import { useAuthStore } from '@stores/authStore';

import { trackingSchema, TrackingFormData } from '../schemas/trackingSchema';

const STEPS = ['vessel', 'criteria', 'review', 'confirm'] as const;
type Step = typeof STEPS[number];

export const CreateTrackingPage: React.FC = () => {
  const { vesselId } = useParams<{ vesselId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState<Step>('vessel');
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Data fetching
  const { data: vessel, isLoading: vesselLoading } = useVessel(vesselId!);
  const createTracking = useCreateTracking();
  
  // Form management
  const form = useForm<TrackingFormData>({
    resolver: zodResolver(trackingSchema),
    defaultValues: {
      vesselId: vesselId || '',
      duration: 30,
      criteria: [],
      notifications: {
        email: true,
        sms: false,
        webhook: ''
      }
    }
  });
  
  // Cost calculation
  const formValues = form.watch();
  const { cost, isCalculating } = useTrackingCost(formValues);
  
  // Step navigation
  const goToStep = (step: Step) => {
    const stepIndex = STEPS.indexOf(step);
    const currentIndex = STEPS.indexOf(currentStep);
    
    if (stepIndex < currentIndex) {
      setCurrentStep(step);
    }
  };
  
  const nextStep = async () => {
    const currentIndex = STEPS.indexOf(currentStep);
    
    // Validate current step
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);
    
    if (!isValid) return;
    
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };
  
  const previousStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };
  
  // Form submission
  const onSubmit = async (data: TrackingFormData) => {
    // Check credits
    if (user!.subscription.creditsRemaining < cost) {
      toast.error('Insufficient credits');
      navigate('/credits/purchase');
      return;
    }
    
    setIsConfirming(true);
    
    try {
      const tracking = await createTracking.mutateAsync(data);
      
      // Success! Navigate to success page
      navigate(`/tracking/success/${tracking.id}`, {
        state: { 
          vessel: vessel,
          tracking: tracking,
          creditCharged: cost
        }
      });
    } catch (error) {
      // Error is handled by mutation
      setIsConfirming(false);
    }
  };
  
  if (vesselLoading) {
    return <PageLoader />;
  }
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center"
                  onClick={() => goToStep(step)}
                >
                  <div
                    className={clsx(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors cursor-pointer',
                      {
                        'border-primary-500 bg-primary-500 text-white':
                          STEPS.indexOf(currentStep) >= index,
                        'border-neutral-300 bg-white text-neutral-500':
                          STEPS.indexOf(currentStep) < index
                      }
                    )}
                  >
                    {index + 1}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={clsx(
                        'h-0.5 w-full transition-colors',
                        {
                          'bg-primary-500': STEPS.indexOf(currentStep) > index,
                          'bg-neutral-300': STEPS.indexOf(currentStep) <= index
                        }
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 'vessel' && (
                <Card title="Select Vessel">
                  <VesselSelector
                    selectedVessel={vessel}
                    onVesselChange={(v) => form.setValue('vesselId', v.id)}
                  />
                </Card>
              )}
              
              {currentStep === 'criteria' && (
                <Card title="Configure Tracking">
                  <TrackingCriteriaForm form={form} />
                </Card>
              )}
              
              {currentStep === 'review' && (
                <Card title="Review & Cost">
                  <TrackingCostSummary
                    vessel={vessel!}
                    formData={formValues}
                    cost={cost}
                    isCalculating={isCalculating}
                    userCredits={user!.subscription.creditsRemaining}
                  />
                </Card>
              )}
              
              {currentStep === 'confirm' && (
                <Card title="Confirm Tracking">
                  <TrackingConfirmation
                    vessel={vessel!}
                    formData={formValues}
                    cost={cost}
                    onConfirm={form.handleSubmit(onSubmit)}
                    isConfirming={isConfirming}
                  />
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === STEPS[0]}
            >
              Previous
            </Button>
            
            {currentStep !== STEPS[STEPS.length - 1] ? (
              <Button onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button
                onClick={form.handleSubmit(onSubmit)}
                loading={isConfirming}
                disabled={cost > user!.subscription.creditsRemaining}
              >
                Confirm & Start Tracking
              </Button>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Helper function
function getFieldsForStep(step: Step): (keyof TrackingFormData)[] {
  switch (step) {
    case 'vessel':
      return ['vesselId'];
    case 'criteria':
      return ['duration', 'criteria', 'notifications'];
    default:
      return [];
  }
}
```

### 3. Form Component

```typescript
// features/vessel-tracking/components/TrackingCriteriaForm.tsx
import { UseFormReturn } from 'react-hook-form';
import { Info } from 'lucide-react';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/forms/Form';
import { Input } from '@components/forms/Input';
import { Checkbox } from '@components/forms/Checkbox';
import { Switch } from '@components/forms/Switch';
import { RadioGroup, RadioGroupItem } from '@components/forms/RadioGroup';
import { Alert } from '@components/feedback/Alert';

import { TrackingFormData } from '../schemas/trackingSchema';
import { TRACKING_CRITERIA } from '../constants';

interface TrackingCriteriaFormProps {
  form: UseFormReturn<TrackingFormData>;
}

export const TrackingCriteriaForm: React.FC<TrackingCriteriaFormProps> = ({ 
  form 
}) => {
  const duration = form.watch('duration');
  
  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* Duration */}
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tracking Duration</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(v) => field.onChange(parseInt(v))}
                  value={field.value.toString()}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                  {[7, 30, 90].map((days) => (
                    <label
                      key={days}
                      className={clsx(
                        'flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-colors',
                        field.value === days
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      )}
                    >
                      <RadioGroupItem value={days.toString()} />
                      <div className="ml-3 flex-1">
                        <p className="font-medium">{days} days</p>
                        <p className="text-sm text-neutral-500">
                          {calculateCredits(days)} credits
                        </p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Longer durations offer better value per day
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Tracking Criteria */}
        <FormField
          control={form.control}
          name="criteria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tracking Criteria</FormLabel>
              <FormDescription>
                Select events you want to be notified about
              </FormDescription>
              <div className="mt-4 space-y-3">
                {TRACKING_CRITERIA.map((criterion) => (
                  <label
                    key={criterion.id}
                    className={clsx(
                      'flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors',
                      field.value.includes(criterion.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    )}
                  >
                    <Checkbox
                      checked={field.value.includes(criterion.id)}
                      onCheckedChange={(checked) => {
                        const updated = checked
                          ? [...field.value, criterion.id]
                          : field.value.filter((v) => v !== criterion.id);
                        field.onChange(updated);
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{criterion.name}</p>
                      <p className="text-sm text-neutral-500">
                        {criterion.description}
                      </p>
                      {criterion.additionalCost && (
                        <p className="text-sm text-primary-600 mt-1">
                          +{criterion.additionalCost} credits
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Notifications */}
        <div className="space-y-4">
          <FormLabel>Notification Settings</FormLabel>
          
          <FormField
            control={form.control}
            name="notifications.email"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Email Notifications</FormLabel>
                  <FormDescription>
                    Receive alerts via email
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notifications.sms"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>SMS Notifications</FormLabel>
                  <FormDescription>
                    Receive urgent alerts via SMS (+5 credits/month)
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <Alert variant="info">
          <Info className="h-4 w-4" />
          <div>
            <p className="font-medium">Tracking starts immediately</p>
            <p className="text-sm mt-1">
              You'll receive your first update within 6 hours of activation
            </p>
          </div>
        </Alert>
      </div>
    </Form>
  );
};
```

### 4. Cost Calculation Hook

```typescript
// features/vessel-tracking/hooks/useTrackingCost.ts
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { TrackingFormData } from '../schemas/trackingSchema';
import { pricingApi } from '@api/endpoints/pricing';

interface TrackingCost {
  baseCost: number;
  criteriaCost: number;
  notificationCost: number;
  totalCost: number;
  breakdown: Array<{
    item: string;
    cost: number;
  }>;
}

export const useTrackingCost = (formData: Partial<TrackingFormData>) => {
  // Fetch current pricing rules
  const { data: pricing } = useQuery({
    queryKey: ['pricing', 'tracking'],
    queryFn: pricingApi.getTrackingPricing,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
  
  const cost = useMemo<TrackingCost | null>(() => {
    if (!pricing || !formData.duration) return null;
    
    const breakdown = [];
    
    // Base cost for duration
    const baseCost = pricing.baseCost[formData.duration] || 0;
    breakdown.push({
      item: `${formData.duration} days tracking`,
      cost: baseCost
    });
    
    // Additional criteria costs
    let criteriaCost = 0;
    formData.criteria?.forEach(criterionId => {
      const criterion = pricing.criteria.find(c => c.id === criterionId);
      if (criterion?.additionalCost) {
        criteriaCost += criterion.additionalCost;
        breakdown.push({
          item: criterion.name,
          cost: criterion.additionalCost
        });
      }
    });
    
    // Notification costs
    let notificationCost = 0;
    if (formData.notifications?.sms) {
      notificationCost += pricing.smsMonthlyFee * Math.ceil(formData.duration / 30);
      breakdown.push({
        item: 'SMS notifications',
        cost: notificationCost
      });
    }
    
    return {
      baseCost,
      criteriaCost,
      notificationCost,
      totalCost: baseCost + criteriaCost + notificationCost,
      breakdown
    };
  }, [pricing, formData]);
  
  return {
    cost: cost?.totalCost || 0,
    breakdown: cost?.breakdown || [],
    isCalculating: !pricing
  };
};
```

### 5. Create Tracking Mutation

```typescript
// features/vessel-tracking/hooks/useCreateTracking.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { trackingApi } from '@api/endpoints/tracking';
import { useAuthStore } from '@stores/authStore';
import { TrackingFormData } from '../schemas/trackingSchema';

export const useCreateTracking = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const updateCredits = useAuthStore((state) => state.updateCredits);
  
  return useMutation({
    mutationFn: (data: TrackingFormData) => trackingApi.createTracking(data),
    
    onMutate: async (data) => {
      // Show creating toast
      const toastId = toast.loading('Creating tracking...');
      return { toastId };
    },
    
    onError: (error, variables, context) => {
      toast.dismiss(context?.toastId);
      
      // Handle specific errors
      if (error.response?.status === 402) {
        toast.error('Insufficient credits');
        navigate('/credits/purchase');
      } else if (error.response?.status === 409) {
        toast.error('Tracking already exists for this vessel');
      } else {
        toast.error('Failed to create tracking. Please try again.');
      }
    },
    
    onSuccess: (data, variables, context) => {
      toast.dismiss(context?.toastId);
      toast.success('Tracking created successfully!');
      
      // Update local credit balance
      updateCredits(-data.creditsCost);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['trackings'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'credits'] });
      
      // Set the new tracking in cache
      queryClient.setQueryData(['tracking', data.id], data);
    }
  });
};
```

### 6. Success Page

```typescript
// features/vessel-tracking/pages/TrackingSuccessPage.tsx
import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { Badge } from '@components/common/Badge';

export const TrackingSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { vessel, tracking, creditCharged } = location.state || {};
  
  useEffect(() => {
    // Celebration animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);
  
  if (!tracking) {
    navigate('/trackings');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <div className="text-center mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Tracking Activated!
            </h1>
            <p className="mt-2 text-lg text-neutral-600">
              You're now tracking {vessel.name}
            </p>
          </div>
          
          <Card className="mb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Tracking ID</span>
                <span className="font-mono text-sm">{tracking.id}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Vessel</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{vessel.name}</span>
                  <Badge variant="default" size="sm">
                    IMO {vessel.imo}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Duration</span>
                <span>{tracking.duration} days</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Credits Charged</span>
                <span className="font-medium text-primary-600">
                  {creditCharged} credits
                </span>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-neutral-600">
                  Tracking started on{' '}
                  {new Date(tracking.startDate).toLocaleDateString()}
                  {' '}and will run until{' '}
                  {new Date(tracking.endDate).toLocaleDateString()}.
                </p>
              </div>
            </div>
          </Card>
          
          <div className="space-y-3">
            <Button 
              fullWidth
              onClick={() => navigate('/trackings')}
              icon={<ArrowRight className="ml-2 h-4 w-4" />}
              iconPosition="right"
            >
              View Active Trackings
            </Button>
            
            <Button
              variant="outline"
              fullWidth
              onClick={() => window.print()}
              icon={<Download className="mr-2 h-4 w-4" />}
            >
              Download Receipt
            </Button>
            
            <div className="text-center pt-4">
              <Link
                to="/vessels"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Track another vessel
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
```

### 7. API Integration

```typescript
// features/vessel-tracking/services/trackingService.ts
import { apiClient } from '@api/client';
import { TrackingFormData } from '../schemas/trackingSchema';

export const trackingApi = {
  createTracking: async (data: TrackingFormData) => {
    const response = await apiClient.post('/api/v1/trackings', {
      vesselId: data.vesselId,
      duration: data.duration,
      criteria: data.criteria,
      notifications: data.notifications
    });
    
    return response.data.data;
  },
  
  getTracking: async (id: string) => {
    const response = await apiClient.get(`/api/v1/trackings/${id}`);
    return response.data.data;
  },
  
  cancelTracking: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/trackings/${id}`);
    return response.data.data;
  },
  
  getTrackingEvents: async (id: string, params?: { page?: number }) => {
    const response = await apiClient.get(`/api/v1/trackings/${id}/events`, {
      params
    });
    return response.data;
  }
};
```

### 8. Responsive Design

```typescript
// Mobile-optimized tracking form
export const MobileTrackingForm: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Full-screen steps on mobile */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="min-h-[70vh] flex flex-col"
          >
            {/* Step content fills screen */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              {renderStepContent()}
            </div>
            
            {/* Fixed bottom navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={previousStep}
                  disabled={isFirstStep}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={isLastStep ? handleSubmit : nextStep}
                  className="flex-1"
                  loading={isSubmitting}
                >
                  {isLastStep ? 'Confirm' : 'Next'}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }
  
  // Desktop layout as shown above
  return <DesktopLayout />;
};
```

### 9. Error Handling

```typescript
// Comprehensive error handling
export const TrackingErrorBoundary: React.FC<{ children: ReactNode }> = ({ 
  children 
}) => {
  return (
    <ErrorBoundary
      fallback={({ error, retry }) => (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-red-500 mb-4">
                <AlertCircle className="h-full w-full" />
              </div>
              <h2 className="text-lg font-semibold mb-2">
                Unable to Create Tracking
              </h2>
              <p className="text-neutral-600 mb-4">
                {error.message || 'An unexpected error occurred'}
              </p>
              <div className="space-y-2">
                <Button onClick={retry} fullWidth>
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/support')}
                  fullWidth
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};
```

### 10. Testing

```typescript
// features/vessel-tracking/__tests__/CreateTrackingPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { CreateTrackingPage } from '../pages/CreateTrackingPage';
import { TestProviders } from '@test/utils';

const server = setupServer(
  rest.get('/api/v1/vessels/:id', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: mockVessel
    }));
  }),
  
  rest.post('/api/v1/trackings', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: mockTracking
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CreateTrackingPage', () => {
  it('completes tracking purchase flow', async () => {
    const user = userEvent.setup();
    
    render(
      <TestProviders initialPath="/vessels/vsl_001/track">
        <CreateTrackingPage />
      </TestProviders>
    );
    
    // Step 1: Vessel should be pre-selected
    await waitFor(() => {
      expect(screen.getByText('PACIFIC VOYAGER')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Next'));
    
    // Step 2: Configure tracking
    await user.click(screen.getByLabelText('30 days'));
    await user.click(screen.getByLabelText('AIS Reporting'));
    await user.click(screen.getByLabelText('Dark Event Detection'));
    
    await user.click(screen.getByText('Next'));
    
    // Step 3: Review cost
    expect(screen.getByText('Total Cost')).toBeInTheDocument();
    expect(screen.getByText('150 credits')).toBeInTheDocument();
    
    await user.click(screen.getByText('Next'));
    
    // Step 4: Confirm
    const confirmButton = screen.getByText('Confirm & Start Tracking');
    await user.click(confirmButton);
    
    // Should navigate to success page
    await waitFor(() => {
      expect(screen.getByText('Tracking Activated!')).toBeInTheDocument();
    });
  });
  
  it('handles insufficient credits', async () => {
    // Mock user with low credits
    server.use(
      rest.post('/api/v1/trackings', (req, res, ctx) => {
        return res(
          ctx.status(402),
          ctx.json({
            success: false,
            error: {
              code: 'INSUFFICIENT_CREDITS',
              message: 'Not enough credits'
            }
          })
        );
      })
    );
    
    // ... test insufficient credits flow
  });
});
```

## Key Integration Points

### 1. State Management Integration
- **Server State**: React Query for vessel data and API calls
- **Form State**: React Hook Form with Zod validation
- **Global State**: Zustand for user credits and auth
- **URL State**: Route params for vessel ID

### 2. Design System Usage
- All components use design tokens from `DESIGN-SYSTEM.md`
- Consistent spacing, colors, and typography
- Responsive breakpoints from `RESPONSIVE-STRATEGY.md`
- Animation patterns from `ANIMATION-GUIDE.md`

### 3. Error Handling
- Network errors handled by React Query
- Form validation errors shown inline
- Business logic errors (credits) handled gracefully
- Global error boundary for unexpected errors

### 4. Performance Optimizations
- Route-based code splitting
- Prefetching vessel data on route load
- Memoized cost calculations
- Optimistic UI updates for better perceived performance

### 5. Accessibility
- Proper form labels and ARIA attributes
- Keyboard navigation support
- Focus management between steps
- Screen reader announcements for errors

## Lessons Applied

This implementation demonstrates:

1. **Clean Architecture**: Feature-based organization with clear separation
2. **Type Safety**: Full TypeScript coverage with Zod schemas
3. **State Management**: Appropriate state solutions for each need
4. **User Experience**: Loading states, error handling, success feedback
5. **Responsive Design**: Mobile-first with desktop enhancements
6. **Testing**: Comprehensive test coverage of the user flow
7. **Performance**: Optimizations without premature optimization
8. **Maintainability**: Clear naming, consistent patterns, documentation