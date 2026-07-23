# Cross-Company Isolation Security Tests - Documentation

## Overview

This document provides detailed documentation for the new cross-company isolation security tests added to the Customer Portal test suite.

## New Test Files

### 1. `cross-company-isolation.spec.ts`
**Comprehensive cross-company resource access prevention tests**

### 2. `database-query-validation.spec.ts`
**Database query security tests focusing on WHERE clause validation**

## Test Users & Companies

### Test Companies

| Company | Example ID | Description |
|---------|-----------|-------------|
| EFSORA | 1 | System/platform company |
| Apex Corporation | 2 | Customer company |
| Demo Company | 3 | Customer company |
| TechCorp | 4 | Customer company (optional) |

### Test Users

| Email | Company | Role | Access Level |
|-------|---------|------|--------------|
| admin@efsora.com | EFSORA | EFSORA_ADMIN | Full system access, all companies |
| customeradmin@apex.com | Apex | CUSTOMER | Apex company only |
| sarah.wilson@apex.com | Apex | CUSTOMER | Limited Apex access |
| customer@demo.com | Demo | CUSTOMER | Demo company only |

**Default Password:** `Demo123!` (for all test users)

## Test Scenarios

### Cross-Company Resource Access Prevention

#### 1. Company ID Manipulation in Query Parameters
```typescript
// Test: Apex user trying to access Demo company projects
GET /api/v1/projects?companyId=3
Expected: 403 Forbidden or 400 Bad Request
Actual: Should NOT return Demo company projects
```

#### 2. Company ID Manipulation in Path Parameters
```typescript
// Test: Access other company resources via path
GET /api/v1/companies/3/projects
Expected: 403 Forbidden
Actual: Should block access to other company's resources
```

#### 3. POST Body Manipulation
```typescript
// Test: Creating resource for different company
POST /api/v1/projects
Body: { name: "Project", companyId: 999 }
Expected: 403 Forbidden or 400 Bad Request
Actual: Should reject or override to user's companyId
```

#### 4. UUID/GUID-based Access
```typescript
// Test: Accessing resources by UUID
GET /api/v1/projects/019c3e44-a2ad-761b-ab5e-9c5824e9c2ac
Expected: 403 Forbidden (if belongs to other company)
Actual: Should verify ownership before returning data
```

### Header Manipulation Prevention

#### 1. Custom Company Headers
```typescript
// Test: Setting custom headers to bypass authorization
GET /api/v1/projects
Headers: { "X-Company-Id": "999", "X-Tenant-Id": "3" }
Expected: Headers should be ignored, use JWT claims
Actual: Should not change company context
```

### SQL Injection Tests

#### 1. SQL Injection via Company ID
```typescript
// Test payloads:
"1' OR '1'='1"
"1 OR 1=1"
"1; DROP TABLE companies;--"
"1 UNION SELECT * FROM users--"

Expected: 400 Bad Request or properly sanitized
Actual: Should NOT return data from other companies
```

#### 2. NoSQL Injection
```typescript
// Test payloads:
{"$gt":""}
{"$ne":null}
{"$regex":".*"}

Expected: 400 Bad Request
Actual: Should reject malicious operators
```

### Mass Assignment Prevention

```typescript
// Test: Updating project but trying to change company
PATCH /api/v1/projects/1
Body: { name: "Updated", companyId: 999 }
Expected: companyId should be ignored or rejected
Actual: companyId should remain unchanged
```

### Multi-Tenancy Isolation

#### 1. Complete Data Isolation
```typescript
// Test: Verify no cross-contamination
- Login as Apex user, get projects
- Login as Demo user, get projects
Expected: No overlap in data
Actual: Each user sees only their company's data
```

#### 2. Session Isolation
```typescript
// Test: Sequential logins don't leak data
- Login as Apex user
- Logout
- Login as Demo user
Expected: No Apex data visible to Demo user
Actual: Clean session separation
```

## Database Query Validation

### Required Query Patterns

#### ✅ Safe SELECT Query
```sql
SELECT * FROM projects 
WHERE company_id = ? AND id = ?;
```

#### ❌ Unsafe SELECT Query
```sql
SELECT * FROM projects 
WHERE id = ?;  -- Missing company_id filter!
```

#### ✅ Safe UPDATE Query
```sql
UPDATE projects 
SET name = ? 
WHERE id = ? AND company_id = ?;
```

#### ❌ Unsafe UPDATE Query
```sql
UPDATE projects 
SET name = ? 
WHERE id = ?;  -- Missing company_id check!
```

#### ✅ Safe DELETE Query
```sql
DELETE FROM projects 
WHERE id = ? AND company_id = ?;
```

#### ❌ Unsafe DELETE Query
```sql
DELETE FROM projects 
WHERE id = ?;  -- Missing company_id check!
```

## Enabling Database Query Logging

### Prisma
```bash
# Environment variable
export DEBUG="prisma:query"

# Or in .env file
DEBUG=prisma:query
```

### TypeORM
```typescript
// ormconfig.ts or config
{
  logging: ['query', 'error', 'schema'],
  logger: 'advanced-console',
}
```

### Sequelize
```typescript
{
  logging: console.log,
  benchmark: true,
}
```

