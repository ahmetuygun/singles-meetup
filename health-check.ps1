param(
    [string]$Url = "https://gotrumeet.com",
    [int]$IntervalSeconds = 3,
    [string]$LogFile = "health-check.log"
)

Write-Host "Starting health check for $Url every $IntervalSeconds seconds..."
Write-Host "Logs will be written to: $LogFile"
Write-Host "Press Ctrl+C to stop"
Write-Host ""

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    try {
        # Make HTTP request with timeout
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 10 -UseBasicParsing
        $statusCode = $response.StatusCode
        $responseTime = $response.Headers.'X-Response-Time'
        
        if ($statusCode -eq 200) {
            $status = "✅ UP"
            $color = "Green"
        } else {
            $status = "⚠️  WARNING"
            $color = "Yellow"
        }
        
        $message = "$timestamp - $status - Status: $statusCode - URL: $Url"
        Write-Host $message -ForegroundColor $color
        
        # Log to file
        Add-Content -Path $LogFile -Value $message
        
    } catch {
        $status = "❌ DOWN"
        $error = $_.Exception.Message
        $message = "$timestamp - $status - Error: $error - URL: $Url"
        
        Write-Host $message -ForegroundColor Red
        Add-Content -Path $LogFile -Value $message
    }
    
    Start-Sleep -Seconds $IntervalSeconds
} 