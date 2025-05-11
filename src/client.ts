import "./styles.css"

import { Player, PlayerId } from "rune-sdk"
import { Board, getNextBestMove } from "./min_max.ts"
import { Cells, GameState } from "./logic.ts"

// Import sound assets
import selectSoundSrc from "./assets/select.wav"
// We'll need to add these sound files to your assets folder
import placeSoundSrc from "./assets/place.wav"
import millSoundSrc from "./assets/mill.wav"
import removeSoundSrc from "./assets/remove.wav"

// Import the robot image for proper bundling
import robotImageSrc from "./assets/robot.png"

// Sound Manager for game sound effects
class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement } = {}
  private enabled: boolean = true

  constructor() {
    // Initialize sounds
    this.sounds = {
      select: new Audio(selectSoundSrc),
      place: new Audio(placeSoundSrc),
      mill: new Audio(millSoundSrc),
      remove: new Audio(removeSoundSrc),
    }

    // Preload sounds
    Object.values(this.sounds).forEach((sound) => {
      sound.load()
    })
  }

  play(soundName: "select" | "place" | "mill" | "remove"): void {
    if (!this.enabled) return

    const sound = this.sounds[soundName]
    if (sound) {
      // Reset the sound to the beginning if it's already playing
      sound.currentTime = 0
      sound.play().catch((err) => console.warn("Audio play failed:", err))
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  isEnabled(): boolean {
    return this.enabled
  }
}

// Create a global sound manager instance
const soundManager = new SoundManager()

// Import functions for bot logic
function convertGameStateToBoard(game: GameState): Board {
  const board = new Board()

  // Copy the board state
  for (let i = 0; i < game.cells.length; i++) {
    const cell = game.cells[i]
    if (cell.playerId === null) {
      board.board[i] = 0
    } else if (cell.playerId === "bot") {
      board.board[i] = 2 // Bot is player 2 in the min-max algorithm
    } else {
      board.board[i] = 1 // Human is player 1 in the min-max algorithm
    }
  }

  // Set game state properties
  board.cellPlacedCount = game.cellPlacedCount
  board.totalCellsToPlace = game.totalCellsToPlace

  // Map the next action
  board.nextAction = game.nextAction

  // Set the current player (bot is always player 2)
  board.currentPlayer = 2

  // Pass any removable cells
  if (game.removableCells.length > 0) {
    board.removableOpponentCells = game.removableCells
  }

  // If we're selecting a destination, set the index to move
  if (game.nextAction === "selectDestination") {
    board.selectedIndexToMove = game.selectedCellIndex
    board.possibleMovableDestinations = game.neighborHighlightCells
  }

  // If we're selecting to move, set the possible movable men
  if (game.nextAction === "selectToMove") {
    board.possibleMovableMens = game.clickableCells
  }

  return board
}

const board = document.getElementById("board")!
const playersSection = document.getElementById("players-section")!
const gameBoardSVG = document.getElementById("game-board-svg")!
const modal = document.getElementById("myModal")!
// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0]!
const questionMarkBtn = document.getElementById("question-mark")!
const modalQuestionMark = document.getElementById("modal-question-mark")!
const modalSettings = document.getElementById("modal-settings")!

// const selectSound = new Audio(selectSoundAudio)

let cellImages: SVGImageElement[], playerContainers: HTMLLIElement[]
// Add a timer variable to handle bot's moves
let botMoveTimer: number | null = null

// Add bot timing check to always check if it's time for a bot move
let lastGameTimeCheck = 0
let pendingBotMove: number | null = null
let lastGameState: GameState | null = null

const LINES_COORDINATES = [
  { x1: 0, y1: 300, x2: 200, y2: 300 },
  { x1: 300, y1: 0, x2: 300, y2: 200 },
  { x1: 600, y1: 300, x2: 400, y2: 300 },
  { x1: 300, y1: 400, x2: 300, y2: 600 },
]

const RECT_COORDINATES = [
  { x: 200, y: 200, width: 200, height: 200 },
  { x: 100, y: 100, width: 400, height: 400 },
  { x: 0, y: 0, width: 600, height: 600 },
]

const ELLIPSE_STROKE_WIDTH = (10).toString()
const LINE_STROKE_WIDTH = (7).toString()
const CELL_SIZE = (+ELLIPSE_STROKE_WIDTH * 4).toString()
const STROKE_COLOR = "#e6e6e6"

function getShowPlayerHTML(
  player: Player,
  index: number,
  showYou: boolean,
  remainingMens: number
) {
  const li = document.createElement("li")
  li.setAttribute("player", index.toString())

  let html = `
  <div class="players-info">
    <div class="player-info">
      <img src="${player.avatarUrl}" />
      <span>${player.displayName} ${showYou ? "<br>(You)" : ""}
      </span>
    </div>
    <div class="remaining-mills">`

  // Create 3 rows with 3 images each
  for (let remaining = 0; remaining < 9; remaining++) {
    if (remaining % 3 === 0) {
      html += `<div class="row">`
    }
    if (remaining < remainingMens) {
      html += `<img src="${player.avatarUrl}" />`
    }
    if (remaining % 3 === 2) {
      html += `</div>`
    }
  }

  html += `
    </div>
  </div>`

  li.innerHTML = html

  return li
}

function initUI(
  cells: Cells[],
  playerIds: PlayerId[],
  yourPlayerId: PlayerId | undefined
) {
  // Create lines at the linesCoordinates
  for (let i = 0; i < LINES_COORDINATES.length; i++) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
    line.setAttribute("x1", LINES_COORDINATES[i].x1.toString())
    line.setAttribute("y1", LINES_COORDINATES[i].y1.toString())
    line.setAttribute("x2", LINES_COORDINATES[i].x2.toString())
    line.setAttribute("y2", LINES_COORDINATES[i].y2.toString())
    line.setAttribute(
      "style",
      `stroke: #e6e6e6; stroke-width: ${LINE_STROKE_WIDTH};`
    )
    gameBoardSVG.appendChild(line)
  }

  // Create rects at the rectCoordinates
  for (let i = 0; i < RECT_COORDINATES.length; i++) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    rect.setAttribute("x", RECT_COORDINATES[i].x.toString())
    rect.setAttribute("y", RECT_COORDINATES[i].y.toString())
    rect.setAttribute("width", RECT_COORDINATES[i].width.toString())
    rect.setAttribute("height", RECT_COORDINATES[i].height.toString())
    rect.setAttribute(
      "style",
      `stroke: ${STROKE_COLOR}; fill: rgba(0, 0, 0, 0); stroke-width: ${LINE_STROKE_WIDTH};`
    )
    gameBoardSVG.appendChild(rect)
  }

  cellImages = cells.map((_, index) => {
    const ellipse = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "ellipse"
    )
    ellipse.setAttribute("cx", cells[index].x.toString())
    ellipse.setAttribute("cy", cells[index].y.toString())
    ellipse.setAttribute("rx", ELLIPSE_STROKE_WIDTH)
    ellipse.setAttribute("ry", ELLIPSE_STROKE_WIDTH)
    ellipse.setAttribute(
      "style",
      `stroke: ${STROKE_COLOR}; stroke-width: ${+ELLIPSE_STROKE_WIDTH / 2};`
    )

    // Create a svg image element which will then be used to set the image of avatar
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    )

    image.setAttribute("x", (cells[index].x - +CELL_SIZE).toString())
    image.setAttribute("y", (cells[index].y - +CELL_SIZE).toString())
    image.setAttribute("width", (+CELL_SIZE * 2).toString())
    image.setAttribute("height", (+CELL_SIZE * 2).toString())
    // New player joined when first player playing with the bot should not have event listener
    // So add actions only for the player that are in player list
    if (yourPlayerId && playerIds.includes(yourPlayerId)) {
      image.addEventListener("click", () => {
        const fromBot = image.getAttribute("from-bot")
        Rune.actions.handleClick({
          cellIndex: index,
          fromBot:
            fromBot === null ? false : fromBot === "false" ? false : true,
        })
      })
    }

    gameBoardSVG.appendChild(ellipse)
    gameBoardSVG.appendChild(image)
    return image
  })

  // When the user clicks on <span> (x), close the modal
  span.addEventListener("click", () => {
    modal.style.display = "none"
  })

  // When the user clicks anywhere outside of the modal, close it
  window.addEventListener("click", (event) => {
    if (event.target == modal) {
      modal.style.display = "none"
    }
  })

  // Setup question mark button to show instructions
  questionMarkBtn.addEventListener("click", () => {
    modal.style.display = "block"
    modalSettings.style.display = "none"
    modalQuestionMark.style.display = "block"
  })

  playerContainers = playerIds.map((playerId, index) => {
    let li: HTMLLIElement

    if (playerId === "bot") {
      const player: Player = {
        displayName: "Bot",
        avatarUrl: robotImageSrc,
        playerId: "bot",
      }
      li = getShowPlayerHTML(player, index, false, 9)
    } else {
      const player = Rune.getPlayerInfo(playerId)
      li = getShowPlayerHTML(player, index, player.playerId === yourPlayerId, 9)
    }

    playersSection.appendChild(li)

    return li
  })
}