### PostgreSQL
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;
SELECT pg_reload_conf();
```

### MySQL
```sql
-- Enable general query log
SET GLOBAL general_log = 'ON';
SET GLOBAL log_output = 'TABLE';
```

## Running the Tests

### Run All New Security Tests
```powershell
npx playwright test tests/customerportal/security/cross-company-isolation.spec.ts
npx playwright test tests/customerportal/security/database-query-validation.spec.ts
```

### Run with UI Mode
```powershell
npx playwright test tests/customerportal/security/cross-company-isolation.spec.ts --ui
```

### Run Specific Test
```powershell
npx playwright test -g "Apex user cannot access Demo company projects"
```

### Run with Query Logging
```powershell
# Windows PowerShell
$env:DEBUG="prisma:query"
npx playwright test tests/customerportal/security/database-query-validation.spec.ts

# Linux/Mac
DEBUG=prisma:query npx playwright test tests/customerportal/security/database-query-validation.spec.ts
```

## Expected Test Results

### ✅ All Tests Should Pass If:
1. Users can only access their own company's resources
2. API returns **403 Forbidden** for cross-company access
3. Company ID manipulation attempts are blocked
4. SQL injection attempts are sanitized
5. Database queries include `WHERE company_id = ?`
6. No data leakage in error messages
7. Sessions are properly isolated

### ❌ Tests Will Fail If:
1. **200 OK** returned when accessing other company data = **CRITICAL**
2. Query parameters can change company context = **CRITICAL**
3. SQL injection returns data = **CRITICAL**
4. Missing WHERE clauses in queries = **CRITICAL**
5. Error messages reveal sensitive information = **HIGH**
6. Session data persists across logins = **HIGH**

## Security Vulnerabilities Detected

### 1. Broken Access Control (OWASP A01:2021)
**Symptom**: Users can access resources from other companies
**Fix**: Add company_id validation in all API endpoints

### 2. Insecure Direct Object Reference (IDOR)
**Symptom**: Manipulating IDs grants unauthorized access
**Fix**: Verify resource ownership before returning data

### 3. SQL Injection (OWASP A03:2021)
**Symptom**: SQL payloads return unauthorized data
**Fix**: Use parameterized queries, input validation

### 4. Mass Assignment
**Symptom**: Changing company_id in request body succeeds
**Fix**: Whitelist allowed fields, validate ownership

### 5. Information Disclosure
**Symptom**: Error messages reveal database structure
**Fix**: Generic error messages, log details server-side

## Log Analysis

### Finding Unsafe Queries

```bash
# Find SELECT without company_id
grep "SELECT.*FROM projects" logs/database.log | grep -v "company_id"

# Find UPDATE without company_id
grep "UPDATE projects" logs/database.log | grep -v "company_id"

# Find DELETE without company_id  
grep "DELETE FROM" logs/database.log | grep -v "company_id"
```

### Analyzing Query Patterns

```bash
# Count safe queries
grep -c "WHERE company_id" logs/database.log

# Count potentially unsafe queries
grep -c "SELECT \* FROM" logs/database.log
```

## Implementation Best Practices

### 1. Middleware/Interceptor Pattern
```typescript
// Add company_id filter automatically
app.use((req, res, next) => {
  req.companyId = req.user.companyId;
  next();
});
```

### 2. ORM Scope/Middleware
```typescript
// Prisma middleware example
prisma.$use(async (params, next) => {
  if (params.model === 'Project') {
    if (params.action === 'findMany') {
      params.args.where = { 
        ...params.args.where, 
        companyId: req.user.companyId 
      };
    }
  }
  return next(params);
});
```

### 3. Query Builder Helpers
```typescript
// Helper function that always includes company filter
function findProjects(companyId: number, filters: any) {
  return prisma.project.findMany({
    where: {
      companyId,  // Always include!
      ...filters
    }
  });
}
```

### 4. Row-Level Security (PostgreSQL)
```sql
-- Enable RLS on table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY company_isolation_policy ON projects
  USING (company_id = current_setting('app.current_company_id')::INTEGER);
```

## CI/CD Integration

```yaml
# .github/workflows/security-tests.yml
name: Security Tests

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - name: Run security tests
        run: |
          npx playwright test tests/customerportal/security/cross-company-isolation.spec.ts
          npx playwright test tests/customerportal/security/database-query-validation.spec.ts
        env:
          DEBUG: prisma:query
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: security-test-results
          path: playwright-report/
```

## Troubleshooting

### Tests Timeout
**Solution**: Ensure backend (port 3000) and frontend (port 5174) are running

### 401 Unauthorized Errors
**Solution**: Check session/cookie configuration, verify login flow

### Cannot See Query Logs
**Solution**: Verify DEBUG environment variable is set correctly

### Random Failures
**Solution**: Ensure test data is seeded consistently

## Monitoring in Production

### Metrics to Track
- Count of 403 Forbidden responses per endpoint
- Failed authorization attempts per user
- SQL injection attempt patterns
- Unusual cross-company access patterns

### Alerting Rules
```typescript
// Example: Alert on suspicious activity
if (forbiddenCount > 10 in 5 minutes) {
  alert("Possible unauthorized access attempt");
}

if (sqlInjectionPattern.test(params)) {
  alert("SQL injection attempt detected");
  logSecurityEvent(user, params);
}
```

## Additional Resources

- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Multi-Tenancy Security Guide](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/tenancy-models)
- [Playwright Security Testing](https://playwright.dev/)

---

**Created**: February 2026  
**Author**: Security Test Suite  
**Status**: ✅ Active
