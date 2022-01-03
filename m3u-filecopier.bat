@echo off
rem chcp 65001


cd "C:\Program Files\nodejs\"

set NODE_OPTIONS=--max-old-space-size=8192

:start

node m3u-filecopier.js

pause
