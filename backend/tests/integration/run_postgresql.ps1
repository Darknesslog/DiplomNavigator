# Run migrations and PostgreSQL tests in a unique disposable Compose project.
param([string[]]$TestArguments = @('-v', '--tb=short'))

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path
$pythonExecutable = Join-Path $projectRoot '.venv/Scripts/python.exe'
$testProject = 'diplomnavigator-tests-' + [Guid]::NewGuid().ToString('N').Substring(0, 12)
$previousTestUrl = $env:TEST_DATABASE_URL
$previousTestPort = $env:POSTGRES_TEST_PORT
$resultCode = 1
$composeStarted = $false
Push-Location $projectRoot
try {
    if (-not (Test-Path -LiteralPath $pythonExecutable)) { throw 'Run uv sync first' }
    $env:POSTGRES_TEST_PORT = '0'
    $composeStarted = $true
    docker compose -p $testProject -f docker-compose.test.yml up -d --wait
    if ($LASTEXITCODE -ne 0) { throw 'Could not start the isolated test PostgreSQL' }
    $binding = docker compose -p $testProject -f docker-compose.test.yml port db 5432
    if ($LASTEXITCODE -ne 0 -or $binding -notmatch '^127\.0\.0\.1:(\d+)$') {
        throw 'Could not determine the localhost PostgreSQL port'
    }
    $testPort = $Matches[1]
    $env:TEST_DATABASE_URL = "postgresql+psycopg://postgres:test-only-password@127.0.0.1:${testPort}/diplom_test"
    & $pythonExecutable -m pytest -m postgres @TestArguments
    $resultCode = $LASTEXITCODE
}
finally {
    $env:TEST_DATABASE_URL = $previousTestUrl
    $env:POSTGRES_TEST_PORT = $previousTestPort
    if ($composeStarted) {
        docker compose -p $testProject -f docker-compose.test.yml down --volumes | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-Warning "Could not clean up test project $testProject" }
    }
    Pop-Location
}
exit $resultCode
