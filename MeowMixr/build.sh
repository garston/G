#!/bin/bash

REPO_NAME=${PWD##*/}
SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"

echo "//+++++++++++++++++++++++++++++++++++$REPO_NAME `git rev-parse HEAD`+++++++++++++++++++++++++++++++++++" > $SCRIPT_DIR/build/$REPO_NAME.txt
cat * >> $SCRIPT_DIR/build/$REPO_NAME.txt
echo "//-----------------------------------$REPO_NAME `git rev-parse HEAD`-----------------------------------" >> $SCRIPT_DIR/build/$REPO_NAME.txt
