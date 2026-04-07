param(
  [switch]$Overwrite,
  [int]$TimeoutSec = 90
)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$manifestPath = Join-Path $scriptDir 'image-manifest.md'

$items = @(
  @{ Stone = 'Atlantis'; Code = 'PV1016'; File = '2026-04-05-PV1016-reference.jpg'; Url = 'https://acstone.com.au/wp-content/uploads/2025/03/AC1016-0-0-1-1.jpg' },
  @{ Stone = 'Dolomite'; Code = 'PV6010'; File = '2026-04-05-PV6010-reference.jpg'; Url = 'https://acstone.com.au/wp-content/uploads/2024/10/AC6010-0-1-1.jpg' },
  @{ Stone = 'Magma Gold'; Code = 'PV1015'; File = '2026-04-05-PV1015-reference.jpg'; Url = 'https://acstone.com.au/wp-content/uploads/2025/03/AC1015-0-1-2.jpg' },
  @{ Stone = 'Amazonite'; Code = 'PV1017'; File = '2026-04-05-PV1017-reference.jpg'; Url = 'https://acstone.com.au/wp-content/uploads/2025/03/AC1017-0-0-1-2.jpg' },
  @{ Stone = 'Opal'; Code = 'PV0806'; File = '2026-04-05-PV0806-reference.jpg'; Url = 'https://acstone.com.au/wp-content/uploads/2020/10/AC0806N.jpg' }
)

$requestHeaders = @{
  'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
  'Accept' = 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
  'Referer' = 'https://acstone.com.au/'
}

function Get-HeaderValue {
  param(
    $Headers,
    [string]$Name
  )

  if (-not $Headers) {
    return ''
  }

  $value = $Headers[$Name]
  if ($null -eq $value) {
    return ''
  }

  if ($value -is [System.Collections.IEnumerable] -and -not ($value -is [string])) {
    return [string]($value | Select-Object -First 1)
  }

  return [string]$value
}

function Get-ImageFormatFromBytes {
  param([byte[]]$Bytes)

  if (-not $Bytes -or $Bytes.Length -lt 12) {
    return ''
  }

  if ($Bytes[0] -eq 0xFF -and $Bytes[1] -eq 0xD8 -and $Bytes[2] -eq 0xFF) {
    return 'jpeg'
  }

  if (
    $Bytes[0] -eq 0x89 -and $Bytes[1] -eq 0x50 -and $Bytes[2] -eq 0x4E -and
    $Bytes[3] -eq 0x47 -and $Bytes[4] -eq 0x0D -and $Bytes[5] -eq 0x0A -and
    $Bytes[6] -eq 0x1A -and $Bytes[7] -eq 0x0A
  ) {
    return 'png'
  }

  if (
    $Bytes[0] -eq 0x47 -and $Bytes[1] -eq 0x49 -and $Bytes[2] -eq 0x46 -and
    $Bytes[3] -eq 0x38
  ) {
    return 'gif'
  }

  if (
    $Bytes[0] -eq 0x52 -and $Bytes[1] -eq 0x49 -and $Bytes[2] -eq 0x46 -and $Bytes[3] -eq 0x46 -and
    $Bytes[8] -eq 0x57 -and $Bytes[9] -eq 0x45 -and $Bytes[10] -eq 0x42 -and $Bytes[11] -eq 0x50
  ) {
    return 'webp'
  }

  return ''
}

function Test-IsHtmlPayload {
  param([byte[]]$Bytes)

  if (-not $Bytes -or $Bytes.Length -eq 0) {
    return $false
  }

  $sampleLength = [Math]::Min($Bytes.Length, 512)
  $sampleText = [System.Text.Encoding]::UTF8.GetString($Bytes, 0, $sampleLength).ToLowerInvariant()

  return (
    $sampleText.Contains('<!doctype html') -or
    $sampleText.Contains('<html') -or
    $sampleText.Contains('<head') -or
    $sampleText.Contains('<body') -or
    $sampleText.Contains('<script')
  )
}

function Test-DownloadedImage {
  param(
    [string]$Path,
    [string]$ContentType = '',
    [switch]$RequireJpeg
  )

  if (-not (Test-Path $Path)) {
    return [PSCustomObject]@{
      IsValid = $false
      Reason = 'file does not exist'
      Format = ''
      SizeKB = 0
    }
  }

  $bytes = [System.IO.File]::ReadAllBytes($Path)
  $size = $bytes.Length

  if ($size -lt 1024) {
    return [PSCustomObject]@{
      IsValid = $false
      Reason = 'file is too small (< 1KB)'
      Format = ''
      SizeKB = [Math]::Round($size / 1KB, 1)
    }
  }

  if (Test-IsHtmlPayload -Bytes $bytes) {
    return [PSCustomObject]@{
      IsValid = $false
      Reason = 'payload looks like HTML, not an image'
      Format = ''
      SizeKB = [Math]::Round($size / 1KB, 1)
    }
  }

  $format = Get-ImageFormatFromBytes -Bytes $bytes
  if (-not $format) {
    return [PSCustomObject]@{
      IsValid = $false
      Reason = 'unknown image signature (magic bytes)'
      Format = ''
      SizeKB = [Math]::Round($size / 1KB, 1)
    }
  }

  if ($RequireJpeg -and $format -ne 'jpeg') {
    return [PSCustomObject]@{
      IsValid = $false
      Reason = "detected '$format' but filename requires .jpg"
      Format = $format
      SizeKB = [Math]::Round($size / 1KB, 1)
    }
  }

  if ($ContentType) {
    $normalizedType = $ContentType.ToLowerInvariant()
    if (-not $normalizedType.StartsWith('image/')) {
      return [PSCustomObject]@{
        IsValid = $false
        Reason = "unexpected content-type '$ContentType'"
        Format = $format
        SizeKB = [Math]::Round($size / 1KB, 1)
      }
    }
  }

  return [PSCustomObject]@{
    IsValid = $true
    Reason = 'ok'
    Format = $format
    SizeKB = [Math]::Round($size / 1KB, 1)
  }
}

