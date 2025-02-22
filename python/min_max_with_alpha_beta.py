"""
Python code for min max algo for 9mm
"""

from typing import List, Literal

board: List[int] = [0] * 24  # b->board
next_action: Literal[
  "selectToPlace", "selectToMove", "selectDestination", "selectToRemove"
] = "selectToPlace"

"""
first create tree till the placement and which ever the
state having minimum number of player mens navigate through that branch.
0->empty, 1->player, 2->aibot
"""


class Board:
  def __init__(self):
    self.board: List[int] = [0] * 24
    self.next_action: Literal[
      "selectToPlace", "selectToMove", "selectDestination", "selectToRemove"
    ] = "selectToPlace"
    self.current_player = 1
    self.total_cells_to_place = 17
    self.cell_placed_count = 0
    self.selected_index_to_move: int = -1
    self.game_over: bool = False
    self.winner: int = -1
    self.removable_opponent_cells: List[int] = []
    self.removed_men: List[int] = []
    self.current_mill_indexes: List[int] = []
    self.possible_movable_destinations: List[int] = []
    self.possible_movable_mens: List[int] = []
    self.mills: List[List[int]] = [
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
    self.reachable_cell_indexes: List[List[int]] = [
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

  def get_all_empty_locations(self) -> List[int]:
    empty_list: List[int] = []
    for i, ele in enumerate(self.board):
      if ele == 0:
        empty_list.append(i)
    return empty_list

  def perform_next_move(self, index: int) -> List[int]:
    updated_board: List[int] = self.board[:]
    print("-" * 50)

    if self.next_action == "selectToRemove":
      if (
        updated_board[index] in (0, self.current_player)
        or index not in self.removable_opponent_cells
      ):
        print("Invalid Selection")
        return updated_board

      self.removed_men.append(index)
      updated_board[index] = 0

      self.removable_opponent_cells = []

    elif self.next_action in ("selectToPlace", "selectDestination"):
      if self.next_action == "selectToPlace":
        self.cell_placed_count += 1

      if self.next_action == "selectDestination":
        if index not in self.reachable_cell_indexes[self.selected_index_to_move]:
          print("Invalid Destination")
          return updated_board

        if updated_board[index] != 0:
          print("Cell already occupied")
          return updated_board

        updated_board[self.selected_index_to_move] = 0
        self.selected_index_to_move = 0

        # TODO: Update the current_mill_indexes list here.

      # Placing the men on the board
      updated_board[index] = self.current_player

      # Check if there is a mill formation
      for i, mill in enumerate(self.mills):
        if index not in mill:
          continue

        if (
          updated_board[mill[0]]
          == updated_board[mill[1]]
          == updated_board[mill[2]]
          == self.current_player
        ):
          # Add the mill index to the current mill indexes
          self.current_mill_indexes.append(i)

          # Mill has formed, now change the action and return
          self.next_action = "selectToRemove"

          # Print all the opponent removable cells
          opponent_player = 2 if self.current_player == 1 else 1

          opponent_player_mills = self.get_player_mills(opponent_player)

          for i in self.get_player_indexes(updated_board, opponent_player):
            if i not in opponent_player_mills:
              self.removable_opponent_cells.append(i)

          if len(self.removable_opponent_cells) != 0:
            return updated_board

    elif self.next_action == "selectToMove":
      # Check if the selected index is empty
      if self.board[index] != self.current_player:
        print("Select different men to move")
        return updated_board

      # Display the possible moves
      self.possible_movable_destinations = []

      for i in self.reachable_cell_indexes[index]:
        if self.board[i] == 0:
          self.possible_movable_destinations.append(i)

      if len(self.possible_movable_destinations) == 0:
        print("Select different men to move")
        return updated_board

      self.selected_index_to_move = index
      self.next_action = "selectDestination"
      return updated_board

    else:
      print("Invalid Action!")
      return updated_board

    if self.cell_placed_count > self.total_cells_to_place:
      self.next_action = "selectToMove"

    else:
      self.next_action = "selectToPlace"

    previous_player = self.current_player

    # Update the next player turn to other player
    self.current_player = 2 if self.current_player == 1 else 1

    if self.next_action == "selectToMove":
      # For all the possible movable mens check if any of the neighbors is empty, else remove from the list
      possible_movable_mens = self.get_player_indexes(
        updated_board, self.current_player
      )
      self.possible_movable_mens = []
      for men in possible_movable_mens:
        for i in self.reachable_cell_indexes[men]:
          if updated_board[i] == 0:
            self.possible_movable_mens.append(men)
            break

      if len(self.possible_movable_mens) == 0:
        # Declare the winner and exit
        self.declare_winner(previous_player)

    # Check if the count of any player is less than 3
    current_player_count: int = len(
      self.get_player_indexes(updated_board, self.current_player)
    )
    previous_player_count: int = len(
      self.get_player_indexes(updated_board, previous_player)
    )

    if self.cell_placed_count >= self.total_cells_to_place:
      if current_player_count <= 2:
        self.declare_winner(previous_player)

      if previous_player_count <= 2:
        self.declare_winner(self.current_player)

    return updated_board

  def get_player_indexes(self, board: List[int], player: int) -> List[int]:
    return [i for i, x in enumerate(board) if x == player]

  def get_player_mills(self, player: int) -> List[int]:
    player_mills: List[int] = []

    for i in self.current_mill_indexes:
      if self.board[self.mills[i][0]] == player:
        player_mills += self.mills[i]

    return player_mills

  def declare_winner(self, player: int) -> None:
    print(f"Player {player} has won the game")
    self.game_over = True
    self.winner = player
    return

  def get_value(self) -> int:
    next_player_turn = 2 if self.current_player == 1 else 1

    # 1. Check how many places the mill can be formed for the current player.
    possible_mills_for_current_player = 0

    for mill in self.mills:
      if (
        (
          self.board[mill[0]] == 0
          and self.board[mill[1]] == self.current_player
          and self.board[mill[2]] == self.current_player
        )
        or (
          self.board[mill[0]] == self.current_player
          and self.board[mill[1]] == 0
          and self.board[mill[2]] == self.current_player
        )
        or (
          self.board[mill[0]] == self.current_player
          and self.board[mill[1]] == self.current_player
          and self.board[mill[2]] == 0
        )
      ):
        possible_mills_for_current_player += 1

    # 2. Check how many places the mill can be formed for the next player.
    possible_mills_for_next_player = 0

    for mill in self.mills:
      if (
        (
          self.board[mill[0]] == 0
          and self.board[mill[1]] == next_player_turn
          and self.board[mill[2]] == next_player_turn
        )
        or (
          self.board[mill[0]] == next_player_turn
          and self.board[mill[1]] == 0
          and self.board[mill[2]] == next_player_turn
        )
        or (
          self.board[mill[0]] == next_player_turn
          and self.board[mill[1]] == next_player_turn
          and self.board[mill[2]] == 0
        )
      ):
        possible_mills_for_next_player += 1

    # 3. Check how many places a mill will be formed for sure in the next move for the current player.
    definite_mills_for_current_player_in_next_move = 0
    definite_mills_for_next_player_in_next_move = 0

    for index, player in enumerate(self.board):
      if player != 0:
        # Get the possible mills for this index
        possible_mills_for_index = self.get_mills_for_index(index)

        # Create combinations of 4 from the possible mills except the index
        first_mill = possible_mills_for_index[0]
        second_mill = possible_mills_for_index[1]

        for first_mill_index in first_mill:
          for second_mill_index in second_mill:
            if first_mill_index != index and second_mill_index != index:
              # Check if the next move will create a mill
              if (
                self.board[first_mill_index] == self.current_player
                and self.board[second_mill_index] == self.current_player
              ):
                definite_mills_for_current_player_in_next_move += 1

              if (
                self.board[first_mill_index] == next_player_turn
                and self.board[second_mill_index] == next_player_turn
              ):
                definite_mills_for_next_player_in_next_move += 1

    # Get the removed current player count
    removed_current_player_count = self.removed_men.count(self.current_player)

    # Get the removed next player count
    removed_next_player_count = self.removed_men.count(next_player_turn)

    print(f"""
    possible_mills_for_current_player_in_next_move: {definite_mills_for_current_player_in_next_move}
    possible_mills_for_current_player: {possible_mills_for_current_player}
    removed_next_player_count: {removed_next_player_count}

    possible_mills_for_next_player: {possible_mills_for_next_player}
    possible_mills_for_next_player_in_next_move: {definite_mills_for_next_player_in_next_move}
    removed_current_player_count: {removed_current_player_count}
    """)

    score: int = (
      (4 * definite_mills_for_current_player_in_next_move)
      + (3 * possible_mills_for_current_player)
      + removed_next_player_count
      - (3 * definite_mills_for_next_player_in_next_move)
      - (2 * possible_mills_for_next_player)
      - removed_current_player_count
    )

    return score

  def get_neighbor(self, index: int, level: int) -> int:
    return (index + level) % 8 + ((index // 8) * 8)

  def get_mills_for_index(self, index: int) -> List[List[int]]:
    if index % 2 == 0:  # corners
      return [
        [index, self.get_neighbor(index, 1), self.get_neighbor(index, 2)],
        [index, self.get_neighbor(index, -1), self.get_neighbor(index, -2)],
      ]
    else:  # middle
      return [
        [index, self.get_neighbor(index, 1), self.get_neighbor(index, -1)],
        [i for i in range(index - (2 * 8), index + (2 * 8) + 1, 8) if i > 0 and i < 24],
      ]

  def display(self) -> None:
    format = """
0_00           0_01           0_02
     0_08      0_09      0_10
          0_16 0_17 0_18
0_07 0_15 0_23      0_19 0_11 0_03
          0_22 0_21 0_20
     0_14      0_13      0_12
0_06           0_05           0_04
  """
    for i in range(24):
      format = format.replace(f"0_{i:02}", str(self.board[i]) + f"_{i:02}")
    print(format)


count = 0
last_state: List[int] = []


# if __name__ == "__main__":
def start_game():
  print("Welcome to the game!!!")
  game_board = Board()

  for i in range(24):
    print(game_board.get_mills_for_index(i))

  while True:
    if game_board.game_over:
      break

    game_board.display()
    print(
      "Next Action: ",
      game_board.next_action,
      "\t",
      "Player: ",
      game_board.current_player,
      "\t",
      "Remaining Mens to be placed: ",
      game_board.total_cells_to_place - game_board.cell_placed_count,
    )
    if game_board.removable_opponent_cells:
      print("Removable Cells: ", game_board.removable_opponent_cells)

    if game_board.next_action == "selectDestination":
      print(
        f"Possible destinations for index {game_board.selected_index_to_move} are: {game_board.possible_movable_destinations}"
      )

    if game_board.next_action == "selectToMove":
      print(
        f"Possible moves for player {game_board.current_player} are: {game_board.possible_movable_mens}"
      )

    index = input("Enter the index: ")

    try:
      index = int(index)

      # TODO: Remove this, as this just for testing
      if index == 25:
        # Print the score of the current state of the board
        print("Score: ", game_board.get_value())
        continue

      elif index < 0 or index > 23:
        raise ValueError

    except ValueError:
      print("Invalid Input")
      continue

    game_board.board = game_board.perform_next_move(index)


if __name__ == "__main__":
  start_game()
