import { useEffect, useState } from "react";
import axios from "axios";
import type { Adventure } from "../../../shared/types";
import CenteredLayout from "./CenteredLayout";
import PickAdventureCards from "./PickAdventureCards";
import PickAdventureForm, { Address } from "./PickAdventureForm";
import { useAdventureStream } from "../hooks/useAdventureStream";

export default function PickAdventure({
  onPick
}: {
  onPick: (card: Adventure, startTime: string, duration: number) => void;
}) {
  const [address, setAddress] = useState<Address>({ lat: null, lng: null, streetAddress: "" });
  const [startTime, setStartTime] = useState<string>("09:00");
  const [duration, setDuration] = useState<number>(5);
  
  const { loading, progress, adventures, error, fetchAdventures } = useAdventureStream();

  // Get current location on mount and reverse geocode to address
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
            .then((res) => res.data)
            .then((data) => {
              setAddress({
                lat: latitude,
                lng: longitude,
                streetAddress: data.display_name || `${latitude},${longitude}`,
                city: data.address?.city || data.address?.town || data.address?.village || data.address?.state || data.address?.county || data.address?.region || data.address?.country || data.display_name || `${latitude},${longitude}`
              });
            })
            .catch(() => setAddress({ lat: latitude, lng: longitude, streetAddress: `${latitude},${longitude}`, city: `${latitude},${longitude}` }));
        },
		  (error) => {
			console.error("Geolocation error:", error);
          	setAddress({ lat: null, lng: null, streetAddress: "", city: "" });
        }
      );
    }
  }, []);

  // Fetch adventures only when user clicks proceed
  const handleProceed = () => {
    fetchAdventures({
      lat: address.lat,
      lng: address.lng,
      hours: duration,
      city: address.city
    });
  };

  return (
    <CenteredLayout title="Pick Your Adventure">
      <PickAdventureForm
        address={address}
        setAddress={setAddress}
        startTime={startTime}
        setStartTime={setStartTime}
        duration={duration}
        setDuration={setDuration}
        loading={loading}
        processingStage={progress?.stage}
        progress={progress?.progress}
        onProceed={handleProceed}
      />
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-sm text-red-700">Error: {error}</span>
        </div>
      )}
      <PickAdventureCards 
        cards={adventures || []} 
        onPick={(c) => onPick(c, startTime, duration)}
        loading={loading}
      />
    </CenteredLayout>
  );
}
