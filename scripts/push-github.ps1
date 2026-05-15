$ErrorActionPreference = "Continue"
$log = Join-Path $PSScriptRoot "..\push-log.txt"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")

function Log($msg) {
  $line = "[$(Get-Date -Format 'HH:mm:ss')] $msg"
  Add-Content -Path $log -Value $line
  Write-Host $line
}

Set-Location $root
"" | Set-Content $log

Log "cwd: $root"

if (-not (Test-Path .git)) {
  git init 2>&1 | ForEach-Object { Log $_ }
}

$branch = git branch --show-current 2>&1
Log "branch before: $branch"
if (-not $branch -or $branch -match "fatal") {
  git checkout -b main 2>&1 | ForEach-Object { Log $_ }
}
if ((git branch --show-current) -eq "master") {
  git branch -M main 2>&1 | ForEach-Object { Log $_ }
}

$remotes = git remote 2>&1
if ($remotes -notcontains "origin") {
  git remote add origin https://github.com/MikeZay1/CourseFront2.git 2>&1 | ForEach-Object { Log $_ }
} else {
  git remote set-url origin https://github.com/MikeZay1/CourseFront2.git 2>&1 | ForEach-Object { Log $_ }
}
git remote -v 2>&1 | ForEach-Object { Log $_ }

git add -A 2>&1 | ForEach-Object { Log $_ }
$porcelain = git status --porcelain 2>&1
Log "status: $porcelain"
if ($porcelain) {
  git commit -m "Initial commit: TutorSpace SPA (React, TypeScript, API integration)" 2>&1 | ForEach-Object { Log $_ }
}

git fetch origin main 2>&1 | ForEach-Object { Log $_ }
$hasMain = git ls-remote --heads origin main 2>&1
Log "remote main: $hasMain"
if ($hasMain -and $hasMain -notmatch "fatal") {
  git pull --rebase origin main 2>&1 | ForEach-Object { Log $_ }
}

git push -u origin main 2>&1 | ForEach-Object { Log $_ }
Log "exit push: $LASTEXITCODE"
Log "DONE"
