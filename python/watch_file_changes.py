import os
import sys
import time
import subprocess
from typing import Dict, List


def get_last_modified_dict(path: str) -> Dict[str, float]:
  """
  returns the dict object containing filename and last modified time
  """
  data = os.walk(path)
  return_data: Dict[str, float] = {}
  for root, _, files in data:
    for file in files:
      file_path = os.path.join(root, file)
      return_data[file_path] = os.stat(file_path).st_mtime
  return return_data


def get_unique_data(old_dict: Dict[str, float], new_dict: Dict[str, float]) -> Dict[str, List[str]]:
  """
  returns the dict object that contains new files , changed files, deleted files by comparing
  two arguments that contains last modified time
  """
  return_data: Dict[str, List[str]] = {"changed": [], "new": [], "deleted": []}
  if old_dict != new_dict:
    return_data["changed"] = [
      file
      for file in set(old_dict.keys()).intersection(set(new_dict.keys()))
      if old_dict[file] != new_dict[file]
    ]
    return_data["new"] = list(set(new_dict.keys()).difference(set(old_dict.keys())))
    return_data["deleted"] = list(set(old_dict.keys()).difference(set(new_dict.keys())))

  return return_data


def main(command: str, watchdir: str = "./") -> None:
  """
  the main method
  """
  print("File-change monitor is live")
  print("command to exec : %s" % (command))

  print("\nexecuting %s\n" % (command))
  process = subprocess.Popen(command.split())
  current_data = get_last_modified_dict(watchdir)

  while True:
    try:
      new_data = get_last_modified_dict(watchdir)
      if new_data != current_data:
        print("terminating last process")
        process.terminate()

        unique_data = get_unique_data(current_data, new_data)

        if unique_data["changed"]:
          print("changed files :", ",".join(unique_data["changed"]))
        if unique_data["new"]:
          print("new files :", ",".join(unique_data["new"]))
        if unique_data["deleted"]:
          print("deleted files :", ",".join(unique_data["deleted"]))

        current_data = new_data
        print("\nexecuting : %s\n" % (command))
        process = subprocess.Popen(command.split())

      time.sleep(1)
    except KeyboardInterrupt:
      print("Keyboard interrupt received...")
      process.terminate()
      sys.exit(0)


if __name__ == "__main__":
  main("python min_max.py")


# import os
# import sys
# import time
# import subprocess


# def get_last_modified_dict(path: str) -> dict:
#     """
#     returns the dict object containing filename and last modified time
#     """
#     data = os.walk(path)
#     return_data = dict()
#     for root, _, files in data:
#         for file in files:
#             file = os.path.join(root, file)
#             return_data[file] = os.stat(file).st_mtime
#     return return_data


# def get_unique_data(old_dict: dict, new_dict: dict) -> dict:
#     """
#     returns the dict object that contains new files , changed files, deleted files by comparing
#     two arguments that contains last modified time
#     """
#     return_data = {"changed": [], "new": [], "deleted": []}
#     if old_dict != new_dict:
#         return_data["changed"] = [
#             file
#             for file in set(old_dict.keys()).intersection(set(new_dict.keys()))
#             if old_dict[file] != new_dict[file]
#         ]
#         return_data["new"] = list(set(new_dict.keys()).difference(set(old_dict.keys())))
#         return_data["deleted"] = list(set(old_dict.keys()).difference(set(new_dict.keys())))

#     return return_data


# def main(command: str, watchdir: str = "./"):
#     """
#     the main method
#     """
#     print("File-change monitor is live")
#     print("command to exec : %s" % (command))

#     print("\nexecuting %s\n" % (command))
#     process = subprocess.Popen(command.split())
#     current_data = get_last_modified_dict(watchdir)

#     while True:
#         try:
#             new_data = get_last_modified_dict(watchdir)
#             if new_data != current_data:
#                 print("terminating last process")
#                 process.terminate()

#                 unique_data = get_unique_data(current_data, new_data)

#                 if unique_data["changed"]:
#                     print("changed files :", ",".join(unique_data["changed"]))
#                 if unique_data["new"]:
#                     print("new files :", ",".join(unique_data["new"]))
#                 if unique_data["deleted"]:
#                     print("deleted files :", ",".join(unique_data["deleted"]))

#                 current_data = new_data
#                 print("\nexecuting : %s\n" % (command))
#                 process = subprocess.Popen(command.split())

#             time.sleep(1)
#         except KeyboardInterrupt:
#             print("Keyboard interrupt received...")
#             process.terminate()
#             sys.exit(0)


# main("python min_max.py")
