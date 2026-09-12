$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$toolsPath = Join-Path $repoRoot '.tools'
New-Item -ItemType Directory -Force -Path $toolsPath | Out-Null
$archivePath = Join-Path $toolsPath 'gitleaks.zip'
Invoke-WebRequest -Uri 'https://github.com/gitleaks/gitleaks/releases/download/v8.24.3/gitleaks_8.24.3_windows_x64.zip' -OutFile $archivePath
$actualHash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actualHash -ne '3f1a35578631dbfe633cc5b49e6c906e55ff14a4bfd7336a10fb27fe33b6dcd2') { throw 'Gitleaks checksum mismatch; not executing archive.' }
$releaseZip = [System.IO.Compression.ZipFile]::OpenRead($archivePath)
try {
    $binaryEntry = $releaseZip.GetEntry('gitleaks.exe')
    if ($null -eq $binaryEntry) { throw 'Expected executable missing from release archive.' }
    [System.IO.Compression.ZipFileExtensions]::ExtractToFile($binaryEntry, (Join-Path $toolsPath 'gitleaks.exe'), $true)
} finally { $releaseZip.Dispose() }
Push-Location $repoRoot
try {
    git config --local core.hooksPath .githooks
    if ($LASTEXITCODE -ne 0) { throw 'Could not install local hook setting.' }
    & (Join-Path $toolsPath 'gitleaks.exe') version
    if ($LASTEXITCODE -ne 0) { throw 'Gitleaks did not run.' }
    Write-Output 'Hook installed for this clone. Run the verification commands in SECURITY.md.'
} finally { Pop-Location }
