$dirs = @(
  "src\api",
  "src\components\ui",
  "src\components\layout",
  "src\components\customers",
  "src\components\inventory",
  "src\components\pos",
  "src\components\products",
  "src\components\reports",
  "src\data",
  "src\hooks",
  "src\layouts",
  "src\lib",
  "src\pages\auth",
  "src\routes",
  "src\services",
  "src\stores",
  "src\test"
)

foreach ($dir in $dirs) {
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  Write-Host "Created: $dir"
}
Write-Host "All folders created successfully."
