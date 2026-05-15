# Пуш в https://github.com/MikeZay1/CourseFront2
# Запуск: powershell -ExecutionPolicy Bypass -File .\scripts\push-github.ps1

$ErrorActionPreference = "Continue"
Set-Location (Resolve-Path (Join-Path $PSScriptRoot ".."))

Write-Host "=== TutorSpace -> CourseFront2 ===" -ForegroundColor Cyan

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git не найден. Установите Git for Windows." -ForegroundColor Red
  exit 1
}

if (-not (Test-Path .git)) {
  git init
  git branch -M main
}

$remoteUrl = "https://github.com/MikeZay1/CourseFront2.git"
if ((git remote) -contains "origin") {
  git remote set-url origin $remoteUrl
} else {
  git remote add origin $remoteUrl
}

# gh — самый простой способ обойти 403 на Windows
if (Get-Command gh -ErrorAction SilentlyContinue) {
  $auth = gh auth status 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Войдите в GitHub (исправляет 403):" -ForegroundColor Yellow
    gh auth login
  }
  gh auth setup-git 2>&1 | Out-Null
} else {
  Write-Host "Рекомендуется: winget install GitHub.cli  затем gh auth login" -ForegroundColor Yellow
  Write-Host "Или PAT: https://github.com/settings/tokens (scope: repo)" -ForegroundColor Yellow
}

git add -A
$dirty = git status --porcelain
if ($dirty) {
  git commit -m "Update: API integration, local media, lesson cards without cover images"
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка commit. Проверьте: git config user.name и user.email" -ForegroundColor Red
    exit 1
  }
} else {
  Write-Host "Нет новых изменений для commit." -ForegroundColor Gray
}

$hasRemoteMain = $false
try {
  git ls-remote --heads origin main 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) { $hasRemoteMain = $true }
} catch { }

if ($hasRemoteMain) {
  git pull --rebase origin main
}

Write-Host "Отправка на origin main..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
  Write-Host "Готово: https://github.com/MikeZay1/CourseFront2" -ForegroundColor Green
} else {
  Write-Host "Push не удался. Частая причина — 403: неверный токен в Credential Manager." -ForegroundColor Red
  Write-Host "Удалите git:https://github.com в Диспетчере учётных данных и повторите gh auth login" -ForegroundColor Yellow
  exit 1
}
