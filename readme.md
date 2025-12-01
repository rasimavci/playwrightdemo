# training codes for playwright

## commands

npx playwright test HomePageTest --headed

npx playwright test example --headed

### Run a set of test files
npx playwright test tests/todo-page/ tests/landing-page/


### Run tests for a specific project
npx playwright test --project=chromium

npx playwright show-report

npx playwright test --ui

npx playwright --version

## trace viewer

npx playwright show-trace path/to/trace.zip

# Codegen

## Running Codegen

npx playwright codegen



# .NET
## install
dotnet new mstest -n PlaywrightTests
cd PlaywrightTests

## install dependenciees

dotnet add package Microsoft.Playwright.MSTest

## build
dotnet build

## install browsers
pwsh bin/Debug/net8.0/playwright.ps1 install

## Run
pwsh bin/Debug/net8.0/playwright.ps1 codegen demo.playwright.dev/todomvc


