window.isDevVersion = window.location.href.indexOf('demonin.com') === -1
framerate = 60

//Formatting code modified from RedShark77's games
function format(ex, acc = 0, max = 9, forceFormat = "None") {
  if (game.numberFormat == "Normal" || forceFormat == "Normal") { // Check if the number format is set to "normal" or forced to "normal"
    function E(x) {
      return new Decimal(x)
    }
    ex = E(ex) // Convert the input value into a Decimal object
    neg = ex.lt(0) ? "-" : "" // Store the sign of the number
    if (ex.mag == Infinity) return neg + 'Infinity' // Check for infinity and NaN cases
    if (Number.isNaN(ex.mag)) return neg + 'NaN'
    //The bit I added, this rounds the mag if it's extremely close to an integer due to rounding errors during calculations
    if (ex.layer > 0 && ex.mag % 1 != 0 && (ex.mag % 1) > 0.9999) ex.mag = Math.round(ex.mag)
    if (ex.lt(0)) ex = ex.mul(-1) // Convert negative numbers to positive for further processing
    if (ex.eq(0)) return ex.toFixed(acc) // Return the value with specified decimal places if the number is zero
    let e = ex.log10().floor() // Calculate the exponent of the number
    if (ex.log10().lt(Math.min(-acc, 0)) && acc > 1) { // Handle numbers smaller than 10^-acc
      let e = ex.log10().ceil()
      let m = ex.div(e.eq(-1) ? E(0.1) : E(10).pow(e))
      let be = e.mul(-1).max(1).log10().gte(9)
      return neg + (be ? '' : m.toFixed(2)) + 'e' + format(e, 0, max, forceFormat)
    }
    else if (e.lt(max)) { // Handle numbers smaller than the max value
      let a = Math.max(Math.min(acc - e.toNumber(), acc), 0)
      return neg + (a > 0 ? ex.toFixed(a) : ex.toFixed(a).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'))
    }
    else { // Handle numbers larger than or equal to the max value
      if (ex.gte("eeee9")) {
        let slog = ex.slog()
        return (slog.gte(1e9) ? '' : E(10).pow(slog.sub(slog.floor())).toFixed(4)) + "F" + format(slog.floor(), 0)
      }
      let m = ex.div(E(10).pow(e))
      let be = e.log10().gte(3)
      return neg + (be ? '' : m.toFixed(2)) + 'e' + format(e, 0, max, forceFormat)
    }
  }
  //My section (could be improved) for handling array notation
  else if (game.numberFormat = "Array" || forceFormat == "Array") {
    function E(x) {
      return new Decimal(x)
    }
    ex = E(ex) // Convert the input value into a Decimal object
    neg = ex.lt(0) ? "-" : "" // Store the sign of the number
    if (ex.mag == Infinity) return neg + 'Infinity' // Check for infinity and NaN cases
    if (Number.isNaN(ex.mag)) return neg + 'NaN'
    //The bit I added, this rounds the mag if it's extremely close to an integer due to rounding errors during calculations
    if (ex.layer > 0 && ex.mag % 1 != 0 && (ex.mag % 1) > 0.9999) ex.mag = Math.round(ex.mag)
		if (ex.eq(0)) return ex.toFixed(acc) // Return the value with specified decimal places if the number is zero
    let e = ex.log10().floor() // Calculate the exponent of the number
    if (ex.lt(1e9)) { // Handle numbers smaller than 1e9
      let a = Math.max(Math.min(acc - e.toNumber(), acc), 0)
      return neg + (a > 0 ? ex.toFixed(a) : ex.toFixed(a).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'))
    }
    else if (ex.lt("eeee9")) { // Handle numbers smaller than "eeee9"
			
      if (ex.log10().eq(ex.log10().round())) {
        return "{10, " + format(ex.log10(), 0, max, forceFormat) + "}"
      }
      else {
        return "{10, " + format(ex.log10(), 3, max, forceFormat) + "}"
      }
    }
    else { // Handle numbers larger than or equal to "eeee9"
      return "{10, " + format(ex.slog(), 3, max, forceFormat) + ", 2}"
    }
  }
}

var autosaveStarted = false;
//Sets all variables to their base values
function reset() {
  game = {
    array: [new Decimal(10), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
    unlocks: 0,
		separatorUnlocks: 0,
    timeOfLastUpdate: Date.now(),
    numberFormat: "Normal",
		currentFont: 0,
    currentTab: 0,
		confirmations: [true, true, true, true, true],

    currentChallenge: 0,
    challengesBeaten: [0, 0, 0, 0, 0, 0, 0, 0],

    AGenerators: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
    AGeneratorsBought: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
    AGeneratorCosts: [new Decimal(10), new Decimal(100), new Decimal(1000), new Decimal(100000), new Decimal(1e7)],
    AGeneratorProduction: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
    AUpgradesBought: [new Decimal(0), new Decimal(0), new Decimal(0)],
    AUpgradeCosts: [new Decimal(1e6), new Decimal(1e8), new Decimal(1e80)],

    BToGet: new Decimal(0),
    BGenerators: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
    BGeneratorsBought: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
    BGeneratorCosts: [new Decimal(10), new Decimal(100), new Decimal(1000), new Decimal(10000), new Decimal(100000)],
    BGeneratorProduction: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
    ABoosters: new Decimal(0),
    ABoosterators: new Decimal(0),
    ABoosteratorProduction: new Decimal(0),
    ABoosteratorCost: new Decimal(3),
    BUpgradesBought: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
		BUpgradeCosts: [new Decimal(1e80), new Decimal(1e200)],

    CToGet: new Decimal(0),
		CGenerators: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
    CGeneratorsBought: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
    CGeneratorCosts: [new Decimal(10), new Decimal(100), new Decimal(1000), new Decimal(10000), new Decimal(100000)],
    CGeneratorProduction: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
		CMilestonesReached: 0,
		
		DToGet: new Decimal(0),
		DGenerators: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
    DGeneratorsBought: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
    DGeneratorCosts: [new Decimal(10), new Decimal(100), new Decimal(1000), new Decimal(10000), new Decimal(100000)],
    DGeneratorProduction: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
		DMilestonesReached: 0,
		
		separatorsToGet: new Decimal(0),
		separators: [new Decimal(1)],
		separatorPoints: new Decimal(0),
		unspentSeparatorPoints: new Decimal(0),
		separatorBoosts: [new Decimal(0), new Decimal(0), new Decimal(0)],
		separatorUpgradesBought: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
		
		EGenerators: new Decimal(0),
    EGeneratorsBought: new Decimal(0),
    EGeneratorCost: new Decimal(10),
    EGeneratorProduction: new Decimal(0),
		
		FGenerators: new Decimal(0),
    FGeneratorsBought: new Decimal(0),
    FGeneratorCost: new Decimal(10),
    FGeneratorProduction: new Decimal(0),
  }
}

reset()

//If the user confirms the hard reset, resets all variables, saves and refreshes the page
function hardReset() {
  if (confirm("Are you sure you want to reset? You will lose everything!")) {
    reset()
    save()
    location.reload()
  }
}

function save() {
  //console.log("saving")
  game.lastSave = Date.now();
  localStorage.setItem("arrayGameSave", JSON.stringify(game));
  localStorage.setItem("arrayGameLastSaved", game.lastSave);
}

function setAutoSave() {
  if (!window.isDevVersion) setInterval(save, 5000);
  autosaveStarted = true;
}
//setInterval(save, 5000)

function exportGame() {
  save()
  navigator.clipboard.writeText(btoa(JSON.stringify(game))).then(function() {
    alert("Copied to clipboard!")
  }, function() {
    alert("Error copying to clipboard, try again...")
  });
}

function importGame() {
  loadgame = JSON.parse(atob(prompt("Input your save here:")))
  if (loadgame && loadgame != null && loadgame != "") {
    reset()
    loadGame(loadgame)
    save()
		location.reload()
  }
  else {
    alert("Invalid input.")
  }
}

function load() {
  reset()
  let loadgame = JSON.parse(localStorage.getItem("arrayGameSave"))
  if (loadgame != null) {
    loadGame(loadgame)
  }
  mainLoop = function() {
    updateVisuals();
    requestAnimationFrame(mainLoop);
  };
  requestAnimationFrame(mainLoop)
}

//load()

function loadGame(loadgame) {
  //Sets each variable in 'game' to the equivalent variable in 'loadgame' (the saved file)
  let loadKeys = Object.keys(loadgame); // Get the keys of the loadgame object
  for (i = 0; i < loadKeys.length; i++) { // Iterate through each key in the loadgame object
    if (loadgame[loadKeys[i]] != "undefined") { // Only process keys with defined values
      let thisKey = loadKeys[i];
      if (typeof loadgame[thisKey] == "string" && !isNaN(parseFloat(loadgame[thisKey]))) { // If the value is a string that can be converted to a Decimal, do so
        game[thisKey] = new Decimal(loadgame[thisKey])
      }
      else if (Array.isArray(loadgame[thisKey]) && game[loadKeys[i]]) { // If the value is an array and the corresponding key exists in the game object
        for (j = 0; j < loadgame[thisKey].length; j++) { // Iterate through the array elements
          if (typeof loadgame[thisKey][j] == "string" && !isNaN(parseFloat(loadgame[thisKey][j]))) { // If the array element is a string that can be converted to a Decimal, do so
            game[loadKeys[i]][j] = new Decimal(loadgame[thisKey][j])
          }
          else { // Otherwise, copy the value directly
            game[loadKeys[i]][j] = loadgame[thisKey][j]
          }
        }
      }
      //else {game[Object.keys(game)[i]] = loadgame[loadKeys[i]]}
      else {
        game[loadKeys[i]] = loadgame[loadKeys[i]]
      } // For other types of values, copy them directly
    }
  }
	
	$("#formatSetting").html("Number format: " + game.numberFormat)
	if (game.currentFont == 1) {
		$("body").css("fontFamily", "monospace")
		$("button").css("fontFamily", "monospace")
		$("#fontSetting").html("Font: Monospace")
	}
	else {
		$("body").css("fontFamily", "'Pixelated MS Sans Serif', Arial")
		$("button").css("fontFamily", "'Pixelated MS Sans Serif', Arial")
		$("#fontSetting").html("Font: Pixelated")
  }
	for (i=0;i<game.confirmations.length;i++) {
		if (game.confirmations[i]) {$(".confirmationButton").eq(i).html("Confirmation: On")}
		else {$(".confirmationButton").eq(i).html("Confirmation: Off")}
	}

  game.currentTab = 0
  if (game.unlocks >= 1) {
    $(".tabButton").eq(1).css("display", "inline-block")
    for (i = 0; i < 8; i++) {
      if (game.BUpgradesBought[i].eq(1)) {
        document.getElementsByClassName("BUpgrade")[i].disabled = true
        if (i == 0) $(".AUpgrade").eq(3).css("display", "inline-block")
        if (i == 4) $(".AUpgrade").eq(2).css("display", "inline-block")
      }
    }
  }
  if (game.unlocks >= 2 || game.separatorUnlocks >= 1) {
    if (game.unlocks >= 2) $(".tabButton").eq(2).css("display", "inline-block")
    $(".tabButton").eq(4).css("display", "inline-block")
		if (game.CMilestonesReached >= 5 || game.unlocks >= 3) $(".challenge").eq(1).css("display", "inline-block")
		if (game.CMilestonesReached >= 9 || game.unlocks >= 3) $(".challenge").eq(2).css("display", "inline-block")
  }
	if (game.unlocks >= 3 || game.separatorUnlocks >= 1) {
    if (game.unlocks >= 3) $(".tabButton").eq(3).css("display", "inline-block")
		$(".challengeSection").eq(1).css("display", "block")
		if (game.DMilestonesReached >= 5) $(".challenge").eq(5).css("display", "inline-block")
  }
	if (game.separatorUnlocks >= 1) {
		$(".BUpgrade").eq(8).css("display", "inline-block")
		$(".BUpgrade").eq(9).css("display", "inline-block")
    $("#separatorUnlockButton").css("display", "none")
		$(".tabButton").eq(5).css("display", "inline-block")
		$(".tabButton").eq(6).css("display", "inline-block")
		if (game.separatorUpgradesBought[0].eq(1)) {
			$(".challenge").eq(1).css("display", "inline-block")
			$(".challenge").eq(2).css("display", "inline-block")
			$(".challenge").eq(3).css("display", "inline-block")
			$(".challenge").eq(5).css("display", "inline-block")
			$(".challenge").eq(6).css("display", "inline-block")
			$(".challenge").eq(7).css("display", "inline-block")
			game.challengesBeaten = [6,6,6,6,6,6,6,6]
			$(".separatorUpgrade").eq(1).css("display", "inline-block")
		}
		if (game.separatorUpgradesBought[1].eq(1)) {
			$(".separatorUpgrade").eq(2).css("display", "inline-block")
			$(".separatorUpgrade").eq(3).css("display", "inline-block")
		}
		if (game.separatorUpgradesBought[3].eq(1)) {
			$(".separatorUpgrade").eq(4).css("display", "inline-block")
		}
		if (game.separatorUpgradesBought[4].eq(1)) {
			$(".separatorUpgrade").eq(5).css("display", "inline-block")
		}
  }

  if (game.currentChallenge > 0) {
    $(".challenge").eq(game.currentChallenge - 1).css("border", "3px solid #0f0")
    $(".challenge").eq(game.currentChallenge - 1).css("backgroundColor", "#020")
  }
}

//Hotkeys
Mousetrap.bind('1', () => {changeTab(0)});
Mousetrap.bind('a', () => {changeTab(0)});
Mousetrap.bind('2', () => {if (game.unlocks >= 1) changeTab(1)});
Mousetrap.bind('b', () => {if (game.unlocks >= 1) changeTab(1)});
Mousetrap.bind('3', () => {if (game.unlocks >= 2) changeTab(2)});
Mousetrap.bind('c', () => {if (game.unlocks >= 2) changeTab(2)});
Mousetrap.bind('4', () => {if (game.unlocks >= 3) changeTab(4)});
Mousetrap.bind('d', () => {if (game.unlocks >= 3) changeTab(4)});
Mousetrap.bind('s', () => {if (game.separatorUnlocks >= 1) changeTab(5)});
Mousetrap.bind('5', () => {if (game.separatorUnlocks >= 1) changeTab(6)});
Mousetrap.bind('e', () => {if (game.separatorUnlocks >= 1) changeTab(6)});

function changeNotation() {
  if (game.numberFormat == "Normal") {
    game.numberFormat = "Array"
  }
  else {
    game.numberFormat = "Normal"
  }
	$("#formatSetting").html("Number format: " + game.numberFormat);
}

function changeFont() {
  if (game.currentFont == 0) {
    game.currentFont = 1
		$("body").css("fontFamily", "monospace")
		$("button").css("fontFamily", "monospace")
		$("#fontSetting").html("Font: Monospace")
  }
  else {
    game.currentFont = 0
		$("body").css("fontFamily", "'Pixelated MS Sans Serif', Arial")
		$("button").css("fontFamily", "'Pixelated MS Sans Serif', Arial")
		$("#fontSetting").html("Font: Pixelated")
  }
}

function toggleConfirmation(x) {
	game.confirmations[x-1] = !game.confirmations[x-1]
	if (game.confirmations[x-1]) {$(".confirmationButton").eq(x-1).html("Confirmation: On")}
	else {$(".confirmationButton").eq(x-1).html("Confirmation: Off")}
}

//Skips x seconds into the future
function skipTime(x) {
  game.timeOfLastUpdate = game.timeOfLastUpdate - (x * 1000)
}

function changeTitle() {
  title = titleNames[Math.floor(Math.random() * titleNames.length)];
  $("#titleText").html(title);
  document.title = title;
}

function changeTab(x=0) {
  game.currentTab = x
  for (i = 0; i < 7; i++) {
    if (i == x) {
      $(".tab").eq(i).css("display", "block")
    }
    else {
      $(".tab").eq(i).css("display", "none")
    }
  }
}

function numberToTime(x) {
  xCeil = Math.ceil(x / 1000)
  result = ""
  if (xCeil >= 7200) result += Math.floor(xCeil / 3600) + " hours "
  else if (xCeil >= 3600) result += Math.floor(xCeil / 3600) + " hour "
  if (Math.floor(xCeil / 60) % 60 == 1) result += (Math.floor(xCeil / 60) % 60) + " minute "
  else if (Math.floor(xCeil / 60) % 60 != 0) result += (Math.floor(xCeil / 60) % 60) + " minutes "
  if (xCeil % 60 == 1) result += Math.floor(xCeil % 60) + " second"
  else if (xCeil % 60 != 0) result += Math.floor(xCeil % 60) + " seconds"
  return result
}

function updateVisuals() {
  arrayText = "<span style='color:" + arrayColours[0] + "'>" + format(game.array[0]) + "</span>"
  if (game.unlocks >= 1) arrayText += ", <span style='color:" + arrayColours[1] + "'>" + format(game.array[1]) + "</span>"
  if (game.unlocks >= 2) arrayText += ", <span style='color:" + arrayColours[2] + "'>" + format(game.array[2]) + "</span>"
	if (game.unlocks >= 3) arrayText += ", <span style='color:" + arrayColours[3] + "'>" + format(game.array[3]) + "</span>"
	if (game.separatorUnlocks >= 1) {
		arrayText += " [<span style='color:#888'>" + format(game.separators[0]) + "</span>]"
		arrayText += " <span style='color:" + arrayColours[4] + "'>" + format(game.array[4]) + "</span>"
	}
	if (game.array[5].gt(0)) arrayText += ", <span style='color:" + arrayColours[5] + "'>" + format(game.array[5]) + "</span>"
  $("#array").html(arrayText);

	if (game.separatorUnlocks == 0) {
		arrayValue = " = "
		if (game.unlocks == 0) arrayValue += format(game.array[0].round(), 0, 9, "Normal")
		else if (game.unlocks == 1) arrayValue += format(game.array[0].round().pow(game.array[1].round()), 0, 9, "Normal")
		else if (game.unlocks > 1) {
			if (game.array[2].lt(2) && game.array[3].lt(2) && game.array[4].lt(2)) {
				arrayValue += format(game.array[0].round().pow(game.array[1].round()), 0, 9, "Normal")
			}
			else if (game.array[2].eq(2) && game.array[0].round().tetrate(game.array[1].round()).lt("eeee9")) {
				arrayValue += format(game.array[0].round().tetrate(game.array[1].round()), 0, 9, "Normal")
			}
			else {
				arrayValue = ""
			}
		}
		$("#arrayValue").html(arrayValue);
	}
	else $("#arrayValue").html("");
	
	if (game.currentChallenge != 0 && game.challengesBeaten[game.currentChallenge - 1] < 6 && game.array[0].gte(challengeGoals[game.currentChallenge - 1][game.challengesBeaten[game.currentChallenge - 1]])) {
		$(".tabButton").eq(4).css("border", "3px solid #0f0")
	}
	else {
		$(".tabButton").eq(4).css("border", "3px solid #bbb")
	}

  if (game.currentTab == 0) {
    $("#A").html(format(game.array[0]));
    for (i = 0; i < 5; i++) {
      $(".AGeneratorAmount").eq(i).html(format(game.AGenerators[i]));
      $(".AGeneratorProduction").eq(i).html(format(game.AGeneratorProduction[i], 1));
      $(".AGeneratorBought").eq(i).html(format(game.AGeneratorsBought[i]));
      $(".AGeneratorCost").eq(i).html(format(game.AGeneratorCosts[i]));
      if (game.AGeneratorsBought[i] > 20) {
				if (game.DMilestonesReached >= 2) {
          $(".AGeneratorMultiplier").eq(i).html(" (*" + format(game.AGeneratorsBought[i].sub(19).pow(2), 2) + ")")
        }
        else if (game.BUpgradesBought[1].eq(1)) {
          $(".AGeneratorMultiplier").eq(i).html(" (*" + format(game.AGeneratorsBought[i].sub(19).pow(0.6), 2) + ")")
        }
        else {
          $(".AGeneratorMultiplier").eq(i).html(" (*" + format(game.AGeneratorsBought[i].sub(19).pow(0.2), 2) + ")")
        }
      }
      else {
        $(".AGeneratorMultiplier").eq(i).html("")
      }
    }
    for (i = 0; i < 3; i++) {
      $(".AUpgradeCost").eq(i).html(format(game.AUpgradeCosts[i]))
      if (i == 2) {
        $(".AUpgradeEffect").eq(i).html(format(new Decimal(3).pow(game.AUpgradesBought[i])))
      }
      else {
        $(".AUpgradeEffect").eq(i).html(format(new Decimal(2).pow(game.AUpgradesBought[i])))
      }
      document.getElementsByClassName("AUpgrade")[i].disabled = game.array[0].lt(game.AUpgradeCosts[i])
    }
  }
  else if (game.currentTab == 1) {
    $("#B").html(format(game.array[1]));
    $("#BBoost").html(format(game.array[1].pow(0.4).mul(0.6).add(1), 2));
    if (game.BUpgradesBought[2].eq(1)) {
      $("#BPerSecond").css("display", "block")
      $("#BPerSecond").html("You are gaining <span style='color: #80f'>" + format(game.BToGet.div(5), 1) + "</span> B per second")
    }
    else {
      $("#BPerSecond").css("display", "none")
      $("#BPerSecond").html("")
    }
    for (i = 0; i < 5; i++) {
      $(".BGeneratorAmount").eq(i).html(format(game.BGenerators[i]));
      $(".BGeneratorProduction").eq(i).html(format(game.BGeneratorProduction[i], 1));
      $(".BGeneratorBought").eq(i).html(format(game.BGeneratorsBought[i]));
      $(".BGeneratorCost").eq(i).html(format(game.BGeneratorCosts[i]));
      if (game.BGeneratorsBought[i] > 20) {
				if (game.CMilestonesReached >= 12) {$(".BGeneratorMultiplier").eq(i).html(" (*" + format(game.BGeneratorsBought[i].sub(19).pow(2), 2) + ")")}
				else {$(".BGeneratorMultiplier").eq(i).html(" (*" + format(game.BGeneratorsBought[i].sub(19).pow(0.2), 2) + ")")}
      }
      else {
        $(".BGeneratorMultiplier").eq(i).html("")
      }
    }
    $("#ABoosters").html(format(game.ABoosters))
    $("#ABoosterEffect").html(format(game.ABoosters.pow(0.5).div(10).add(1), 2))
    $("#ABoosterators").html(format(game.ABoosterators))
    $("#ABoosteratorProduction").html(format(game.ABoosteratorProduction, 1))
    $("#ABoosteratorCost").html(format(game.ABoosteratorCost))
		if (game.CMilestonesReached >= 14 || game.unlocks >= 3 || game.separatorUnlocks >= 1) {
			$(".BUpgradeCost").eq(0).html(format(game.BUpgradeCosts[0]))
			$(".BUpgradeEffect").eq(0).html(format(new Decimal(3).pow(game.BUpgradesBought[8])))
			document.getElementsByClassName("BUpgrade")[8].disabled = game.array[1].lt(game.BUpgradeCosts[0])
		}
		if (game.CMilestonesReached >= 13 || game.unlocks >= 4 || game.separatorUnlocks >= 1) {
			$(".BUpgradeCost").eq(1).html(format(game.BUpgradeCosts[1]))
			$(".BUpgradeEffect").eq(1).html(format(new Decimal(3).pow(game.BUpgradesBought[9])))
			document.getElementsByClassName("BUpgrade")[9].disabled = game.array[1].lt(game.BUpgradeCosts[1])
		}
  }
  else if (game.currentTab == 2) {
    $("#C").html(format(game.array[2]));
    $("#CBoost").html(format(game.array[2].pow(0.6).mul(3).add(1), 2));
		if (game.CMilestonesReached >= 10) {
      $("#CPerSecond").css("display", "block")
      $("#CPerSecond").html("You are gaining <span style='color: #f0f'>" + format(game.CToGet.div(5), 1) + "</span> C per second")
    }
    else {
      $("#CPerSecond").css("display", "none")
      $("#CPerSecond").html("")
    }
		for (i = 0; i < 5; i++) {
      $(".CGeneratorAmount").eq(i).html(format(game.CGenerators[i]));
      $(".CGeneratorProduction").eq(i).html(format(game.CGeneratorProduction[i], 1));
      $(".CGeneratorBought").eq(i).html(format(game.CGeneratorsBought[i]));
      $(".CGeneratorCost").eq(i).html(format(game.CGeneratorCosts[i]));
      if (game.CGeneratorsBought[i] > 20) {
				if (game.DMilestonesReached >= 14) {$(".CGeneratorMultiplier").eq(i).html(" (*" + format(game.CGeneratorsBought[i].sub(19).pow(2), 2) + ")")}
        else {$(".CGeneratorMultiplier").eq(i).html(" (*" + format(game.CGeneratorsBought[i].sub(19).pow(0.2), 2) + ")")}
      }
      else {
        $(".CGeneratorMultiplier").eq(i).html("")
      }
    }
    for (i = 0; i < CMilestones.length; i++) {
      if (i < game.CMilestonesReached) {
				$(".CMilestone").eq(i).css("color", "#f8f")
				$(".CMilestone").eq(i).css("backgroundColor", "#808")
			}
			else if ((i==0 || i == 3 || i == 4 || i == 8 || i == 10 || i == 13) && game.unlocks >= 3) {
				$(".CMilestone").eq(i).css("color", "#f8f")
				$(".CMilestone").eq(i).css("backgroundColor", "#808")
			}
			else {
				$(".CMilestone").eq(i).css("color", "#ccc")
				$(".CMilestone").eq(i).css("backgroundColor", "#222")
			}
    }
  }
  else if (game.currentTab == 3) {
		for (i=0;i<8;i++) {
			if (challengeGoals[i][game.challengesBeaten[i]]) {$(".challengeGoal").eq(i).html(format(challengeGoals[i][game.challengesBeaten[i]]))}
			else {$(".challengeGoal").eq(i).html("Infinite")}
			$(".challengesBeaten").eq(i).html(game.challengesBeaten[i]);
		}
    $(".challengeEffect").eq(0).html(format(new Decimal(100000).pow(game.challengesBeaten[0] ** 0.5).pow(game.separatorBoosts[2].add(1).log10().add(1))));
    $(".challengeEffect").eq(1).html(format(game.BGenerators[4].add(1).pow(game.challengesBeaten[1] / 1.5), 2));
		$(".challengeEffect").eq(2).html(format((game.challengesBeaten[2] + 1) ** 1.5, 2));
		$(".challengeEffect").eq(3).html(format(new Decimal(1e30).pow(game.challengesBeaten[3] ** 1.2)));
		
		$(".challengeEffect").eq(4).html(format(new Decimal(100000).pow(game.challengesBeaten[4] ** 0.5).pow(game.separatorBoosts[2].add(1).log10().add(1))));
		$(".challengeEffect").eq(5).html(format(new Decimal(10000).pow(game.challengesBeaten[5] ** 0.7)));
		$(".challengeEffect").eq(6).html(format(new Decimal(100000).pow(game.challengesBeaten[6] ** 0.7)));
		$(".challengeEffect").eq(7).html(format(new Decimal(1e50).pow(game.challengesBeaten[7])));
    document.getElementById("finishChallengeButton").disabled = !(game.currentChallenge != 0 && game.challengesBeaten[game.currentChallenge - 1] < 6 && game.array[0].gte(challengeGoals[game.currentChallenge - 1][game.challengesBeaten[game.currentChallenge - 1]]))
  }
	else if (game.currentTab == 4) {
    $("#D").html(format(game.array[3]));
    $("#DBoost").html(format(game.array[3].pow(0.8).mul(3).add(1), 2));
		if (game.DMilestonesReached >= 8) {
      $("#DPerSecond").css("display", "block")
      $("#DPerSecond").html("You are gaining <span style='color: #f00'>" + format(game.DToGet.div(5), 1) + "</span> D per second")
    }
    else {
      $("#DPerSecond").css("display", "none")
      $("#DPerSecond").html("")
    }
		for (i = 0; i < 5; i++) {
      $(".DGeneratorAmount").eq(i).html(format(game.DGenerators[i]));
      $(".DGeneratorProduction").eq(i).html(format(game.DGeneratorProduction[i], 1));
      $(".DGeneratorBought").eq(i).html(format(game.DGeneratorsBought[i]));
      $(".DGeneratorCost").eq(i).html(format(game.DGeneratorCosts[i]));
      if (game.DGeneratorsBought[i] > 20) {
        $(".DGeneratorMultiplier").eq(i).html(" (*" + format(game.DGeneratorsBought[i].sub(19).pow(0.2), 2) + ")")
      }
      else {
        $(".DGeneratorMultiplier").eq(i).html("")
      }
		}
		for (i = 0; i < DMilestones.length; i++) {
      if (i < game.DMilestonesReached) {
				
				$(".DMilestone").eq(i).css("color", "#f88")
				$(".DMilestone").eq(i).css("backgroundColor", "#800")
			}
			else {
				$(".DMilestone").eq(i).css("color", "#ccc")
				$(".DMilestone").eq(i).css("backgroundColor", "#222")
			}
    }
		$("#separatorUnlockRequirement").html(format(1e10));
	}
	else if (game.currentTab == 5) {
		if (game.separatorUpgradesBought[4].eq(1)) {
      $("#separatorsPerSecond").css("display", "block")
      $("#separatorsPerSecond").html("Your separator and SP are increasing by <span style='color: #888'>" + format(game.separatorsToGet, 1) + "</span> per second")
    }
    else {
      $("#separatorsPerSecond").css("display", "none")
      $("#separatorsPerSecond").html("")
    }
		$("#separator").html(format(game.separators[0]))
		$("#nextSeparator").html(format(game.separators[0].add(game.separatorsToGet)))
		$("#separatorRequirement").html(format(new Decimal(10).pow(game.separatorsToGet.add(1).pow(0.5).mul(10))))
		$("#separatorPointsToGet").html(format(game.separatorsToGet))
		$("#separatorPoints").html(format(game.unspentSeparatorPoints))
		$("#totalSeparatorPoints").html(format(game.separatorPoints))
		$(".separatorBoostEffect").eq(0).html(format(Decimal.min(game.separatorBoosts[0].add(1).log10().add(1), 3), 2))
		$(".separatorBoostEffect").eq(1).html(format(game.separatorBoosts[1].add(1).log10().mul(20).add(1), 2))
		$(".separatorBoostEffect").eq(2).html(format(game.separatorBoosts[2].add(1).log10().mul(2).add(1), 2))
		$(".nextSeparatorBoostEffect").eq(0).html(format(Decimal.min(game.separatorBoosts[0].add(2).log10().add(1), 3), 2))
		$(".nextSeparatorBoostEffect").eq(1).html(format(game.separatorBoosts[1].add(2).log10().mul(20).add(1), 2))
		$(".nextSeparatorBoostEffect").eq(2).html(format(game.separatorBoosts[2].add(2).log10().mul(2).add(1), 2))
		$(".separatorBoostSpent").eq(0).html(format(game.separatorBoosts[0]) + " SP spent")
		$(".separatorBoostSpent").eq(1).html(format(game.separatorBoosts[1]) + " SP spent")
		$(".separatorBoostSpent").eq(2).html(format(game.separatorBoosts[2]) + " SP spent")
		for (i=0;i<separatorUpgradeCosts.length;i++) document.getElementsByClassName("separatorUpgrade")[i].disabled = game.separatorUpgradesBought[i].eq(1)
		$(".separatorUpgradeEffect").eq(0).html(format(game.array[0].add(10).log10().log10().mul(2), 2))
	}
	else if (game.currentTab == 6) {
		$("#E").html(format(game.array[4]));
    $("#EBoost").html(format(game.array[4].pow(0.8).mul(3).add(1), 2));
		$(".EGeneratorAmount").eq(0).html(format(game.EGenerators));
		$(".EGeneratorProduction").eq(0).html(format(game.EGeneratorProduction, 1));
		$(".EGeneratorBought").eq(0).html(format(game.EGeneratorsBought));
		$(".EGeneratorCost").eq(0).html(format(game.EGeneratorCost));
		if (game.EGeneratorsBought > 20) {
			$(".EGeneratorMultiplier").eq(0).html(" (*" + format(game.EGeneratorsBought.sub(19).pow(0.5), 2) + ")")
		}
		else {
			$(".EGeneratorMultiplier").eq(0).html("")
		}
		$(".arrayGainRequirement").eq(0).html(format(new Decimal(1.3).pow(game.array[4]).ceil()));
		
		$("#F").html(format(game.array[5]));
    $("#FBoost").html(format(game.array[5].pow(0.8).mul(2).add(1), 2));
		$(".FGeneratorAmount").eq(0).html(format(game.FGenerators));
		$(".FGeneratorProduction").eq(0).html(format(game.FGeneratorProduction, 1));
		$(".FGeneratorBought").eq(0).html(format(game.FGeneratorsBought));
		$(".FGeneratorCost").eq(0).html(format(game.FGeneratorCost));
		if (game.FGeneratorsBought > 20) {
			$(".FGeneratorMultiplier").eq(0).html(" (*" + format(game.FGeneratorsBought.sub(19).pow(0.5), 2) + ")")
		}
		else {
			$(".FGeneratorMultiplier").eq(0).html("")
		}
		$(".arrayGainRequirement").eq(1).html(format(new Decimal(1.4).pow(game.array[5]).mul(10000).ceil()));
	}
}

function updateVariables() {
  timeDivider = 1000 / (Date.now() - game.timeOfLastUpdate)
	//A variables
  for (i = 0; i < 5; i++) {
    if (i == 0) {
      game.AGeneratorProduction[i] = game.AGenerators[i]
    }
    else {
      game.AGeneratorProduction[i] = game.AGenerators[i].div(10)
    }
    if (game.AGeneratorsBought[i].gt(20)) {
			if (game.DMilestonesReached >= 2) {game.AGeneratorProduction[i] = game.AGeneratorProduction[i].mul(game.AGeneratorsBought[i].sub(19).pow(2))}
      else if (game.BUpgradesBought[1].eq(1)) {game.AGeneratorProduction[i] = game.AGeneratorProduction[i].mul(game.AGeneratorsBought[i].sub(19).pow(0.6))}
      else {game.AGeneratorProduction[i] = game.AGeneratorProduction[i].mul(game.AGeneratorsBought[i].sub(19).pow(0.2))}
    }
    if (game.unlocks >= 1) game.AGeneratorProduction[i] = game.AGeneratorProduction[i].mul(game.ABoosters.pow(0.5).div(10).add(1))
    if (game.BUpgradesBought[5].eq(1)) game.AGeneratorProduction[i] = game.AGeneratorProduction[i].mul(game.BGeneratorsBought[i].add(1))
		if (game.CMilestonesReached >= 7) game.AGeneratorProduction[i] = game.AGeneratorProduction[i].mul(game.ABoosterators.add(1))
		if (game.currentChallenge == 4) {game.AGeneratorProduction[i] = game.AGeneratorProduction[i].pow(0.2)}
		if (game.currentChallenge == 7) {game.AGeneratorProduction[i] = game.AGeneratorProduction[i].div(1e35)}
		if (game.currentChallenge == 8) {game.AGeneratorProduction[i] = game.AGeneratorProduction[i].pow(0.1)}
  }
  if (game.AUpgradesBought[0].gt(0)) game.AGeneratorProduction[0] = game.AGeneratorProduction[0].mul(new Decimal(2).pow(game.AUpgradesBought[0]))
  if (game.unlocks >= 1) game.AGeneratorProduction[0] = game.AGeneratorProduction[0].mul(game.array[1].pow(0.4).mul(0.6).add(1))
  if (game.unlocks >= 2) game.AGeneratorProduction[0] = game.AGeneratorProduction[0].mul(game.array[2].pow(0.6).mul(3).add(1))
  if (game.unlocks >= 2 || game.separatorUnlocks >= 1) game.AGeneratorProduction[0] = game.AGeneratorProduction[0].mul(new Decimal(100000).pow(game.challengesBeaten[0] ** 0.5).pow(game.separatorBoosts[2].add(1).log10().mul(2).add(1)))
	if (game.unlocks >= 3) game.AGeneratorProduction[0] = game.AGeneratorProduction[0].mul(game.array[3].pow(0.8).mul(3).add(1))
	if (game.separatorUnlocks >= 1) game.AGeneratorProduction[0] = game.AGeneratorProduction[0].mul(game.array[4].pow(0.8).mul(3).add(1))
  if (game.currentChallenge == 1 || game.currentChallenge == 6) game.AGeneratorProduction[0] = game.AGeneratorProduction[0].pow(0.5)
  if (game.AUpgradesBought[1].gt(0)) game.AGeneratorProduction[1] = game.AGeneratorProduction[1].mul(new Decimal(2).pow(game.AUpgradesBought[1]))
	if (game.currentChallenge == 2) game.AGeneratorProduction[1] = game.AGeneratorProduction[1].div(game.AGenerators[1].add(1))
	if (game.currentChallenge == 3) {game.AGeneratorProduction[3] = new Decimal(0); game.AGenerators[2] = new Decimal(0)}
	if (game.CMilestonesReached >= 11|| game.separatorUnlocks >= 1) game.AGeneratorProduction[3] = game.AGeneratorProduction[3].mul(new Decimal(1e30).pow(game.challengesBeaten[3] ** 1.2))
  game.array[0] = game.array[0].add(game.AGeneratorProduction[0].div(timeDivider))
  game.AGenerators[0] = game.AGenerators[0].add(game.AGeneratorProduction[1].div(timeDivider))
  game.AGenerators[1] = game.AGenerators[1].add(game.AGeneratorProduction[2].div(timeDivider))
  game.AGenerators[2] = game.AGenerators[2].add(game.AGeneratorProduction[3].div(timeDivider))
  game.AGenerators[3] = game.AGenerators[3].add(game.AGeneratorProduction[4].div(timeDivider))
	if (game.CMilestonesReached >= 6) buyUpgrade(1,5)
	if (game.CMilestonesReached >= 8 && game.currentChallenge != 1) buyMaxGenerators(1, 7)
  if (game.array[0].gte(1e10)) {
    game.BToGet = game.array[0].add(1).log10().div(10).pow(2).floor()
  }
  else {
    game.BToGet = new Decimal(0)
  }
  $("#nextB").html(format(new Decimal(10).pow(game.BToGet.add(1).pow(0.5).mul(10))))
  if (game.BUpgradesBought[4].eq(1)) game.BToGet = game.BToGet.mul(new Decimal(3).pow(game.AUpgradesBought[2]))
  if (game.unlocks >= 2) game.BToGet = game.BToGet.mul(game.array[2].pow(0.6).mul(3).add(1))
	if (game.unlocks >= 3) game.BToGet = game.BToGet.mul(game.array[3].pow(0.8).mul(3).add(1))
	if (game.CMilestonesReached >= 5 || game.separatorUnlocks >= 1) game.BToGet = game.BToGet.mul(game.BGenerators[4].add(1).pow(game.challengesBeaten[1] / 1.5))
	if (game.DMilestonesReached >= 15 || game.separatorUnlocks >= 1) game.BToGet = game.BToGet.mul(new Decimal(1e50).pow(game.challengesBeaten[7]))
	if (game.separatorUnlocks >= 1) game.BToGet = game.BToGet.pow(Decimal.min(game.separatorBoosts[0].add(1).log10().add(1), 3))
  game.BToGet = game.BToGet.floor()
  $("#BToGet").html(format(game.BToGet))

	//B variables
  if (game.unlocks >= 1) {
		if (game.array[1].lt(1)) game.array[1] = new Decimal(1)
		if (game.BUpgradesBought[2].eq(1)) game.array[1] = game.array[1].add(game.BToGet.div(5).div(timeDivider))
		for (i = 0; i < 5; i++) {
			if (i == 0) {
				game.BGeneratorProduction[i] = game.BGenerators[i]
			}
			else {
				game.BGeneratorProduction[i] = game.BGenerators[i].div(10)
			}
			if (game.BGeneratorsBought[i].gt(20)) {
				if (game.CMilestonesReached >= 12) {game.BGeneratorProduction[i] = game.BGeneratorProduction[i].mul(game.BGeneratorsBought[i].sub(19).pow(2))}
				else {game.BGeneratorProduction[i] = game.BGeneratorProduction[i].mul(game.BGeneratorsBought[i].sub(19).pow(0.2))}
			}
			if (game.DMilestonesReached >= 12) game.BGeneratorProduction[i] = game.BGeneratorProduction[i].mul(game.CGenerators[i].add(1))
			if (game.BUpgradesBought[7].eq(1)) game.BGeneratorProduction[i] = game.BGeneratorProduction[i].mul(100)
			if (game.CMilestonesReached >= 3) game.BGeneratorProduction[i] = game.BGeneratorProduction[i].mul(game.array[2])
			if (game.currentChallenge == 7) {game.BGeneratorProduction[i] = game.BGeneratorProduction[i].div(1e35)}
			if (game.currentChallenge == 8) {game.BGeneratorProduction[i] = game.BGeneratorProduction[i].pow(0.1)}
		}
		if (game.currentChallenge != 6) game.AGenerators[4] = game.AGenerators[4].add(game.BGeneratorProduction[0].div(timeDivider))
		if (game.currentChallenge != 5) game.BGenerators[0] = game.BGenerators[0].add(game.BGeneratorProduction[1].div(timeDivider))
		if (game.currentChallenge != 5) game.BGenerators[1] = game.BGenerators[1].add(game.BGeneratorProduction[2].div(timeDivider))
		if (game.currentChallenge != 5) game.BGenerators[2] = game.BGenerators[2].add(game.BGeneratorProduction[3].div(timeDivider))
		if (game.currentChallenge != 5) game.BGenerators[3] = game.BGenerators[3].add(game.BGeneratorProduction[4].div(timeDivider))
		if (game.BUpgradesBought[6].eq(1)) {
			game.ABoosteratorProduction = new Decimal(21).pow(game.ABoosterators.pow(0.8)).sub(1).div(20)
		}
		else {
			game.ABoosteratorProduction = new Decimal(11).pow(game.ABoosterators.pow(0.8)).sub(1).div(10)
		}
		if (game.BUpgradesBought[3].eq(1)) game.ABoosteratorProduction = game.ABoosteratorProduction.mul(game.BGeneratorsBought[0].add(1))
		if (game.currentChallenge == 5) game.ABoosteratorProduction = new Decimal(0)
		game.ABoosters = game.ABoosters.add(game.ABoosteratorProduction.div(timeDivider))
		if (game.DMilestonesReached >= 6) {
			buyMaxABoosterators(2)
			buyUpgrade(2, 10)
		}
		if (game.DMilestonesReached >= 13) buyUpgrade(2, 12)
		if (game.DMilestonesReached >= 7) buyMaxGenerators(2, 7)
		if (game.array[1].gte(1e10)) {
			game.CToGet = game.array[1].add(1).log10().div(10).pow(2).floor()
		}
		else {
			game.CToGet = new Decimal(0)
		}
		$("#nextC").html(format(new Decimal(10).pow(game.CToGet.add(1).pow(0.5).mul(10))))
		if (game.unlocks >= 3) game.CToGet = game.CToGet.mul(game.array[3].pow(0.8).mul(3).add(1))
		if (game.CMilestonesReached >= 9) game.CToGet = game.CToGet.mul((game.challengesBeaten[2] + 1) ** 1.5)
		if (game.CMilestonesReached >= 13) game.CToGet = game.CToGet.mul(game.CGeneratorsBought[3].add(1))
		if (game.CMilestonesReached >= 14 || game.unlocks >= 3) game.CToGet = game.CToGet.mul(new Decimal(3).pow(game.BUpgradesBought[8]))
		if (game.unlocks >= 3 || game.separatorUnlocks >= 1) game.CToGet = game.CToGet.mul(new Decimal(10000).pow(game.challengesBeaten[5] ** 0.7))
		if (game.DMilestonesReached >= 9) game.CToGet = game.CToGet.mul(game.DGeneratorsBought[0].add(1))
		game.CToGet = game.CToGet.floor()
		$("#CToGet").html(format(game.CToGet))
	}

	//C variables
	if (game.unlocks >= 2) {
		if (game.array[2].lt(1)) game.array[2] = new Decimal(1)
		if (game.CMilestonesReached >= 10) game.array[2] = game.array[2].add(game.CToGet.div(5).div(timeDivider))
		for (i = 0; i < 5; i++) {
			if (i == 0) {
				game.CGeneratorProduction[i] = game.CGenerators[i]
			}
			else {
				game.CGeneratorProduction[i] = game.CGenerators[i].div(10)
			}
			if (game.CGeneratorsBought[i].gt(20)) {
				if (game.DMilestonesReached >= 14) {game.CGeneratorProduction[i] = game.CGeneratorProduction[i].mul(game.CGeneratorsBought[i].sub(19).pow(2))}
				else {game.CGeneratorProduction[i] = game.CGeneratorProduction[i].mul(game.CGeneratorsBought[i].sub(19).pow(0.2))}
			}
			if (game.DMilestonesReached >= 16) game.CGeneratorProduction[i] = game.CGeneratorProduction[i].mul(game.DGenerators[4].add(1))
		}
		if (game.unlocks >= 3 || game.separatorUnlocks >= 1) game.CGeneratorProduction[0] = game.CGeneratorProduction[0].mul(new Decimal(100000).pow(game.challengesBeaten[4] ** 0.5).pow(game.separatorBoosts[2].add(1).log10().mul(2).add(1)))
		if (game.currentChallenge != 5) game.BGenerators[4] = game.BGenerators[4].add(game.CGeneratorProduction[0].div(timeDivider))
		if (game.currentChallenge == 6) game.AGenerators[4] = game.AGenerators[4].add(game.CGeneratorProduction[0].div(timeDivider))
		game.CGenerators[0] = game.CGenerators[0].add(game.CGeneratorProduction[1].div(timeDivider))
		game.CGenerators[1] = game.CGenerators[1].add(game.CGeneratorProduction[2].div(timeDivider))
		game.CGenerators[2] = game.CGenerators[2].add(game.CGeneratorProduction[3].div(timeDivider))
		game.CGenerators[3] = game.CGenerators[3].add(game.CGeneratorProduction[4].div(timeDivider))
		if (game.CMilestonesReached >= 10) {
			while (game.CMilestonesReached < CMilestones.length && game.array[2].gte(CMilestones[game.CMilestonesReached])) game.CMilestonesReached++
		}
		if ((game.CMilestonesReached >= 11 || game.unlocks >= 3) && document.getElementsByClassName("challenge")[3].style.display != "inline-block") $(".challenge").eq(3).css("display", "inline-block")
		if ((game.CMilestonesReached >= 14 || game.unlocks >= 3) && document.getElementsByClassName("BUpgrade")[8].style.display != "inline-block") {
			$(".BUpgrade").eq(8).css("display", "inline-block")
			game.BUpgradeCosts[0] = new Decimal(BUpgradeCostExponents[0]).pow(game.BUpgradesBought[8]).mul(BUpgradeCostBases[0]).floor()
		}
		if (game.array[2].gte(1e10)) {
      game.DToGet = game.array[2].add(1).log10().div(10).pow(2).floor()
    }
    else {
      game.DToGet = new Decimal(0)
    }
    $("#nextD").html(format(new Decimal(10).pow(game.DToGet.add(1).pow(0.5).mul(10))))
		if (game.DMilestonesReached >= 11) game.DToGet = game.DToGet.pow(2)
		if (game.DMilestonesReached >= 13 || game.separatorUnlocks >= 1) game.DToGet = game.DToGet.mul(new Decimal(3).pow(game.BUpgradesBought[9]))
		if (game.separatorUnlocks >= 1) game.DToGet = game.DToGet.mul(game.separatorBoosts[1].add(1).log10().mul(20).add(1))
		if (game.separatorUnlocks >= 1) game.DToGet = game.DToGet.mul(game.array[4].pow(0.8).mul(3).add(1))
    game.DToGet = game.DToGet.floor()
    $("#DToGet").html(format(game.DToGet))
	}
	
	//D variables
	if (game.unlocks >= 3) {
		if (game.array[3].lt(1)) game.array[3] = new Decimal(1)
		if (game.DMilestonesReached >= 8) game.array[3] = game.array[3].add(game.DToGet.div(5).div(timeDivider))
		for (i = 0; i < 5; i++) {
			if (i == 0) {
				game.DGeneratorProduction[i] = game.DGenerators[i]
			}
			else {
				game.DGeneratorProduction[i] = game.DGenerators[i].div(10)
			}
			if (game.DGeneratorsBought[i].gt(20)) game.DGeneratorProduction[i] = game.DGeneratorProduction[i].mul(game.DGeneratorsBought[i].sub(19).pow(0.2))
		}
		if (game.DMilestonesReached >= 10 || game.separatorUnlocks >= 1) game.DGeneratorProduction[0] = game.DGeneratorProduction[0].mul(new Decimal(100000).pow(game.challengesBeaten[6] ** 0.7))
		game.CGenerators[4] = game.CGenerators[4].add(game.DGeneratorProduction[0].div(timeDivider))
		game.DGenerators[0] = game.DGenerators[0].add(game.DGeneratorProduction[1].div(timeDivider))
		game.DGenerators[1] = game.DGenerators[1].add(game.DGeneratorProduction[2].div(timeDivider))
		game.DGenerators[2] = game.DGenerators[2].add(game.DGeneratorProduction[3].div(timeDivider))
		game.DGenerators[3] = game.DGenerators[3].add(game.DGeneratorProduction[4].div(timeDivider))
		if (game.DMilestonesReached >= 8) {
			while (game.DMilestonesReached < DMilestones.length && game.array[3].gte(DMilestones[game.DMilestonesReached])) game.DMilestonesReached++
		}
		if ((game.DMilestonesReached >= 10) && document.getElementsByClassName("challenge")[6].style.display != "inline-block") $(".challenge").eq(6).css("display", "inline-block")
		if ((game.DMilestonesReached >= 13) && document.getElementsByClassName("BUpgrade")[9].style.display != "inline-block") {
			$(".BUpgrade").eq(9).css("display", "inline-block")
			game.BUpgradeCosts[1] = new Decimal(BUpgradeCostExponents[1]).pow(game.BUpgradesBought[9]).mul(BUpgradeCostBases[1]).floor()
		}
		if ((game.DMilestonesReached >= 15) && document.getElementsByClassName("challenge")[7].style.display != "inline-block") $(".challenge").eq(7).css("display", "inline-block")
	}

	//Array items II and separators
	if (game.separatorUnlocks >= 1) {
		//game.separatorsToGet = Decimal.max(game.array[3].add(1).log10().sub(5).div(5).floor(), 0)
		if (game.separatorUpgradesBought[4].eq(1)) {
			game.separators[0] = game.separators[0].add(game.separatorsToGet.div(timeDivider))
			game.separatorPoints = game.separatorPoints.add(game.separatorsToGet.div(timeDivider))
		}
		if (game.array[3].gte(1e10)) {
      game.separatorsToGet = game.array[3].add(1).log10().div(10).pow(2).floor()
    }
    else {
      game.separatorsToGet = new Decimal(0)
    }
		if (game.array[5].gt(0)) game.separatorsToGet = game.separatorsToGet.mul(game.array[5].pow(0.8).mul(2).add(1)).floor()
		if (game.separatorUpgradesBought[4].eq(1)) game.separatorsToGet = game.separatorsToGet.mul(game.array[0].add(10).log10().log10().mul(2))
		calculateUnspentSeparators()
		if (game.array[4].lt(1)) game.array[4] = new Decimal(1)
	}

	//Array items II
	if (game.separatorUnlocks >= 1) {
		game.EGeneratorProduction = game.EGenerators.mul(100)
		if (game.EGeneratorsBought.gt(20)) game.EGeneratorProduction = game.EGeneratorProduction.mul(game.EGeneratorsBought.sub(19).pow(0.5))
		if (game.unlocks >= 3) game.DGenerators[4] = game.DGenerators[4].add(game.EGeneratorProduction.div(timeDivider))
		game.FGeneratorProduction = game.FGenerators.mul(100)
		if (game.FGeneratorsBought.gt(20)) game.FGeneratorProduction = game.FGeneratorProduction.mul(game.FGeneratorsBought.sub(19).pow(0.5))
		game.EGenerators = game.EGenerators.add(game.FGeneratorProduction.div(timeDivider))
	}

  if (Date.now() - game.timeOfLastUpdate > 21600000) {
    $("#welcomeBackTab").css("display", "block")
    $("#welcomeBackTime").html((numberToTime(Date.now() - game.timeOfLastUpdate)))
  }

  //updateVisuals()
  game.timeOfLastUpdate = Date.now()
}

setInterval(updateVariables, 16)

function buyGenerator(x, y) {
  if (x == 1 && game.currentChallenge != 1 && (game.currentChallenge != 3 || y != 3)) {
    if (game.array[0].gte(game.AGeneratorCosts[y - 1])) {
      game.array[0] = game.array[0].sub(game.AGeneratorCosts[y - 1])
      game.AGenerators[y - 1] = game.AGenerators[y - 1].add(1)
      game.AGeneratorsBought[y - 1] = game.AGeneratorsBought[y - 1].add(1)
      calculateGeneratorCosts(1)
    }
  }
  else if (x == 2) {
    if (game.array[1].gte(game.BGeneratorCosts[y - 1])) {
      game.array[1] = game.array[1].sub(game.BGeneratorCosts[y - 1])
      game.BGenerators[y - 1] = game.BGenerators[y - 1].add(1)
      game.BGeneratorsBought[y - 1] = game.BGeneratorsBought[y - 1].add(1)
      calculateGeneratorCosts(2)
    }
  }
	else if (x == 3) {
    if (game.array[2].gte(game.CGeneratorCosts[y - 1])) {
      game.array[2] = game.array[2].sub(game.CGeneratorCosts[y - 1])
      game.CGenerators[y - 1] = game.CGenerators[y - 1].add(1)
      game.CGeneratorsBought[y - 1] = game.CGeneratorsBought[y - 1].add(1)
      calculateGeneratorCosts(3)
    }
  }
	else if (x == 4) {
    if (game.array[3].gte(game.DGeneratorCosts[y - 1])) {
      game.array[3] = game.array[3].sub(game.DGeneratorCosts[y - 1])
      game.DGenerators[y - 1] = game.DGenerators[y - 1].add(1)
      game.DGeneratorsBought[y - 1] = game.DGeneratorsBought[y - 1].add(1)
      calculateGeneratorCosts(4)
    }
  }
	else if (x == 5) {
    if (game.array[4].gte(game.EGeneratorCost)) {
      game.EGenerators = game.EGenerators.add(1)
      game.EGeneratorsBought = game.EGeneratorsBought.add(1)
      calculateGeneratorCosts(5)
    }
  }
	else if (x == 6) {
    if (game.array[5].gte(game.FGeneratorCost)) {
      game.FGenerators = game.FGenerators.add(1)
      game.FGeneratorsBought = game.FGeneratorsBought.add(1)
      calculateGeneratorCosts(6)
    }
  }
}

//y=1-5 buys the max amount of that generator (for buy max), y=6 maxes all with the cost in effect (for max all), y=7 maxes all and ignores cost (for autobuy)
function buyMaxGenerators(x, y) {
  if (x == 1 && game.currentChallenge != 1 && (game.currentChallenge != 3 || y != 3)) {
		if (y > 5) {
			for (k=4;k>=0;k--) {
				if (game.array[0].gte(game.AGeneratorCosts[k]) && (game.currentChallenge != 3 || k != 2)) {
					generatorAmountCanBuy = Decimal.affordGeometricSeries(game.array[0], AGeneratorCostBases[k], AGeneratorCostExponents[k], game.AGeneratorsBought[k])
					generatorCost = Decimal.sumGeometricSeries(generatorAmountCanBuy, AGeneratorCostBases[k], AGeneratorCostExponents[k], game.AGeneratorsBought[k])
					game.AGenerators[k] = game.AGenerators[k].add(generatorAmountCanBuy)
					game.AGeneratorsBought[k] = game.AGeneratorsBought[k].add(generatorAmountCanBuy)
					if (y==6) game.array[0] = game.array[0].sub(generatorCost)
					calculateGeneratorCosts(1)
				}
			}
		}
		else {
			generatorAmountCanBuy = Decimal.affordGeometricSeries(game.array[0], AGeneratorCostBases[y - 1], AGeneratorCostExponents[y - 1], game.AGeneratorsBought[y - 1])
			generatorCost = Decimal.sumGeometricSeries(generatorAmountCanBuy, AGeneratorCostBases[y - 1], AGeneratorCostExponents[y - 1], game.AGeneratorsBought[y - 1])
			game.array[0] = game.array[0].sub(generatorCost)
			game.AGenerators[y - 1] = game.AGenerators[y - 1].add(generatorAmountCanBuy)
			game.AGeneratorsBought[y - 1] = game.AGeneratorsBought[y - 1].add(generatorAmountCanBuy)
			calculateGeneratorCosts(1)
		}
  }
  else if (x == 2) {
		if (y > 5) {
			for (k=4;k>=0;k--) {
				if (game.array[1].gte(game.BGeneratorCosts[k])) {
					generatorAmountCanBuy = Decimal.affordGeometricSeries(game.array[1], BGeneratorCostBases[k], BGeneratorCostExponents[k], game.BGeneratorsBought[k])
					generatorCost = Decimal.sumGeometricSeries(generatorAmountCanBuy, BGeneratorCostBases[k], BGeneratorCostExponents[k], game.BGeneratorsBought[k])
					game.BGenerators[k] = game.BGenerators[k].add(generatorAmountCanBuy)
					game.BGeneratorsBought[k] = game.BGeneratorsBought[k].add(generatorAmountCanBuy)
					if (y==6) game.array[1] = game.array[1].sub(generatorCost)
					calculateGeneratorCosts(2)
				}
			}
		}
		else {
			generatorAmountCanBuy = Decimal.affordGeometricSeries(game.array[1], BGeneratorCostBases[y - 1], BGeneratorCostExponents[y - 1], game.BGeneratorsBought[y - 1])
			generatorCost = Decimal.sumGeometricSeries(generatorAmountCanBuy, BGeneratorCostBases[y - 1], BGeneratorCostExponents[y - 1], game.BGeneratorsBought[y - 1])
			game.array[1] = game.array[1].sub(generatorCost)
			game.BGenerators[y - 1] = game.BGenerators[y - 1].add(generatorAmountCanBuy)
			game.BGeneratorsBought[y - 1] = game.BGeneratorsBought[y - 1].add(generatorAmountCanBuy)
			calculateGeneratorCosts(2)
		}
  }
	else if (x == 3) {
		if (y > 5) {
			for (k=4;k>=0;k--) {
				if (game.array[2].gte(game.CGeneratorCosts[k])) {
					generatorAmountCanBuy = Decimal.affordGeometricSeries(game.array[2], CGeneratorCostBases[k], CGeneratorCostExponents[k], game.CGeneratorsBought[k])
					generatorCost = Decimal.sumGeometricSeries(generatorAmountCanBuy, CGeneratorCostBases[k], CGeneratorCostExponents[k], game.CGeneratorsBought[k])
					game.CGenerators[k] = game.CGenerators[k].add(generatorAmountCanBuy)
					game.CGeneratorsBought[k] = game.CGeneratorsBought[k].add(generatorAmountCanBuy)
					if (y==6) game.array[2] = game.array[2].sub(generatorCost)
					calculateGeneratorCosts(3)
				}
			}
		}
		else {
			generatorAmountCanBuy = Decimal.affordGeometricSeries(game.array[2], CGeneratorCostBases[y - 1], CGeneratorCostExponents[y - 1], game.CGeneratorsBought[y - 1])
			generatorCost = Decimal.sumGeometricSeries(generatorAmountCanBuy, CGeneratorCostBases[y - 1], CGeneratorCostExponents[y - 1], game.CGeneratorsBought[y - 1])
			game.array[2] = game.array[2].sub(generatorCost)
			game.CGenerators[y - 1] = game.CGenerators[y - 1].add(generatorAmountCanBuy)
			game.CGeneratorsBought[y - 1] = game.CGeneratorsBought[y - 1].add(generatorAmountCanBuy)
			calculateGeneratorCosts(3)
		}
  }
	else if (x == 4) {
		if (y > 5) {
			for (k=4;k>=0;k--) {
				if (game.array[3].gte(game.DGeneratorCosts[k])) {
					generatorAmountCanBuy = Decimal.affordGeometricSeries(game.array[3], DGeneratorCostBases[k], DGeneratorCostExponents[k], game.DGeneratorsBought[k])
					generatorCost = Decimal.sumGeometricSeries(generatorAmountCanBuy, DGeneratorCostBases[k], DGeneratorCostExponents[k], game.DGeneratorsBought[k])
					game.DGenerators[k] = game.DGenerators[k].add(generatorAmountCanBuy)
					game.DGeneratorsBought[k] = game.DGeneratorsBought[k].add(generatorAmountCanBuy)
					if (y==6) game.array[3] = game.array[3].sub(generatorCost)
					calculateGeneratorCosts(4)
				}
			}
		}
		else {
			generatorAmountCanBuy = Decimal.affordGeometricSeries(game.array[3], DGeneratorCostBases[y - 1], DGeneratorCostExponents[y - 1], game.DGeneratorsBought[y - 1])
			generatorCost = Decimal.sumGeometricSeries(generatorAmountCanBuy, DGeneratorCostBases[y - 1], DGeneratorCostExponents[y - 1], game.DGeneratorsBought[y - 1])
			game.array[3] = game.array[3].sub(generatorCost)
			game.DGenerators[y - 1] = game.DGenerators[y - 1].add(generatorAmountCanBuy)
			game.DGeneratorsBought[y - 1] = game.DGeneratorsBought[y - 1].add(generatorAmountCanBuy)
			calculateGeneratorCosts(4)
		}
  }
	else if (x == 5) {
		if (game.array[4].gte(game.EGeneratorCost)) {
			generatorAmountCanBuy = Decimal.max(game.array[4].add(1).div(10).log(1.2).sub(game.EGeneratorsBought).sub(0.01), 0).ceil() //The sub(0.01) is because the number is sometimes 1.000000000000001 and rounds up to 2
			game.EGenerators = game.EGenerators.add(generatorAmountCanBuy)
			game.EGeneratorsBought = game.EGeneratorsBought.add(generatorAmountCanBuy)
			calculateGeneratorCosts(5)
		}
	}
	else if (x == 6) {
		if (game.array[5].gte(game.FGeneratorCost)) {
			generatorAmountCanBuy = Decimal.max(game.array[5].add(1).div(10).log(1.2).sub(game.FGeneratorsBought).sub(0.01), 0).ceil() //The sub(0.01) is because the number is sometimes 1.000000000000001 and rounds up to 2
			game.FGenerators = game.FGenerators.add(generatorAmountCanBuy)
			game.FGeneratorsBought = game.FGeneratorsBought.add(generatorAmountCanBuy)
			calculateGeneratorCosts(6)
		}
	}
}

//Calculates generator costs based on amount bought (could be condensed)
function calculateGeneratorCosts(x) {
  if (x == 1) {
    for (i = 0; i < 5; i++) game.AGeneratorCosts[i] = new Decimal(AGeneratorCostExponents[i]).pow(game.AGeneratorsBought[i]).mul(AGeneratorCostBases[i]).floor()
  }
  else if (x == 2) {
    for (i = 0; i < 5; i++) game.BGeneratorCosts[i] = new Decimal(BGeneratorCostExponents[i]).pow(game.BGeneratorsBought[i]).mul(BGeneratorCostBases[i]).floor()
  }
	else if (x == 3) {
    for (i = 0; i < 5; i++) game.CGeneratorCosts[i] = new Decimal(CGeneratorCostExponents[i]).pow(game.CGeneratorsBought[i]).mul(CGeneratorCostBases[i]).floor()
  }
	else if (x == 4) {
    for (i = 0; i < 5; i++) game.DGeneratorCosts[i] = new Decimal(DGeneratorCostExponents[i]).pow(game.DGeneratorsBought[i]).mul(DGeneratorCostBases[i]).floor()
  }
	else if (x == 5) {
    game.EGeneratorCost = new Decimal(1.2).pow(game.EGeneratorsBought).mul(10).floor()
  }
	else if (x == 6) {
    game.FGeneratorCost = new Decimal(1.2).pow(game.FGeneratorsBought).mul(10).floor()
  }
}

//Buys upgrades (could definitely be condensed)
function buyUpgrade(x, y) {
  if (x == 1) {
    if (y == 1 && game.array[0].gte(game.AUpgradeCosts[0])) {
      game.array[0] = game.array[0].sub(game.AUpgradeCosts[0])
      game.AUpgradesBought[0] = game.AUpgradesBought[0].add(1)
      game.AUpgradeCosts[0] = new Decimal(AUpgradeCostExponents[0]).pow(game.AUpgradesBought[0]).mul(AUpgradeCostBases[0]).floor()
    }
    else if (y == 2 && game.array[0].gte(game.AUpgradeCosts[1])) {
      game.array[0] = game.array[0].sub(game.AUpgradeCosts[1])
      game.AUpgradesBought[1] = game.AUpgradesBought[1].add(1)
      game.AUpgradeCosts[1] = new Decimal(AUpgradeCostExponents[1]).pow(game.AUpgradesBought[1]).mul(AUpgradeCostBases[1]).floor()
    }
    else if (y == 3 && game.array[0].gte(game.AUpgradeCosts[2])) {
      game.array[0] = game.array[0].sub(game.AUpgradeCosts[2])
      game.AUpgradesBought[2] = game.AUpgradesBought[2].add(1)
      game.AUpgradeCosts[2] = new Decimal(AUpgradeCostExponents[2]).pow(game.AUpgradesBought[2]).mul(AUpgradeCostBases[2]).floor()
    }
		//Max all
    else if (y == 4) {
      upgradeAmountCanBuy = Decimal.affordGeometricSeries(game.array[0], AUpgradeCostBases[0], AUpgradeCostExponents[0], game.AUpgradesBought[0])
      upgradeCost = Decimal.sumGeometricSeries(upgradeAmountCanBuy, AUpgradeCostBases[0], AUpgradeCostExponents[0], game.AUpgradesBought[0])
      game.array[0] = game.array[0].sub(upgradeCost)
      game.AUpgradesBought[0] = game.AUpgradesBought[0].add(upgradeAmountCanBuy)
      game.AUpgradeCosts[0] = new Decimal(AUpgradeCostExponents[0]).pow(game.AUpgradesBought[0]).mul(AUpgradeCostBases[0]).floor()
      upgradeAmountCanBuy = Decimal.affordGeometricSeries(game.array[0], AUpgradeCostBases[1], AUpgradeCostExponents[1], game.AUpgradesBought[1])
      upgradeCost = Decimal.sumGeometricSeries(upgradeAmountCanBuy, AUpgradeCostBases[1], AUpgradeCostExponents[1], game.AUpgradesBought[1])
      game.array[0] = game.array[0].sub(upgradeCost)
      game.AUpgradesBought[1] = game.AUpgradesBought[1].add(upgradeAmountCanBuy)
      game.AUpgradeCosts[1] = new Decimal(AUpgradeCostExponents[1]).pow(game.AUpgradesBought[1]).mul(AUpgradeCostBases[1]).floor()
      upgradeAmountCanBuy = Decimal.affordGeometricSeries(game.array[0], AUpgradeCostBases[2], AUpgradeCostExponents[2], game.AUpgradesBought[2])
      upgradeCost = Decimal.sumGeometricSeries(upgradeAmountCanBuy, AUpgradeCostBases[2], AUpgradeCostExponents[2], game.AUpgradesBought[2])
      game.array[0] = game.array[0].sub(upgradeCost)
      game.AUpgradesBought[2] = game.AUpgradesBought[2].add(upgradeAmountCanBuy)
      game.AUpgradeCosts[2] = new Decimal(AUpgradeCostExponents[2]).pow(game.AUpgradesBought[2]).mul(AUpgradeCostBases[2]).floor()
    }
		//Max all without spending money
		else if (y == 5) {
      upgradeAmountCanBuy = Decimal.affordGeometricSeries(game.array[0], AUpgradeCostBases[0], AUpgradeCostExponents[0], game.AUpgradesBought[0])
      upgradeCost = Decimal.sumGeometricSeries(upgradeAmountCanBuy, AUpgradeCostBases[0], AUpgradeCostExponents[0], game.AUpgradesBought[0])
      game.AUpgradesBought[0] = game.AUpgradesBought[0].add(upgradeAmountCanBuy)
      game.AUpgradeCosts[0] = new Decimal(AUpgradeCostExponents[0]).pow(game.AUpgradesBought[0]).mul(AUpgradeCostBases[0]).floor()
      upgradeAmountCanBuy = Decimal.affordGeometricSeries(game.array[0], AUpgradeCostBases[1], AUpgradeCostExponents[1], game.AUpgradesBought[1])
      upgradeCost = Decimal.sumGeometricSeries(upgradeAmountCanBuy, AUpgradeCostBases[1], AUpgradeCostExponents[1], game.AUpgradesBought[1])
      game.AUpgradesBought[1] = game.AUpgradesBought[1].add(upgradeAmountCanBuy)
      game.AUpgradeCosts[1] = new Decimal(AUpgradeCostExponents[1]).pow(game.AUpgradesBought[1]).mul(AUpgradeCostBases[1]).floor()
      upgradeAmountCanBuy = Decimal.affordGeometricSeries(game.array[0], AUpgradeCostBases[2], AUpgradeCostExponents[2], game.AUpgradesBought[2])
      upgradeCost = Decimal.sumGeometricSeries(upgradeAmountCanBuy, AUpgradeCostBases[2], AUpgradeCostExponents[2], game.AUpgradesBought[2])
      game.AUpgradesBought[2] = game.AUpgradesBought[2].add(upgradeAmountCanBuy)
      game.AUpgradeCosts[2] = new Decimal(AUpgradeCostExponents[2]).pow(game.AUpgradesBought[2]).mul(AUpgradeCostBases[2]).floor()
    }
  }
  else if (x == 2) {
    //Definitely condense this at some point
    if (y == 1 && game.array[1].gte(20)) {
      game.BUpgradesBought[0] = new Decimal(1)
      document.getElementsByClassName("BUpgrade")[0].disabled = true
      $(".AUpgrade").eq(3).css("display", "inline-block")
    }
    else if (y == 2 && game.array[1].gte(50)) {
      game.array[1] = game.array[1].sub(50)
      game.BUpgradesBought[1] = new Decimal(1)
      document.getElementsByClassName("BUpgrade")[1].disabled = true
    }
    else if (y == 3 && game.array[1].gte(200)) {
      game.array[1] = game.array[1].sub(200)
      game.BUpgradesBought[2] = new Decimal(1)
      document.getElementsByClassName("BUpgrade")[2].disabled = true
    }
    else if (y == 4 && game.array[1].gte(2000)) {
      game.array[1] = game.array[1].sub(2000)
      game.BUpgradesBought[3] = new Decimal(1)
      document.getElementsByClassName("BUpgrade")[3].disabled = true
    }
    else if (y == 5 && game.array[1].gte(15000)) {
      game.array[1] = game.array[1].sub(15000)
      game.BUpgradesBought[4] = new Decimal(1)
      document.getElementsByClassName("BUpgrade")[4].disabled = true
      $(".AUpgrade").eq(2).css("display", "inline-block")
			game.AUpgradeCosts[2] = new Decimal(AUpgradeCostExponents[2]).pow(game.AUpgradesBought[2]).mul(AUpgradeCostBases[2]).floor()
    }
    else if (y == 6 && game.array[1].gte(500000)) {
      game.array[1] = game.array[1].sub(500000)
      game.BUpgradesBought[5] = new Decimal(1)
      document.getElementsByClassName("BUpgrade")[5].disabled = true
    }
    else if (y == 7 && game.array[1].gte(5e6)) {
      game.array[1] = game.array[1].sub(5e6)
      game.BUpgradesBought[6] = new Decimal(1)
      document.getElementsByClassName("BUpgrade")[6].disabled = true
    }
    else if (y == 8 && game.array[1].gte(1e8)) {
      game.array[1] = game.array[1].sub(1e8)
      game.BUpgradesBought[7] = new Decimal(1)
      document.getElementsByClassName("BUpgrade")[7].disabled = true
    }
		else if (y == 9 && game.array[1].gte(game.BUpgradeCosts[0])) {
      game.array[1] = game.array[1].sub(game.BUpgradeCosts[0])
      game.BUpgradesBought[8] = game.BUpgradesBought[8].add(1)
      game.BUpgradeCosts[0] = new Decimal(BUpgradeCostExponents[0]).pow(game.BUpgradesBought[8]).mul(BUpgradeCostBases[0]).floor()
    }
		else if (y == 10 && game.array[1].gte(game.BUpgradeCosts[0])) {
			upgradeAmountCanBuy = Decimal.affordGeometricSeries(game.array[1], BUpgradeCostBases[0], BUpgradeCostExponents[0], game.BUpgradesBought[8])
      upgradeCost = Decimal.sumGeometricSeries(upgradeAmountCanBuy, BUpgradeCostBases[0], BUpgradeCostExponents[0], game.BUpgradesBought[8])
      game.BUpgradesBought[8] = game.BUpgradesBought[8].add(upgradeAmountCanBuy)
      game.BUpgradeCosts[0] = new Decimal(BUpgradeCostExponents[0]).pow(game.BUpgradesBought[8]).mul(BUpgradeCostBases[0]).floor()
		}
		else if (y == 11 && game.array[1].gte(game.BUpgradeCosts[1])) {
      game.array[1] = game.array[1].sub(game.BUpgradeCosts[1])
      game.BUpgradesBought[9] = game.BUpgradesBought[9].add(1)
      game.BUpgradeCosts[1] = new Decimal(BUpgradeCostExponents[1]).pow(game.BUpgradesBought[9]).mul(BUpgradeCostBases[1]).floor()
    }
		else if (y == 12 && game.array[1].gte(game.BUpgradeCosts[1])) {
			upgradeAmountCanBuy = Decimal.affordGeometricSeries(game.array[1], BUpgradeCostBases[1], BUpgradeCostExponents[1], game.BUpgradesBought[9])
      upgradeCost = Decimal.sumGeometricSeries(upgradeAmountCanBuy, BUpgradeCostBases[1], BUpgradeCostExponents[1], game.BUpgradesBought[9])
      game.BUpgradesBought[9] = game.BUpgradesBought[9].add(upgradeAmountCanBuy)
      game.BUpgradeCosts[1] = new Decimal(BUpgradeCostExponents[1]).pow(game.BUpgradesBought[9]).mul(BUpgradeCostBases[1]).floor()
		}
  }
}

function prestigeConfirm(x) {
  if (x == 1) {
    if (game.array[0].lt(1e10)) {
      alert("You don't have enough A to reset for B!")
    }
    else if (!game.confirmations[0] || confirm("Are you sure you want to reset for B?")) {
      prestige(1)
    }
  }
  else if (x == 2) {
    if (game.array[1].lt(1e10)) {
      alert("You don't have enough B to reset for C!")
    }
    else if (!game.confirmations[1] || confirm("Are you sure you want to reset for C?")) {
      prestige(2)
    }
  }
	else if (x == 3) {
    if (game.array[2].lt(1e10)) {
      alert("You don't have enough C to reset for D!")
    }
    else if (!game.confirmations[2] || confirm("Are you sure you want to reset for D?")) {
      prestige(3)
    }
  }
}

function prestige(x) {
  if (x >= 1) {
    if (game.unlocks < 1) {
      game.unlocks = 1
      $(".tabButton").eq(1).css("display", "inline-block")
    }
    game.array[1] = game.array[1].add(game.BToGet)
    game.array[0] = new Decimal(10)
    game.AGenerators = [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)]
    game.AGeneratorsBought = [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)]
    game.AGeneratorCosts = [new Decimal(10), new Decimal(100), new Decimal(1000), new Decimal(100000), new Decimal(1e7)]
    game.AGeneratorProduction = [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)]
    game.AUpgradesBought[0] = new Decimal(0)
    game.AUpgradesBought[1] = new Decimal(0)
    game.AUpgradeCosts[0] = new Decimal(1e6)
    game.AUpgradeCosts[1] = new Decimal(1e8)
  }
  if (x >= 2) {
    if (game.unlocks < 2) {
      game.unlocks = 2
      $(".tabButton").eq(2).css("display", "inline-block")
      $(".tabButton").eq(4).css("display", "inline-block")
    }
    game.array[2] = game.array[2].add(game.CToGet)
		while (game.CMilestonesReached < CMilestones.length && game.array[2].gte(CMilestones[game.CMilestonesReached])) game.CMilestonesReached++
		if (game.CMilestonesReached >= 5) $(".challenge").eq(1).css("display", "inline-block")
		if (game.CMilestonesReached >= 9) $(".challenge").eq(2).css("display", "inline-block")
    game.array[1] = new Decimal(1)
    game.AUpgradesBought[2] = new Decimal(0)
    game.AUpgradeCosts[2] = new Decimal(1e80)
    game.BGenerators = [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)]
    game.BGeneratorsBought = [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)]
    game.BGeneratorCosts = [new Decimal(10), new Decimal(100), new Decimal(1000), new Decimal(10000), new Decimal(100000)]
    game.BGeneratorProduction = [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)]
    game.ABoosters = new Decimal(0)
    game.ABoosterators = new Decimal(0)
    game.ABoosteratorProduction = new Decimal(0)
    game.ABoosteratorCost = new Decimal(3)
		//I'm not bothering to optimize this since it caused bugs and I don't want to deal with that
    if (game.CMilestonesReached < 2 && game.unlocks < 3 && game.separatorUpgradesBought[3].eq(0)) {
			game.BUpgradesBought[1] = new Decimal(0)
			document.getElementsByClassName("BUpgrade")[1].disabled = false
			game.BUpgradesBought[2] = new Decimal(0)
			document.getElementsByClassName("BUpgrade")[2].disabled = false
		}
		if (game.CMilestonesReached < 4 && game.unlocks < 3 && game.separatorUpgradesBought[3].eq(0)) {
			game.BUpgradesBought[3] = new Decimal(0)
			document.getElementsByClassName("BUpgrade")[3].disabled = false
			game.BUpgradesBought[5] = new Decimal(0)
			document.getElementsByClassName("BUpgrade")[5].disabled = false
			game.BUpgradesBought[6] = new Decimal(0)
			document.getElementsByClassName("BUpgrade")[6].disabled = false
			game.BUpgradesBought[7] = new Decimal(0)
			document.getElementsByClassName("BUpgrade")[7].disabled = false
		}
    //for (i = 0; i < 8; i++) {
    //  if (i == 0 || i == 4 || game.CMilestonesReached >= 4 || game.unlocks >= 3) {document.getElementsByClassName("BUpgrade")[i].disabled = true}
		//	else if (i == 1 && (game.CMilestonesReached >= 2 || game.unlocks >= 3)) {document.getElementsByClassName("BUpgrade")[i].disabled = true}
		//	else if (i == 2 && (game.CMilestonesReached >= 2 || game.unlocks >= 3)) {document.getElementsByClassName("BUpgrade")[i].disabled = true}
    //  else {document.getElementsByClassName("BUpgrade")[i].disabled = false}
    //}
  }
	if (x >= 3) {
    if (game.unlocks < 3) {
      game.unlocks = 3
			$(".tabButton").eq(3).css("display", "inline-block")
			$(".challengeSection").eq(1).css("display", "block")
    }
		game.array[3] = game.array[3].add(game.DToGet)
		while (game.DMilestonesReached < DMilestones.length && game.array[3].gte(DMilestones[game.DMilestonesReached])) game.DMilestonesReached++
		if (game.DMilestonesReached >= 5) $(".challenge").eq(5).css("display", "inline-block")
		game.array[2] = new Decimal(1)
		if (game.DMilestonesReached < 3) game.CMilestonesReached = 1
		if (game.separatorUpgradesBought[3].eq(0)) {
			game.BUpgradesBought[8] = new Decimal(0)
			game.BUpgradeCosts[0] = new Decimal(1e80)
		}
    game.CGenerators = [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)]
    game.CGeneratorsBought = [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)]
    game.CGeneratorCosts = [new Decimal(10), new Decimal(100), new Decimal(1000), new Decimal(10000), new Decimal(100000)]
    game.CGeneratorProduction = [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)]
		if (game.DMilestonesReached < 4) {
			game.challengesBeaten[0] = 0
			game.challengesBeaten[1] = 0
			game.challengesBeaten[2] = 0
			game.challengesBeaten[3] = 0
		}
	}
	if (x >= 4) {
		if (game.separatorUpgradesBought[2].eq(1)) {game.unlocks = 3}
		else if (game.separatorUpgradesBought[1].eq(1)) {game.unlocks = 2}
		else {game.unlocks = 1}
		game.separators[0] = game.separators[0].add(game.separatorsToGet)
		game.separatorPoints = game.separatorPoints.add(game.separatorsToGet)
		if (game.separatorUpgradesBought[1].eq(0)) {
			game.array[2] = new Decimal(0)
			$(".tabButton").eq(2).css("display", "none")
			$(".BUpgrade").eq(8).css("display", "none")
			game.CMilestonesReached = 0
		}
		else {game.array[2] = new Decimal(1)}
		if (game.separatorUpgradesBought[2].eq(0)) {
			game.array[3] = new Decimal(0)
			$(".tabButton").eq(3).css("display", "none")
			$(".BUpgrade").eq(9).css("display", "none")
			game.DMilestonesReached = 0
		}
		else {game.array[3] = new Decimal(1)}
		if (game.separatorUpgradesBought[3].eq(0)) {
			game.BUpgradesBought[1] = new Decimal(0)
			document.getElementsByClassName("BUpgrade")[1].disabled = false
			game.BUpgradesBought[2] = new Decimal(0)
			document.getElementsByClassName("BUpgrade")[2].disabled = false
			game.BUpgradesBought[3] = new Decimal(0)
			document.getElementsByClassName("BUpgrade")[3].disabled = false
			game.BUpgradesBought[5] = new Decimal(0)
			document.getElementsByClassName("BUpgrade")[5].disabled = false
			game.BUpgradesBought[6] = new Decimal(0)
			document.getElementsByClassName("BUpgrade")[6].disabled = false
			game.BUpgradesBought[7] = new Decimal(0)
			document.getElementsByClassName("BUpgrade")[7].disabled = false
			game.BUpgradesBought[9] = new Decimal(0)
			game.BUpgradeCosts[1] = new Decimal(1e200)
		}
		game.DGenerators = [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)]
    game.DGeneratorsBought = [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)]
    game.DGeneratorCosts = [new Decimal(10), new Decimal(100), new Decimal(1000), new Decimal(10000), new Decimal(100000)]
    game.DGeneratorProduction = [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)]
		if (game.separatorUpgradesBought[0].eq(0)) {
			game.challengesBeaten[0] = 0
			game.challengesBeaten[1] = 0
			game.challengesBeaten[2] = 0
			game.challengesBeaten[3] = 0
			game.challengesBeaten[4] = 0
			game.challengesBeaten[5] = 0
			game.challengesBeaten[6] = 0
			game.challengesBeaten[7] = 0
			$(".challenge").eq(1).css("display", "none")
			$(".challenge").eq(2).css("display", "none")
			$(".challenge").eq(3).css("display", "none")
			$(".challenge").eq(5).css("display", "none")
			$(".challenge").eq(6).css("display", "none")
			$(".challenge").eq(7).css("display", "none")
		}
	}
}

