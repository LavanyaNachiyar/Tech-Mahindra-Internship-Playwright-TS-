# OrangeHRM Testing with Playwright

A comprehensive end-to-end testing suite for OrangeHRM using Playwright, covering all major modules and functionalities of the HR management system.

##  Project Overview

This project provides automated testing for the OrangeHRM demo application, covering:
- User authentication and dashboard navigation
- Employee information management (PIM)
- Time tracking and timesheets
- Leave management
- Performance reviews and tracking
- Recruitment processes
- Directory search functionality
- Administrative functions
- Claims management
- System maintenance
- Social features (Buzz)

##  Features

- **Comprehensive Coverage**: Tests all major OrangeHRM modules
- **Cross-browser Testing**: Configured for Microsoft Edge
- **CI/CD Integration**: GitHub Actions workflow for automated testing
- **Detailed Reporting**: HTML reports with trace collection
- **Robust Test Helpers**: Reusable functions for common operations
- **Error Handling**: Fallback mechanisms for flaky UI elements

##  Prerequisites

- Node.js (LTS version)
- npm or yarn package manager
- Microsoft Edge browser

##  Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Playwright
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

##  Running Tests

### Run all tests:
```bash
npx playwright test
```

### Run tests in headed mode:
```bash
npx playwright test --headed
```

### Run specific test file:
```bash
npx playwright test tests/Login.test.ts
```

### Run tests with UI mode:
```bash
npx playwright test --ui
```

##  Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

Reports are automatically generated in the `playwright-report/` directory.

##  Test Structure

### Main Test Suite (`Login.test.ts`)
Comprehensive end-to-end test covering:

1. **Authentication**: Login with admin credentials
2. **Dashboard**: Verify dashboard elements and navigation
3. **My Info**: Personal details and contact information
4. **Time Management**: Timesheet functionality
5. **Leave Management**: Leave assignment processes
6. **Performance**: Employee reviews and trackers
7. **Recruitment**: Candidate and vacancy management
8. **Directory**: Employee search functionality
9. **PIM (Personnel Information Management)**:
   - Employee list management
   - Adding new employees
   - Report generation
10. **Admin Functions**:
    - User management
    - Job and pay grade configuration
    - Organization settings
    - Qualifications and skills
    - Corporate branding
    - Email configuration
11. **Claims Management**:
    - Employee claims processing
    - Claim assignment
    - Configuration management
12. **Maintenance**: System maintenance and data purging
13. **Buzz**: Social platform features

### Example Tests (`example.spec.ts`)
Basic Playwright examples for reference.

##  Configuration

### Playwright Configuration (`playwright.config.ts`)
- **Test Directory**: `./tests`
- **Browser**: Microsoft Edge
- **Parallel Execution**: Enabled
- **Retries**: 2 on CI, 0 locally
- **Reporter**: HTML with trace collection
- **Timeout**: Extended for complex workflows

### Key Configuration Features:
- Trace collection on first retry
- Network idle waiting for stability
- Comprehensive error handling
- Fallback URL navigation for flaky elements

##  CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/playwright.yml`):
- Triggers on push/PR to main/master branches
- Runs on Ubuntu latest
- Installs dependencies and browsers
- Executes all tests
- Uploads test reports as artifacts
- 60-minute timeout for comprehensive testing

##  Test Reliability Features

### Robust Element Selection
- Multiple selector strategies (role, text, xpath)
- Fallback mechanisms for dynamic content
- Wait strategies for loading states

### Error Handling
- URL fallbacks for navigation failures
- Timeout configurations for slow operations
- Graceful degradation for optional elements

### Helper Functions
- `waitForAllVisible()`: Ensures multiple elements are ready
- `byLabelWithin()`: Consistent form field selection
- `openTopbar()`: Reliable dropdown navigation
- `fillAutocompleteAndSelectFirst()`: Autocomplete handling

##  Project Structure

```
Playwright/
├── .github/
│   └── workflows/
│       └── playwright.yml          # CI/CD pipeline
├── playwright-report/              # Test reports
├── test-results/                   # Test execution results
├── tests/
│   ├── Login.test.ts              # Main comprehensive test
│   └── example.spec.ts            # Example tests
├── .gitignore                     # Git ignore rules
├── package.json                   # Project dependencies
├── playwright.config.ts           # Playwright configuration
└── README.MD                      # This file
```

##  Test Coverage

The test suite covers:
-  User authentication
-  Dashboard navigation
-  Employee information management
-  Time and attendance tracking
-  Leave management workflows
-  Performance evaluation system
-  Recruitment processes
-  Directory and search functionality
-  Administrative configurations
-  Claims processing
-  System maintenance operations
-  Social platform features

##  Debugging

### Debug Mode
```bash
npx playwright test --debug
```

### Trace Viewer
```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

### Screenshots and Videos
Automatically captured on test failures in the `test-results/` directory.

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Add or modify tests
4. Ensure all tests pass
5. Submit a pull request

##  Notes

- Tests are designed for the OrangeHRM demo environment
- Default credentials: Username: `Admin`, Password: `admin123`
- Test timeout is set to 240 seconds for comprehensive workflows
- Network idle waiting ensures page stability
- Fallback mechanisms handle UI inconsistencies

##  Troubleshooting

### Common Issues
1. **Browser not found**: Run `npx playwright install`
2. **Test timeouts**: Check network connectivity and increase timeout values
3. **Element not found**: Verify selectors and wait conditions
4. **CI failures**: Check GitHub Actions logs for detailed error information

### Performance Tips
- Use `--workers=1` for debugging
- Enable `--headed` mode to see browser interactions
- Use `--trace=on` for detailed execution traces

##  License

ISC License - See package.json for details.
