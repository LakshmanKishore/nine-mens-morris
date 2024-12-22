import "./styles.css"

import { Player, PlayerId } from "rune-sdk"

import selectSoundAudio from "./assets/select.wav"
import { Cells } from "./logic.ts"

const board = document.getElementById("board")!
const playersSection = document.getElementById("playersSection")!
const gameBoardSVG = document.getElementById("game-board-svg")!
// const buttonsContainer = document.getElementById("buttons-container")!

const selectSound = new Audio(selectSoundAudio)

let cellImages: SVGImageElement[], playerContainers: HTMLLIElement[]

// Define the Constants
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
      `stroke: #e6e6e6; fill: rgba(0, 0, 0, 0); stroke-width: ${LINE_STROKE_WIDTH};`
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
    ellipse.setAttribute("style", "stroke: #e6e6e6;")

    // Create a svg image element which will then be used to set the image of avatar
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    )

    image.setAttribute("x", (cells[index].x - +CELL_SIZE).toString())
    image.setAttribute("y", (cells[index].y - +CELL_SIZE).toString())
    image.setAttribute("width", (+CELL_SIZE * 2).toString())
    image.setAttribute("height", (+CELL_SIZE * 2).toString())
    image.addEventListener("click", () => Rune.actions.handleClick(index))

    gameBoardSVG.appendChild(ellipse)
    gameBoardSVG.appendChild(image)
    return image
  })

  playerContainers = playerIds.map((playerId, index) => {
    const player = Rune.getPlayerInfo(playerId)

    const li = document.createElement("li")
    li.setAttribute("player", index.toString())
    li.innerHTML = `<div class="player-info"><img src="${player.avatarUrl}" />
           <span>${
             player.displayName +
             (player.playerId === yourPlayerId ? "<br>(You)" : "")
           }</span></div>`
    li.innerHTML += `<div class="remaining-mills"><span>xxx</span><span>xxx</span><span>xxx</span></div>`
    // li.innerHTML += `<span>xxx</span>`
    // li.innerHTML += `<span>xxx</span></div>`
    // li.innerHTML += `<div><span>xxx</span></div>`
    playersSection.appendChild(li)

    return li
  })
}

Rune.initClient({
  onChange: ({ game, yourPlayerId, action }) => {
    const { cells, playerIds, lastMovePlayerId } = game

    if (!cellImages) initUI(cells, playerIds, yourPlayerId)

    if (lastMovePlayerId) board.classList.remove("initial")
    // console.log("Here", lastMovePlayerId)

    // Get all the player ids information
    const playersInfo = playerIds.reduce(
      (acc, playerId) => {
        const info = Rune.getPlayerInfo(playerId)
        acc[playerId] = info
        return acc
      },
      {} as { [playerId: string]: Player }
    )

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

      // Enable the rect button to avoid clicks for these conditions
      /*
        1. If the last move player id is not your player id
        2. If the cell has a player id
      */
      if (lastMovePlayerId === yourPlayerId || cells[index].playerId) {
        cellImage.setAttribute("disable-click", "1")
      } else {
        cellImage.setAttribute("disable-click", "0")
      }

      // If the cell needs to be removed, then set and attribute to remove the cell
      if (lastMovePlayerId !== yourPlayerId && cells[index].toRemove) {
        cellImage.setAttribute("remove", "1")
        cellImage.setAttribute("disable-click", "0")
      } else {
        cellImage.setAttribute("remove", "0")
      }

      // if (!cells[index].disableClick) {
      //   cellImage.setAttribute("disable-click", "0")
      // }
    })

    playerContainers.forEach((container, i) => {
      container.setAttribute(
        "your-turn",
        String(playerIds[i] !== lastMovePlayerId)
      )
    })

    // Play a sound after placing a cell
    console.log("selectSound", selectSound, action)
    // if (action && action.name === "handleClick") selectSound.play()
  },
})
