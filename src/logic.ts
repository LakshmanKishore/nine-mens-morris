import type { PlayerId, RuneClient } from "rune-sdk"

// export type Cells = PlayerId[]
export type Cells = {
  x: number
  y: number
  playerId: PlayerId | null
  reachableCellIndexes: number[]
  isPartOfMill: boolean
  toRemove: boolean
  disableClick: boolean
}

export interface GameState {
  cells: Cells[]
  winCombo: number[] | null
  lastMovePlayerId: PlayerId | null
  playerIds: PlayerId[]
  freeCells?: boolean
  cellPlacedCount: number
  mills: number[][]
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
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 300,
        y: 0,
        playerId: null,
        reachableCellIndexes: [0, 2, 9],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 600,
        y: 0,
        playerId: null,
        reachableCellIndexes: [1, 3],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 600,
        y: 300,
        playerId: null,
        reachableCellIndexes: [2, 4, 11],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 600,
        y: 600,
        playerId: null,
        reachableCellIndexes: [3, 5],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 300,
        y: 600,
        playerId: null,
        reachableCellIndexes: [4, 6, 13],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 0,
        y: 600,
        playerId: null,
        reachableCellIndexes: [5, 7],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 0,
        y: 300,
        playerId: null,
        reachableCellIndexes: [0, 6, 15],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 100,
        y: 100,
        playerId: null,
        reachableCellIndexes: [9, 15],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 300,
        y: 100,
        playerId: null,
        reachableCellIndexes: [1, 8, 10, 17],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 500,
        y: 100,
        playerId: null,
        reachableCellIndexes: [9, 11],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 500,
        y: 300,
        playerId: null,
        reachableCellIndexes: [3, 10, 12, 19],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 500,
        y: 500,
        playerId: null,
        reachableCellIndexes: [11, 13],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 300,
        y: 500,
        playerId: null,
        reachableCellIndexes: [5, 12, 14, 21],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 100,
        y: 500,
        playerId: null,
        reachableCellIndexes: [13, 15],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 100,
        y: 300,
        playerId: null,
        reachableCellIndexes: [7, 8, 14, 23],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 200,
        y: 200,
        playerId: null,
        reachableCellIndexes: [17, 23],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 300,
        y: 200,
        playerId: null,
        reachableCellIndexes: [9, 16, 18],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 400,
        y: 200,
        playerId: null,
        reachableCellIndexes: [17, 19],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 400,
        y: 300,
        playerId: null,
        reachableCellIndexes: [18, 11, 20],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 400,
        y: 400,
        playerId: null,
        reachableCellIndexes: [19, 21],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 300,
        y: 400,
        playerId: null,
        reachableCellIndexes: [13, 20, 22],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 200,
        y: 400,
        playerId: null,
        reachableCellIndexes: [21, 23],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
      {
        x: 200,
        y: 300,
        playerId: null,
        reachableCellIndexes: [15, 16, 22],
        isPartOfMill: false,
        toRemove: false,
        disableClick: false,
      },
    ],
    winCombo: null,
    lastMovePlayerId: allPlayerIds[1],
    playerIds: allPlayerIds,
    cellPlacedCount: 0,
    mills: [
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
  }),
  actions: {
    handleClick: (cellIndex, { game, playerId, allPlayerIds }) => {
      if (game.lastMovePlayerId === playerId) {
        console.log("True!!!!")
        return
      }
      console.log("playerId", playerId)
      console.log("lastMovePlayerId", game.lastMovePlayerId)
      // if (
      //   game.cells[cellIndex].playerId !== null ||
      //   playerId === game.lastMovePlayerId
      // ) {
      //   throw Rune.invalidAction()
      // }

      // If the cell needs to be removed then remove it
      if (game.cells[cellIndex].toRemove) {
        console.log("first if", game.cells[cellIndex].playerId)
        // Set the player id to null
        game.cells[cellIndex].playerId = null
        console.log("first if", game.cells[cellIndex].playerId)
        // Reset all the remove flags
        // TODO: Make this to store recent removed cells and use that to access it here
        for (let i = 0; i < game.cells.length; i++) {
          game.cells[i].toRemove = false
          game.cells[i].disableClick = false
        }
        // Change the last move player id
        game.lastMovePlayerId = playerId
        return
      }

      // game.cells[cellIndex] = playerId
      console.log("allPlayerIds", allPlayerIds)

      // Check if the player has clicked on an empty cells
      if (
        game.cells[cellIndex].playerId === null &&
        game.cellPlacedCount <= 17
      ) {
        game.cells[cellIndex].playerId = playerId
        console.log("Set the cell with the player id", playerId)
        console.log("game.cells", JSON.stringify(game.cells))
        game.cellPlacedCount += 1
      }

      // Check if any mills has formed
      for (const mill of game.mills) {
        if (
          game.cells[mill[0]].playerId === playerId &&
          game.cells[mill[1]].playerId === playerId &&
          game.cells[mill[2]].playerId === playerId
        ) {
          game.cells[mill[0]].isPartOfMill = true
          game.cells[mill[1]].isPartOfMill = true
          game.cells[mill[2]].isPartOfMill = true
          console.log("Win combo", mill)
          // Make the opponent player's cells clickable and disable the click on all other cells
          for (const cell of game.cells) {
            if (
              cell.playerId !== playerId &&
              !cell.isPartOfMill &&
              cell.playerId
            ) {
              cell.toRemove = true
              cell.disableClick = false
            }
            if (cell.playerId === playerId) {
              cell.disableClick = true
            }
          }
          return
        }
      }

      game.lastMovePlayerId = playerId
    },
  },
})
