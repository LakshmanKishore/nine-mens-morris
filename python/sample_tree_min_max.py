from typing import List


class TreeNode:
  def __init__(self, val: int = 0):
    self.val = val
    self.children: List[TreeNode] = []

  def __repr__(self):
    return f"TreeNode({self.val})"


# Create a sample tree
tree = TreeNode(6)
tree.children = [TreeNode(3), TreeNode(6), TreeNode(5)]

first_level_children = tree.children

first_level_children[0].children = [TreeNode(5), TreeNode(3)]
first_level_children[1].children = [TreeNode(6), TreeNode(7)]
first_level_children[2].children = [TreeNode(5), TreeNode(8)]


second_level_children: List[TreeNode] = (
  []
  + first_level_children[0].children
  + first_level_children[1].children
  + first_level_children[2].children
)


print(second_level_children)

# Add third level children using second_level_children
second_level_children[0].children = [TreeNode(5), TreeNode(4)]
second_level_children[1].children = [TreeNode(3)]

second_level_children[2].children = [TreeNode(6), TreeNode(6)]
second_level_children[3].children = [TreeNode(7)]

second_level_children[4].children = [TreeNode(5)]
second_level_children[5].children = [TreeNode(8), TreeNode(6)]

# Print third level children
third_level_children: List[TreeNode] = (
  []
  + second_level_children[0].children
  + second_level_children[1].children
  + second_level_children[2].children
  + second_level_children[3].children
  + second_level_children[4].children
  + second_level_children[5].children
)

print(third_level_children)

# Add fourth level children using third_level_children
third_level_children[0].children = [TreeNode(5), TreeNode(6)]
third_level_children[1].children = [TreeNode(7), TreeNode(4), TreeNode(5)]

third_level_children[2].children = [TreeNode(3)]
third_level_children[3].children = [TreeNode(6)]

third_level_children[4].children = [TreeNode(6), TreeNode(9)]
third_level_children[5].children = [TreeNode(7)]

third_level_children[6].children = [TreeNode(5)]

third_level_children[7].children = [TreeNode(9), TreeNode(8)]
third_level_children[8].children = [TreeNode(6)]

# Print fourth level children
fourth_level_children: List[TreeNode] = (
  []
  + third_level_children[0].children
  + third_level_children[1].children
  + third_level_children[2].children
  + third_level_children[3].children
  + third_level_children[4].children
  + third_level_children[5].children
  + third_level_children[6].children
  + third_level_children[7].children
  + third_level_children[8].children
)

print(fourth_level_children)


# Reset all the values to 0 except for leaf node
def dfs(node: TreeNode, depth: int) -> None:
  if node.children:
    node.val = 0

  for child in node.children:
    dfs(child, depth + 1)


dfs(tree, 0)


def min_max(tree: TreeNode, depth: int) -> int:
  if depth == 4:
    print(tree)
    return tree.val

  val = -1
  for child in tree.children:
    min_max_value = min_max(child, depth + 1)
    if val == -1:
      val = min_max_value

    if depth % 2 == 0:
      if min_max_value > val:
        val = min_max_value
    else:
      if min_max_value < val:
        val = min_max_value

  return val


print(min_max(tree, 0))


def min_max_with_alpha_beta(
  tree: TreeNode, depth: int, maximizing_player: bool, alpha: int, beta: int
) -> int:
  if depth == 0:
    print(tree)
    return tree.val

  if maximizing_player:
    val = -99999999
    for child in tree.children:
      if alpha >= beta:
        return val
      val = max(val, min_max_with_alpha_beta(child, depth - 1, False, alpha, beta))
      alpha = max(alpha, val)
      # Alpha = -inf and beta = inf and val = 30, so alpha = 30

    return val

  else:
    val = 99999999
    for child in tree.children:
      if alpha >= beta:
        return val
      val = min(val, min_max_with_alpha_beta(child, depth - 1, True, alpha, beta))
      # val = 30
      beta = min(beta, val)  # beta = 30

      # Here in the second level, alpha = -inf and beta = inf, and it get reset's to 30

    return val


# print(
#   "Min max with alpha beta:",
#   min_max_with_alpha_beta(tree, 4, True, -99999999, 99999999),
# )


tree_b: TreeNode = TreeNode(0)

tree_b.children = [TreeNode(0), TreeNode(0)]

tree_b.children[0].children = [TreeNode(0), TreeNode(0)]
tree_b.children[1].children = [TreeNode(0), TreeNode(0)]

tree_b.children[0].children[0].children = [TreeNode(0), TreeNode(0)]
tree_b.children[0].children[1].children = [TreeNode(0), TreeNode(0)]

tree_b.children[1].children[0].children = [TreeNode(0), TreeNode(0)]
tree_b.children[1].children[1].children = [TreeNode(0), TreeNode(0)]

tree_b.children[0].children[0].children[0].children = [TreeNode(80), TreeNode(30)]
tree_b.children[0].children[0].children[1].children = [TreeNode(25), TreeNode(35)]

tree_b.children[0].children[1].children[0].children = [TreeNode(55), TreeNode(20)]
tree_b.children[0].children[1].children[1].children = [TreeNode(5), TreeNode(65)]

tree_b.children[1].children[0].children[0].children = [TreeNode(40), TreeNode(10)]
tree_b.children[1].children[0].children[1].children = [TreeNode(70), TreeNode(15)]

tree_b.children[1].children[1].children[0].children = [TreeNode(50), TreeNode(45)]
tree_b.children[1].children[1].children[1].children = [TreeNode(60), TreeNode(75)]


def dfs_b(node: TreeNode, depth: int) -> None:
  if node.children:
    node.val = 0

  for child in node.children:
    dfs_b(child, depth + 1)


dfs_b(tree_b, 0)


print(
  "Min max with alpha beta:",
  min_max_with_alpha_beta(tree_b, 4, True, -99999999, 99999999),
)
