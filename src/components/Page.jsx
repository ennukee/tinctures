import React, { useCallback, useState } from 'react'
import stringSimilarity from 'string-similarity'

import tinctureData from 'util/tinctureMods.json';
import charmData from 'util/charmMods.json';

import { generateQuery } from 'util/generateQuery';
import './Page.css'

const VERSION_NUMBER = '1.1.0';

const tinctureModNameList = tinctureData.map(d => d.text);
const charmModNameList = charmData.map(d => d.text);

export default function Page() {
  const [ output, setOutput ] = useState('')
  const [ input, setInput ] = useState('')
  const [ seed, setSeed ] = useState('')

  const generateTradeLink = useCallback(() => {
    const [itemData,...otherRows] = input.split('--------')
    const mods = otherRows[otherRows.length - 3]
    const [,,itemName] = itemData.trim('\n').split('\n')

    try {
      let modIds, itemFullSearchName
      const tinctureBaseMatch = itemName.match(/\b\w+(?= Tincture)/g)
      const charmBaseMatch = itemName.match(/\b\w+(?= Charm)/g)
      if (tinctureBaseMatch?.length === 1) {
        const modMatches = mods.trim('\n').split('\n').map(mod => stringSimilarity.findBestMatch(mod, tinctureModNameList).bestMatch.target)
        modIds = modMatches.map(mod => tinctureData.find(d => d.text === mod).id)
        itemFullSearchName = `${tinctureBaseMatch[0]} Tincture`
      } else if (charmBaseMatch?.length === 1) {
        const modMatches = mods.trim('\n').split('\n').map(mod => stringSimilarity.findBestMatch(mod, charmModNameList).bestMatch.target)
        modIds = modMatches.map(mod => charmData.find(d => d.text === mod).id)
        itemFullSearchName = `${charmBaseMatch[0]} Charm`
      } else {
        throw new Error('Could not determine item type');
      }

      const query = generateQuery(modIds, itemFullSearchName)

      console.log(query)

      setOutput(`https://www.pathofexile.com/trade/search?q=${encodeURIComponent(JSON.stringify(query))}`)
      setSeed(Math.random())
    } catch (e) {
      console.error(e)
      setSeed(0)
      setOutput('')
    }
    
  }, [input])

  const handleChange = useCallback((e) => {
    setInput(e.target.value)
  }, [])

  return (
    <div className="page-container">
      <div className="title">Affliction Trade Gen <a href="https://github.com/ennukee/tinctures/blob/master/CHANGELOG.md" className="version-number">v{VERSION_NUMBER}</a></div>
      <div className="subtitle">Ctrl+C over your tincture/charm and place it below. Use the "generate" button to then create a trade link.</div>
      <textarea className="input" value={input} onChange={handleChange} />
      <button className="generate-button" onClick={() => generateTradeLink()}>Generate</button>
      {output && <a href={output} target="_blank" rel="noreferrer">Click me to be brought to the trade site (seed: {seed})</a>}
    </div>
  )
}
