#!/bin/sh
cd /c/Users/zengv/Desktop/node-blog/blog-1/logs
cp access.log $(date +%Y-%m-%d).access.log
echo "" > access.log