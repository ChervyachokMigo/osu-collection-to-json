@echo off
rem chcp 65001

rem call npm install fs
rem call npm install path
rem call npm install lodash
rem call npm install sanitize-filename

set NODE_OPTIONS=--max-old-space-size=8192

:start

"%programfiles%\nodejs\node" "osu-collection-reader.js"

pause
