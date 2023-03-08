from math import floor


def scale_ticks(oldPPQ: int, newPPQ: int, ticks: int) -> int:
    res = floor((newPPQ / oldPPQ) * ticks)
    return res