function buyABoosterator() {
  if (game.array[1].gte(game.ABoosteratorCost)) {
    game.array[1] = game.array[1].sub(game.ABoosteratorCost)
    game.ABoosterators = game.ABoosterators.add(1)
    game.ABoosteratorCost = new Decimal(2).pow(game.ABoosterators).mul(3)
  }
}

function buyMaxABoosterators(x=1) {
	boosteratorAmountCanBuy = Decimal.affordGeometricSeries(game.array[1], 3, 2, game.ABoosterators)
	boosteratorCost = Decimal.sumGeometricSeries(boosteratorAmountCanBuy, 3, 2, game.ABoosterators)
	if (x==1) game.array[1] = game.array[1].sub(boosteratorCost)
	game.ABoosterators = game.ABoosterators.add(boosteratorAmountCanBuy)
	game.ABoosteratorCost = new Decimal(2).pow(game.ABoosterators).mul(3)
}

function enterChallenge(x) {
  if (x != game.currentChallenge) {
    if (confirm("Are you sure you want to enter this challenge?")) {
      game.currentChallenge = x
			for (i=0;i<8;i++) {
				if (i <= 3) {
					$(".challenge").eq(i).css("border", "3px solid #00f")
					$(".challenge").eq(i).css("backgroundColor", "#111")
				}
				else if (i <= 4) {
					$(".challenge").eq(i).css("border", "3px solid #80f")
					$(".challenge").eq(i).css("backgroundColor", "#111")
				}
			}
			$(".challenge").eq(x - 1).css("border", "3px solid #0f0")
			$(".challenge").eq(x - 1).css("backgroundColor", "#020")
      if (x <= 4) {prestige(1)}
			else if (x <= 8) {prestige(2)}
    }
  }
  else if (confirm("Are you sure you want to leave this challenge early?")) {
    game.currentChallenge = 0
    if (x <= 4) {
			$(".challenge").eq(x - 1).css("border", "3px solid #00f")
			$(".challenge").eq(x - 1).css("backgroundColor", "#111")
			prestige(1)
		}
		else if (x <= 8) {
			$(".challenge").eq(x - 1).css("border", "3px solid #80f")
			$(".challenge").eq(x - 1).css("backgroundColor", "#111")
			prestige(2)
		}
  }
}

