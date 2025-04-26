import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Game, Tournament } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { GameFilter } from "@/components/game-card";
import { TournamentCard } from "@/components/tournament-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

export default function TournamentsPage() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);

  // Fetch games for filtering
  const { data: games, isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  // Fetch tournaments based on selected game
  const { data: featuredTournaments, isLoading: featuredLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments", { status: "featured", gameId: selectedGameId }],
    enabled: selectedGameId === null || !!selectedGameId,
  });

  // Fetch free tournaments
  const { data: freeTournaments, isLoading: freeLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments", { status: "free", gameId: selectedGameId }],
    enabled: selectedGameId === null || !!selectedGameId,
  });

  // Handle game filter selection
  const handleGameSelection = (gameId: number | null) => {
    setSelectedGameId(gameId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-primary">
      {/* Header */}
      <header className="bg-primary-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button className="mr-2" onClick={() => navigate("/")}>
            <i className="ri-arrow-left-line text-xl"></i>
          </button>
          <h1 className="text-lg font-bold">Tournaments</h1>
        </div>
        <div className="flex items-center">
          <div className="bg-primary-50 rounded-full py-1 px-3 mr-2 flex items-center">
            <i className="ri-coin-line text-secondary mr-1"></i>
            <span className="text-sm font-medium">₹{user?.balance?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </header>

      {/* Tournament Filter Tabs */}
      <div className="bg-primary-900 px-4 pb-3">
        {gamesLoading ? (
          <div className="flex space-x-3 overflow-x-auto py-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        ) : (
          <GameFilter 
            games={games || []} 
            selectedGameId={selectedGameId} 
            onSelectGame={handleGameSelection} 
          />
        )}
      </div>

      {/* Main Content Area with Scrolling */}
      <main className="flex-1 overflow-y-auto pb-16">
        {/* Featured Tournaments */}
        <div className="px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold font-rajdhani">Featured Tournaments</h2>
          </div>
          
          {featuredLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="w-full h-48 rounded-xl" />
              ))}
            </div>
          ) : featuredTournaments && featuredTournaments.length > 0 ? (
            <div className="space-y-4">
              {featuredTournaments.map(tournament => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          ) : (
            <div className="bg-primary-50 rounded-xl p-6 text-center">
              <p className="text-gray-400">No featured tournaments available</p>
              {selectedGameId && (
                <p className="text-gray-500 text-sm mt-1">Try selecting a different game</p>
              )}
            </div>
          )}
        </div>

        {/* Free Tournaments */}
        <div className="px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold font-rajdhani">Free Tournaments</h2>
          </div>
          
          {freeLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="w-full h-32 rounded-xl" />
              ))}
            </div>
          ) : freeTournaments && freeTournaments.length > 0 ? (
            <div className="space-y-4">
              {freeTournaments.map(tournament => (
                <TournamentCard key={tournament.id} tournament={tournament} minimal />
              ))}
            </div>
          ) : (
            <div className="bg-primary-50 rounded-xl p-6 text-center">
              <p className="text-gray-400">No free tournaments available</p>
              {selectedGameId && (
                <p className="text-gray-500 text-sm mt-1">Try selecting a different game</p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
