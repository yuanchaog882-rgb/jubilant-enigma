import type { GameEvent } from "../types/game";

interface Props {
  event: GameEvent;
  onChoose: (choiceId: string) => void;
}

const EventCard = ({ event, onChoose }: Props) => {
  return (
    <section className="panel event-card">
      <div className="event-header">
        <div>
          <p className="label">{event.category}</p>
          <h2>{event.title}</h2>
        </div>
      </div>
      <p className="event-description">{event.description}</p>
      <div className="choices-grid">
        {event.choices.map((choice) => (
          <button
            key={choice.id}
            className="choice-button"
            onClick={() => onChoose(choice.id)}
          >
            <span>{choice.id}.</span>
            <div>
              <strong>{choice.label}</strong>
              <small>{choice.description}</small>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default EventCard;
