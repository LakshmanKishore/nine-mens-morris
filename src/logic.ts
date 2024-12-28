import type { PlayerId, RuneClient } from "rune-sdk"

// export type Cells = PlayerId[]
export type Cells = {
  x: number
  y: number
  playerId: PlayerId | null
  reachableCellIndexes: number[]
  // isPartOfMill: boolean
  // toRemove: boolean
  // disableClick: boolean
}

export interface GameState {
  cells: Cells[]
  winCombo: number[] | null
  lastMovePlayerId: PlayerId | null
  playerIds: PlayerId[]
  freeCells?: boolean
  cellPlacedCount: number
  possibleMills: number[][]
  clickableCells: number[]
  removableCells: number[]
  cellsPartOfMill: number[]
  highlightedCellsPartOfMill: number[]
}

type GameActions = {
  handleClick: (cellIndex: number) => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

// function findWinningCombo(cells: Cells) {
//   return (
//     [
//       [0, 1, 2],
//       [3, 4, 5],
//       [6, 7, 8],
//       [0, 3, 6],
//       [1, 4, 7],
//       [2, 5, 8],
//       [0, 4, 8],
//       [2, 4, 6],
//     ].find((combo) =>
//       combo.every((i) => cells[i] && cells[i] === cells[combo[0]])
//     ) || null
//   )
// }

Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 2,
  setup: (allPlayerIds) => ({
    cells: [
      {
        x: 0,
        y: 0,
        playerId: null,
        reachableCellIndexes: [1, 7],
      },
      {
        x: 300,
        y: 0,
        playerId: null,
        reachableCellIndexes: [0, 2, 9],
      },
      {
        x: 600,
        y: 0,
        playerId: null,
        reachableCellIndexes: [1, 3],
      },
      {
        x: 600,
        y: 300,
        playerId: null,
        reachableCellIndexes: [2, 4, 11],
      },
      {
        x: 600,
        y: 600,
        playerId: null,
        reachableCellIndexes: [3, 5],
      },
      {
        x: 300,
        y: 600,
        playerId: null,
        reachableCellIndexes: [4, 6, 13],
      },
      {
        x: 0,
        y: 600,
        playerId: null,
        reachableCellIndexes: [5, 7],
      },
      {
        x: 0,
        y: 300,
        playerId: null,
        reachableCellIndexes: [0, 6, 15],
      },
      {
        x: 100,
        y: 100,
        playerId: null,
        reachableCellIndexes: [9, 15],
      },
      {
        x: 300,
        y: 100,
        playerId: null,
        reachableCellIndexes: [1, 8, 10, 17],
      },
      {
        x: 500,
        y: 100,
        playerId: null,
        reachableCellIndexes: [9, 11],
      },
      {
        x: 500,
        y: 300,
        playerId: null,
        reachableCellIndexes: [3, 10, 12, 19],
      },
      {
        x: 500,
        y: 500,
        playerId: null,
        reachableCellIndexes: [11, 13],
      },
      {
        x: 300,
        y: 500,
        playerId: null,
        reachableCellIndexes: [5, 12, 14, 21],
      },
      {
        x: 100,
        y: 500,
        playerId: null,
        reachableCellIndexes: [13, 15],
      },
      {
        x: 100,
        y: 300,
        playerId: null,
        reachableCellIndexes: [7, 8, 14, 23],
      },
      {
        x: 200,
        y: 200,
        playerId: null,
        reachableCellIndexes: [17, 23],
      },
      {
        x: 300,
        y: 200,
        playerId: null,
        reachableCellIndexes: [9, 16, 18],
      },
      {
        x: 400,
        y: 200,
        playerId: null,
        reachableCellIndexes: [17, 19],
      },
      {
        x: 400,
        y: 300,
        playerId: null,
        reachableCellIndexes: [18, 11, 20],
      },
      {
        x: 400,
        y: 400,
        playerId: null,
        reachableCellIndexes: [19, 21],
      },
      {
        x: 300,
        y: 400,
        playerId: null,
        reachableCellIndexes: [13, 20, 22],
      },
      {
        x: 200,
        y: 400,
        playerId: null,
        reachableCellIndexes: [21, 23],
      },
      {
        x: 200,
        y: 300,
        playerId: null,
        reachableCellIndexes: [15, 16, 22],
      },
    ],
    winCombo: null,
    lastMovePlayerId: allPlayerIds[1],
    playerIds: allPlayerIds,
    cellPlacedCount: 0,
    possibleMills: [
      [0, 1, 2],
      [2, 3, 4],
      [4, 5, 6],
      [6, 7, 0],
      [8, 9, 10],
      [10, 11, 12],
      [12, 13, 14],
      [14, 15, 8],
      [16, 17, 18],
      [18, 19, 20],
      [20, 21, 22],
      [22, 23, 16],
      [1, 9, 17],
      [3, 11, 19],
      [5, 13, 21],
      [7, 15, 23],
    ],
    clickableCells: [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24,
    ],
    removableCells: [],
    cellsPartOfMill: [],
    highlightedCellsPartOfMill: [],
  }),
  actions: {
    // handleClick: (cellIndex, { game, playerId, allPlayerIds }) => {
    handleClick: (cellIndex, { game, playerId }) => {
      if (game.lastMovePlayerId === playerId) {
        return
      }

      // Reset the clickable cells
      game.clickableCells = []

      // Update clickable cells with all the empty cells
      game.cells.forEach((cell, index) => {
        if (cell.playerId === null && cellIndex !== index) {
          game.clickableCells.push(index)
        }
      })

      // If the cell needs to be removed then remove it
      if (game.removableCells.includes(cellIndex)) {
        // Set the player id to null
        game.cells[cellIndex].playerId = null
        // Reset all the remove flags
        // TODO: Make this to store recent removed cells and use that to access it here
        // for (let i = 0; i < game.cells.length; i++) {
        //   game.cells[i].toRemove = false
        //   game.cells[i].disableClick = false
        //   game.cells[i].isPartOfMill = false
        // }
        // After removing the cell reset the clickable cells
        if (game.cellPlacedCount <= 17) {
          // Reset the clickable cells to empty cells
          game.cells.forEach((cell, index) => {
            if (cell.playerId === null) {
              game.clickableCells.push(index)
            }
          })
        } else {
          // Set the clickable cells to the opponent cells when it's time to move
          game.cells.forEach((cell, index) => {
            if (cell.playerId !== playerId) {
              game.clickableCells.push(index)
            }
          })
        }
        game.removableCells = []
        game.highlightedCellsPartOfMill = []
        // Change the last move player id
        game.lastMovePlayerId = playerId
        return
      }

      // Check if the player has clicked on an empty cells
      if (
        game.cells[cellIndex].playerId === null &&
        game.cellPlacedCount <= 17
      ) {
        game.cells[cellIndex].playerId = playerId
        game.cellPlacedCount += 1
      }

      let canTakeOpponentCell = false

      // Check if any mills has formed only on the cell where the player has clicked
      for (const mill of game.possibleMills) {
        // If the cell is not part of the mill then continue
        if (!mill.includes(cellIndex)) {
          continue
        }
        if (
          game.cells[mill[0]].playerId === playerId &&
          game.cells[mill[1]].playerId === playerId &&
          game.cells[mill[2]].playerId === playerId
        ) {
          // Add the mill to the cells part of mill
          game.cellsPartOfMill.push(mill[0], mill[1], mill[2])
          game.highlightedCellsPartOfMill.push(mill[0], mill[1], mill[2])
          // game.cells[mill[0]].isPartOfMill = true
          // game.cells[mill[1]].isPartOfMill = true
          // game.cells[mill[2]].isPartOfMill = true
          // Make the opponent player's cells clickable and disable the click on all other cells
          game.cells.forEach((cell, index) => {
            if (cell.playerId !== playerId && cell.playerId) {
              if (!game.cellsPartOfMill.includes(index)) {
                game.removableCells.push(index)
                canTakeOpponentCell = true
              }
            }
          })
          // Return only if the player can take the opponent's cell else the player's turn will change
          if (canTakeOpponentCell) {
            // Set the clickable cells to removable cells
            game.clickableCells = game.removableCells
            return
          } else {
            // Reset the highlighted cells part of mill if there are no cells to take
            game.highlightedCellsPartOfMill = []
          }
        }
      }

      game.lastMovePlayerId = playerId
    },
  },
})
