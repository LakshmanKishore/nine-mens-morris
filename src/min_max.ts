/**
 * TypeScript implementation of min-max algorithm with alpha-beta pruning for Nine Men's Morris
 * Based on the Python implementation in min_max_with_alpha_beta.py
 */

type NextAction =
  | "selectToPlace"
  | "selectToMove"
  | "selectDestination"
  | "selectToRemove"

/**
 * Board class representing the Nine Men's Morris game board
 */
export class Board {
  board: number[] = Array(24).fill(0)
  nextAction: NextAction = "selectToPlace"
  currentPlayer: number = 1
  totalCellsToPlace: number = 17
  cellPlacedCount: number = 0
  selectedIndexToMove: number = -1
  gameOver: boolean = false
  winner: number = -1
  removableOpponentCells: number[] = []
  removedMen: number[] = []
  currentMillIndexes: number[] = []
  possibleMovableDestinations: number[] = []
  possibleMovableMens: number[] = []
  movesPerformed: number[] = []

  // Mill patterns on the board
  mills: number[][] = [
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
  ]

  // Connected positions for each position on the board
  reachableCellIndexes: number[][] = [
    [1, 7],
    [0, 2, 9],
    [1, 3],
    [2, 4, 11],
    [3, 5],
    [4, 6, 13],
    [5, 7],
    [0, 6, 15],
    [9, 15],
    [1, 8, 10, 17],
    [9, 11],
    [3, 10, 12, 19],
    [11, 13],
    [5, 12, 14, 21],
    [13, 15],
    [7, 8, 14, 23],
    [17, 23],
    [9, 16, 18],
    [17, 19],
    [18, 11, 20],
    [19, 21],
    [13, 20, 22],
    [21, 23],
    [15, 16, 22],
  ]

  constructor() {
    // Initialize the board with empty cells (0)
  }

  /**
   * Get all empty locations on the board
   */
  getAllEmptyLocations(): number[] {
    const emptyList: number[] = []
    this.board.forEach((cell, index) => {
      if (cell === 0) {
        emptyList.push(index)
      }
    })
    return emptyList
  }

  /**
   * Get indices of cells occupied by a specific player
   */
  getPlayerIndexes(board: number[], player: number): number[] {
    return board
      .map((cell, index) => (cell === player ? index : -1))
      .filter((index) => index !== -1)
  }

  /**
   * Get indices of mills formed by a specific player
   */
  getPlayerMills(player: number): number[] {
    const playerMills: number[] = []

    for (const i of this.currentMillIndexes) {
      if (this.board[this.mills[i][0]] === player) {
        playerMills.push(...this.mills[i])
      }
    }

    return playerMills
  }

  /**
   * Declare a winner and end the game
   */
  declareWinner(player: number): void {
    console.log(`Player ${player} has won the game`)
    this.gameOver = true
    this.winner = player
  }

  /**
   * Get the neighbor of a position on the board
   */
  getNeighbor(index: number, level: number): number {
    return ((index + level) % 8) + Math.floor(index / 8) * 8
  }

  /**
   * Get all neighbors of a specific type for a position
   */
  getAllNeighborsWithType(index: number, type: number): number[] {
    const neighbors: number[] = []
    const leftNeighbor = this.getNeighbor(index, -1)
    const rightNeighbor = this.getNeighbor(index, 1)

    if (this.board[leftNeighbor] === type) {
      neighbors.push(leftNeighbor)
    }

    if (this.board[rightNeighbor] === type) {
      neighbors.push(rightNeighbor)
    }

    if (index % 2 === 1) {
      // middle
      for (let i = index - 2 * 8; i <= index + 2 * 8; i += 8) {
        if (
          i > 0 &&
          i < 24 &&
          i !== index &&
          (i - index === -8 || i - index === 8)
        ) {
          if (this.board[i] === type) {
            neighbors.push(i)
          }
        }
      }
    }

    return neighbors
  }

