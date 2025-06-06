import { AdventureCard } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export interface PickAdventureCardsProps {
  cards: AdventureCard[];
  onPick: (card: AdventureCard) => void;
}

export default function PickAdventureCards({ cards, onPick }: PickAdventureCardsProps) {
  return (
    <div id="pick-adventure-cards" className="flex-1 flex flex-wrap justify-center items-center gap-24 w-full">
      {cards.map((c) => (
        <Card
          key={c.id}
          className="cursor-pointer w-full max-w-xs"
          onClick={() => onPick(c)}
          id={`pick-adventure-card-${c.id}`}
        >
          <CardHeader id={`pick-adventure-card-header-${c.id}`}>
            <CardTitle id={`pick-adventure-card-title-${c.id}`}>{c.title}</CardTitle>
          </CardHeader>
          <CardContent className="justify-between p-4" id={`pick-adventure-card-content-${c.id}`}>
            <img src={c.heroImage} alt={c.title} className="w-full aspect-square object-cover rounded-t-xl" id={`pick-adventure-card-img-${c.id}`}/>
            <CardDescription id={`pick-adventure-card-desc-${c.id}`}>{c.subtitle}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
