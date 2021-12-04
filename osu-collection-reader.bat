@echo off
rem chcp 65001


cd "C:\Program Files\nodejs\"

set NODE_OPTIONS=--max-old-space-size=8192

:start

node osu-collection-reader.js

pause
