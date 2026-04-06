param(
  [switch]$Overwrite
)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$items = @(
  @{ Code = 'PV1016'; File = '2026-04-05-pv1016-reference.jpg'; Url = 'https://acstone.com.au/wp-content/uploads/2025/03/AC1016-0-0-1-1.jpg' },
  @{ Code = 'PV6010'; File = '2026-04-05-pv6010-reference.jpg'; Url = 'https://acstone.com.au/wp-content/uploads/2024/10/AC6010-0-1-1.jpg' },
  @{ Code = 'PV1015'; File = '2026-04-05-pv1015-reference.jpg'; Url = 'https://acstone.com.au/wp-content/uploads/2025/03/AC1015-0-1-2.jpg' },
  @{ Code = 'PV1017'; File = '2026-04-05-pv1017-reference.jpg'; Url = 'https://acstone.com.au/wp-content/uploads/2025/03/AC1017-0-0-1-2.jpg' },
  @{ Code = 'PV0806'; File = '2026-04-05-pv0806-reference.jpg'; Url = 'https://acstone.com.au/wp-content/uploads/2020/10/AC0806N.jpg' }
)

Write-Host "Downloading reference images to: $scriptDir"

$downloaded = 0
$skipped = 0

foreach ($item in $items) {
  $outPath = Join-Path $scriptDir $item.File

  if ((Test-Path $outPath) -and -not $Overwrite) {
    Write-Host "SKIP  $($item.Code) -> $($item.File) (already exists)"
    $skipped++
    continue
  }

  Write-Host "GET   $($item.Code) -> $($item.File)"
  Invoke-WebRequest -Uri $item.Url -OutFile $outPath

  $size = (Get-Item $outPath).Length
  if ($size -le 0) {
    throw "Downloaded file is empty: $outPath"
  }

  $downloaded++
}

Write-Host ""
Write-Host "Done. Downloaded: $downloaded | Skipped: $skipped"
Write-Host "If needed, rerun with -Overwrite to refresh files."