function finishChallenge() {
  if (game.challengesBeaten[game.currentChallenge - 1] < 6) game.challengesBeaten[game.currentChallenge - 1]++
  if (game.currentChallenge <= 4) {
    $(".challenge").eq(game.currentChallenge - 1).css("border", "3px solid #00f")
    $(".challenge").eq(game.currentChallenge - 1).css("backgroundColor", "#111")
    prestige(1)
  }
	else if (game.currentChallenge <= 8) {
    $(".challenge").eq(game.currentChallenge - 1).css("border", "3px solid #80f")
    $(".challenge").eq(game.currentChallenge - 1).css("backgroundColor", "#111")
    prestige(2)
  }
  game.currentChallenge = 0
}

function unlockSeparators() {
	if (game.array[3].gte(1e10)) {
		if (game.separatorUnlocks < 1) game.separatorUnlocks = 1
		$("#separatorUnlockButton").css("display", "none")
		$(".tabButton").eq(5).css("display", "inline-block")
		$(".tabButton").eq(6).css("display", "inline-block")
	}
}

function upgradeSeparator() {
	if (game.array[3].lt(1e10)) {
		alert("You don't have enough D to upgrade your separator!")
	}
	else if (!game.confirmations[3] || confirm("Are you sure you want to upgrade your separator?")) {
		prestige(4)
	}
}

