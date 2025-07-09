import React from "react";
import { Link } from "wouter";
import { Tournament, Game } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow, format, isPast, isToday, isTomorrow } from "date-fns";

interface TournamentCardProps {
  tournament: Tournament;
  minimal?: boolean;
  showRegisterButton?: boolean;
}

export function TournamentCard({ tournament, minimal = false, showRegisterButton = true }: TournamentCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: game } = useQuery<Game>({
    queryKey: [`/api/games/${tournament.gameId}`],
    enabled: !!tournament.gameId,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/tournaments/${tournament.id}/register`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: `You have successfully registered for ${tournament.title}`,
        variant: "success"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to register for tournament",
        variant: "destructive"
      });
    }
  });

  const handleRegister = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to register for tournaments",
        variant: "destructive"
      });
      return;
    }

    registerMutation.mutate();
  };

  const getStatusBadge = () => {
    if (tournament.status === "live") {
      return (
        <div className="bg-red-600 text-white text-xs font-bold py-1 px-2 rounded inline-block mb-2">LIVE NOW</div>
      );
    } else if (tournament.status === "upcoming") {
      return (
        <div className="bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded inline-block mb-2">UPCOMING</div>
      );
    } else if (tournament.featured) {
      return (
        <div className="bg-secondary text-white text-xs font-bold py-1 px-2 rounded inline-block mb-2">FEATURED</div>
      );
    }
    return null;
  };

  const getTimeDisplay = () => {
    const startTime = new Date(tournament.startTime);

    if (tournament.status === "live") {
      if (!tournament.endTime) return "Unknown end time";

      const endTime = new Date(tournament.endTime);
      if (isNaN(endTime.getTime())) return "Invalid end time";

      return `Ends in ${formatDistanceToNow(endTime, { addSuffix: false })}`;
    } else if (tournament.status === "upcoming") {
      if (isToday(startTime)) {
        return `Today, ${format(startTime, "h:mm a")}`;
      } else if (isTomorrow(startTime)) {
        return `Tomorrow, ${format(startTime, "h:mm a")}`;
      }
    }
    return format(startTime, "MMM d, h:mm a");
  };

  const getButtonText = () => {
    if (tournament.status === "live") {
      return "Join Now";
    } else if (tournament.status === "upcoming") {
      return "Register";
    }
    return "View Details";
  };

  if (minimal) {
    return (
      <div className="bg-primary-50 rounded-xl overflow-hidden">
        <div className="relative">
          <img
            src={tournament.imageUrl || "https://placehold.co/500x200/0F1923/FFFFFF/png?text=Tournament"}
            className="w-full h-24 object-cover"
            alt={tournament.title}
          />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-primary via-primary/50 to-transparent"></div>
          {game && (
            <div className="absolute top-3 right-3">
              <div className="bg-primary-900/80 rounded p-1.5">
                <img src={game.imageUrl} className="w-6 h-6 rounded" alt={game.name} />
              </div>
            </div>
          )}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-base font-bold">{tournament.title}</h3>
          </div>
        </div>
        <div className="p-3 flex justify-between items-center">
          <div>
            <div className="flex items-center text-xs text-gray-400 mb-1">
              <i className="ri-calendar-line mr-1"></i>
              <span>{getTimeDisplay()}</span>
            </div>
            <div className="flex items-center text-xs text-green-400">
              <i className="ri-money-dollar-circle-line mr-1"></i>
              <span className="font-medium">
                {tournament.entryFee > 0 ? `₹${tournament.entryFee}` : "Free Entry"}
              </span>
            </div>
          </div>
          {showRegisterButton && (
            <button
              className="bg-secondary hover:bg-secondary-600 text-white font-medium py-1.5 px-4 rounded-lg transition text-sm"
              onClick={handleRegister}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "..." : getButtonText()}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary-50 rounded-xl overflow-hidden">
      <div className="game-card" style={{ backgroundImage: `url(${tournament.imageUrl || "https://placehold.co/500x200/0F1923/FFFFFF/png?text=Tournament"})` }}>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              {getStatusBadge()}
              <h3 className="text-lg font-bold">{tournament.title}</h3>
              <div className="flex items-center text-sm mt-1 text-gray-300">
                {tournament.status === "live" ? (
                  <>
                    <i className="ri-user-line mr-1"></i>
                    <span>{tournament.currentPlayers}/{tournament.maxPlayers} Players</span>
                  </>
                ) : (
                  <>
                    <i className="ri-calendar-line mr-1"></i>
                    <span>{getTimeDisplay()}</span>
                  </>
                )}
              </div>
            </div>
            {game && (
              <div className="bg-primary-900/80 rounded-lg p-2">
                <img src={game.imageUrl} className="w-10 h-10 rounded-md" alt={game.name} />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-3 flex justify-between items-center">
        <div>
          <div className="flex items-center text-yellow-400 mb-1">
            <i className="ri-trophy-line mr-1"></i>
            <span className="font-medium">₹{tournament.prizePool}</span>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <i className="ri-time-line mr-1"></i>
            <span>
              {tournament.status === "live"
                ? tournament.endTime
                  ? `Ends in ${formatDistanceToNow(new Date(tournament.endTime))}`
                  : "Ends at unknown time"
                : tournament.tournamentType}
            </span>

          </div>
        </div>
        {showRegisterButton && (
          <button
            className="bg-secondary hover:bg-secondary-600 text-white font-medium py-2 px-4 rounded-lg transition"
            onClick={handleRegister}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "..." : getButtonText()}
          </button>
        )}
      </div>
    </div>
  );
}
