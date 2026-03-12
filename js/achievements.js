/**
 * achievements.js — Achievement system
 * Defines all achievements and logic to check/unlock them
 */
const Achievements = (() => {

  const ACHIEVEMENTS = [
    {
      id: 'first_steps',
      name: 'First Steps',
      desc: 'Complete your first case study',
      icon: '🎯',
      condition: (player, ctx) => player.stats.casesCompleted >= 1
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      desc: 'Complete a case in under 3 minutes',
      icon: '⚡',
      condition: (player, ctx) => {
        if (!ctx || !ctx.timeTaken) return false;
        return ctx.timeTaken <= 180;
      }
    },
    {
      id: 'perfect_score',
      name: 'Perfect Score',
      desc: 'Get 100% on a case study',
      icon: '💯',
      condition: (player, ctx) => {
        if (ctx && ctx.score === 100) return true;
        return player.stats.perfectScores > 0;
      }
    },
    {
      id: 'domain_master_business',
      name: 'Business Master',
      desc: 'Complete all Business cases',
      icon: '💼',
      condition: (player, ctx, cases) => {
        if (!cases) return false;
        const businessCases = cases.filter(c => c.domain === 'Business').map(c => c.id);
        return businessCases.every(id => !!player.completedCases[id]);
      }
    },
    {
      id: 'domain_master_tech',
      name: 'Tech Guru',
      desc: 'Complete all Technology cases',
      icon: '💻',
      condition: (player, ctx, cases) => {
        if (!cases) return false;
        const techCases = cases.filter(c => c.domain === 'Technology').map(c => c.id);
        return techCases.every(id => !!player.completedCases[id]);
      }
    },
    {
      id: 'domain_master_healthcare',
      name: 'Health Champion',
      desc: 'Complete all Healthcare cases',
      icon: '🏥',
      condition: (player, ctx, cases) => {
        if (!cases) return false;
        const hcCases = cases.filter(c => c.domain === 'Healthcare').map(c => c.id);
        return hcCases.every(id => !!player.completedCases[id]);
      }
    },
    {
      id: 'domain_master_finance',
      name: 'Finance Wizard',
      desc: 'Complete all Finance cases',
      icon: '💰',
      condition: (player, ctx, cases) => {
        if (!cases) return false;
        const finCases = cases.filter(c => c.domain === 'Finance').map(c => c.id);
        return finCases.every(id => !!player.completedCases[id]);
      }
    },
    {
      id: 'domain_master_leadership',
      name: 'True Leader',
      desc: 'Complete all Leadership cases',
      icon: '👑',
      condition: (player, ctx, cases) => {
        if (!cases) return false;
        const leadCases = cases.filter(c => c.domain === 'Leadership').map(c => c.id);
        return leadCases.every(id => !!player.completedCases[id]);
      }
    },
    {
      id: 'streak_master',
      name: 'Streak Master',
      desc: 'Achieve a 5x consecutive good-decision streak',
      icon: '🔥',
      condition: (player, ctx) => {
        if (ctx && ctx.maxStreak >= 5) return true;
        return player.stats.bestStreak >= 5;
      }
    },
    {
      id: 'completionist',
      name: 'Completionist',
      desc: 'Finish all case studies',
      icon: '🏆',
      condition: (player, ctx, cases) => {
        if (!cases) return false;
        return cases.every(c => !!player.completedCases[c.id]);
      }
    },
    {
      id: 'risk_taker',
      name: 'Risk Taker',
      desc: 'Choose all high-risk options in a single case',
      icon: '🎲',
      condition: (player, ctx) => {
        if (ctx && ctx.allHighRisk) return true;
        return false;
      }
    },
    {
      id: 'play_it_safe',
      name: 'Play It Safe',
      desc: 'Choose all low-risk options in a single case',
      icon: '🛡️',
      condition: (player, ctx) => {
        if (ctx && ctx.allLowRisk) return true;
        return false;
      }
    },
    {
      id: 'quick_thinker',
      name: 'Quick Thinker',
      desc: 'Make 10 decisions in under 10 seconds each',
      icon: '🧠',
      condition: (player, ctx) => {
        return (player.stats.quickDecisions || 0) >= 10;
      }
    },
    {
      id: 'scholar',
      name: 'Scholar',
      desc: 'Read all evidence before making decisions in a case',
      icon: '📚',
      condition: (player, ctx) => {
        if (ctx && ctx.allEvidenceRead) return true;
        return false;
      }
    },
    {
      id: 'veteran',
      name: 'Veteran',
      desc: 'Complete 5 or more case studies',
      icon: '🎖️',
      condition: (player, ctx) => player.stats.casesCompleted >= 5
    },
    {
      id: 'comeback',
      name: 'Comeback Kid',
      desc: 'Score above 80% after a previous score below 50%',
      icon: '📈',
      condition: (player, ctx) => {
        if (!ctx || ctx.score === undefined) return false;
        const scores = Object.values(player.completedCases).map(c => c.score);
        const hadBad = scores.some(s => s < 50);
        const hasGood = ctx.score >= 80;
        return hadBad && hasGood;
      }
    }
  ];

  /**
   * Check which achievements should be unlocked given current state.
   * Returns array of newly unlocked achievement objects.
   */
  function checkAchievements(player, gameContext, cases) {
    const newlyUnlocked = [];
    for (const achievement of ACHIEVEMENTS) {
      // Skip if already unlocked
      if (player.achievements.includes(achievement.id)) continue;
      try {
        if (achievement.condition(player, gameContext, cases)) {
          const didUnlock = Player.unlockAchievement(achievement.id);
          if (didUnlock) {
            newlyUnlocked.push(achievement);
          }
        }
      } catch (e) {
        console.warn('[Achievements] Error checking:', achievement.id, e);
      }
    }
    return newlyUnlocked;
  }

  function getAll() {
    return ACHIEVEMENTS;
  }

  function getById(id) {
    return ACHIEVEMENTS.find(a => a.id === id) || null;
  }

  function getUnlocked(player) {
    if (!player) return [];
    return ACHIEVEMENTS.filter(a => player.achievements.includes(a.id));
  }

  function getLocked(player) {
    if (!player) return ACHIEVEMENTS;
    return ACHIEVEMENTS.filter(a => !player.achievements.includes(a.id));
  }

  return {
    checkAchievements,
    getAll,
    getById,
    getUnlocked,
    getLocked
  };
})();
