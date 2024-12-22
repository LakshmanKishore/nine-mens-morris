import type { PlayerId, RuneClient } from "rune-sdk"

// export type Cells = PlayerId[]
export type Cells = {
  x: number
  y: number
  playerId: PlayerId | null
  reachableCellIndexes: number[]
}

export interface GameState {
  cells: Cells[]
  winCombo: number[] | null
  lastMovePlayerId: PlayerId | null
  playerIds: PlayerId[]
  freeCells?: boolean
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
      { x: 0, y: 0, playerId: null, reachableCellIndexes: [1, 7] },
      { x: 300, y: 0, playerId: null, reachableCellIndexes: [0, 2, 9] },
      { x: 600, y: 0, playerId: null, reachableCellIndexes: [1, 3] },
      { x: 600, y: 300, playerId: null, reachableCellIndexes: [2, 4, 11] },
      { x: 600, y: 600, playerId: null, reachableCellIndexes: [3, 5] },
      { x: 300, y: 600, playerId: null, reachableCellIndexes: [4, 6, 13] },
      { x: 0, y: 600, playerId: null, reachableCellIndexes: [5, 7] },
      { x: 0, y: 300, playerId: null, reachableCellIndexes: [0, 6, 15] },
      { x: 100, y: 100, playerId: null, reachableCellIndexes: [9, 15] },
      { x: 300, y: 100, playerId: null, reachableCellIndexes: [1, 8, 10, 17] },
      { x: 500, y: 100, playerId: null, reachableCellIndexes: [9, 11] },
      { x: 500, y: 300, playerId: null, reachableCellIndexes: [3, 10, 12, 19] },
      { x: 500, y: 500, playerId: null, reachableCellIndexes: [11, 13] },
      { x: 300, y: 500, playerId: null, reachableCellIndexes: [5, 12, 14, 21] },
      { x: 100, y: 500, playerId: null, reachableCellIndexes: [13, 15] },
      { x: 100, y: 300, playerId: null, reachableCellIndexes: [7, 8, 14, 23] },
      { x: 200, y: 200, playerId: null, reachableCellIndexes: [17, 23] },
      { x: 300, y: 200, playerId: null, reachableCellIndexes: [9, 16, 18] },
      { x: 400, y: 200, playerId: null, reachableCellIndexes: [17, 19] },
      { x: 400, y: 300, playerId: null, reachableCellIndexes: [18, 11, 20] },
      { x: 400, y: 400, playerId: null, reachableCellIndexes: [19, 21] },
      { x: 300, y: 400, playerId: null, reachableCellIndexes: [13, 20, 22] },
      { x: 200, y: 400, playerId: null, reachableCellIndexes: [21, 23] },
      { x: 200, y: 300, playerId: null, reachableCellIndexes: [15, 16, 22] },
    ],
    winCombo: null,
    lastMovePlayerId: allPlayerIds[1],
    playerIds: allPlayerIds,
  }),
  actions: {
    handleClick: (cellIndex, { game, playerId, allPlayerIds }) => {
      // if (
      //   game.cells[cellIndex].playerId !== null ||
      //   playerId === game.lastMovePlayerId
      // ) {
      //   throw Rune.invalidAction()
      // }

      // game.cells[cellIndex] = playerId
      game.lastMovePlayerId = playerId
      console.log("allPlayerIds", allPlayerIds)
      // game.winCombo = findWinningCombo(game.cells)

      // Check if the player has clicked on an empty cells
      if (game.cells[cellIndex].playerId === null) {
        game.cells[cellIndex].playerId = playerId
      }
    },
  },
})
