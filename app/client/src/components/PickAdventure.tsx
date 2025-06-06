import { useEffect, useState } from "react";
import { AdventureCard } from "../types";
import CenteredLayout from "./CenteredLayout";
import PickAdventureCards from "./PickAdventureCards";
import PickAdventureForm, { Address } from "./PickAdventureForm";

export default function PickAdventure({
  onPick
}: {
  onPick: (card: AdventureCard) => void;
}) {
  const [cards, setCards] = useState<AdventureCard[]>([]);
  const [address, setAddress] = useState<Address>({ lat: null, lng: null, streetAddress: "" });
  const [duration, setDuration] = useState<number>(5);
  const [showCards, setShowCards] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get current location on mount and reverse geocode to address
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
            .then((r) => r.json())
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
        () => {
          setAddress({ lat: null, lng: null, streetAddress: "", city: "" });
        }
      );
    }
  }, []);

  // Fetch adventures only when user clicks proceed
  const handleProceed = () => {
    setLoading(true);
    let url = '';
    const cityParam = address.city ? `&city=${encodeURIComponent(address.city)}` : '';
    if (address.lat !== null && address.lng !== null) {
      url = `/api/adventures?lat=${address.lat}&lng=${address.lng}&hours=${duration}${cityParam}`;
    } else {
      url = `/api/adventures?lat=&lng=&hours=${duration}${cityParam}`;
    }
    fetch(url)
      .then((r) => r && r.body ? r.json() : Promise.reject("No response body"))
      .then(setCards)
      .finally(() => {
        setShowCards(true);
        setLoading(false);
      });
  };

  return (
    <CenteredLayout title="Pick Your Adventure">
      <PickAdventureForm
        address={address}
        setAddress={setAddress}
        duration={duration}
        setDuration={setDuration}
        loading={loading}
        onProceed={handleProceed}
      />
      {showCards && (
        <PickAdventureCards cards={cards} onPick={onPick} />
      )}
    </CenteredLayout>
  );
}
