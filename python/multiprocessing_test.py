from typing import List, Tuple
import multiprocessing
import time
import os

# empty list with global scope
result = []


# def square_list(mylist):
#   """
#   function to square a given list
#   """
#   #   global result
#   result = []
#   print(f"Process {os.getpid()},  is running\n")
#   # append squares of mylist to global list result
#   for num in mylist:
#     result.append(num * num)
#   # print global list result
#   print("Result(in process p1): {}".format(result))
#   return result


# def worker(queue, input_data):
#   result = square_list(input_data)
#   queue.put(result)


# if __name__ == "__main__":
#   # input list
#   mylist = [1, 2, 3, 4]
#   b = [1, 3, 3, 4]
#   c = [1, 0, 3, 4]
#   d = [1, 1, 3, 4]

#   # creating new process
#   queue = multiprocessing.Queue()
#   p1 = multiprocessing.Process(target=worker, args=(queue, mylist))
#   p2 = multiprocessing.Process(
#     target=worker,
#     args=(
#       queue,
#       b,
#     ),
#   )
#   p3 = multiprocessing.Process(
#     target=worker,
#     args=(
#       queue,
#       c,
#     ),
#   )
#   p4 = multiprocessing.Process(
#     target=worker,
#     args=(
#       queue,
#       d,
#     ),
#   )
#   # starting process
#   p1.start()
#   p2.start()
#   p3.start()
#   p4.start()
#   # wait until process is finished
#   p1.join()
#   p2.join()
#   p3.join()
#   p4.join()

#   result = queue.get()

#   # print global result list
#   print("Result(in main program): {}".format(result))


import multiprocessing


def square(num, b) -> Tuple[int, List[int]]:
  start_time = time.time()
  print(f"Process {os.getpid()},  is running\n")
  time.sleep(5)
  end_time = time.time()
  print("finished in: ", end_time - start_time)
  num = num + b
  return num * num, [num, num + 1, num + 2]


if __name__ == "__main__":
  start_time = time.time()
  with multiprocessing.Pool() as pool:  # Use a pool of 2 processes
    results = pool.starmap(
      square, [(1, 2), (2, 3), (3, 4), (4, 5), (5, 6), (6, 7), (7, 8), (8, 9)]
    )
    # Wait till all the processes are finished.
    # pool.close()
    # pool.join()
    print("asdfasdfasdf")

    print(f"Results: {results}")

  end_time = time.time()
  print(f"Time taken: {end_time - start_time}")
