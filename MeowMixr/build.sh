#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"

echo "//+++++++++++++++++++++++++++++++++++$1 `git rev-parse HEAD`+++++++++++++++++++++++++++++++++++" > $SCRIPT_DIR/build/$1.txt
cat $1/* >> $SCRIPT_DIR/build/$1.txt
echo "//-----------------------------------$1 `git rev-parse HEAD`-----------------------------------" >> $SCRIPT_DIR/build/$1.txt
