import { db } from './db';
import { games, tournaments, InsertGame, InsertTournament } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function seedDatabase() {
  console.log('Seeding database with initial data...');
  
  // Check if we already have games
  const existingGames = await db.select().from(games);
  if (existingGames.length === 0) {
    // Create games
    const gameData: InsertGame[] = [
      { name: "Free Fire", imageUrl: "https://freefiremobile-a.akamaihd.net/ffwebsite/images/freefire32-2.png" },
      { name: "PUBG Mobile", imageUrl: "https://w7.pngwing.com/pngs/944/476/png-transparent-playerunknown-s-battlegrounds-pubg-mobile-fortnite-battle-royale-game-android-game-angle-game-rectangle-thumbnail.png" },
      { name: "Call of Duty", imageUrl: "https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/blog/hero/mw-wz/WZ-Season-Three-Announce-TOUT.jpg" },
      { name: "Fortnite", imageUrl: "https://cdn2.unrealengine.com/24br-s24-egs-launcher-pdp-2560x1440-2560x1440-2a7353b5a438.jpg" }
    ];
    
    console.log('Adding games...');
    await db.insert(games).values(gameData);
  }
  
  // Check if we already have tournaments
  const existingTournaments = await db.select().from(tournaments);
  if (existingTournaments.length === 0) {
    // Create tournaments
    const tournamentData: InsertTournament[] = [
      {
        title: "Free Fire Pro League",
        gameId: 1,
        description: "Battle for glory in the Free Fire Pro League",
        startTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
        prizePool: 5000,
        entryFee: 100,
        maxPlayers: 100,
        status: "live",
        tournamentType: "solo",
        featured: true,
        imageUrl: "https://img.fresherslive.com/latestnews/images/articles/origin/2023/07/28/free-fire-max-obm-rush-rush-1-tournament-register-online-64c3a4c4f36c1-1690548420.jpg"
      },
      {
        title: "PUBG Mobile Cup",
        gameId: 2,
        description: "Compete in the PUBG Mobile Cup tournament",
        startTime: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        endTime: new Date(Date.now() + 1000 * 60 * 45), // 45 mins from now
        prizePool: 10000,
        entryFee: 50,
        maxPlayers: 100,
        status: "live",
        tournamentType: "squad",
        featured: true,
        imageUrl: "https://cdn.oneesports.gg/cdn-data/2022/05/PUBGM_PMPL_2022_Spring_SEA.jpg"
      },
      {
        title: "Call of Duty Championship",
        gameId: 3,
        description: "The ultimate Call of Duty showdown",
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 60 * 3), // 2 days + 3 hours from now
        prizePool: 15000,
        entryFee: 200,
        maxPlayers: 64,
        status: "upcoming",
        tournamentType: "team",
        featured: false,
        imageUrl: "https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/championships/2022/desktop/COD_CWL-Desktop_Championships_Overview_HERO-BANNER.jpg"
      },
      {
        title: "Fortnite Beginners Cup",
        gameId: 4,
        description: "The perfect tournament for Fortnite beginners",
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60 * 4), // 3 days + 4 hours from now
        prizePool: 2000,
        entryFee: 0,
        maxPlayers: 50,
        status: "upcoming",
        tournamentType: "solo",
        featured: false,
        imageUrl: "https://cdn2.unrealengine.com/fortnite-competitive-update-chapter-2-season-6-1920x1080-dc8c70a98462.jpg"
      },
      {
        title: "Free Fire World Series",
        gameId: 1,
        description: "The biggest Free Fire tournament of the year",
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 + 1000 * 60 * 60 * 5), // 1 day + 5 hours from now
        prizePool: 25000,
        entryFee: 100,
        maxPlayers: 100,
        status: "upcoming",
        tournamentType: "solo",
        featured: true,
        imageUrl: "https://staticg.sportskeeda.com/editor/2023/11/aeec5-17008069242986-1920.jpg"
      },
      {
        title: "Call of Duty Practice Match",
        gameId: 3,
        description: "Practice your skills in this free tournament",
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 + 1000 * 60 * 60 * 2), // 1 day + 2 hours from now
        prizePool: 500,
        entryFee: 0,
        maxPlayers: 50,
        status: "upcoming",
        tournamentType: "solo",
        featured: false,
        imageUrl: "https://assets.xboxservices.com/assets/15/02/1502c04d-c508-4364-ae47-53bca9dabba2.jpg"
      }
    ];
    
    console.log('Adding tournaments...');
    await db.insert(tournaments).values(tournamentData);
    
    // Update current players for tournaments
    console.log('Updating tournament player counts...');
    await db.update(tournaments)
      .set({ currentPlayers: 32 })
      .where(eq(tournaments.id, 1));
    await db.update(tournaments)
      .set({ currentPlayers: 78 })
      .where(eq(tournaments.id, 2));
  }
  
  console.log('Database seeding completed!');
}

export { seedDatabase };