  /**
   * Get mill patterns that involve a specific position
   */
  getMillsForIndex(index: number): number[][] {
    if (index % 2 === 0) {
      // corners
      return [
        [index, this.getNeighbor(index, 1), this.getNeighbor(index, 2)].sort(
          (a, b) => a - b
        ),
        [index, this.getNeighbor(index, -1), this.getNeighbor(index, -2)].sort(
          (a, b) => a - b
        ),
      ]
    } else {
      // middle
      const verticalMill: number[] = []
      for (let i = index - 2 * 8; i <= index + 2 * 8; i += 8) {
        if (i >= 0 && i < 24) {
          verticalMill.push(i)
        }
      }

      return [
        [index, this.getNeighbor(index, 1), this.getNeighbor(index, -1)].sort(
          (a, b) => a - b
        ),
        verticalMill.sort((a, b) => a - b),
      ]
    }
  }

  /**
   * Perform the next move in the game
   */
  performNextMove(index: number): number[] {
    this.movesPerformed.push(index)

    if (this.nextAction === "selectToRemove") {
      if (
        this.board[index] === 0 ||
        this.board[index] === this.currentPlayer ||
        !this.removableOpponentCells.includes(index)
      ) {
        console.log("Invalid Selection")
        return this.board
      }

      this.removedMen.push(this.board[index])
      this.board[index] = 0
      this.removableOpponentCells = []
    } else if (
      this.nextAction === "selectToPlace" ||
      this.nextAction === "selectDestination"
    ) {
      if (this.nextAction === "selectToPlace") {
        if (this.board[index] !== 0) {
          console.log("Cell already occupied")
          return this.board
        }

        this.cellPlacedCount += 1
      }

      if (this.nextAction === "selectDestination") {
        if (
          !this.reachableCellIndexes[this.selectedIndexToMove].includes(index)
        ) {
          console.log("Invalid Destination")
          return this.board
        }

        if (this.board[index] !== 0) {
          console.log("Cell already occupied")
          return this.board
        }

        this.board[this.selectedIndexToMove] = 0
        this.selectedIndexToMove = 0
      }

      // Place the piece on the board
      this.board[index] = this.currentPlayer
      this.currentMillIndexes = []

      // Check for mill formations
      for (let i = 0; i < this.mills.length; i++) {
        const mill = this.mills[i]

        // Track all mills formed by both players
        if (
          this.board[mill[0]] === this.board[mill[1]] &&
          this.board[mill[1]] === this.board[mill[2]] &&
          this.board[mill[0]] !== 0
        ) {
          this.currentMillIndexes.push(i)
        }

        if (!mill.includes(index)) {
          continue
        }

        if (
          this.board[mill[0]] === this.currentPlayer &&
          this.board[mill[1]] === this.currentPlayer &&
          this.board[mill[2]] === this.currentPlayer
        ) {
          // Mill has formed, change action to remove opponent's piece
          this.nextAction = "selectToRemove"
          this.removableOpponentCells = []

          // Get opponent player
          const opponentPlayer = this.currentPlayer === 1 ? 2 : 1

          // Get opponent's mills
          const opponentPlayerMills = this.getPlayerMills(opponentPlayer)

          // Find removable opponent pieces (not in a mill)
          for (const i of this.getPlayerIndexes(this.board, opponentPlayer)) {
            if (!opponentPlayerMills.includes(i)) {
              this.removableOpponentCells.push(i)
            }
          }

          if (this.removableOpponentCells.length !== 0) {
            return this.board
          }
        }
      }
    } else if (this.nextAction === "selectToMove") {
      // Check if selected piece belongs to current player
      if (this.board[index] !== this.currentPlayer) {
        console.log("Select different men to move")
        return this.board
      }

      // Find possible destinations
      this.possibleMovableDestinations = []

      for (const i of this.reachableCellIndexes[index]) {
        if (this.board[i] === 0) {
          this.possibleMovableDestinations.push(i)
        }
      }

      if (this.possibleMovableDestinations.length === 0) {
        console.log("Select different men to move")
        return this.board
      }

      this.selectedIndexToMove = index
      this.nextAction = "selectDestination"
      return this.board
    } else {
      console.log("Invalid Action!")
      return this.board
    }

    // Determine next action based on game state
    if (this.cellPlacedCount > this.totalCellsToPlace) {
      this.nextAction = "selectToMove"
    } else {
      this.nextAction = "selectToPlace"
    }

    const previousPlayer = this.currentPlayer

    // Switch player
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1

    if (this.nextAction === "selectToMove") {
      // Find possible movable pieces for the current player
      const possibleMovableMens = this.getPlayerIndexes(
        this.board,
        this.currentPlayer
      )
      this.possibleMovableMens = []

      for (const men of possibleMovableMens) {
        for (const i of this.reachableCellIndexes[men]) {
          if (this.board[i] === 0) {
            this.possibleMovableMens.push(men)
            break
          }
        }
      }

      if (this.possibleMovableMens.length === 0) {
        // No moves possible, declare winner
        this.declareWinner(previousPlayer)
      }
    }

    // Check if either player has fewer than 3 pieces (after placement phase)
    const currentPlayerCount = this.getPlayerIndexes(
      this.board,
      this.currentPlayer
    ).length
    const previousPlayerCount = this.getPlayerIndexes(
      this.board,
      previousPlayer
    ).length

    if (this.cellPlacedCount >= this.totalCellsToPlace) {
      if (currentPlayerCount <= 2) {
        this.declareWinner(previousPlayer)
      }

      if (previousPlayerCount <= 2) {
        this.declareWinner(this.currentPlayer)
      }
    }

    return this.board
  }

