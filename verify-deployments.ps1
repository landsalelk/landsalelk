
# Get all functions
$functionsJson = appwrite functions list --json
if (-not $functionsJson) {
    Write-Host "Failed to fetch functions." -ForegroundColor Red
    exit 1
}

$functions = $functionsJson | ConvertFrom-Json

Write-Host "Checking Appwrite Function Deployments..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

foreach ($func in $functions.functions) {
    $funcName = $func.name
    $funcId = $func.'$id'
    $activeDeploymentId = $func.deployment
    
    Write-Host "Function: $funcName ($funcId)" -NoNewline

    # Get deployments for this function (default limit is usually 25, we take the first one)
    $deploymentsJson = appwrite functions list-deployments --function-id $funcId --json
    
    if ($deploymentsJson) {
        $deployments = $deploymentsJson | ConvertFrom-Json
        
        if ($deployments.deployments.Count -gt 0) {
            $latestDeployment = $deployments.deployments[0]
            $latestId = $latestDeployment.'$id'
            $latestStatus = $latestDeployment.status
            $createdAt = $latestDeployment.'$createdAt'

            if ($activeDeploymentId -eq $latestId) {
                 Write-Host " [OK]" -ForegroundColor Green
                 Write-Host "  - Active Deployment: $activeDeploymentId" -ForegroundColor Green
                 Write-Host "  - Created: $createdAt" -ForegroundColor Gray
            } else {
                 Write-Host " [UPDATE AVAILABLE]" -ForegroundColor Yellow
                 Write-Host "  - Active: $activeDeploymentId" -ForegroundColor Yellow
                 Write-Host "  - Latest: $latestId (Status: $latestStatus)" -ForegroundColor Cyan
                 
                 if ($latestStatus -eq "ready") {
                    Write-Host "  - The latest deployment is READY but not active." -ForegroundColor Yellow
                 } elseif ($latestStatus -eq "building") {
                    Write-Host "  - The latest deployment is still BUILDING." -ForegroundColor Magenta
                 }
            }
        } else {
            Write-Host " [NO DEPLOYMENTS]" -ForegroundColor Red
        }
    } else {
        Write-Host " [ERROR FETCHING DEPLOYMENTS]" -ForegroundColor Red
    }
    Write-Host ""
}
