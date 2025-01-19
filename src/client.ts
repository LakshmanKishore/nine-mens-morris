import "./styles.css"

import { Player, PlayerId } from "rune-sdk"

// import selectSoundAudio from "./assets/select.wav"
import { Cells } from "./logic.ts"

const board = document.getElementById("board")!
const playersSection = document.getElementById("players-section")!
const gameBoardSVG = document.getElementById("game-board-svg")!
const modal = document.getElementById("myModal")!
// Get the button that opens the modal
const settings = document.getElementById("settings")!
// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0]!

// const selectSound = new Audio(selectSoundAudio)

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
const STROKE_COLOR = "#e6e6e6"

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

  // When the user clicks on the button, open the modal
  settings.addEventListener("click", () => {
    modal.style.display = "block"
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

  playerContainers = playerIds.map((playerId, index) => {
    const player = Rune.getPlayerInfo(playerId)

    const li = document.createElement("li")
    li.setAttribute("player", index.toString())
    if (playerId === "bot") {
      li.innerHTML = `<div class="player-info"><img id="bot-image" />
           <span>Bot</span></div>`
    } else {
      li.innerHTML = `<div class="player-info"><img src="${player.avatarUrl}" />
           <span>${
             player.displayName +
             (player.playerId === yourPlayerId ? "<br>(You)" : "")
           }</span></div>`
    }
    li.innerHTML += `<div class="remaining-mills"></div>`
    // li.innerHTML += `<span>xxx</span>`
    // li.innerHTML += `<span>xxx</span></div>`
    // li.innerHTML += `<div><span>xxx</span></div>`
    playersSection.appendChild(li)

    return li
  })

  // if (playerIds.length === 1) {
  //   const li = document.createElement("li")
  //   li.setAttribute("player", "bot")
  //   li.innerHTML = `<div class="player-info"><img id="bot-image" />
  //          <span>Bot</span></div>`
  //   li.innerHTML += `<div class="remaining-mills"></div>`
  //   // li.innerHTML += `<span>xxx</span>`
  //   // li.innerHTML += `<span>xxx</span></div>`
  //   // li.innerHTML += `<div><span>xxx</span></div>`
  //   playersSection.appendChild(li)
  //   playerContainers.push(li)
  // }
}

Rune.initClient({
  // onChange: ({ game, yourPlayerId, action }) => {
  onChange: ({ game, yourPlayerId }) => {
    const { cells, playerIds, lastMovePlayerId } = game

    if (!cellImages) initUI(cells, playerIds, yourPlayerId)

    if (lastMovePlayerId) board.classList.remove("initial")
    // console.log("Here", lastMovePlayerId)

    // Get all the player ids information
    const playersInfo = playerIds.reduce(
      (acc, playerId) => {
        const info: Player = Rune.getPlayerInfo(playerId)
        acc[playerId] = info
        return acc
      },
      {} as { [playerId: string]: Player }
    )

    const botPlayerInfo: Player = {
      displayName: "Bot",
      avatarUrl: "/src/assets/robot.png",
      playerId: "bot",
    }

    playersInfo["bot"] = botPlayerInfo

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

      // Disable the pointer events on the image
      /*
        1. If the last move player id is not your player id
        2. If the cell has a player id
      */
      // if (lastMovePlayerId === yourPlayerId || cells[index].playerId) {
      //   cellImage.setAttribute("disable-click", "1")
      // } else {
      //   cellImage.setAttribute("disable-click", "0")
      // }

      // Disable all the other cells other than the clickable cells
      if (game.clickableCells.includes(index)) {
        // cellImage.setAttribute("disable-click", "0")
        cellImage.setAttribute("clickable", "1")
      } else {
        // cellImage.setAttribute("disable-click", "1")
        cellImage.setAttribute("clickable", "0")
      }

      // If the cell needs to be removed, then set and attribute to remove the cell
      // if (cells[index].toRemove) {
      if (game.removableCells.includes(index)) {
        cellImage.setAttribute("remove", "1")
      } else {
        cellImage.setAttribute("remove", "0")
      }

      // If the cell is part of the mill then it should be highlighted
      // if (cells[index].isPartOfMill) {
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

      // Update the remaining mills
      // const remainingMills = container.querySelector(".remaining-mills")!
      // Get the count of the current player's cells
      // for (let j = 0; j < game.cellPlacedCount; j += 2) {
      //   remainingMills.innerHTML += `<img src=${playersInfo[playerIds[i]].avatarUrl} />`
      // }
    })

    gameBoardSVG.setAttribute(
      "your-turn",
      String(yourPlayerId !== lastMovePlayerId)
    )

    // Bot click handler
    if (game.playingWithBot) {
      if (lastMovePlayerId === yourPlayerId) {
        // It's bots turn, randomly click on a clickable cell.
        let randomIndex = Math.floor(Math.random() * game.clickableCells.length)
        let index = game.clickableCells[randomIndex]
        setTimeout(() => {
          // when next action is to move, then first click should be any random, but the second click should be of neighbor clickable cell.
          if (game.nextAction === "selectToMove") {
            randomIndex = Math.floor(
              Math.random() * game.neighborHighlightCells.length
            )
            index = game.neighborHighlightCells[randomIndex]
          }
          // Add the fromBot attribute to the image element of the index.
          cellImages[index].setAttribute("from-bot", "true")
          // Remove the pointer event style for the image.
          cellImages[index].style.pointerEvents = "all"
          // Perform the click
          cellImages[index].dispatchEvent(
            new MouseEvent("click", { bubbles: true })
          )
          cellImages[index].removeAttribute("from-bot")
          cellImages[index].style.pointerEvents = "none"
        }, 1000)
        // if (game.botClickCanBeInitiated) {
        //   setTimeout(() => {
        //     Rune.actions.handleClick({
        //       cellIndex: index,
        //       fromBot: true,
        //     })
        //   }, 2000)
        // }
      }
    }

    // Play a sound after placing a cell
    // console.log("selectSound", selectSound, action)
    // if (action && action.name === "handleClick") selectSound.play()
  },
})
