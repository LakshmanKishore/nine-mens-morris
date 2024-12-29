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
  highlightedCellsPartOfMill: number[]
  totalCellsToPlace: number
  selectedCellIndex: number
  neighborHighlightCells: number[]
  occurredPossibleMillIndexes: number[]
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
    highlightedCellsPartOfMill: [],
    totalCellsToPlace: 17,
    selectedCellIndex: -1,
    neighborHighlightCells: [],
    occurredPossibleMillIndexes: [],
  }),
  actions: {
    // handleClick: (cellIndex, { game, playerId, allPlayerIds }) => {
    handleClick: (cellIndex, { game, playerId }) => {
      if (game.lastMovePlayerId === playerId) {
        return
      }

      // If the cell needs to be removed then remove it
      if (game.removableCells.includes(cellIndex)) {
        // Set the player id to null
        game.cells[cellIndex].playerId = null
        // After removing the cell reset the clickable cells
        if (game.cellPlacedCount <= game.totalCellsToPlace) {
          game.clickableCells = []
          // Reset the clickable cells to empty cells
          game.cells.forEach((cell, index) => {
            if (cell.playerId === null) {
              game.clickableCells.push(index)
            }
          })
        } else {
          // Set the clickable cells to the opponent cells when it's time to move
          game.cells.forEach((cell, index) => {
            if (cell.playerId !== playerId && cell.playerId !== null) {
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

      // Logic to move the cells
      if (game.cellPlacedCount > game.totalCellsToPlace) {
        // First check if the clicked cell is present in neighbors highlight cell
        if (game.neighborHighlightCells.includes(cellIndex)) {
          game.cells[cellIndex].playerId =
            game.cells[game.selectedCellIndex].playerId
          game.cells[game.selectedCellIndex].playerId = null

          // Reset the clickable cells to remove the previous selected cell's neighbors
          game.clickableCells = game.clickableCells.filter(
            (index) => !game.neighborHighlightCells.includes(index)
          )
          game.selectedCellIndex = -1
          // reset neighbor highlight cells
          game.neighborHighlightCells = []
        }
        // Check if the clicked cell is in clickable cells
        if (game.clickableCells.includes(cellIndex)) {
          game.selectedCellIndex = cellIndex
          // If there is a new selected cells are present, then remove all the previous neighbor highlight cells from the clickable cells
          game.clickableCells = game.clickableCells.filter(
            (index) => !game.neighborHighlightCells.includes(index)
          )

          // Reset the neighbor highlight cells for the new selected cell
          game.neighborHighlightCells = []
          game.cells[cellIndex].reachableCellIndexes.forEach((index) => {
            if (!game.cells[index].playerId) {
              game.neighborHighlightCells.push(index)
              game.clickableCells.push(index)
            }
          })
          return
        }
      } else {
        // Reset the clickable cells
        game.clickableCells = []

        // Update clickable cells with all the empty cells
        game.cells.forEach((cell, index) => {
          if (cell.playerId === null && cellIndex !== index) {
            game.clickableCells.push(index)
          }
        })
      }

      // Check if the player has clicked on an empty cells
      if (
        game.cells[cellIndex].playerId === null &&
        game.cellPlacedCount <= game.totalCellsToPlace
      ) {
        game.cells[cellIndex].playerId = playerId
        game.cellPlacedCount += 1
      }

      // For all occurred possible mills check if the mill exists still
      game.occurredPossibleMillIndexes =
        game.occurredPossibleMillIndexes.filter((index) => {
          const mill = game.possibleMills[index]
          return (
            game.cells[mill[0]].playerId === game.cells[mill[1]].playerId &&
            game.cells[mill[1]].playerId === game.cells[mill[2]].playerId &&
            game.cells[mill[2]].playerId === game.cells[mill[0]].playerId
          )
        })

      let canTakeOpponentCell = false

      // Check if any mills has formed only on the cell where the player has clicked
      for (let index = 0; index < game.possibleMills.length; index++) {
        const mill = game.possibleMills[index]
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
          game.occurredPossibleMillIndexes.push(index)
          game.highlightedCellsPartOfMill.push(mill[0], mill[1], mill[2])

          // Make the opponent player's cells clickable and disable the click on all other cells
          game.cells.forEach((cell, index) => {
            if (cell.playerId !== playerId && cell.playerId) {
              // For each mills that has occurred check if the cell is part of the mill
              let indexPresentInMill = false
              for (
                let i = 0;
                i < game.occurredPossibleMillIndexes.length;
                i++
              ) {
                const millIndexes =
                  game.possibleMills[game.occurredPossibleMillIndexes[i]]
                if (millIndexes.includes(index)) {
                  indexPresentInMill = true
                  break
                }
              }
              if (!indexPresentInMill) {
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

      // After placing all the 17 cells, the clickable Cells should be only the current player's cells
      if (game.cellPlacedCount > game.totalCellsToPlace) {
        game.clickableCells = []
        game.cells.forEach((cell, index) => {
          if (cell.playerId === game.lastMovePlayerId) {
            game.clickableCells.push(index)
          }
        })
      }

      game.lastMovePlayerId = playerId
    },
  },
})