function Escape-MarkdownCell {
  param([string]$Value)

  if ($null -eq $Value) {
    return ''
  }

  return $Value.Replace('|', '\|').Replace("`r", ' ').Replace("`n", ' ')
}

function Write-Manifest {
  param(
    [string]$ManifestPath,
    [System.Collections.IEnumerable]$Rows
  )

  $lines = @(
    '# Image Manifest - Stone Reference Downloads',
    '',
    "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm')",
    'Purpose: Local reference images for AI prompt attachment accuracy.',
    '',
    '| Stone | Stone Code | Source URL | Local Path | Status |',
    '| --- | --- | --- | --- | --- |'
  )

  foreach ($row in $Rows) {
    $stone = Escape-MarkdownCell -Value $row.Stone
    $code = Escape-MarkdownCell -Value $row.Code
    $url = Escape-MarkdownCell -Value $row.SourceUrl
    $localPath = Escape-MarkdownCell -Value $row.LocalPath
    $status = Escape-MarkdownCell -Value $row.Status

    $lines += "| $stone | $code | $url | $localPath | $status |"
  }

  $lines += @(
    '',
    '## Download Command',
    '',
    'From repository root, run:',
    '',
    '```powershell',
    'powershell -ExecutionPolicy Bypass -File docs/image_temp/download-reference-images.ps1',
    '```',
    '',
    'To refresh existing files:',
    '',
    '```powershell',
    'powershell -ExecutionPolicy Bypass -File docs/image_temp/download-reference-images.ps1 -Overwrite',
    '```'
  )

  Set-Content -Path $ManifestPath -Value $lines -Encoding UTF8
}

Write-Host "Downloading reference images to: $scriptDir"

$downloaded = 0
$kept = 0
$failed = 0
$results = New-Object System.Collections.Generic.List[object]

foreach ($item in $items) {
  $outPath = Join-Path $scriptDir $item.File
  $tempPath = "$outPath.part"
  $localPath = "docs/image_temp/$($item.File)"

  try {
    if ((Test-Path $outPath) -and -not $Overwrite) {
      $existingValidation = Test-DownloadedImage -Path $outPath -RequireJpeg
      if ($existingValidation.IsValid) {
        Write-Host "SKIP  $($item.Code) -> $($item.File) (already exists, valid $($existingValidation.Format))"
        $kept++

        $results.Add([PSCustomObject]@{
            Stone = $item.Stone
            Code = $item.Code
            SourceUrl = $item.Url
            LocalPath = $localPath
            Status = "kept existing ($($existingValidation.Format), $($existingValidation.SizeKB) KB)"
          })
        continue
      }

      Write-Warning "Existing file failed validation and will be re-downloaded: $($item.File) ($($existingValidation.Reason))"
      Remove-Item -Path $outPath -Force
    }

    if (Test-Path $tempPath) {
      Remove-Item -Path $tempPath -Force
    }

    if ($item.File -notmatch '^\d{4}-\d{2}-\d{2}-[A-Za-z0-9]+-reference\.jpg$') {
      throw "Filename '$($item.File)' does not match required pattern YYYY-MM-DD-[STONE_CODE]-reference.jpg"
    }

    Write-Host "GET   $($item.Code) -> $($item.File)"
    $requestParams = @{
      Uri = $item.Url
      Headers = $requestHeaders
      OutFile = $tempPath
      MaximumRedirection = 10
      TimeoutSec = $TimeoutSec
      PassThru = $true
    }
    $response = Invoke-WebRequest @requestParams

    $contentType = Get-HeaderValue -Headers $response.Headers -Name 'Content-Type'
    $validation = Test-DownloadedImage -Path $tempPath -ContentType $contentType -RequireJpeg

    if (-not $validation.IsValid) {
      throw "Invalid image for $($item.Code): $($validation.Reason)"
    }

    if (Test-Path $outPath) {
      Remove-Item -Path $outPath -Force
    }

    Move-Item -Path $tempPath -Destination $outPath -Force

    Write-Host "OK    $($item.Code) ($($validation.Format), $($validation.SizeKB) KB)"
    $downloaded++

    $results.Add([PSCustomObject]@{
        Stone = $item.Stone
        Code = $item.Code
        SourceUrl = $item.Url
        LocalPath = $localPath
        Status = "downloaded ($($validation.Format), $($validation.SizeKB) KB)"
      })
  }
  catch {
    if (Test-Path $tempPath) {
      Remove-Item -Path $tempPath -Force
    }

    $failed++
    $errorMessage = $_.Exception.Message
    Write-Host "FAIL  $($item.Code) -> $($item.File): $errorMessage"

    $results.Add([PSCustomObject]@{
        Stone = $item.Stone
        Code = $item.Code
        SourceUrl = $item.Url
        LocalPath = $localPath
        Status = "failed ($errorMessage)"
      })
  }
}

Write-Manifest -ManifestPath $manifestPath -Rows $results

Write-Host ''
Write-Host "Manifest updated: $manifestPath"
Write-Host "Done. Downloaded: $downloaded | Kept: $kept | Failed: $failed"

if ($failed -gt 0) {
  throw "Reference image download failed for $failed item(s). Fix failed rows in image-manifest.md before moving to prompt generation."
}

Write-Host 'All reference images validated successfully. You can proceed to prompt generation.'
