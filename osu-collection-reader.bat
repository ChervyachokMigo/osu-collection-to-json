@echo off
rem chcp 65001

call npm install fs
call npm install path
call npm install lodash
call npm install sanitize-filename

set NODE_OPTIONS=--max-old-space-size=8192

:start

"%programfiles%\nodejs\node" "osu-collection-reader.js"

pause
