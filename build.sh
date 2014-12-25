#!/bin/bash

(cd ../JSUtil && ./build.sh) && cat ../JSUtil/build/all.js src/* > build/all.js