  /**
   * Calculate the heuristic value of the current board state
   */
  getValue(player: number, printHeuristics: boolean = false): number {
    const opponentPlayer = player === 1 ? 2 : 1

    // Check for potential mills
    let possibleMillsForPlayer = 0
    let possibleMillsForOpponentPlayer = 0

    if (this.cellPlacedCount <= this.totalCellsToPlace) {
      for (const mill of this.mills) {
        // Check for player's potential mills (2 pieces and an empty space)
        if (
          (this.board[mill[0]] === 0 &&
            this.board[mill[1]] === player &&
            this.board[mill[2]] === player) ||
          (this.board[mill[0]] === player &&
            this.board[mill[1]] === 0 &&
            this.board[mill[2]] === player) ||
          (this.board[mill[0]] === player &&
            this.board[mill[1]] === player &&
            this.board[mill[2]] === 0)
        ) {
          possibleMillsForPlayer++
        }

        // Check for opponent's potential mills
        if (
          (this.board[mill[0]] === 0 &&
            this.board[mill[1]] === opponentPlayer &&
            this.board[mill[2]] === opponentPlayer) ||
          (this.board[mill[0]] === opponentPlayer &&
            this.board[mill[1]] === 0 &&
            this.board[mill[2]] === opponentPlayer) ||
          (this.board[mill[0]] === opponentPlayer &&
            this.board[mill[1]] === opponentPlayer &&
            this.board[mill[2]] === 0)
        ) {
          possibleMillsForOpponentPlayer++
        }
      }
    }

    // Check for definite mills in the next move
    let definiteMillsForPlayerInNextMove = 0
    let definiteMillsForOpponentPlayerInNextMove = 0

    if (this.cellPlacedCount <= this.totalCellsToPlace) {
      for (let index = 0; index < this.board.length; index++) {
        const men = this.board[index]
        if (men !== 0) {
          // Get possible mills for this position
          const possibleMillsForIndex = this.getMillsForIndex(index)

          // Create combinations from possible mills
          const firstMill = [...possibleMillsForIndex[0]]
          const secondMill = [...possibleMillsForIndex[1]]

          // Remove the current position
          firstMill.splice(firstMill.indexOf(index), 1)
          secondMill.splice(secondMill.indexOf(index), 1)

          // Check combinations for potential mills
          const checkCombinations = [
            [0, 0, 1, 1],
            [0, 1, 1, 0],
            [1, 0, 0, 1],
            [1, 1, 0, 0],
          ]

          for (const combination of checkCombinations) {
            if (
              this.board[firstMill[combination[0]]] ===
                this.board[secondMill[combination[1]]] &&
              this.board[firstMill[combination[0]]] === men &&
              this.board[firstMill[combination[2]]] === 0 &&
              this.board[secondMill[combination[3]]] === 0
            ) {
              if (men === player) {
                definiteMillsForPlayerInNextMove++
              } else {
                definiteMillsForOpponentPlayerInNextMove++
              }
            }
          }
        }
      }
    }

    // Count removed pieces
    const removedPlayerCount = this.removedMen.filter(
      (p) => p === player
    ).length
    const removedOpponentPlayerCount = this.removedMen.filter(
      (p) => p === opponentPlayer
    ).length

    // Check for potential mills during movement phase
    let millEveryMoveForPlayer = 0
    let millEveryMoveForOpponentPlayer = 0
    let possibleMillDuringMoveForPlayer = 0
    let possibleMillDuringMoveForOpponentPlayer = 0
    let nonMovableMensCurrentPlayerCount = 0
    let nonMovableMensOpponentPlayerCount = 0

    if (this.cellPlacedCount >= this.totalCellsToPlace) {
      // Get all movable pieces
      const allMovableMen: number[] = [
        ...this.getPlayerIndexes(this.board, player),
        ...this.getPlayerIndexes(this.board, opponentPlayer),
      ]

      for (const men of allMovableMen) {
        const destinations = this.getAllNeighborsWithType(men, 0)

        if (destinations.length === 0) {
          if (this.board[men] === this.currentPlayer) {
            nonMovableMensCurrentPlayerCount++
          } else {
            nonMovableMensOpponentPlayerCount++
          }
        }

        const movableMenMills = this.getMillsForIndex(men)

        for (const destination of destinations) {
          const destinationMills = this.getMillsForIndex(destination)

          // Check for potential "mill every move" scenarios
          const everyMoveMillPair: number[][] = []

          if (
            JSON.stringify(destinationMills[0]) ===
            JSON.stringify(movableMenMills[0])
          ) {
            everyMoveMillPair.push(destinationMills[1])
            everyMoveMillPair.push(movableMenMills[1])
          } else if (
            JSON.stringify(destinationMills[0]) ===
            JSON.stringify(movableMenMills[1])
          ) {
            everyMoveMillPair.push(destinationMills[1])
            everyMoveMillPair.push(movableMenMills[0])
          } else if (
            JSON.stringify(destinationMills[1]) ===
            JSON.stringify(movableMenMills[0])
          ) {
            everyMoveMillPair.push(destinationMills[0])
            everyMoveMillPair.push(movableMenMills[1])
          } else {
            everyMoveMillPair.push(destinationMills[0])
            everyMoveMillPair.push(movableMenMills[0])
          }

          // Get unique piece types in the mill pair (excluding the destination)
          const mensOfEveryMoveMillPair = new Set<number>()
          everyMoveMillPair.forEach((mill) => {
            mill.forEach((pos) => {
              if (pos !== destination) {
                mensOfEveryMoveMillPair.add(this.board[pos])
              }
            })
          })

          if (mensOfEveryMoveMillPair.size === 1) {
            if (this.board[men] === player) {
              millEveryMoveForPlayer++
            } else {
              millEveryMoveForOpponentPlayer++
            }
          }

          // Check for potential mills in the next move
          const focusMill = movableMenMills[0].includes(men)
            ? destinationMills[1]
            : destinationMills[0]

          const focusMillCopy = [...focusMill]
          focusMillCopy.splice(focusMillCopy.indexOf(destination), 1)

          if (
            this.board[focusMillCopy[0]] === this.board[focusMillCopy[1]] &&
            this.board[focusMillCopy[0]] === this.board[men] &&
            this.board[focusMillCopy[0]] !== 0
          ) {
            if (this.board[men] === player) {
              possibleMillDuringMoveForPlayer++
            } else {
              possibleMillDuringMoveForOpponentPlayer++
            }
          }
        }
      }
    }

    if (printHeuristics) {
      console.log(`
      definite_mills_for_player_in_next_move: ${definiteMillsForPlayerInNextMove}
      possible_mills_for_player: ${possibleMillsForPlayer}
      possible_mill_during_move_for_player: ${possibleMillDuringMoveForPlayer}
      removed_opponent_player_count: ${removedOpponentPlayerCount}
      non_movable_mens_opponent_player_count: ${nonMovableMensOpponentPlayerCount}
      mill_every_move_player: ${millEveryMoveForPlayer}

      definite_mills_for_opponent_player_in_next_move: ${definiteMillsForOpponentPlayerInNextMove}
      possible_mills_for_opponent_player: ${possibleMillsForOpponentPlayer}
      possible_mill_during_move_for_opponent_player: ${possibleMillDuringMoveForOpponentPlayer}
      removed_player_count: ${removedPlayerCount}
      non_movable_mens_current_player_count: ${nonMovableMensCurrentPlayerCount}
      mill_every_move_opponent_player: ${millEveryMoveForOpponentPlayer}
      `)
    }

    let millEveryMovePlayerWeight = 6

    // Increase weight during movement phase
    if (this.cellPlacedCount >= this.totalCellsToPlace) {
      millEveryMovePlayerWeight = 20
    }

    // Calculate final score using weighted heuristics
    const score =
      13 * removedOpponentPlayerCount +
      millEveryMovePlayerWeight * millEveryMoveForPlayer +
      4 * definiteMillsForPlayerInNextMove +
      3 * possibleMillsForPlayer +
      3 * possibleMillDuringMoveForPlayer +
      2 * nonMovableMensOpponentPlayerCount -
      10 * removedPlayerCount -
      (millEveryMovePlayerWeight - 1) * millEveryMoveForOpponentPlayer -
      3 * definiteMillsForOpponentPlayerInNextMove -
      2 * possibleMillsForOpponentPlayer -
      2 * possibleMillDuringMoveForOpponentPlayer -
      1 * nonMovableMensCurrentPlayerCount

    return score
  }

