#!/bin/bash
echo "init new build"
npm run build
echo 'remove old build'
rm -rf ../../builds/website_acioli/build
echo 'create new build'
cp -rf build/ ../../builds/website_acioli/build
echo 'end'