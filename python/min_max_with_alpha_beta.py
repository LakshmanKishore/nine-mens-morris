"""
Python code for min max algo for 9mm
"""

from typing import List, Literal

board: List[int] = [0] * 24  # b->board
next_action: Literal["selectToPlace", "selectToMove", "selectDestination", "selectToRemove"] = (
  "selectToPlace"
)

"""
first create tree till the placement and which ever the
state having minimum number of player mens navigate through that branch.
0->empty, 1->player, 2->aibot
"""
mills: List[List[int]] = [  # ms->mills
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


class Board:
  def __init__(self):
    self.board: List[int] = [0] * 24
    self.next_action: Literal[
      "selectToPlace", "selectToMove", "selectDestination", "selectToRemove"
    ] = "selectToPlace"
    self.current_player = 1
    self.cell_count = 0
    self.removed_men: List[int] = []

  def get_all_empty_locations(self) -> List[int]:
    empty_list: List[int] = []
    for i, ele in enumerate(self.board):
      if ele == 0:
        empty_list.append(i)
    return empty_list

  def perform_next_move(self, index: int) -> List[int]:
    if self.next_action == "selectToRemove":
      self.removed_men.append(index)

    # Placing the men on the board
    updated_board: List[int] = self.board[:]
    updated_board[index] = self.current_player

    # Check if there is a mill formation
    for mill in mills:
      if (
        updated_board[mill[0]]
        == updated_board[mill[1]]
        == updated_board[mill[2]]
        == self.current_player
      ):
        # Mill has formed, now change the action and return
        self.next_action = "selectToRemove"
        return updated_board

    # Update the next player turn to other player
    self.current_player = 2 if self.current_player == 1 else 1
    return updated_board

  def get_value(self) -> int:
    next_player_turn = 2 if self.current_player == 1 else 1

    # 1. Check how many places the mill can be formed for the current player.
    possible_mills_for_current_player = 0

    for mill in mills:
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

    for mill in mills:
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

    # Get the removed current player count
    removed_current_player_count = self.removed_men.count(self.current_player)

    # Get the removed next player count
    removed_next_player_count = self.removed_men.count(next_player_turn)

    score: int = (
      (3 * possible_mills_for_current_player)
      + removed_next_player_count
      - (3 * possible_mills_for_next_player)
      - removed_current_player_count
    )

    return score

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


# def min_max(board: List[int], player: Literal[1, 2], depth: int) -> int:  # mm->min_max
#     global count, last_state
#     if depth == 5:
#         count += 1
#         # print(b)
#         last_state = board
#         return value(board)
#     empty_list: List[int] = get_empty_loc(board)
#     player = 2 if player == 1 else 1
#     for i in empty_list:
#         updated_board = perform_next_move(board, i, player)
#         # here if a mill is formed, then player wont change
#         # remove opponents men if mill formed.
#         # if
#         min_max(updated_board, player, depth + 1)

#     return 0


def value(board: List[int]) -> int:
  for mill in mills:
    if board[mill[0]] == board[mill[1]] == board[mill[2]] == (board[mill[0]] in [0, 1]):
      return 1
  return 0


def print_board(board: List[int]) -> None:
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
    format = format.replace(f"0_{i:02}", str(board[i]) + f"_{i:02}")
  print(format)


print_board(board)

board[0] = 1
# min_max(board, 1, 0)
print(count)
print_board(last_state)
