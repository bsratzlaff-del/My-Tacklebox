param(
    [string]$DeploymentName = "tacklebox-deployment"
)

# Force the terminal window to support UTF-8 Emojis
chcp 65001 | Out-Null

# Define paths relative to where this script is running
$logDir = Join-Path $PSScriptRoot "backend_logs"
$combinedPath = Join-Path $logDir "combined.log"
$errorPath = Join-Path $logDir "error.log"

# Automatically create the backend_logs directory if it got deleted
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

Write-Host "🎣 Tacklebox Log Streamer Active!" -ForegroundColor Cyan
Write-Host "📝 Writing to: $logDir" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop streaming.`n"

# Stream and sort the logs live
kubectl logs deployment/$DeploymentName -f | ForEach-Object {
    $line = $_
    
    # 1. Write to combined log
    Add-Content -Path $combinedPath -Value $line -Encoding UTF8
    
    # 2. Extract errors dynamically
    if ($line -match 'error') {
        Add-Content -Path $errorPath -Value $line -Encoding UTF8
    }
    
    # 3. Output to terminal
    $line
}