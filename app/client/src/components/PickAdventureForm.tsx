export type Address = {
  lat: number | null;
  lng: number | null;
  streetAddress: string;
  city?: string;
};

export interface PickAdventureFormProps {
  address: Address;
  setAddress: (a: Address) => void;
  duration: number;
  setDuration: (v: number) => void;
  loading: boolean;
  onProceed: () => void;
}

export default function PickAdventureForm(props: PickAdventureFormProps) {
  const { address, setAddress, duration, setDuration, loading, onProceed } = props;
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
          className="ml-4 bg-blue-600 text-white rounded-xl px-4 py-2 text-sm h-10 mt-5"
          type="button"
          onClick={onProceed}
          disabled={loading || !address.streetAddress || !duration}
        >
          {loading ? "Loading..." : "Proceed"}
        </button>
      </div>
    </form>
  );
}
