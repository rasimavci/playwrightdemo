# Customer Portal Test Suite

This directory contains comprehensive UI tests for the Customer Portal application running at http://localhost:5174/

## Test Files

### Authentication Tests

#### login.spec.ts
Core login functionality tests including:
- Page element visibility and layout
- Password visibility toggle
- Form input validation
- Email and password entry
- Form submission
- Keyboard navigation
- Enter key submission

#### login-security.spec.ts
Security-focused tests including:
- Invalid credentials handling
- Password exposure prevention
- SQL injection prevention
- XSS attack prevention
- Special character handling
- Autocomplete settings
- Rate limiting for multiple login attempts

#### login-accessibility.spec.ts
Accessibility tests including:
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus indicators
- Color contrast
- Semantic HTML
- Tab order

#### login-responsive.spec.ts
Responsive design tests including:
- Desktop viewport (1920x1080)
- Tablet viewport (768x1024)
- Mobile viewport (375x667)
- iPhone 12 device emulation
- iPad Pro device emulation
- Small screen support (320x568)
- Horizontal scrollbar prevention
- Image scaling

#### login-performance.spec.ts
Performance tests including:
- Page load time
- Critical resource loading
- Slow network handling
- Console error monitoring
- Memory leak detection
- Form submission response time
- UI responsiveness
- Image loading efficiency

### Account-Specific Tests

#### admin-account.spec.ts
EFSORA_ADMIN role tests (admin@efsora.com):
- Full system access verification
- View all companies and projects
- User management capabilities
- System settings access
- Admin-only features
- Role indicator display

#### customer-apex-admin.spec.ts
CUSTOMER role tests (customeradmin@apex.com):
- Apex company access only
- Project visibility: Apex Mobile + Apex Analytics
- Limited customer permissions
- No admin features
- Company isolation verification

#### customer-apex-sarah.spec.ts
CUSTOMER role tests (sarah.wilson@apex.com):
- Apex company access only
- Project visibility: Apex Web Portal + Apex Analytics
- Different project access than customeradmin
- Shared access to Apex Analytics
- Company isolation verification

#### customer-demo.spec.ts
CUSTOMER role tests (customer@demo.com):
- Demo company access only
- Complete isolation from Apex company
- No cross-company data visibility
- Basic customer features

#### cross-account-validation.spec.ts
Cross-account security and permissions:
- Role-based access control (RBAC)
- Company data isolation
- Project access permissions
- Shared vs. exclusive project access
- Session isolation
- Admin vs. customer permissions

## Running Tests

Run all customer portal tests:
```bash
npx playwright test tests/customerportal
```

Run specific test file:
```bash
npx playwright test tests/customerportal/login.spec.ts
```

Run tests in headed mode:
```bash
npx playwright test tests/customerportal --headed
```

Run tests with UI mode:
```bash
npx playwright test tests/customerportal --ui
```

## Test Accounts

All test accounts use the password: `Demo123!`

| Email | Role | Company | Projects Visible |
|-------|------|---------|------------------|
| admin@efsora.com | EFSORA_ADMIN | ALL | ALL |
| customeradmin@apex.com | CUSTOMER | Apex | Apex Mobile, Apex Analytics |
| sarah.wilson@apex.co (login, logout, navigation)
- ✅ Security testing (SQL injection, XSS, authentication)
- ✅ Accessibility testing (WCAG compliance, keyboard navigation)
- ✅ Responsive design testing (mobile, tablet, desktop)
- ✅ Performance testing (load times, resource usage)
- ✅ Role-based access control (RBAC)
- ✅ Multi-tenant isolation (company separation)
- ✅ Project-level permissions
- ✅ Cross-account validation

## Key Test Scenarios

### Admin Account (EFSORA_ADMIN)
- Can see ALL companies (Apex, Demo, etc.)
- Can see ALL projects across all companies
- Has access to system settings and user management
- Full administrative capabilities

### Customer Accounts (CUSTOMER role)
- **Company Isolation**: Each customer only sees their own company
- **Project Permissions**: Users see only assigned projects within their company
- **Shared Access**: Multiple users can share access to same projects (e.g., Apex Analytics)
- **Exclusive Access**: Some projects visible to specific users only

### Security Validations
- No cross-company data leakage
- Role-based feature restrictions
- Session management and isolation
- Protection against common vulnerabilities

## Notes

- Tests are designed to be independent and can run in parallel
- Some tests use flexible locators to handle UI variations
- Tests include timeout handling for async operations
- Update the tests as new features are added to the customer portal
- Adjust project names and company names if they change in the application
The test suite covers:
- ✅ Functional testing
- ✅ Security testing
- ✅ Accessibility testing
- ✅ Responsive design testing
- ✅ Performance testing

## Notes

- Tests are designed to be independent and can run in parallel
- Some tests may require adjustment based on actual application behavior (authentication responses, error messages, etc.)
- Update the tests as new features are added to the customer portal
