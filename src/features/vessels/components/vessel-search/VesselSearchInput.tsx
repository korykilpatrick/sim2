import { SearchInput } from '@/components/search';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';
import Alert from '@/components/feedback/Alert';
import { Card } from '@/components/common/Card';
import VesselSearchResults from '../VesselSearchResults';
import type { Vessel } from '../../types';

interface VesselSearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchResults: Vessel[];
  isSearching: boolean;
  selectedVessel: Vessel | null;
  onSelectVessel: (vessel: Vessel) => void;
  onClearSelection?: () => void;
  error?: string | null;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export function VesselSearchInput({
  searchTerm,
  onSearchChange,
  searchResults,
  isSearching,
  selectedVessel,
  onSelectVessel,
  onClearSelection,
  error,
  placeholder = 'Enter vessel name, IMO, or MMSI...',
  label = 'Search for vessel',
  required = false,
}: VesselSearchInputProps) {
  return (
    <div className="space-y-4">
      <div>
        {label && (
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <SearchInput
          value={searchTerm}
          onValueChange={onSearchChange}
          placeholder={placeholder}
          disabled={!!selectedVessel}
        />
      </div>

      {error && (
        <Alert type="error" message={error} />
      )}

      {isSearching && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" />
        </div>
      )}

      {!selectedVessel && searchResults.length > 0 && (
        <Card>
          <VesselSearchResults
            results={searchResults}
            selectedVessel={selectedVessel}
            onSelectVessel={onSelectVessel}
          />
        </Card>
      )}

      {selectedVessel && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Selected Vessel:
              </p>
              <p className="text-sm text-blue-700">{selectedVessel.name}</p>
              <p className="text-xs text-blue-600">
                IMO: {selectedVessel.imo} | Type: {selectedVessel.type}
              </p>
            </div>
            {onClearSelection && (
              <button
                type="button"
                onClick={onClearSelection}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Change
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}