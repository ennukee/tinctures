/**
 * Takes in a list of mod id strings (e.g. crucible.mod_55555) and
 * the weapon type (e.g. weapon.wand)
 * 
 * @param {string[]} modList 
 * @param {string} weaponType 
 * @returns A query to be used in the trade site's "q=" query param
 */
export const generateQuery = (modList, itemName) => ({
  query: {
    status: {
      option: "online"
    },
    stats: [
      {
        type: "and",
        filters: [
          ...modList.map(mod => ({
            id: mod
          })),
        ]
      },
    ],
    filters: {
      trade_filters: {
        filters: {
          collapse: {
            option: "true"
          }
        }
      },
    },
    type: itemName
  },
  sort: {
    price: "asc"
  }
})