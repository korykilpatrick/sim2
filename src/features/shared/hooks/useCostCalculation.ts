import { useState, useEffect, useCallback } from 'react';
import {
  calculateVesselTrackingCost,
  calculateAreaMonitoringCost,
  calculateAreaMonitoringCostDetailed,
  calculateFleetTrackingCost,
  getReportCost,
} from '../utils/creditPricing';

interface VesselTrackingCostParams {
  criteriaCount: number;
  durationDays: number;
}

interface AreaMonitoringCostParams {
  size: 'small' | 'medium' | 'large' | 'veryLarge';
  durationDays: number;
  criteriaCount?: number;
}

interface FleetTrackingCostParams {
  vesselCount: number;
  months: number;
}

export function useVesselTrackingCost({
  criteriaCount,
  durationDays,
}: VesselTrackingCostParams) {
  const [cost, setCost] = useState(0);
  const [creditsPerDay, setCreditsPerDay] = useState(0);

  useEffect(() => {
    const totalCost = calculateVesselTrackingCost(criteriaCount, durationDays);
    const dailyCost = durationDays > 0 ? totalCost / durationDays : 0;
    
    setCost(totalCost);
    setCreditsPerDay(dailyCost);
  }, [criteriaCount, durationDays]);

  return {
    totalCost: cost,
    creditsPerDay,
    isValid: criteriaCount > 0 && durationDays > 0,
  };
}

export function useAreaMonitoringCost({
  size,
  durationDays,
  criteriaCount = 1,
}: AreaMonitoringCostParams) {
  const [cost, setCost] = useState(0);
  const [creditsPerDay, setCreditsPerDay] = useState(0);

  useEffect(() => {
    const totalCost = calculateAreaMonitoringCost(size, durationDays, criteriaCount);
    const dailyCost = durationDays > 0 ? totalCost / durationDays : 0;
    
    setCost(totalCost);
    setCreditsPerDay(dailyCost);
  }, [size, durationDays, criteriaCount]);

  return {
    totalCost: cost,
    creditsPerDay,
    isValid: durationDays > 0,
  };
}

export function useFleetTrackingCost({
  vesselCount,
  months,
}: FleetTrackingCostParams) {
  const [cost, setCost] = useState(0);
  const [creditsPerMonth, setCreditsPerMonth] = useState(0);

  useEffect(() => {
    const totalCost = calculateFleetTrackingCost(vesselCount, months);
    const monthlyCost = months > 0 ? totalCost / months : 0;
    
    setCost(totalCost);
    setCreditsPerMonth(monthlyCost);
  }, [vesselCount, months]);

  return {
    totalCost: cost,
    creditsPerMonth,
    isValid: vesselCount > 0 && months > 0,
  };
}

export function useReportCost(reportType: 'compliance' | 'chronology' | 'custom') {
  const [cost, setCost] = useState(0);

  useEffect(() => {
    setCost(getReportCost(reportType));
  }, [reportType]);

  return cost;
}

// Generic cost calculation hook for custom scenarios
export function useCostCalculation() {
  const calculateVesselTracking = useCallback(
    (params: VesselTrackingCostParams) => {
      return calculateVesselTrackingCost(params.criteriaCount, params.durationDays);
    },
    []
  );

  const calculateAreaMonitoring = useCallback(
    (params: AreaMonitoringCostParams | { areaSize: number; criteriaCount: number; updateFrequency: number; durationMonths: number }) => {
      // If it has the detailed params, use the detailed function
      if ('areaSize' in params && 'updateFrequency' in params && 'durationMonths' in params) {
        return calculateAreaMonitoringCostDetailed(
          params.areaSize,
          params.criteriaCount || 1,
          params.updateFrequency,
          params.durationMonths
        );
      }
      // Otherwise use the simple function
      return calculateAreaMonitoringCost(
        params.size,
        params.durationDays,
        params.criteriaCount
      );
    },
    []
  );

  const calculateFleetTracking = useCallback(
    (params: FleetTrackingCostParams) => {
      return calculateFleetTrackingCost(params.vesselCount, params.months);
    },
    []
  );

  const calculateReport = useCallback((reportType: 'compliance' | 'chronology' | 'custom') => {
    return getReportCost(reportType);
  }, []);

  return {
    calculateVesselTracking,
    calculateAreaMonitoring,
    calculateFleetTracking,
    calculateReport,
  };
}