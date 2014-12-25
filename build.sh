#!/bin/bash

echo "//+++++++++++++++++++++++++++++++++++JSUtil `git rev-parse HEAD`+++++++++++++++++++++++++++++++++++" > build/all.js
cat src/* >> build/all.js
echo "//-----------------------------------JSUtil `git rev-parse HEAD`-----------------------------------" >> build/all.js
