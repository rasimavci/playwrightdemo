# training codes for playwright

## commands

npx playwright test HomePageTest --headed
npx playwright test example --headed

npx playwright show-report

npx playwright test --ui
npx playwright --version

# codegen
## install
dotnet new mstest -n PlaywrightTests
cd PlaywrightTests

## install dependenciees

dotnet add package Microsoft.Playwright.MSTest

## build
dotnet build

## install browsers
pwsh bin/Debug/net8.0/playwright.ps1 install

## Running Codegen

pwsh bin/Debug/net8.0/playwright.ps1 codegen demo.playwright.dev/todomvc