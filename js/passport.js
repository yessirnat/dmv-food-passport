// Reads and writes all user progress to localStorage

const STORAGE_KEYS = {
  visits: "dmv-passport-visits",
  xp: "dmv-passport-xp",
  level: "dmv-passport-level"
};

function getVisits() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.visits)) || {};
  } catch {
    return {};
  }
}

function getVisit(restaurantId) {
  return getVisits()[restaurantId] || null;
}

function saveVisit(restaurantId, visitData) {
  const visits = getVisits();
  visits[restaurantId] = { ...visits[restaurantId], ...visitData };
  localStorage.setItem(STORAGE_KEYS.visits, JSON.stringify(visits));
}

function getXP() {
  return parseInt(localStorage.getItem(STORAGE_KEYS.xp) || "0", 10);
}

function addXP(amount) {
  const current = getXP();
  const newXP = current + amount;
  localStorage.setItem(STORAGE_KEYS.xp, String(newXP));
  updateLevel(newXP);
  return newXP;
}

function updateLevel(xp) {
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXP) currentLevel = level;
  }
  localStorage.setItem(STORAGE_KEYS.level, currentLevel.name);
  return currentLevel;
}

function getCurrentLevel() {
  const xp = getXP();
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXP) currentLevel = level;
  }
  return currentLevel;
}

function getNextLevel() {
  const xp = getXP();
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp < LEVELS[i].minXP) return LEVELS[i];
  }
  return null;
}

function getXPProgress() {
  const xp = getXP();
  const current = getCurrentLevel();
  const next = getNextLevel();
  if (!next) return { percent: 100, xpInLevel: xp - current.minXP, xpNeeded: 0 };
  const xpInLevel = xp - current.minXP;
  const xpNeeded = next.minXP - current.minXP;
  return { percent: Math.round((xpInLevel / xpNeeded) * 100), xpInLevel, xpNeeded };
}

function checkNeighborhoodComplete(passportId, neighborhood) {
  const passport = PASSPORTS[passportId];
  if (!passport) return false;
  const visits = getVisits();
  const inNeighborhood = passport.restaurants.filter(r => r.neighborhood === neighborhood);
  return inNeighborhood.every(r => visits[r.id]?.checkedIn);
}

function getStampCount(passportId) {
  const passport = PASSPORTS[passportId];
  if (!passport) return 0;
  const visits = getVisits();
  return passport.restaurants.filter(r => visits[r.id]?.checkedIn).length;
}

function isGoldStamp(restaurantId) {
  const visit = getVisit(restaurantId);
  return visit?.checkedIn && visit?.scores?.overall >= 4.5;
}

function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}

// ── Custom restaurants ────────────────────────────────────────────────────────
const CUSTOM_KEY = "dmv-passport-custom";

function getCustomRestaurants(passportId) {
  try {
    const all = JSON.parse(localStorage.getItem(CUSTOM_KEY)) || {};
    return Object.values(all).filter(r => r.passportId === passportId);
  } catch { return []; }
}

function saveCustomRestaurant(data) {
  const all = (() => { try { return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || {}; } catch { return {}; } })();
  const id = data.id || "custom-" + Date.now();
  all[id] = { ...data, id, custom: true };
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(all));
  return all[id];
}

function deleteCustomRestaurant(id) {
  const all = (() => { try { return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || {}; } catch { return {}; } })();
  delete all[id];
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(all));
}

function getStampCountWithCustom(passportId) {
  const passport = PASSPORTS[passportId];
  if (!passport) return 0;
  const custom = getCustomRestaurants(passportId);
  const visits = getVisits();
  const builtInVisited = passport.restaurants.filter(r => visits[r.id]?.checkedIn).length;
  const customVisited = custom.filter(r => visits[r.id]?.checkedIn).length;
  return builtInVisited + customVisited;
}
