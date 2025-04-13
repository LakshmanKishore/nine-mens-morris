"""
Python code for min max algo for 9mm
"""

import copy
import traceback
import os
import time
import multiprocessing as mp
from typing import List, Literal, Set, Tuple, Dict

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
    self.moves_performed: List[int] = []
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

  def perform_next_move(self, index: int):
    # print("-" * 50)
    self.moves_performed.append(index)

    if self.next_action == "selectToRemove":
      if (
        self.board[index] in (0, self.current_player)
        or index not in self.removable_opponent_cells
      ):
        print("Invalid Selection")
        return self.board

      self.removed_men.append(self.board[index])
      self.board[index] = 0

      self.removable_opponent_cells = []

    elif self.next_action in ("selectToPlace", "selectDestination"):
      if self.next_action == "selectToPlace":
        if self.board[index] != 0:
          print("Cell already occupied")
          return self.board

        self.cell_placed_count += 1

      if self.next_action == "selectDestination":
        if index not in self.reachable_cell_indexes[self.selected_index_to_move]:
          print("Invalid Destination")
          return self.board

        if self.board[index] != 0:
          print("Cell already occupied")
          return self.board

        self.board[self.selected_index_to_move] = 0
        self.selected_index_to_move = 0

      # Placing the men on the board
      self.board[index] = self.current_player

      self.current_mill_indexes = []

      # Check if there is a mill formation
      for i, mill in enumerate(self.mills):
        # Track all the mills that has been formed for both the players.
        if (self.board[mill[0]] == self.board[mill[1]] == self.board[mill[2]]) and (
          self.board[mill[0]] != 0
        ):
          self.current_mill_indexes.append(i)

        if index not in mill:
          continue

        if (
          self.board[mill[0]]
          == self.board[mill[1]]
          == self.board[mill[2]]
          == self.current_player
        ):
          # Add the mill index to the current mill indexes, only if it is not already present
          # TODO: If the current mill list getting updated here, then remove it in other part.
          # if i not in self.current_mill_indexes:
          #   self.current_mill_indexes.append(i)

          # Mill has formed, now change the action and return
          self.next_action = "selectToRemove"
          self.removable_opponent_cells = []

          # Print all the opponent removable cells
          opponent_player = 2 if self.current_player == 1 else 1

          opponent_player_mills = self.get_player_mills(opponent_player)

          # TODO: Some of the older mills are not appending to the list. Needs verification

          for i in self.get_player_indexes(self.board, opponent_player):
            if i not in opponent_player_mills:
              self.removable_opponent_cells.append(i)

          if len(self.removable_opponent_cells) != 0:
            return self.board

    elif self.next_action == "selectToMove":
      # Check if the selected index is empty
      if self.board[index] != self.current_player:
        print("Select different men to move")
        return self.board

      # Display the possible moves
      self.possible_movable_destinations = []

      for i in self.reachable_cell_indexes[index]:
        if self.board[i] == 0:
          self.possible_movable_destinations.append(i)

      if len(self.possible_movable_destinations) == 0:
        print("Select different men to move")
        return self.board

      self.selected_index_to_move = index
      self.next_action = "selectDestination"
      return self.board

    else:
      print("Invalid Action!")
      return self.board

    if self.cell_placed_count > self.total_cells_to_place:
      self.next_action = "selectToMove"

    else:
      self.next_action = "selectToPlace"

    previous_player = self.current_player

    # Update the next player turn to other player
    self.current_player = 2 if self.current_player == 1 else 1

    if self.next_action == "selectToMove":
      # For all the possible movable mens check if any of the neighbors is empty, else remove from the list
      possible_movable_mens = self.get_player_indexes(self.board, self.current_player)
      self.possible_movable_mens = []
      for men in possible_movable_mens:
        for i in self.reachable_cell_indexes[men]:
          if self.board[i] == 0:
            self.possible_movable_mens.append(men)
            break

      if len(self.possible_movable_mens) == 0:
        # Declare the winner and exit
        self.declare_winner(previous_player)

    # Check if the count of any player is less than 3
    current_player_count: int = len(
      self.get_player_indexes(self.board, self.current_player)
    )
    previous_player_count: int = len(
      self.get_player_indexes(self.board, previous_player)
    )

    if self.cell_placed_count >= self.total_cells_to_place:
      if current_player_count <= 2:
        self.declare_winner(previous_player)

      if previous_player_count <= 2:
        self.declare_winner(self.current_player)

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

  def get_value(self, player: int, print_heuristics: bool = False) -> int:
    opponent_player = 2 if player == 1 else 1

    # * Check how many places the mill can be formed.
    possible_mills_for_player = 0
    possible_mills_for_opponent_player = 0

    if self.cell_placed_count <= self.total_cells_to_place:
      for mill in self.mills:
        if (
          (
            self.board[mill[0]] == 0
            and self.board[mill[1]] == player
            and self.board[mill[2]] == player
          )
          or (
            self.board[mill[0]] == player
            and self.board[mill[1]] == 0
            and self.board[mill[2]] == player
          )
          or (
            self.board[mill[0]] == player
            and self.board[mill[1]] == player
            and self.board[mill[2]] == 0
          )
        ):
          possible_mills_for_player += 1

        if (
          (
            self.board[mill[0]] == 0
            and self.board[mill[1]] == opponent_player
            and self.board[mill[2]] == opponent_player
          )
          or (
            self.board[mill[0]] == opponent_player
            and self.board[mill[1]] == 0
            and self.board[mill[2]] == opponent_player
          )
          or (
            self.board[mill[0]] == opponent_player
            and self.board[mill[1]] == opponent_player
            and self.board[mill[2]] == 0
          )
        ):
          possible_mills_for_opponent_player += 1

    # * Check how many places a mill will be formed for sure in the next move for the current player.
    definite_mills_for_player_in_next_move = 0
    definite_mills_for_opponent_player_in_next_move = 0

    if self.cell_placed_count <= self.total_cells_to_place:
      for index, men in enumerate(self.board):
        if men != 0:
          # Get the possible mills for this index
          possible_mills_for_index = self.get_mills_for_index(index)

          # Create combinations of 4 from the possible mills except the index
          first_mill = possible_mills_for_index[0]
          second_mill = possible_mills_for_index[1]

          first_mill.remove(index)
          second_mill.remove(index)

          # For every two pair, check if the mens are same, if so then check if the other two positions are empty.
          check_combinations = [[0, 0, 1, 1], [0, 1, 1, 0], [1, 0, 0, 1], [1, 1, 0, 0]]

          for combination in check_combinations:
            # if the first 2 combination index contain same men and the other 2 are empty, then in the next move there will be a mill formed.
            if (
              self.board[first_mill[combination[0]]]
              == self.board[second_mill[combination[1]]]
              == men
            ) and (
              self.board[first_mill[combination[2]]]
              == self.board[second_mill[combination[3]]]
              == 0
            ):
              if men == player:
                definite_mills_for_player_in_next_move += 1
              else:
                definite_mills_for_opponent_player_in_next_move += 1

    # Get the removed player count
    removed_player_count = self.removed_men.count(player)

    # Get the removed opponent player count
    removed_opponent_player_count = self.removed_men.count(opponent_player)

    # * This heuristic is for checking if there are any state that can have mill every move.
    mill_every_move_for_player: int = 0
    mill_every_move_for_opponent_player: int = 0

    # * This heuristic is to check if there is a possible mill during the moving time.
    possible_mill_during_move_for_player: int = 0
    possible_mill_during_move_for_opponent_player: int = 0

    # Calculate this only during the player's turn

    if self.cell_placed_count >= self.total_cells_to_place:
      # Get all movable mens
      all_movable_men: List[int] = []
      all_movable_men += self.get_player_indexes(self.board, player)
      all_movable_men += self.get_player_indexes(self.board, opponent_player)

      for men in all_movable_men:
        destinations: List[int] = self.get_all_neighbors_with_type(men, 0)
        movable_men_mills = self.get_mills_for_index(men)

        # For each destination, get mills
        # destination_mills = get_mills_for_index()
        for destination in destinations:
          destination_mills = self.get_mills_for_index(destination)

          # Getting double mill every move pair
          every_move_mill_pair: List[List[int]] = []
          if destination_mills[0] == movable_men_mills[0]:
            every_move_mill_pair.append(destination_mills[1])
            every_move_mill_pair.append(movable_men_mills[1])
          elif destination_mills[0] == movable_men_mills[1]:
            every_move_mill_pair.append(destination_mills[1])
            every_move_mill_pair.append(movable_men_mills[0])
          elif destination_mills[1] == movable_men_mills[0]:
            every_move_mill_pair.append(destination_mills[0])
            every_move_mill_pair.append(movable_men_mills[1])
          else:
            every_move_mill_pair.append(destination_mills[0])
            every_move_mill_pair.append(movable_men_mills[0])

          mens_of_every_move_mill_pair: Set[int] = set(
            [self.board[j] for i in every_move_mill_pair for j in i if j != destination]
          )

          if len(mens_of_every_move_mill_pair) == 1:
            if self.board[men] == player:
              mill_every_move_for_player += 1
            else:
              mill_every_move_for_opponent_player += 1

          # Now check if there are any mills in the next move.
          focus_mill = (
            destination_mills[1]
            if men in destination_mills[0]
            else destination_mills[0]
          )
          focus_mill.remove(destination)

          if (
            self.board[focus_mill[0]] == self.board[focus_mill[1]] == self.board[men]
            and self.board[focus_mill[0]] != 0
          ):
            if self.board[men] == player:
              possible_mill_during_move_for_player += 1
            else:
              possible_mill_during_move_for_opponent_player += 1

    if print_heuristics:
      print(f"""
      definite_mills_for_player_in_next_move: {definite_mills_for_player_in_next_move}
      possible_mills_for_player: {possible_mills_for_player}
      possible_mill_during_move_for_player: {possible_mill_during_move_for_player}
      removed_opponent_player_count: {removed_opponent_player_count}
      mill_every_move_player: {mill_every_move_for_player}

      definite_mills_for_opponent_player_in_next_move: {definite_mills_for_opponent_player_in_next_move}
      possible_mills_for_opponent_player: {possible_mills_for_opponent_player}
      possible_mill_during_move_for_opponent_player: {possible_mill_during_move_for_opponent_player}
      removed_player_count: {removed_player_count}
      mill_every_move_opponent_player: {mill_every_move_for_opponent_player}
      """)

    score: int = (
      (13 * removed_opponent_player_count)
      + (5 * mill_every_move_for_player)
      + (4 * definite_mills_for_player_in_next_move)
      + (3 * possible_mills_for_player)
      + (3 * possible_mill_during_move_for_player)
      - (10 * removed_player_count)
      - (4 * mill_every_move_for_opponent_player)
      - (3 * definite_mills_for_opponent_player_in_next_move)
      - (2 * possible_mills_for_opponent_player)
      - (2 * possible_mill_during_move_for_opponent_player)
    )
    # print("Score: ", score)

    return score

  def get_neighbor(self, index: int, level: int) -> int:
    return (index + level) % 8 + ((index // 8) * 8)

  def get_all_neighbors_with_type(self, index: int, type: int) -> List[int]:
    neighbors: List[int] = []
    left_neighbor = self.get_neighbor(index, -1)
    right_neighbor = self.get_neighbor(index, 1)

    if self.board[left_neighbor] == type:
      neighbors.append(left_neighbor)
    if self.board[right_neighbor] == type:
      neighbors.append(right_neighbor)

    if index % 2 == 1:  # middle
      for i in range(index - (2 * 8), index + (2 * 8), 8):
        if i > 0 and i < 24 and i != index and (i - index in (-8, 8)):
          if self.board[i] == type:
            neighbors.append(i)

    return neighbors

  def get_mills_for_index(self, index: int) -> List[List[int]]:
    if index % 2 == 0:  # corners
      return [
        sorted([index, self.get_neighbor(index, 1), self.get_neighbor(index, 2)]),
        sorted([index, self.get_neighbor(index, -1), self.get_neighbor(index, -2)]),
      ]
    else:  # middle
      return [
        sorted([index, self.get_neighbor(index, 1), self.get_neighbor(index, -1)]),
        sorted(
          [
            i
            for i in range(index - (2 * 8), index + (2 * 8) + 1, 8)
            if i > 0 and i < 24
          ]
        ),
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


# if __name__ == "__main__":
def start_game():
  print("Welcome to the game!!!")
  game_board = Board()

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

    if game_board.current_player == 3:
      depth = 3

      if game_board.next_action == "selectToMove":
        next_action_possible_positions = game_board.possible_movable_mens
      elif game_board.next_action == "selectDestination":
        next_action_possible_positions = game_board.possible_movable_destinations
      elif game_board.next_action == "selectToRemove":
        next_action_possible_positions = game_board.removable_opponent_cells
      else:
        next_action_possible_positions = game_board.get_all_empty_locations()

      if game_board.cell_placed_count >= game_board.total_cells_to_place:
        depth = 8

      # Get the time taken for getting the best move
      start_time = time.time()

      # For each next action get the min max value and store it and choose the best one.
      min_max_values: List[Tuple[int, int, List[int]]] = []
      for next_action in next_action_possible_positions:
        game_board_copied = copy.deepcopy(game_board)
        min_max_value, initial_action, moves_performed = min_max(
          # min_max_value = min_max(
          game_board_copied,
          depth,
          next_action,
          False,
          -9999999999,
          9999999999,
          True,
        )
        min_max_values.append(
          (
            initial_action,
            min_max_value,
            # [],
            moves_performed[len(game_board.moves_performed) - 1 :],
          )
        )

      print("Min Max Values: ", min_max_values)
      # Print the best move
      best_move = max(min_max_values, key=lambda x: x[1])

      print("Best Move: ", best_move)
      print("Time Taken: ", time.time() - start_time)
      game_board.perform_next_move(best_move[1])

      continue

    if game_board.current_player == 2:
      best_move = get_next_best_move(game_board)
      game_board.perform_next_move(best_move[1])
      continue

    index = input("Enter the index: ")

    try:
      index = int(index)

      # TODO: Remove this, as this just for testing
      if index == 25:
        # Print the score of the current state of the board
        print("Score: ", game_board.get_value(2, True))
        continue

      if index == 26:
        # Perform min max on the current state of the board
        # Collect original board attributes before min max
        # original_board_attributes = game_board.__dict__.copy()
        best_move = get_next_best_move(game_board)

        game_board.perform_next_move(best_move[0])
        continue

      elif index < 0 or index > 23:
        raise ValueError

    except ValueError:
      print("Invalid Input")
      continue

    except Exception as e:
      print("Error: ", e)
      traceback.print_exc()
      continue

    game_board.perform_next_move(index)


def get_next_best_move(game_board: Board) -> Tuple[int, int, List[int]]:
  depth = 3

  if game_board.next_action == "selectToMove":
    next_action_possible_positions = game_board.possible_movable_mens
  elif game_board.next_action == "selectDestination":
    next_action_possible_positions = game_board.possible_movable_destinations
  elif game_board.next_action == "selectToRemove":
    next_action_possible_positions = game_board.removable_opponent_cells
  else:
    next_action_possible_positions = game_board.get_all_empty_locations()

  if game_board.cell_placed_count >= game_board.total_cells_to_place:
    depth = 8

  # For each next action get the min max value and store it and choose the best one.
  min_max_values: List[Tuple[int, int, List[int]]] = []

  start_time = time.time()
  with mp.Pool() as pool:
    results = []
    args: List[Tuple[Board, int, int, bool, int, int]] = [
      (
        copy.deepcopy(game_board),
        depth,
        next_action,
        False,
        -9999999999,
        9999999999,
        True,
      )  # type: ignore
      for next_action in next_action_possible_positions
    ]
    # print("Args:", args)
    # exit(0)
    results = pool.starmap(min_max, args)
    # Wait until all the processes are finished.
    pool.close()
    pool.join()

    # min_max_values, moves_performed = zip(*results)
    min_max_values = results

    # print("Results:", results)

  end_time = time.time()
  print(f"Time taken: {end_time - start_time}")
  print("Min Max Values: ", min_max_values)

  best_move = max(min_max_values, key=lambda x: x[0])
  print("Best Move: ", best_move)

  return best_move


explored_states: Dict[str, int] = {}
c = 0


def min_max(
  game_board: Board,
  depth: int,
  initial_action: int,
  maximizing_player: bool,
  alpha: int,
  beta: int,
  apply_initial_action: bool,
) -> Tuple[int, int, List[int]]:
  # ) -> int:
  global explored_states
  if depth == 0:
    # Get the value of the board state
    value = game_board.get_value(2)
    # print("Value: ", value)

    # return value
    return value, initial_action, game_board.moves_performed

  # Perform the initial action
  if apply_initial_action:
    print(
      f"Process {initial_action} {os.getpid()}, {mp.current_process().pid} is started"
    )
    game_board.perform_next_move(initial_action)

  # board_string = "".join(map(str, game_board.board))
  # if board_string in explored_states:
  #   return explored_states[board_string]

  if game_board.next_action == "selectToMove":
    next_action_possible_positions = game_board.possible_movable_mens
  elif game_board.next_action == "selectDestination":
    next_action_possible_positions = game_board.possible_movable_destinations
  elif game_board.next_action == "selectToRemove":
    next_action_possible_positions = game_board.removable_opponent_cells
  else:
    next_action_possible_positions = game_board.get_all_empty_locations()

  if maximizing_player:
    value = -9999999
    moves_performed = []

    for next_action_position in next_action_possible_positions:
      game_board_copied: Board = copy.deepcopy(game_board)  # type: ignore
      game_board_copied.perform_next_move(next_action_position)
      game_board_string = "".join(map(str, game_board_copied.board))

      if game_board_string in explored_states:
        value = max(value, explored_states[game_board_string])
        continue

      if game_board.current_player == 1:
        maximizing_player = False

      min_max_value, initial_action, moves_performed = min_max(
        # min_max_value = min_max(
        game_board_copied,
        depth - 1,
        initial_action,
        maximizing_player,
        alpha,
        beta,
        False,
      )
      value = max(value, min_max_value)
      alpha = max(alpha, value)
      if alpha >= beta:
        # return value
        return value, initial_action, moves_performed

    # return value
    return value, initial_action, moves_performed
  else:
    value = 9999999
    moves_performed = []

    for next_action_position in next_action_possible_positions:
      game_board_copied: Board = copy.deepcopy(game_board)  # type: ignore
      game_board_copied.perform_next_move(next_action_position)
      game_board_string = "".join(map(str, game_board_copied.board))

      if game_board_string in explored_states:
        value = min(value, explored_states[game_board_string])
        continue

      if game_board.current_player == 2:
        maximizing_player = True

      min_max_value, initial_action, moves_performed = min_max(
        # min_max_value = min_max(
        game_board_copied,
        depth - 1,
        initial_action,
        maximizing_player,
        alpha,
        beta,
        False,
      )

      value = min(value, min_max_value)
      beta = min(beta, value)
      if alpha >= beta:
        # return value
        return value, initial_action, moves_performed

    # return value
    return value, initial_action, moves_performed


if __name__ == "__main__":
  start_game()
