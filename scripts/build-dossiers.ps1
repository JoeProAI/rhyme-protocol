# Regenerates lib/dossiers/index.ts from all .md files in lib/dossiers/.
# Run after editing any dossier markdown.
#
# Usage (from rhyme-protocol root):
#   pwsh ./scripts/build-dossiers.ps1
#   # or
#   powershell -ExecutionPolicy Bypass -File ./scripts/build-dossiers.ps1

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$dossierDir = Join-Path $root 'lib/dossiers'
$outFile = Join-Path $dossierDir 'index.ts'

$mdFiles = Get-ChildItem -Path $dossierDir -Filter '*.md' -File
if ($mdFiles.Count -eq 0) {
  Write-Host "No .md dossiers found at $dossierDir"
  exit 0
}

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('// AUTO-GENERATED from lib/dossiers/*.md. Do not edit by hand.')
[void]$sb.AppendLine('// Regenerate by running scripts/build-dossiers.ps1 after editing the .md files.')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('export const DOSSIERS: Record<string, string> = {')

foreach ($f in $mdFiles) {
  $slug = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
  $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
  $md = [System.Text.Encoding]::UTF8.GetString($bytes)
  # Strip residual box-drawing artifacts.
  $md = $md -replace '[\u2500-\u257F\u2580-\u259F]+\r?\n?', ''
  $md = $md.Trim()
  $escaped = $md.Replace('\','\\').Replace('`','\`').Replace('$','`$')
  [void]$sb.AppendLine("  '$slug': ``$escaped``,")
  Write-Host "  baked: $slug ($($md.Length) chars)"
}

[void]$sb.AppendLine('}')

[System.IO.File]::WriteAllText($outFile, $sb.ToString(), (New-Object System.Text.UTF8Encoding $false))
Write-Host "wrote $outFile ($((Get-Item $outFile).Length) bytes)"
