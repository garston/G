#!/bin/bash

MINUSES='--------------------------------------'
PLUSES='++++++++++++++++++++++++++++++++++++++'
SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"

echo "//$PLUSES `git rev-parse HEAD` $PLUSES" > $SCRIPT_DIR/bundle.txt

for projectName in "$@"
do
    echo "Building $projectName"
    echo "//$PLUSES $projectName $PLUSES" >> $SCRIPT_DIR/bundle.txt
    cat $projectName/* >> $SCRIPT_DIR/bundle.txt
    echo "//$MINUSES $projectName $MINUSES" >> $SCRIPT_DIR/bundle.txt
done

echo "//$MINUSES `git rev-parse HEAD` $MINUSES" >> $SCRIPT_DIR/bundle.txt
