import { useEffect, useState } from "react";
import axios from "axios";
import { Adventure } from "../types";
import CenteredLayout from "./CenteredLayout";
import PickAdventureCards from "./PickAdventureCards";
import PickAdventureForm, { Address } from "./PickAdventureForm";

export default function PickAdventure({
  onPick
}: {
  onPick: (card: Adventure) => void;
}) {
  const [cards, setCards] = useState<Adventure[]>([]);
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
    axios.get(url)
      .then((res) => res.data)
      .then((list: Adventure[]) =>
        list.map((adv, i) => ({ ...adv, id: adv.id || String(i) }))
      )
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