function calculateUnspentSeparators() {
	game.unspentSeparatorPoints = game.separatorPoints.sub(game.separatorBoosts[0]).sub(game.separatorBoosts[1]).sub(game.separatorBoosts[2])
	for (i=0;i<separatorUpgradeCosts.length;i++) {
		if (game.separatorUpgradesBought[i].eq(1)) game.unspentSeparatorPoints = game.unspentSeparatorPoints.sub(separatorUpgradeCosts[i])
	}
	game.unspentSeparatorPoints = Decimal.max(game.unspentSeparatorPoints, 0)
}

function buySeparatorBoost(x, max=0) {
	if (x==4) {
		splitSPAmount = game.unspentSeparatorPoints.div(3).floor()
		for (i=0;i<3;i++) game.separatorBoosts[i] = game.separatorBoosts[i].add(splitSPAmount)
		calculateUnspentSeparators()
		for (i=0;i<game.unspentSeparatorPoints;i++) game.separatorBoosts[i] = game.separatorBoosts[i].add(1)
	}
	else if (max) {
		game.separatorBoosts[x-1] = game.separatorBoosts[x-1].add(game.unspentSeparatorPoints)
	}
	else {
		if (game.unspentSeparatorPoints.gt(0)) {
			game.separatorBoosts[x-1] = game.separatorBoosts[x-1].add(1)
		} 
	}
}