Rune.initClient({
  onChange: ({ game, yourPlayerId }) => {
    const { cells, playerIds, lastMovePlayerId } = game
    const currentTime = Date.now()

    if (!cellImages) initUI(cells, playerIds, yourPlayerId)

    if (lastMovePlayerId) board.classList.remove("initial")

    // Play sounds based on game state changes
    // Only play sounds when there's an actual state change (not during initial render)
    if (lastGameState) {
      const prevAction = lastGameState.nextAction
      const prevSelectedIndex = lastGameState.selectedCellIndex

      // Mill formed - when next action changes to selectToRemove
      if (
        game.nextAction === "selectToRemove" &&
        prevAction !== "selectToRemove"
      ) {
        soundManager.play("mill")
      }
      // Piece removed - when previousAction was selectToRemove but now it's not
      else if (
        lastGameState.removableCells.length > 0 &&
        game.removableCells.length === 0
      ) {
        soundManager.play("remove")
      }
      // Piece placed - when cell count increases and not during movement phase
      else if (lastGameState.cellPlacedCount < game.cellPlacedCount) {
        soundManager.play("place")
      }
      // Piece selected for movement - when selectedCellIndex changes from -1 to a value
      else if (prevSelectedIndex === -1 && game.selectedCellIndex !== -1) {
        soundManager.play("select")
      }
      // Piece moved - when action is selectToDestination and a cell is moved
      else if (
        prevAction === "selectDestination" &&
        game.nextAction !== "selectDestination"
      ) {
        // Only play place sound if we aren't forming a mill (which would play mill sound)
        if (game.nextAction !== "selectToRemove") {
          soundManager.play("place")
        }
      }
    }

    // Store the current game state for next comparison
    lastGameState = JSON.parse(JSON.stringify(game))

    // Check if it's time for a scheduled bot move
    if (
      game.playingWithBot &&
      game.botTurn &&
      game.botTurnAt > 0 &&
      currentTime >= lastGameTimeCheck + 200
    ) {
      lastGameTimeCheck = currentTime
      console.log("Checking scheduled bot move time:", {
        botTurnAt: game.botTurnAt,
        gameTime: Rune.gameTime(),
      })

      if (Rune.gameTime() >= game.botTurnAt) {
        console.log("It's time for the bot to move based on scheduled time")
        // Clear any existing bot move timer
        if (botMoveTimer) {
          clearTimeout(botMoveTimer)
          botMoveTimer = null
        }

        // Make the bot move immediately
        makeBotMove(game)
        return
      }
    }

    // Get all the player ids information
    const playersInfo = playerIds.reduce(
      (acc, playerId) => {
        if (playerId === "bot") return acc
        const info: Player = Rune.getPlayerInfo(playerId)
        acc[playerId] = info
        return acc
      },
      {} as { [playerId: string]: Player }
    )

    const botPlayerInfo: Player = {
      displayName: "Bot",
      avatarUrl: robotImageSrc,
      playerId: "bot",
    }

    playersInfo["bot"] = botPlayerInfo

    // While updating the cell elements, update the player-infos li elements.
    // clear the playerSection
    playersSection.innerHTML = ""

    playerContainers = playerIds.map((playerId, index) => {
      // Calculate the playerId's count
      let playerIdsCount: number = 0
      // Based on the cell placed count and the last move player id decide the remaining count.
      if (game.lastMovePlayerId === playerId && game.cellPlacedCount == 0) {
        playerIdsCount = 10 - game.cellPlacedCount / 2
      } else if (game.lastMovePlayerId === playerId) {
        playerIdsCount = 9 - game.cellPlacedCount / 2
      } else {
        playerIdsCount = 9 - game.cellPlacedCount / 2
      }
      const li: HTMLLIElement = getShowPlayerHTML(
        playersInfo[playerId],
        index,
        playerId === yourPlayerId,
        playerIdsCount
      )
      playersSection.appendChild(li)
      return li
    })

    cellImages.forEach((cellImage, index) => {
      const cellValue: PlayerId | null = cells[index].playerId

      cellImage.setAttribute(
        "player",
        (cellValue !== null ? playerIds.indexOf(cellValue) : -1).toString()
      )

      // If cell has a player id then have to show player id's avatar
      if (cellValue) {
        cellImage.setAttribute("href", playersInfo[cellValue].avatarUrl)
      } else {
        cellImage.setAttribute("href", "")
      }

      // Disable all the other cells other than the clickable cells
      if (game.clickableCells.includes(index)) {
        cellImage.setAttribute("clickable", "1")
      } else {
        cellImage.setAttribute("clickable", "0")
      }

      // If the cell needs to be removed, then set and attribute to remove the cell
      if (game.removableCells.includes(index)) {
        cellImage.setAttribute("remove", "1")
      } else {
        cellImage.setAttribute("remove", "0")
      }

      // If the cell is part of the mill then it should be highlighted
      if (game.highlightedCellsPartOfMill.includes(index)) {
        cellImage.setAttribute("is-part-of-mill", "true")
      } else {
        cellImage.removeAttribute("is-part-of-mill")
      }

      if (game.selectedCellIndex == index) {
        cellImage.setAttribute("selected", "true")
      } else {
        cellImage.removeAttribute("selected")
      }

      if (game.neighborHighlightCells.includes(index)) {
        const playerId = game.cells[game.selectedCellIndex].playerId
        cellImage.setAttribute("neighbor-highlight", "true")
        if (playerId) {
          cellImage.setAttribute("href", playersInfo[playerId].avatarUrl)
        }
      } else {
        cellImage.removeAttribute("neighbor-highlight")
        if (!game.cells[index].playerId) {
          cellImage.removeAttribute("href")
        }
      }
    })

    playerContainers.forEach((container, i) => {
      container.setAttribute(
        "your-turn",
        String(playerIds[i] !== lastMovePlayerId)
      )
    })

    gameBoardSVG.setAttribute(
      "your-turn",
      String(yourPlayerId !== lastMovePlayerId)
    )

    // Handle bot's moves on the client side
    if (
      game.playingWithBot &&
      game.lastMovePlayerId !== "bot" &&
      game.botTurn
    ) {
      if (
        game.nextAction === "selectToRemove" &&
        game.removableCells.length === 0
      ) {
        console.log("Bot won't move - no removable cells")
        console.log("Game state: ", {
          playingWithBot: game.playingWithBot,
          lastMovePlayerId: game.lastMovePlayerId,
          botTurn: game.botTurn,
          nextAction: game.nextAction,
          removableCells: game.removableCells.length,
        })
      } else {
        console.log("Bot should move - Game state:", {
          playingWithBot: game.playingWithBot,
          lastMovePlayerId: game.lastMovePlayerId,
          botTurn: game.botTurn,
          nextAction: game.nextAction,
          removableCells: game.removableCells.length,
        })

        // Clear any existing bot move timer
        if (botMoveTimer) {
          clearTimeout(botMoveTimer)
          botMoveTimer = null
        }

        // Add a slight delay to make the bot's move feel more natural
        botMoveTimer = window.setTimeout(() => {
          makeBotMove(game)
        }, 1000)
      }
    } else {
      console.log("Bot won't move due to conditions:", {
        playingWithBot: game.playingWithBot,
        lastMovePlayerId: game.lastMovePlayerId,
        botTurn: game.botTurn,
        nextAction: game.nextAction,
        removableCellsLength: game.removableCells.length,
      })
    }
  },
})

