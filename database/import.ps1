param(
  [string]$MysqlPath = "C:\Program Files\MariaDB 12.1\bin\mysql.exe",
  [string]$User = "root",
  [string]$HostName = "localhost"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Test-Path -LiteralPath $MysqlPath)) {
  throw "Client MySQL/MariaDB introuvable: $MysqlPath"
}

$files = @(
  "schema.sql",
  "create-user.sql",
  "seed.sql"
)

foreach ($file in $files) {
  $path = Join-Path $root $file
  Write-Host "Import: $file"
  & $MysqlPath -h $HostName -u $User -p --default-character-set=utf8mb4 --binary-mode=1 -e "source $($path.Replace('\', '/'))"

  if ($LASTEXITCODE -ne 0) {
    throw "Echec import: $file"
  }
}

Write-Host "Base cbca_annuaire importee avec succes."
