import os
import sys

os.system('spleeter separate -p spleeter:{}stems -o {} {} -c mp3'.format(sys.argv[1], sys.argv[2], sys.argv[3])) 
