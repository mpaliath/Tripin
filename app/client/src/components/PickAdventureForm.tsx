export type Address = {
  lat: number | null;
  lng: number | null;
  streetAddress: string;
  city?: string;
};

export interface PickAdventureFormProps {
  address: Address;
  setAddress: (a: Address) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  duration: number;
  setDuration: (v: number) => void;
  loading: boolean;
  processingStage?: string;
  progress?: number;
  onProceed: () => void;
}

export default function PickAdventureForm(props: PickAdventureFormProps) {
  const { address, setAddress, startTime, setStartTime, duration, setDuration, loading, processingStage, progress, onProceed } = props;
  // Handle address input change and parse lat,lng if present
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const latLngMatch = val.match(/^\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*$/);
    if (latLngMatch) {
      setAddress({
        lat: parseFloat(latLngMatch[1]),
        lng: parseFloat(latLngMatch[2]),
        streetAddress: val,
        city: val // fallback to lat,lng as city if user enters raw coords
      });
    } else {
      setAddress({ lat: null, lng: null, streetAddress: val, city: val });
    }
  };

  return (
    <form id="pick-adventure-form" className="w-full max-w-2xl flex flex-col items-center mb-8" onSubmit={e => e.preventDefault()}>
      <div className="flex flex-wrap gap-4 w-full justify-center items-end">
        <div className="flex flex-col">
          <label htmlFor="start-location" className="text-xs font-semibold mb-1">Start Location</label>
          <input
            id="start-location"
            className="border rounded px-2 py-1 w-96 overflow-x-auto whitespace-nowrap text-ellipsis"
            style={{ WebkitOverflowScrolling: 'touch' }}
            value={address.streetAddress}
            onChange={handleAddressChange}
            placeholder="lat,lng or address"
            title={address.streetAddress}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="start-time" className="text-xs font-semibold mb-1">Start Time</label>
          <input
            id="start-time"
            type="time"
            className="border rounded px-2 py-1 w-24"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="trip-duration" className="text-xs font-semibold mb-1">Duration (hrs)</label>
          <input
            id="trip-duration"
            type="number"
            min={1}
            max={24}
            className="border rounded px-2 py-1 w-24"
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
          />
        </div>
        <button
          id="pick-adventure-proceed-btn"
          className="ml-4 bg-blue-600 text-white rounded-xl px-4 py-2 text-sm h-10 mt-5 disabled:bg-gray-400 disabled:cursor-not-allowed"
          type="button"
          onClick={onProceed}
          disabled={loading || !address.streetAddress || !duration}
        >
          {loading ? "Loading..." : "Proceed"}
        </button>
      </div>
      
      {loading && processingStage && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">{processingStage}</span>
          </div>
          {progress !== undefined && (
            <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          {processingStage.includes("AI") && (
            <></>
          )}
        </div>
      )}
    </form>
  );
}
