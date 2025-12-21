
$functions = @(
    "github-logger",
    "process-payment",
    "webhook-handler",
    "create-checkout-session",
    "send-email",
    "generate-pdf",
    "send-sms",
    "check-subscription-expiry",
    "expire-listings"
)

foreach ($func in $functions) {
    Write-Host "Checking function: $func"
    try {
        # Get deployments in JSON format
        $deploymentsJson = appwrite functions list-deployments --function-id $func --json
        
        if (-not $deploymentsJson) {
            Write-Host "No deployments found for $func"
            continue
        }

        # Parse JSON
        $deployments = $deploymentsJson | ConvertFrom-Json

        if (-not $deployments.deployments) {
            Write-Host "No deployments list in response for $func"
            continue
        }

        # Filter for ready deployments and sort by createdAt descending (though API usually returns sorted, let's be safe)
        # Actually API returns oldest first? The JSON showed latest at the end.
        # Let's sort descending by createdAt
        $latestReady = $deployments.deployments | Where-Object { $_.status -eq 'ready' } | Sort-Object -Property '$createdAt' -Descending | Select-Object -First 1

        if ($latestReady) {
            $id = $latestReady.'$id'
            $isActive = $latestReady.activate
            Write-Host "Latest ready deployment for $func is $id (Active: $isActive)"

            if (-not $isActive) {
                Write-Host "Activating deployment $id for $func..."
                appwrite functions update-function-deployment --function-id $func --deployment-id $id
                Write-Host "Activated."
            } else {
                Write-Host "Deployment $id is already active."
            }
        } else {
            Write-Host "No ready deployments found for $func"
        }
    } catch {
        Write-Host "Error processing $func : $_"
    }
    Write-Host "--------------------------------"
}
