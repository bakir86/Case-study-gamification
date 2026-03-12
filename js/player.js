/**
 * player.js — Player management module
 * Handles player data, XP, levels, and localStorage persistence
 */
const Player = (() => {
  const STORAGE_KEY = 'csg_player_data';

  const LEVELS = [
    { level: 1,  title: 'Novice Analyst',      xpRequired: 0 },
    { level: 2,  title: 'Junior Consultant',   xpRequired: 500 },
    { level: 3,  title: 'Associate',           xpRequired: 1500 },
    { level: 4,  title: 'Senior Analyst',      xpRequired: 3000 },
    { level: 5,  title: 'Manager',             xpRequired: 5000 },
    { level: 6,  title: 'Director',            xpRequired: 8000 },
    { level: 7,  title: 'VP of Strategy',      xpRequired: 12000 },
    { level: 8,  title: 'C-Suite Executive',   xpRequired: 18000 },
    { level: 9,  title: 'Industry Expert',     xpRequired: 25000 },
    { level: 10, title: 'Legendary Strategist',xpRequired: 35000 },
  ];

  const AVATAR_OPTIONS = ['🧠', '🚀', '💡', '🎯', '⚡', '🔥', '💎', '🌟'];

  function createDefaultPlayer(name) {
    return {
      name: name || '',
      avatar: name ? name.charAt(0).toUpperCase() : 'A',
      avatarEmoji: '',
      xp: 0,
      level: 1,
      completedCases: {},
      achievements: [],
      stats: {
        totalDecisions: 0,
        perfectScores: 0,
        bestStreak: 0,
        totalTimePlayed: 0,
        casesCompleted: 0,
        averageScore: 0,
        quickDecisions: 0,
        allHighRiskCase: false,
        allLowRiskCase: false,
        evidenceReadCase: false,
        domainScores: {
          Business: [],
          Technology: [],
          Healthcare: [],
          Finance: [],
          Leadership: []
        }
      }
    };
  }

  function loadPlayer() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const player = JSON.parse(raw);
      // Ensure all required fields exist (migration safety)
      if (!player.stats.domainScores) {
        player.stats.domainScores = { Business: [], Technology: [], Healthcare: [], Finance: [], Leadership: [] };
      }
      if (!player.stats.quickDecisions) player.stats.quickDecisions = 0;
      if (!player.avatarEmoji) player.avatarEmoji = '';
      return player;
    } catch (e) {
      console.warn('[Player] Failed to load from localStorage:', e);
      return null;
    }
  }

  function savePlayer(player) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    } catch (e) {
      console.warn('[Player] Failed to save to localStorage:', e);
    }
  }

  function calculateLevel(xp) {
    let currentLevel = LEVELS[0];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].xpRequired) {
        currentLevel = LEVELS[i];
        break;
      }
    }
    return currentLevel;
  }

  function getLevelProgress(xp) {
    const current = calculateLevel(xp);
    const nextLevelData = LEVELS.find(l => l.level === current.level + 1);
    if (!nextLevelData) {
      return { current: current.xpRequired, max: current.xpRequired, percent: 100 };
    }
    const currentLevelXp = xp - current.xpRequired;
    const neededXp = nextLevelData.xpRequired - current.xpRequired;
    return {
      current: currentLevelXp,
      max: neededXp,
      percent: Math.min(100, Math.round((currentLevelXp / neededXp) * 100)),
      nextTitle: nextLevelData.title,
      xpToNext: nextLevelData.xpRequired - xp
    };
  }

  // Public API
  let _player = null;

  function init() {
    _player = loadPlayer();
    return _player;
  }

  function getPlayer() {
    return _player;
  }

  function isNewPlayer() {
    return _player === null;
  }

  function createPlayer(name) {
    _player = createDefaultPlayer(name);
    savePlayer(_player);
    return _player;
  }

  function addXP(amount) {
    if (!_player) return { gained: 0, leveled: false, newLevel: null };
    const oldLevel = _player.level;
    _player.xp += amount;
    const newLevelData = calculateLevel(_player.xp);
    _player.level = newLevelData.level;
    savePlayer(_player);
    const leveled = newLevelData.level > oldLevel;
    return {
      gained: amount,
      leveled,
      newLevel: leveled ? newLevelData : null,
      newLevelTitle: leveled ? newLevelData.title : null
    };
  }

  function getLevel() {
    if (!_player) return LEVELS[0];
    return calculateLevel(_player.xp);
  }

  function getLevelData() {
    return LEVELS;
  }

  function updateStats(statsUpdate) {
    if (!_player) return;
    Object.assign(_player.stats, statsUpdate);
    savePlayer(_player);
  }

  function recordCaseCompletion(caseId, domain, score, xpEarned, decisions, timeTaken) {
    if (!_player) return;

    const isFirst = !_player.completedCases[caseId];
    _player.completedCases[caseId] = {
      score,
      xpEarned,
      timestamp: Date.now(),
      decisions,
      timeTaken
    };

    // Update stats
    _player.stats.casesCompleted = Object.keys(_player.completedCases).length;
    if (score >= 100) _player.stats.perfectScores++;
    _player.stats.totalTimePlayed += timeTaken;

    // Domain scores
    if (!_player.stats.domainScores[domain]) {
      _player.stats.domainScores[domain] = [];
    }
    _player.stats.domainScores[domain].push(score);

    // Recalculate average score
    const allScores = Object.values(_player.completedCases).map(c => c.score);
    _player.stats.averageScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

    savePlayer(_player);
    return isFirst;
  }

  function updateBestStreak(streak) {
    if (!_player) return;
    if (streak > _player.stats.bestStreak) {
      _player.stats.bestStreak = streak;
      savePlayer(_player);
    }
  }

  function incrementDecisions(count) {
    if (!_player) return;
    _player.stats.totalDecisions += count;
    savePlayer(_player);
  }

  function incrementQuickDecisions(count) {
    if (!_player) return;
    _player.stats.quickDecisions = (_player.stats.quickDecisions || 0) + count;
    savePlayer(_player);
  }

  function unlockAchievement(id) {
    if (!_player) return false;
    if (_player.achievements.includes(id)) return false;
    _player.achievements.push(id);
    savePlayer(_player);
    return true;
  }

  function setName(name) {
    if (!_player) return;
    _player.name = name;
    _player.avatar = name.charAt(0).toUpperCase();
    savePlayer(_player);
  }

  function setAvatarEmoji(emoji) {
    if (!_player) return;
    _player.avatarEmoji = emoji;
    savePlayer(_player);
  }

  function resetPlayer() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      _player = null;
    } catch (e) {
      console.warn('[Player] Failed to reset:', e);
    }
  }

  function getAvatarOptions() {
    return AVATAR_OPTIONS;
  }

  function getDisplayAvatar() {
    if (!_player) return 'A';
    return _player.avatarEmoji || _player.avatar || 'A';
  }

  function getDomainAvgScore(domain) {
    if (!_player || !_player.stats.domainScores[domain]) return 0;
    const scores = _player.stats.domainScores[domain];
    if (!scores.length) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  return {
    init,
    getPlayer,
    isNewPlayer,
    createPlayer,
    addXP,
    getLevel,
    getLevelData,
    getLevelProgress,
    updateStats,
    recordCaseCompletion,
    updateBestStreak,
    incrementDecisions,
    incrementQuickDecisions,
    unlockAchievement,
    setName,
    setAvatarEmoji,
    resetPlayer,
    getAvatarOptions,
    getDisplayAvatar,
    getDomainAvgScore,
    LEVELS
  };
})();
