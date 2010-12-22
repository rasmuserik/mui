./biggerrun.sh && 
    git diff &&
    sleep 10 &&
    git add commit.sh lightscript.ls lightscript.py run.sh stdlib.js stdlib.py biggerrun.sh && 
    git commit -m "lightscript2: $*"