/**
 * Make the bot's move using the min-max algorithm
 */
function makeBotMove(game: GameState) {
  // Don't calculate moves from inside onChange - schedule for after current execution
  if (pendingBotMove !== null) return

  // Store the current game state for processing outside of onChange
  const currentGameState = JSON.parse(JSON.stringify(game))

  // Schedule the bot move outside of the current onChange execution
  pendingBotMove = window.setTimeout(() => {
    try {
      console.log("Bot is thinking about its move...")

      // Convert the game state to a Board object for the min-max algorithm
      const gameBoard = convertGameStateToBoard(currentGameState)
      console.log("Game board state prepared for bot")

      // Get the best move using the min-max algorithm
      const bestMoveResult = getNextBestMove(gameBoard)
      const bestMove = bestMoveResult[1]

      // Make the bot's move
      if (bestMove !== undefined) {
        console.log("Bot is making move to position:", bestMove)

        // Important: Update lastGameState before calling handleClick
        // This ensures sound effects will work for bot moves
        lastGameState = currentGameState

        Rune.actions.handleClick({
          cellIndex: bestMove,
          fromBot: true,
        })
      } else {
        console.error("Bot failed to find a valid move")
      }
    } catch (error) {
      console.error("Error in bot move calculation:", error)
    } finally {
      // Clear pending state
      pendingBotMove = null
    }
  }, 50) // Short delay to ensure we're outside the onChange execution
}