function buySeparatorUpgrade(x) {
	if (game.unspentSeparatorPoints.gte(separatorUpgradeCosts[x-1]) && game.separatorUpgradesBought[x-1].eq(0)) {
		game.unspentSeparatorPoints = game.unspentSeparatorPoints.sub(separatorUpgradeCosts[x-1])
		game.separatorUpgradesBought[x-1] = new Decimal(1)
		if (x==1) {
			$(".challenge").eq(1).css("display", "inline-block")
			$(".challenge").eq(2).css("display", "inline-block")
			$(".challenge").eq(3).css("display", "inline-block")
			$(".challenge").eq(5).css("display", "inline-block")
			$(".challenge").eq(6).css("display", "inline-block")
			$(".challenge").eq(7).css("display", "inline-block")
			game.challengesBeaten = [6,6,6,6,6,6,6,6]
			$(".separatorUpgrade").eq(1).css("display", "inline-block")
		}
		else if (x==2) {
			$(".separatorUpgrade").eq(2).css("display", "inline-block")
			$(".separatorUpgrade").eq(3).css("display", "inline-block")
		}
		else if (x==4) {
			$(".separatorUpgrade").eq(4).css("display", "inline-block")
		}
		else if (x==5) {
			$(".separatorUpgrade").eq(5).css("display", "inline-block")
		}
	}
}

