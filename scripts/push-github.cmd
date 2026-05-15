@echo off
cd /d "%~dp0.."
echo === PUSH START %DATE% %TIME% === > push-log.txt
git status >> push-log.txt 2>&1
git remote -v >> push-log.txt 2>&1
git branch -v >> push-log.txt 2>&1
git push -u origin main >> push-log.txt 2>&1
echo EXIT_CODE=%ERRORLEVEL% >> push-log.txt
echo === PUSH END === >> push-log.txt
