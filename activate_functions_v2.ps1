
$functions = @(
    "github-logger",
    "process-payment",
    "webhook-handler",
    "create-checkout-session",
    "send-email",
    "693f9fe5002d6f4a065b",
    "send-sms",
    "check-subscription-expiry",
    "expire-listings"
)

foreach ($func in $functions) {
    Write-Host "Checking function: $func"
    try {
        # Get function details in JSON format
        $functionJson = appwrite functions get --function-id $func --json
        
        if (-not $functionJson) {
            Write-Host "No details found for $func"
            continue
        }

        # Parse JSON
        $functionDetails = $functionJson | ConvertFrom-Json

        $latestId = $functionDetails.latestDeploymentId
        $latestStatus = $functionDetails.latestDeploymentStatus
        $currentDeploymentId = $functionDetails.deploymentId

        Write-Host "Latest Deployment: $latestId (Status: $latestStatus)"
        Write-Host "Current Active Deployment: $currentDeploymentId"

        if ($latestStatus -eq 'ready') {
            if ($currentDeploymentId -ne $latestId) {
                Write-Host "Activating latest deployment $latestId..."
                appwrite functions update-function-deployment --function-id $func --deployment-id $latestId
                Write-Host "Activated."
            } else {
                Write-Host "Latest deployment is already active."
            }
        } else {
            Write-Host "Latest deployment is not ready (Status: $latestStatus). Skipping."
        }
    } catch {
        Write-Host "Error processing $func : $_"
    }
    Write-Host "--------------------------------"
}
