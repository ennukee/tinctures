import React, { useCallback, useState } from 'react'
import stringSimilarity from 'string-similarity'

import data from 'util/tinctureMods.json';
import { generateQuery } from 'util/generateQuery';
import './Page.css'

const modNameList = data.map(d => d.text);

export default function Page() {
  const [ output, setOutput ] = useState('')
  const [ input, setInput ] = useState('')
  const [ seed, setSeed ] = useState('')

  const generateTradeLink = useCallback(() => {
    const [itemData,,,mods,,] = input.split('--------')
    const [,,tinctureItemName] = itemData.trim('\n').split('\n')

    try {
      const tinctureBaseMatch = tinctureItemName.match(/\b\w+(?= Tincture)/g)
      if (tinctureBaseMatch.length !== 1) {
        throw new Error(`Expected 1 base, got ${tinctureBaseMatch.length}`)
      }
      
      const tinctureFullSearchName = `${tinctureBaseMatch[0]} Tincture`

      const modMatches = mods.trim('\n').split('\n').map(mod => stringSimilarity.findBestMatch(mod, modNameList).bestMatch.target)
      const modIds = modMatches.map(mod => data.find(d => d.text === mod).id)

      const query = generateQuery(modIds, tinctureFullSearchName)

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
      <div className="title">Tincture Trade Gen</div>
      <div className="subtitle">Ctrl+C over your tincture and place it below. Use the "generate" button to then create a trade link.</div>
      <textarea className="input" value={input} onChange={handleChange} />
      <button className="generate-button" onClick={() => generateTradeLink()}>Generate</button>
      {output && <a href={output} target="_blank" rel="noreferrer">Click me to be brought to the trade site (seed: {seed})</a>}
    </div>
  )
}
