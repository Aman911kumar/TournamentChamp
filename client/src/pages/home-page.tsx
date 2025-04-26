import React from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Game, Tournament } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { EsportsLogoWithText } from "@/components/ui/esports-logo";
import { GameCard } from "@/components/game-card";
import { TournamentCard } from "@/components/tournament-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { user } = useAuth();

  const { data: games, isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const { data: featuredTournaments, isLoading: featuredLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments", { status: "featured" }],
  });

  const { data: liveTournaments, isLoading: liveLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments", { status: "live" }],
  });

  const { data: upcomingTournaments, isLoading: upcomingLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments", { status: "upcoming" }],
  });

  return (
    <div className="flex flex-col min-h-screen bg-primary">
      {/* Header */}
      <header className="bg-primary-900 px-4 py-3 flex items-center justify-between">
        <EsportsLogoWithText />
        <div className="flex items-center">
          <div className="bg-primary-50 rounded-full py-1 px-3 mr-2 flex items-center">
            <i className="ri-coin-line text-secondary mr-1"></i>
            <span className="text-sm font-medium">₹{user?.balance?.toFixed(2) || '0.00'}</span>
          </div>
          <button className="text-white p-1">
            <i className="ri-notification-3-line text-xl"></i>
          </button>
        </div>
      </header>

      {/* Main Content Area with Scrolling */}
      <main className="flex-1 overflow-y-auto pb-16">
        {/* Featured Tournament Banner */}
        <div className="relative p-4">
          {featuredLoading ? (
            <Skeleton className="w-full h-40 rounded-xl" />
          ) : featuredTournaments && featuredTournaments.length > 0 ? (
            <div className="relative rounded-xl overflow-hidden">
              <img 
                src={featuredTournaments[0].imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"} 
                className="w-full h-40 object-cover" 
                alt="Featured tournament" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent flex flex-col justify-end p-4">
                <div className="bg-secondary text-white text-xs font-bold py-1 px-2 rounded-md inline-block mb-2 w-fit">FEATURED</div>
                <h2 className="text-xl font-bold">{featuredTournaments[0].title}</h2>
                <div className="flex items-center text-sm mt-1">
                  <i className="ri-trophy-line text-yellow-400 mr-1"></i>
                  <span>Prize Pool: ₹{featuredTournaments[0].prizePool}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-40 bg-primary-50 rounded-xl flex items-center justify-center">
              <p className="text-gray-400">No featured tournaments</p>
            </div>
          )}
        </div>

        {/* Game Selection */}
        <div className="px-4 mb-6">
          <h2 className="text-xl font-bold mb-3 font-rajdhani">Popular Games</h2>
          {gamesLoading ? (
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="w-full aspect-square rounded-xl mb-1" />
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {games?.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>

        {/* Live Tournaments */}
        <div className="px-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold font-rajdhani">Live Tournaments</h2>
            <Link href="/tournaments" className="text-secondary text-sm">View All</Link>
          </div>
          
          {liveLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="w-full h-48 rounded-xl" />
              ))}
            </div>
          ) : liveTournaments && liveTournaments.length > 0 ? (
            <div className="space-y-4">
              {liveTournaments.map(tournament => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          ) : (
            <div className="bg-primary-50 rounded-xl p-6 text-center">
              <p className="text-gray-400">No live tournaments at the moment</p>
              <p className="text-gray-500 text-sm mt-1">Check back later for upcoming events</p>
            </div>
          )}
        </div>

        {/* Upcoming Tournaments */}
        <div className="px-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold font-rajdhani">Upcoming Tournaments</h2>
            <Link href="/tournaments" className="text-secondary text-sm">View All</Link>
          </div>
          
          {upcomingLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="w-full h-48 rounded-xl" />
              ))}
            </div>
          ) : upcomingTournaments && upcomingTournaments.length > 0 ? (
            <div className="space-y-4">
              {upcomingTournaments.slice(0, 2).map(tournament => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          ) : (
            <div className="bg-primary-50 rounded-xl p-6 text-center">
              <p className="text-gray-400">No upcoming tournaments</p>
              <p className="text-gray-500 text-sm mt-1">Check back later for new events</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
