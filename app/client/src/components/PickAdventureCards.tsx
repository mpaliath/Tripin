import { Adventure } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export interface PickAdventureCardsProps {
  cards: Adventure[];
  onPick: (card: Adventure) => void;
}

export default function PickAdventureCards({ cards, onPick }: PickAdventureCardsProps) {
  return (
    <div id="pick-adventure-cards" className="flex-1 flex flex-wrap justify-center items-center gap-24 w-full">
      {cards.map((c) => {
        const subtitle = c.outline
          .map((o) => o.name)
          .slice(0, 2)
          .join(" + ");
        return (
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
            <CardDescription id={`pick-adventure-card-desc-${c.id}`}>{subtitle}</CardDescription>
          </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
