#!/bin/bash

echo "//+++++++++++++++++++++++++++++++++LordGarston `git rev-parse HEAD`+++++++++++++++++++++++++++++++++" > build/all.js
(cd ../JSUtil && ./build.sh) && cat ../JSUtil/build/all.js src/* >> build/all.js
echo "//---------------------------------LordGarston `git rev-parse HEAD`---------------------------------" >> build/all.js
