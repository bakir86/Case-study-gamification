/**
 * leaderboard.js — Leaderboard management
 * Manages NPC entries and player ranking
 */
const Leaderboard = (() => {

  // 15 NPC entries spanning levels 2-9 with varied, realistic stats
  const NPC_ENTRIES = [
    {
      name: 'Sarah Chen',
      avatar: 'SC',
      level: 9,
      levelTitle: 'Industry Expert',
      xp: 28450,
      casesCompleted: 10,
      averageScore: 96,
      isNpc: true
    },
    {
      name: 'Marcus Rodriguez',
      avatar: 'MR',
      level: 8,
      levelTitle: 'C-Suite Executive',
      xp: 22100,
      casesCompleted: 10,
      averageScore: 91,
      isNpc: true
    },
    {
      name: 'Aisha Patel',
      avatar: 'AP',
      level: 8,
      levelTitle: 'C-Suite Executive',
      xp: 19870,
      casesCompleted: 9,
      averageScore: 89,
      isNpc: true
    },
    {
      name: "James O'Brien",
      avatar: 'JO',
      level: 7,
      levelTitle: 'VP of Strategy',
      xp: 15300,
      casesCompleted: 9,
      averageScore: 85,
      isNpc: true
    },
    {
      name: 'Yuki Tanaka',
      avatar: 'YT',
      level: 7,
      levelTitle: 'VP of Strategy',
      xp: 13750,
      casesCompleted: 8,
      averageScore: 88,
      isNpc: true
    },
    {
      name: 'Elena Kovacs',
      avatar: 'EK',
      level: 7,
      levelTitle: 'VP of Strategy',
      xp: 12400,
      casesCompleted: 8,
      averageScore: 82,
      isNpc: true
    },
    {
      name: 'David Okafor',
      avatar: 'DO',
      level: 6,
      levelTitle: 'Director',
      xp: 10200,
      casesCompleted: 7,
      averageScore: 79,
      isNpc: true
    },
    {
      name: 'Priya Sharma',
      avatar: 'PS',
      level: 6,
      levelTitle: 'Director',
      xp: 9600,
      casesCompleted: 7,
      averageScore: 77,
      isNpc: true
    },
    {
      name: 'Tom Mitchell',
      avatar: 'TM',
      level: 5,
      levelTitle: 'Manager',
      xp: 7800,
      casesCompleted: 6,
      averageScore: 74,
      isNpc: true
    },
    {
      name: 'Anna Larsson',
      avatar: 'AL',
      level: 5,
      levelTitle: 'Manager',
      xp: 6900,
      casesCompleted: 5,
      averageScore: 81,
      isNpc: true
    },
    {
      name: 'Carlos Mendez',
      avatar: 'CM',
      level: 4,
      levelTitle: 'Senior Analyst',
      xp: 4500,
      casesCompleted: 5,
      averageScore: 72,
      isNpc: true
    },
    {
      name: 'Liu Wei',
      avatar: 'LW',
      level: 4,
      levelTitle: 'Senior Analyst',
      xp: 3800,
      casesCompleted: 4,
      averageScore: 76,
      isNpc: true
    },
    {
      name: 'Fatima Al-Hassan',
      avatar: 'FA',
      level: 3,
      levelTitle: 'Associate',
      xp: 2200,
      casesCompleted: 3,
      averageScore: 68,
      isNpc: true
    },
    {
      name: 'Robert Klein',
      avatar: 'RK',
      level: 2,
      levelTitle: 'Junior Consultant',
      xp: 1100,
      casesCompleted: 2,
      averageScore: 65,
      isNpc: true
    },
    {
      name: 'Sophie Dubois',
      avatar: 'SD',
      level: 2,
      levelTitle: 'Junior Consultant',
      xp: 780,
      casesCompleted: 1,
      averageScore: 70,
      isNpc: true
    }
  ];

  function buildPlayerEntry(player) {
    if (!player || !player.name) return null;
    const levelData = Player.getLevel();
    const cases = Object.keys(player.completedCases).length;
    const scores = Object.values(player.completedCases).map(c => c.score);
    const avgScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    return {
      name: player.name,
      avatar: player.avatarEmoji || player.avatar || player.name.charAt(0).toUpperCase(),
      level: player.level,
      levelTitle: levelData.title,
      xp: player.xp,
      casesCompleted: cases,
      averageScore: avgScore,
      isNpc: false,
      isPlayer: true
    };
  }

  function getEntries(player) {
    const all = [...NPC_ENTRIES];
    if (player) {
      const playerEntry = buildPlayerEntry(player);
      if (playerEntry) {
        // Remove existing player entry if present
        const existingIdx = all.findIndex(e => !e.isNpc);
        if (existingIdx !== -1) all.splice(existingIdx, 1);
        all.push(playerEntry);
      }
    }
    // Sort by XP descending
    all.sort((a, b) => b.xp - a.xp || b.averageScore - a.averageScore);
    // Add rank
    return all.map((entry, i) => ({ ...entry, rank: i + 1 }));
  }

  function getRank(player) {
    const entries = getEntries(player);
    const playerEntry = entries.find(e => e.isPlayer);
    return playerEntry ? playerEntry.rank : null;
  }

  function getTopN(n, player) {
    return getEntries(player).slice(0, n);
  }

  return {
    getEntries,
    getRank,
    getTopN
  };
})();
