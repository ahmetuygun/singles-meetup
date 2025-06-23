param(
    [string[]]$Urls = @(
        "https://gotrumeet.com",
        "https://auth.gotrumeet.com/realms/jhipster/protocol/openid-connect/certs",
        "https://gotrumeet.com/api/account"
    ),
    [int]$IntervalSeconds = 3,
    [string]$LogFile = "advanced-health-check.log",
    [int]$TimeoutSeconds = 10
)

Write-Host "🚀 Starting advanced health check..." -ForegroundColor Cyan
Write-Host "📍 Monitoring URLs:" -ForegroundColor Cyan
foreach ($url in $Urls) {
    Write-Host "   • $url" -ForegroundColor Gray
}
Write-Host "⏱️  Check interval: $IntervalSeconds seconds" -ForegroundColor Cyan
Write-Host "📝 Log file: $LogFile" -ForegroundColor Cyan
Write-Host "🛑 Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Initialize counters
$script:totalChecks = 0
$script:successfulChecks = 0
$script:failedChecks = 0

function Test-UrlHealth {
    param([string]$Url)
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec $TimeoutSeconds -UseBasicParsing
        $stopwatch.Stop()
        
        $responseTime = $stopwatch.ElapsedMilliseconds
        $statusCode = $response.StatusCode
        
        return @{
            Success = $true
            StatusCode = $statusCode
            ResponseTime = $responseTime
            Error = $null
        }
    } catch {
        return @{
            Success = $false
            StatusCode = $null
            ResponseTime = $null
            Error = $_.Exception.Message
        }
    }
}

function Show-HealthSummary {
    $uptime = if ($script:totalChecks -gt 0) { 
        [math]::Round(($script:successfulChecks / $script:totalChecks) * 100, 2) 
    } else { 
        0 
    }
    
    Write-Host "`n📊 Health Summary:" -ForegroundColor Cyan
    Write-Host "   Total Checks: $($script:totalChecks)" -ForegroundColor Gray
    Write-Host "   Successful: $($script:successfulChecks)" -ForegroundColor Green
    Write-Host "   Failed: $($script:failedChecks)" -ForegroundColor Red
    Write-Host "   Uptime: $uptime%" -ForegroundColor $(if ($uptime -ge 95) { "Green" } elseif ($uptime -ge 90) { "Yellow" } else { "Red" })
}

# Handle Ctrl+C gracefully
Register-EngineEvent PowerShell.Exiting -Action {
    Show-HealthSummary
}

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $allHealthy = $true
    
    foreach ($url in $Urls) {
        $script:totalChecks++
        $result = Test-UrlHealth -Url $url
        
        if ($result.Success) {
            $script:successfulChecks++
            $status = "✅ UP"
            $color = "Green"
            $details = "Status: $($result.StatusCode) | Response: $($result.ResponseTime)ms"
        } else {
            $script:failedChecks++
            $allHealthy = $false
            $status = "❌ DOWN"
            $color = "Red"
            $details = "Error: $($result.Error)"
        }
        
        $shortUrl = $url -replace "https://", ""
        $message = "$timestamp - $status - $shortUrl - $details"
        
        Write-Host $message -ForegroundColor $color
        Add-Content -Path $LogFile -Value $message
    }
    
    # Show overall status
    if ($allHealthy) {
        Write-Host "$timestamp - 🟢 ALL SYSTEMS OPERATIONAL" -ForegroundColor Green -BackgroundColor DarkGreen
    } else {
        Write-Host "$timestamp - 🔴 SOME SYSTEMS DOWN" -ForegroundColor White -BackgroundColor Red
    }
    
    Write-Host ("-" * 80) -ForegroundColor DarkGray
    
    Start-Sleep -Seconds $IntervalSeconds
} 