param(
    [string]$DeploymentName = "tacklebox-frontend-deployment"
)

chcp 65001 | Out-Null

# 1. Point to a frontend log folder
$logDir = Join-Path $PSScriptRoot "frontend_logs"
$combinedPath = Join-Path $logDir "combined.log"
$errorPath = Join-Path $logDir "error.log"

if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

Write-Host "🎨 Tacklebox Frontend Log Streamer Active!" -ForegroundColor Magenta

# 2. Target your frontend Kubernetes deployment name instead!
kubectl logs deployment/$DeploymentName -f | ForEach-Object {
    $line = $_
    Add-Content -Path $combinedPath -Value $line -Encoding UTF8
    
    # 3. Adjust matching if your frontend uses a different error keyword (like 'stderr' or 'Exception')
    if ($line -match 'error' -or $line -match 'failed') {
        Add-Content -Path $errorPath -Value $line -Encoding UTF8
    }
    
    $_
}