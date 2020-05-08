#! C:/Python27/python.exe
import json
import sys

def print_json(data):
    print(json.dumps(data, sort_keys=True, indent=4, separators=(', ', ': '), ensure_ascii=False))
    sys.exit()


if __name__ == '__main__':
    data = {
        "testData": {
            "data":
                {
                    "bbb": ['1112', '2223', '3334', {"5454": "2323"}],
                    "ccc": "python&electron",
                    "ddd": "wyne1986 19923671685"
                }
        }
    }

    print_json(data)