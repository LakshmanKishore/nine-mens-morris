from typing import List, Literal


class GameState:
  def __init__(self):
    self.board: List[int] = [0] * 24
    self.current_player = 1

  def place_men(self, type: Literal["place"], index: int):
    if type == "place":
      self.board[index] = self.current_player
    self.current_player = 2 if self.current_player == 1 else 1

  def get_empty_positions(self):
    return [i for i, x in enumerate(self.board) if x == 0]

  def print_board(self):
    board = [str(i) for i in self.board]
    # print board something like this:
    """
        1_00           1_01           1_02
            1_08      1_09      1_10
                1_16 1_17 1_18
        1_07 1_15 1_23      1_19 1_11 1_03
                1_22 1_21 1_20
            1_14      1_13      1_12
        1_06           1_05           1_04
        """

    # Define function to format each cell as "Piece_Index"
    def format_cell(piece: str, index: int):
      return f"{piece}_{index:02}"

    # Print the board in the desired format with exact spacing
    print(
      f"{format_cell(board[0], 0)}           {format_cell(board[1], 1)}           {format_cell(board[2], 2)}"
    )
    print(
      f"     {format_cell(board[8], 8)}      {format_cell(board[9], 9)}      {format_cell(board[10], 10)}"
    )
    print(
      f"          {format_cell(board[16], 16)} {format_cell(board[17], 17)} {format_cell(board[18], 18)}"
    )
    print(
      f"{format_cell(board[7], 7)} {format_cell(board[15], 15)} {format_cell(board[23], 23)}      {format_cell(board[19], 19)} {format_cell(board[11], 11)} {format_cell(board[3], 3)}"
    )
    print(
      f"          {format_cell(board[22], 22)} {format_cell(board[21], 21)} {format_cell(board[20], 20)}"
    )
    print(
      f"     {format_cell(board[14], 14)}      {format_cell(board[13], 13)}      {format_cell(board[12], 12)}"
    )
    print(
      f"{format_cell(board[6], 6)}           {format_cell(board[5], 5)}           {format_cell(board[4], 4)}"
    )

    return
    separator_a = "|                           |                           |"
    separator_b = "|       |                   |                    |      |"
    separator_c = "|       |         |                   |          |      |"
    print(
      board[0]
      + "(00)----------------------"
      + board[1]
      + "(01)----------------------"
      + board[2]
      + "(02)"
    )
    print(separator_a)
    print(separator_a)
    print(separator_a)
    print(
      "|       "
      + board[8]
      + "(08)--------------"
      + board[9]
      + "(09)--------------"
      + board[10]
      + "(10)     |"
    )
    print(separator_b)
    print(separator_b)
    print(separator_b)
    print(
      "|       |        "
      + board[16]
      + "(16)-----"
      + board[17]
      + "(17)-----"
      + board[18]
      + "(18)       |      |"
    )
    print(separator_c)
    print(separator_c)
    print(separator_c)
    print(
      board[7]
      + "(07)---"
      + board[15]
      + "(15)----"
      + board[23]
      + "(23)               "
      + board[19]
      + "(19)----"
      + board[11]
      + "(11)---"
      + board[3]
      + "(03)"
    )
    print(separator_c)
    print(separator_c)
    print(separator_c)
    print(
      "|       |        "
      + board[22]
      + "(22)-----"
      + board[21]
      + "(21)-----"
      + board[20]
      + "(20)       |      |"
    )
    print(separator_b)
    print(separator_b)
    print(separator_b)
    print(
      "|       "
      + board[14]
      + "(14)--------------"
      + board[13]
      + "(13)--------------"
      + board[12]
      + "(12)     |"
    )
    print(separator_a)
    print(separator_a)
    print(separator_a)
    print(
      board[6]
      + "(06)----------------------"
      + board[5]
      + "(05)----------------------"
      + board[4]
      + "(04)"
    )
    print("\n")


def print_board(board: List[int]):
  # print board something like this:
  """
  1_00           1_01           1_02
      1_08      1_09      1_10
          1_16 1_17 1_18
  1_07 1_15 1_23      1_19 1_11 1_03
          1_22 1_21 1_20
      1_14      1_13      1_12
  1_06           1_05           1_04
  """

  # Define function to format each cell as "Piece_Index"
  def format_cell(piece: int, index: int):
    return f"{piece}_{index:02}"

  # Print the board in the desired format with exact spacing
  print(
    f"{format_cell(board[0], 0)}           {format_cell(board[1], 1)}           {format_cell(board[2], 2)}"
  )
  print(
    f"     {format_cell(board[8], 8)}      {format_cell(board[9], 9)}      {format_cell(board[10], 10)}"
  )
  print(
    f"          {format_cell(board[16], 16)} {format_cell(board[17], 17)} {format_cell(board[18], 18)}"
  )
  print(
    f"{format_cell(board[7], 7)} {format_cell(board[15], 15)} {format_cell(board[23], 23)}      {format_cell(board[19], 19)} {format_cell(board[11], 11)} {format_cell(board[3], 3)}"
  )
  print(
    f"          {format_cell(board[22], 22)} {format_cell(board[21], 21)} {format_cell(board[20], 20)}"
  )
  print(
    f"     {format_cell(board[14], 14)}      {format_cell(board[13], 13)}      {format_cell(board[12], 12)}"
  )
  print(
    f"{format_cell(board[6], 6)}           {format_cell(board[5], 5)}           {format_cell(board[4], 4)}"
  )
  print("")

  return


class MinMax:
  def __init__(self, board: List[int], depth: int = 2):
    self.board = board
    self.depth = depth

  def get_empty_positions(self, board: List[int]):
    return [index for index, value in enumerate(board) if value == 0]

  def place_men(
    self, board: List[int], type: Literal["place"], index: int, player: Literal[1, 2]
  ) -> List[int]:
    updated_board = board[:]
    if type == "place":
      updated_board[index] = player
    # self.current_player = 2 if self.current_player == 1 else 1
    return updated_board

  def min_max(self, board: List[int], depth: int, player: Literal[1, 2]):
    if depth == self.depth:
      print_board(board)
      return

    for index in self.get_empty_positions(board):
      updated_board = self.place_men(board, "place", index, player)
      # self.current_player = 2 if self.current_player == 1 else 1
      player = 2 if player == 1 else 1
      self.min_max(updated_board, depth + 1, player)

    return


# Pass the game state and then get possible moves
"""
0 -> Empty
1 -> Player 1
2 -> Player 2 / AI
"""
g = GameState()
# g.place_men("place", 0)
# g.place_men("place", 1)
# g.place_men("place", 5)

m = MinMax(g.board)
m.min_max(m.board, 0, 1)

# g.print_board()


"""
1_00           1_01           1_02
     1_08      1_09      1_10
          1_16 1_17 1_18
1_07 1_15 1_23      1_19 1_11 1_03
          1_22 1_21 1_20
     1_14      1_13      1_12
1_06           1_05           1_04
"""