  /**
   * Display the board (for debugging)
   */
  display(): void {
    const format = `
0_00           0_01           0_02
     0_08      0_09      0_10
          0_16 0_17 0_18
0_07 0_15 0_23      0_19 0_11 0_03
          0_22 0_21 0_20
     0_14      0_13      0_12
0_06           0_05           0_04
    `

    let displayFormat = format
    for (let i = 0; i < 24; i++) {
      const pattern = `0_${i.toString().padStart(2, "0")}`
      displayFormat = displayFormat.replace(
        pattern,
        `${this.board[i]}_${i.toString().padStart(2, "0")}`
      )
    }

    console.log(displayFormat)
  }
}

// Track explored states to avoid recomputation
const exploredStates: { [key: string]: number } = {}

/**
 * Get the best move for the AI player
 */
export function getNextBestMove(gameBoard: Board): [number, number, number[]] {
  let depth = 3

  // Determine possible moves based on current game state
  let nextActionPossiblePositions: number[] = []

  if (gameBoard.nextAction === "selectToMove") {
    nextActionPossiblePositions = gameBoard.possibleMovableMens
  } else if (gameBoard.nextAction === "selectDestination") {
    nextActionPossiblePositions = gameBoard.possibleMovableDestinations
  } else if (gameBoard.nextAction === "selectToRemove") {
    nextActionPossiblePositions = gameBoard.removableOpponentCells
  } else {
    nextActionPossiblePositions = gameBoard.getAllEmptyLocations()
  }

  // Increase search depth for movement phase
  if (gameBoard.cellPlacedCount >= gameBoard.totalCellsToPlace) {
    depth = 6
  }

  // Store min-max values for each possible move
  const minMaxValues: [number, number, number[]][] = []

  const startTime = performance.now()

  // Evaluate each possible move
  for (const nextAction of nextActionPossiblePositions) {
    const gameBoardCopy = cloneBoard(gameBoard)
    const result = minMaxWithAlphaBetaPruning(
      gameBoardCopy,
      depth,
      nextAction,
      false,
      -Infinity,
      Infinity,
      true
    )
    minMaxValues.push(result)
  }

  const endTime = performance.now()
  console.log(`Time taken: ${(endTime - startTime) / 1000}s`)
  console.log("Min Max Values: ", minMaxValues)

  // Find the best move (highest score)
  const bestMove = minMaxValues.reduce((best, current) =>
    current[0] > best[0] ? current : best
  )

  console.log("Best Move: ", bestMove)

  return bestMove
}