function refundSeparatorPoints() {
	if (confirm("Are you sure you want to refund your SP?")) {
		game.separatorBoosts = [new Decimal(0), new Decimal(0), new Decimal(0)]
		for (i=0;i<separatorUpgradeCosts.length;i++) game.separatorUpgradesBought[i] = new Decimal(0)
		for (i=1;i<6;i++) $(".separatorUpgrade").eq(i).css("display", "none")
		prestige(4)
	}
}

function gainArray(x) {
	if (x==1 && game.separatorPoints.gte(new Decimal(1.3).pow(game.array[4]))) {
		game.array[4] = game.array[4].add(1)
	}
	else if (x==2 && game.separatorPoints.gte(new Decimal(1.4).pow(game.array[5]).mul(10000))) {
		game.array[5] = game.array[5].add(1)
	}
}

function gainMaxArray(x) {
	if (x==1 && game.separatorPoints.gte(new Decimal(1.3).pow(game.array[4]))) {
		game.array[4] = game.array[4].add(Decimal.max(game.separatorPoints.log(1.3).sub(game.array[4]), 0).ceil())
	}
	else if (x==2 && game.separatorPoints.gte(new Decimal(1.4).pow(game.array[5]).mul(10000))) {
		game.array[5] = game.array[5].add(Decimal.max(game.separatorPoints.div(10000).log(1.4).sub(game.array[5]), 0).ceil())
	}
}