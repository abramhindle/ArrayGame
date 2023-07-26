const arrayColours = ["#00f", "#80f", "#f0f", "#f00", "#f80", "#ff0", "#0f0", "#0ff"]
const titleNames = ["Today Game", "Astray Game", "Convey Game", "Decay Game", "Dismay Game", "Delay Game", "Repay Game", "Obey Game", "Away Game", "Display Game", "Hooray Game", "Betray Game"]
const AGeneratorCostBases = [10, 100, 1000, 100000, 1e7]
const AGeneratorCostExponents = [1.2, 1.3, 1.4, 1.5, 1.6]
const AUpgradeCostBases = [1e6, 1e8, 1e80]
const AUpgradeCostExponents = [10, 100, 1e10]
const BGeneratorCostBases = [10, 100, 1000, 10000, 100000]
const BGeneratorCostExponents = [1.2, 1.3, 1.4, 1.5, 1.6]
const BUpgradeCostBases = [1e80, 1e200]
const BUpgradeCostExponents = [1e10, 1e100]
const CGeneratorCostBases = [10, 100, 1000, 10000, 100000]
const CGeneratorCostExponents = [1.2, 1.3, 1.4, 1.5, 1.6]
const CMilestones = [1, 3, 5, 8, 10, 20, 30, 50, 100, 300, 10000, 30000, 100000, 1e6]
const DGeneratorCostBases = [10, 100, 1000, 10000, 100000]
const DGeneratorCostExponents = [1.2, 1.3, 1.4, 1.5, 1.6]
const DMilestones = [1, 2, 4, 7, 10, 30, 60, 100, 400, 1000, 2000, 20000, 50000, 200000, 2.5e6, 7.5e7]
const challengeGoals = [
["1e25", "1e50", "1e75", "1e90", "1e110", "1e130"],
["1e80", "1e100", "1e120", "1e140", "1e160", "1e180"],
["1e175", "1e225", "1e275", "1e325", "1e375", "1e425"],
["1e80", "1e100", "1e120", "1e135", "1e150", "1e165"],
["1e175", "1e550", "1e675", "1e725", "1e750", "1e780"],
["1e475", "1e525", "1e640", "1e720", "1e800", "1e950"],
["1e1500", "1e1800", "1e2200", "1e2500", "1e3000", "1e3500"],
["1e280", "1e350", "1e390", "1e450", "1e495", "1e540"]]
const separatorUpgradeCosts = [5, 4, 6, 8, 100, 250000]