/**
 * Min-Max algorithm with alpha-beta pruning
 */
export function minMaxWithAlphaBetaPruning(
  gameBoard: Board,
  depth: number,
  initialAction: number,
  maximizingPlayer: boolean,
  alpha: number,
  beta: number,
  applyInitialAction: boolean
): [number, number, number[]] {
  if (depth === 0) {
    // Return heuristic value at leaf node
    const value = gameBoard.getValue(2)
    return [value, initialAction, gameBoard.movesPerformed]
  }

  // Apply initial action if this is the first move
  if (applyInitialAction) {
    gameBoard.performNextMove(initialAction)
  }

  // Check if we've already evaluated this board state
  const boardString = gameBoard.board.join("")
  if (exploredStates[boardString] !== undefined) {
    return [
      exploredStates[boardString],
      initialAction,
      gameBoard.movesPerformed,
    ]
  }

  // Determine possible next moves
  let nextActionPossiblePositions: number[] = []

  if (gameBoard.nextAction === "selectToMove") {
    nextActionPossiblePositions = gameBoard.possibleMovableMens
  } else if (gameBoard.nextAction === "selectDestination") {
    nextActionPossiblePositions = gameBoard.possibleMovableDestinations
  } else if (gameBoard.nextAction === "selectToRemove") {
    nextActionPossiblePositions = gameBoard.removableOpponentCells
  } else {
    nextActionPossiblePositions = gameBoard.getAllEmptyLocations()
  }

  if (maximizingPlayer) {
    let value = -Infinity
    let resultMoves: number[] = []

    for (const nextActionPosition of nextActionPossiblePositions) {
      const gameBoardCopy = cloneBoard(gameBoard)
      gameBoardCopy.performNextMove(nextActionPosition)

      const gameBoardString = gameBoardCopy.board.join("")

      if (exploredStates[gameBoardString] !== undefined) {
        const newValue = exploredStates[gameBoardString]
        if (newValue > value) {
          value = newValue
        }
        continue
      }

      // Determine if next layer should maximize or minimize
      const nextMaximizingPlayer = gameBoardCopy.currentPlayer !== 1

      const [minMaxValue, initAction, movesPerformed] =
        minMaxWithAlphaBetaPruning(
          gameBoardCopy,
          depth - 1,
          initialAction,
          nextMaximizingPlayer,
          alpha,
          beta,
          false
        )

      if (minMaxValue > value) {
        value = minMaxValue
        resultMoves = movesPerformed
      }

      alpha = Math.max(alpha, value)
      if (beta <= alpha) {
        break // Beta cutoff
      }
    }

    // Store result for this board state
    exploredStates[boardString] = value
    return [value, initialAction, resultMoves]
  } else {
    // Minimizing player
    let value = Infinity
    let resultMoves: number[] = []

    for (const nextActionPosition of nextActionPossiblePositions) {
      const gameBoardCopy = cloneBoard(gameBoard)
      gameBoardCopy.performNextMove(nextActionPosition)

      const gameBoardString = gameBoardCopy.board.join("")

      if (exploredStates[gameBoardString] !== undefined) {
        const newValue = exploredStates[gameBoardString]
        if (newValue < value) {
          value = newValue
        }
        continue
      }

      // Determine if next layer should maximize or minimize
      const nextMaximizingPlayer = gameBoardCopy.currentPlayer === 2

      const [minMaxValue, initAction, movesPerformed] =
        minMaxWithAlphaBetaPruning(
          gameBoardCopy,
          depth - 1,
          initialAction,
          nextMaximizingPlayer,
          alpha,
          beta,
          false
        )

      if (minMaxValue < value) {
        value = minMaxValue
        resultMoves = movesPerformed
      }

      beta = Math.min(beta, value)
      if (beta <= alpha) {
        break // Alpha cutoff
      }
    }

    // Store result for this board state
    exploredStates[boardString] = value
    return [value, initialAction, resultMoves]
  }
}

/**
 * Create a deep copy of a Board object
 */
function cloneBoard(board: Board): Board {
  const newBoard = new Board()

  // Copy primitive properties
  newBoard.board = [...board.board]
  newBoard.nextAction = board.nextAction
  newBoard.currentPlayer = board.currentPlayer
  newBoard.totalCellsToPlace = board.totalCellsToPlace
  newBoard.cellPlacedCount = board.cellPlacedCount
  newBoard.selectedIndexToMove = board.selectedIndexToMove
  newBoard.gameOver = board.gameOver
  newBoard.winner = board.winner

  // Copy arrays
  newBoard.removableOpponentCells = [...board.removableOpponentCells]
  newBoard.removedMen = [...board.removedMen]
  newBoard.currentMillIndexes = [...board.currentMillIndexes]
  newBoard.possibleMovableDestinations = [...board.possibleMovableDestinations]
  newBoard.possibleMovableMens = [...board.possibleMovableMens]
  newBoard.movesPerformed = [...board.movesPerformed]

  return newBoard
}
