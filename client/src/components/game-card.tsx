import React from "react";
import { Game } from "@shared/schema";

interface GameCardProps {
  game: Game;
  selected?: boolean;
  onClick?: () => void;
}

export function GameCard({ game, selected, onClick }: GameCardProps) {
  return (
    <div 
      className="flex flex-col items-center cursor-pointer"
      onClick={onClick}
    >
      <div className={`w-full aspect-square rounded-xl overflow-hidden mb-1 ${selected ? 'ring-2 ring-secondary' : 'bg-primary-50'}`}>
        <img 
          src={game.imageUrl} 
          className="w-full h-full object-cover" 
          alt={game.name} 
        />
      </div>
      <span className="text-xs text-center">{game.name}</span>
    </div>
  );
}

interface GameFilterProps {
  games: Game[];
  selectedGameId: number | null;
  onSelectGame: (gameId: number | null) => void;
}

export function GameFilter({ games, selectedGameId, onSelectGame }: GameFilterProps) {
  return (
    <div className="flex space-x-3 overflow-x-auto py-2 scrollbar-hide">
      <button 
        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-white text-sm font-medium ${
          selectedGameId === null ? 'bg-secondary' : 'bg-primary-50'
        }`}
        onClick={() => onSelectGame(null)}
      >
        All Games
      </button>
      
      {games.map(game => (
        <button 
          key={game.id}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-white text-sm font-medium ${
            selectedGameId === game.id ? 'bg-secondary' : 'bg-primary-50'
          }`}
          onClick={() => onSelectGame(game.id)}
        >
          {game.name}
        </button>
      ))}
    </div>
  );
}
