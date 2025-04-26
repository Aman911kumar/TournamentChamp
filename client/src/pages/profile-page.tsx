import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Tournament, Registration } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type UserTournament = Registration & { tournament?: Tournament };

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  // Fetch user tournament history
  const { data: tournamentHistory, isLoading: historyLoading } = useQuery<UserTournament[]>({
    queryKey: ["/api/user/tournaments"],
    enabled: !!user,
  });

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Stats calculation
  const totalTournaments = tournamentHistory?.length || 0;
  const wins = tournamentHistory?.filter(t => t.placement === 1).length || 0;
  const totalEarnings = tournamentHistory?.reduce((sum, t) => sum + (t.earnings || 0), 0) || 0;

  return (
    <div className="flex flex-col min-h-screen bg-primary">
      {/* Header */}
      <header className="bg-primary-900 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Profile</h1>
        <button>
          <i className="ri-settings-3-line text-xl"></i>
        </button>
      </header>

      {/* Profile Header */}
      <div className="bg-primary-900 px-4 pb-6">
        <div className="flex items-center">
          <div className="relative mr-4">
            <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center overflow-hidden">
              {/* User avatar */}
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=FF5722&color=fff`} 
                alt="User Avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-secondary rounded-full p-1">
              <i className="ri-pencil-line text-white text-sm"></i>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.username || 'User'}</h2>
            <p className="text-gray-400 text-sm">@{user?.username?.toLowerCase() || 'user'}</p>
            <div className="flex items-center mt-1">
              <div className="bg-secondary/20 text-secondary text-xs py-0.5 px-2 rounded flex items-center">
                <i className="ri-vip-crown-line mr-1"></i>
                <span>{wins > 0 ? "Pro Player" : "Rookie"}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="flex justify-between mt-6">
          <div className="text-center">
            <p className="text-2xl font-bold">{totalTournaments}</p>
            <p className="text-xs text-gray-400">Tournaments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">{wins}</p>
            <p className="text-xs text-gray-400">Wins</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary">₹{totalEarnings}</p>
            <p className="text-xs text-gray-400">Earnings</p>
          </div>
        </div>
      </div>

      {/* Main Content Area with Scrolling */}
      <main className="flex-1 overflow-y-auto pb-16">
        {/* Account Options */}
        <div className="p-4">
          <h3 className="text-lg font-bold mb-3 font-rajdhani">Account</h3>
          <div className="bg-primary-50 rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-800">
              <a href="#" className="flex items-center justify-between p-4 hover:bg-primary-100">
                <div className="flex items-center">
                  <div className="bg-primary-900 p-2 rounded-full mr-3">
                    <i className="ri-user-settings-line text-blue-400"></i>
                  </div>
                  <span>Edit Profile</span>
                </div>
                <i className="ri-arrow-right-s-line"></i>
              </a>
              <a href="#" className="flex items-center justify-between p-4 hover:bg-primary-100">
                <div className="flex items-center">
                  <div className="bg-primary-900 p-2 rounded-full mr-3">
                    <i className="ri-game-line text-green-400"></i>
                  </div>
                  <span>Game Preferences</span>
                </div>
                <i className="ri-arrow-right-s-line"></i>
              </a>
              <a href="#" className="flex items-center justify-between p-4 hover:bg-primary-100">
                <div className="flex items-center">
                  <div className="bg-primary-900 p-2 rounded-full mr-3">
                    <i className="ri-bank-card-line text-purple-400"></i>
                  </div>
                  <span>Payment Methods</span>
                </div>
                <i className="ri-arrow-right-s-line"></i>
              </a>
            </div>
          </div>
        </div>
        
        {/* Tournament History */}
        <div className="p-4">
          <h3 className="text-lg font-bold mb-3 font-rajdhani">Tournament History</h3>
          
          {historyLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="w-full h-20 rounded-xl" />
              ))}
            </div>
          ) : tournamentHistory && tournamentHistory.length > 0 ? (
            <div className="space-y-3">
              {tournamentHistory.map(entry => (
                <div key={entry.id} className="bg-primary-50 rounded-xl p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex">
                      <div className="bg-primary-900 rounded p-2 mr-3">
                        <img 
                          src={entry.tournament?.imageUrl || "https://placehold.co/100/0F1923/FFFFFF/png?text=Game"} 
                          className="w-10 h-10 rounded" 
                          alt={entry.tournament?.title || "Tournament"} 
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{entry.tournament?.title || "Tournament"}</h4>
                        <p className="text-xs text-gray-400">
                          {entry.registeredAt ? format(new Date(entry.registeredAt), "MMM d, yyyy") : "Unknown date"}
                        </p>
                        <div className="mt-1 flex items-center">
                          {entry.placement === 1 ? (
                            <div className="bg-green-600/20 text-green-500 text-xs py-0.5 px-2 rounded">
                              Winner
                            </div>
                          ) : entry.placement && entry.placement <= 3 ? (
                            <div className="bg-blue-600/20 text-blue-500 text-xs py-0.5 px-2 rounded">
                              {entry.placement}nd Place
                            </div>
                          ) : (
                            <div className="bg-gray-600/20 text-gray-500 text-xs py-0.5 px-2 rounded">
                              {entry.status}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {entry.earnings > 0 && (
                      <div className="text-yellow-400 font-medium">+₹{entry.earnings}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="bg-primary-50 border-gray-700">
              <CardContent className="p-6 text-center">
                <p className="text-gray-400">No tournament history</p>
                <p className="text-gray-500 text-sm mt-1">Join tournaments to build your history</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Logout Button */}
        <div className="p-4">
          <Button 
            className="w-full bg-primary-50 hover:bg-primary-100 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <i className="ri-logout-box-line"></i>
            <span>{logoutMutation.isPending ? "Logging out..." : "Log Out"}</span>
          </Button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
