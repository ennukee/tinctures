/**
 * PLEASE READ IF RUNNING THIS SCRIPT FOR THE FIRST TIME ON A FRESH PULL OF THE REPO
 * 
 * You need two files in order to make this work
 *  1. poedb.txt -- Go to poedb and download the HTML of the page as a txt file (you will likely need to right-click "View source"
 *                  instead of doing "Save as" due to the massive size of this file causing weird issues in the "Save as" download)
 *  2. mods.json -- Visit https://www.pathofexile.com/api/trade/data/stats and download the entire JSON file, name it mods.json and place
 *                  it in this directory
 * 
 * These are two very large files and are not optimal to check into git, so get them manually
 */

const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { default: puppeteer } = require('puppeteer');

const mods = require('./mods.json');

const ENABLE_DEBUG_LOGGING = true;

console.debug = (...args) => {
  if (ENABLE_DEBUG_LOGGING) {
    console.log(...args);
  }
}

// These are for cases where the PoEDB and official texts differ, usually due to lines being swapped
const manualNameOverrides = {}

const main = async () => {
  // const output = {}
  const erroredModTexts = []

  const POEDB_HTML = fs.readFileSync(path.resolve(__dirname, 'poedb.txt'), 'utf8');
  const dom = new jsdom.JSDOM(POEDB_HTML);

  const modList = [
      ...dom.window.document
        .querySelectorAll('#TinctureMods .explicitMod')
    ].map(
      el => [...el.childNodes]
        .map(cN => cN.classList ? '#' : cN.textContent).join('')
    ).slice(8) // The first 8 are not explicits 
  
  // console.debug(modList)

  const explicitMods = mods.result.find(mod => mod.id === 'explicit').entries;
  const output = modList.map(modText => {
    const cleanText = (text) => text.replace('\n', '#').replace('+', '');
    const potentialMods = explicitMods.filter(eMod => cleanText(eMod.text) === cleanText(modText));
    
    // There are identical mod names, but we want the newest one since it's the newest league
    const mod = potentialMods[potentialMods.length - 1]
    if (!mod) {
      erroredModTexts.push(modText);
      return null;
    }
    return {
      text: cleanText(mod.text),
      id: mod.id,
    };
  })

  const KNOWN_MISSING_MODS = [
    'Hits Steal Power Charges',
    'Hits Steal Frenzy Charges',
    'Hits Steal Endurance Charges',
    "Weapon Attacks fire # additional Projectiles if you've been Hit Recently"
  ];
  if (erroredModTexts.filter(mod => !KNOWN_MISSING_MODS.includes(mod)).length > 0) {
    console.debug(`Unsuccessful in finding ${erroredModTexts.length} of ${modList.length} mods`)
    console.debug(erroredModTexts)
  } else {
    // console.debug(output);
  }

  const filteredMods = []
  output.forEach(mod => {
    if (mod && !filteredMods.find(fMod => fMod.text === mod.text)) {
      filteredMods.push(mod);
    }
  })

  console.debug(filteredMods)

  fs.writeFile('../src/util/tinctureMods.json', JSON.stringify(filteredMods, null, 2), null, () => {})
}

main();
