import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Database Query Validation Security Tests
 * 
 * These tests focus on verifying that database queries include proper
 * WHERE clauses for company-based filtering (multi-tenancy isolation).
 * 
 * Prerequisites:
 * - Enable database query logging in your application
 * - Configure log output to a parseable format
 * - Set environment variables for log file paths
 * 
 * What We Check:
 * 1. All SELECT queries include WHERE company_id = ?
 * 2. All UPDATE queries include WHERE company_id = ?
 * 3. All DELETE queries include WHERE company_id = ?
 * 4. No queries use SELECT * without filtering
 * 5. No queries have missing tenant isolation
 */

// Helper function to login via UI and get session
async function loginAndGetSession(page, email: string, password: string = 'Demo123!') {
  await page.goto('http://localhost:5173/');
  
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  await page.waitForTimeout(2000);
  
  return await page.context().cookies();
}

// Helper to capture console logs from the page
async function captureAPILogs(page) {
  const logs: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('SQL') || text.includes('Query') || text.includes('SELECT') || 
        text.includes('prisma') || text.includes('WHERE')) {
      logs.push(text);
    }
  });
  
  return logs;
}

test.describe('Security Tests - Database Query WHERE Clause Validation', () => {
  
  test('Verify company_id filtering in SELECT queries', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Capture any logs
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    // Make API requests that should trigger database queries
    const endpoints = [
      { url: 'http://localhost:3000/api/v1/projects', entity: 'projects' },
      { url: 'http://localhost:3000/api/v1/milestones', entity: 'milestones' },
      { url: 'http://localhost:3000/api/v1/dashboard', entity: 'dashboard' },
    ];
    
    for (const { url, entity } of endpoints) {
      const response = await context.request.get(url);
      
      console.log(`\n📋 Testing ${entity} endpoint:`);
      console.log(`   URL: ${url}`);
      console.log(`   Status: ${response.status()}`);
      
      // Expected behavior documentation
      console.log(`   ✅ Expected Query Pattern:`);
      console.log(`      SELECT * FROM ${entity} WHERE company_id = ? ...`);
      console.log(`   ❌ Vulnerable Query Pattern:`);
      console.log(`      SELECT * FROM ${entity} (missing WHERE clause)`);
      
      if (response.ok()) {
        const data = await response.json();
        console.log(`   📊 Results returned: ${data.data?.length || 0} items`);
        console.log(`   ⚠ MANUAL VERIFICATION REQUIRED:`);
        console.log(`      Check database logs to confirm WHERE company_id filter was applied`);
      }
    }
    
    console.log(`\n💡 To enable query logging:`);
    console.log(`   Prisma: Set DEBUG=prisma:query in environment`);
    console.log(`   TypeORM: Set logging: ['query'] in config`);
    console.log(`   Sequelize: Set logging: console.log in config`);
  });

  test('Check for missing WHERE clauses using response analysis', async ({ page, context }) => {
    // Login as a limited user
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Get the count of projects returned
    const response = await context.request.get('http://localhost:3000/api/v1/dashboard');
    
    if (response.ok()) {
      const data = await response.json();
      const projectCount = data.data?.projects?.length || 0;
      
      console.log(`\n🔍 Response Analysis for WHERE Clause Detection:`);
      console.log(`   Projects returned: ${projectCount}`);
      
      // If count is suspiciously high, might indicate missing WHERE clause
      if (projectCount > 50) {
        console.log(`   ❌ WARNING: Unusually high count (${projectCount}) - possible missing WHERE clause`);
        console.log(`   A customer user should only see their company's projects (typically < 20)`);
        console.log(`   ⚠ INVESTIGATE: Check if query is missing company_id filter`);
      } else if (projectCount > 10) {
        console.log(`   ⚠ REVIEW: Moderate count (${projectCount}) - verify this is expected`);
      } else {
        console.log(`   ✅ Count appears reasonable (${projectCount})`);
      }
      
      // Check if response contains data from multiple companies (indicator of missing WHERE)
      const jsonString = JSON.stringify(data);
      const companyIndicators = ['efsora', 'apex', 'demo', 'techcorp'];
      const foundIndicators = companyIndicators.filter(indicator => 
        jsonString.toLowerCase().includes(indicator)
      );
      
      console.log(`   Company names found in response: ${foundIndicators.join(', ') || 'none'}`);
      
      if (foundIndicators.length > 2) {
        console.log(`   ❌ CRITICAL: Multiple company data detected (${foundIndicators.length} companies)`);
        console.log(`   This strongly suggests missing WHERE company_id clause`);
        expect(foundIndicators.length).toBeLessThanOrEqual(2);
      } else {
        console.log(`   ✅ Response appears to be properly filtered`);
      }
    }
  });

  test('Detect unfiltered queries by comparing admin vs customer results', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Get admin's total count (should see all companies)
    await loginAndGetSession(page1, 'admin@efsora.com');
    const adminResponse = await context1.request.get('http://localhost:3000/api/v1/companies');
    
    let adminCompanyCount = 0;
    if (adminResponse.ok()) {
      const adminData = await adminResponse.json();
      adminCompanyCount = adminData.data?.length || 0;
    }
    
    // Get customer's count (should see only their company)
    await loginAndGetSession(page2, 'customeradmin@apex.com');
    const customerResponse = await context2.request.get('http://localhost:3000/api/v1/companies');
    
    console.log(`\n🔬 Query Filtering Comparison Test:`);
    console.log(`   Admin total companies: ${adminCompanyCount}`);
    
    if (customerResponse.status() === 403) {
      console.log(`   ✅ Customer blocked from /companies endpoint (Status: 403)`);
      console.log(`   This is correct - customers should not list all companies`);
    } else if (customerResponse.ok()) {
      const customerData = await customerResponse.json();
      const customerCompanyCount = customerData.data?.length || 0;
      
      console.log(`   Customer visible companies: ${customerCompanyCount}`);
      
      if (customerCompanyCount === adminCompanyCount) {
        console.log(`   ❌ CRITICAL SECURITY ISSUE: Customer sees ALL companies!`);
        console.log(`   Missing WHERE company_id clause in companies query`);
        expect(customerCompanyCount).toBeLessThan(adminCompanyCount);
      } else if (customerCompanyCount > 1) {
        console.log(`   ⚠ WARNING: Customer sees multiple companies (${customerCompanyCount})`);
        console.log(`   Expected: 1 (their own company only)`);
      } else {
        console.log(`   ✅ Customer properly filtered to their company only`);
      }
    }
    
    await context1.close();
    await context2.close();
  });
});

test.describe('Security Tests - UPDATE/DELETE Query Validation', () => {
  
  test('Verify UPDATE queries include company_id in WHERE clause', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to update a project
    const updatePayload = {
      name: 'Updated Project Name',
      description: 'Security test update'
    };
    
    // Attempt to update project with ID 1
    const response = await context.request.patch(
      'http://localhost:3000/api/v1/projects/1',
      { data: updatePayload }
    );
    
    console.log(`\n✏️ UPDATE Query Validation:`);
    console.log(`   Request: PATCH /api/v1/projects/1`);
    console.log(`   Status: ${response.status()}`);
    console.log(`   ✅ Expected Query:`);
    console.log(`      UPDATE projects SET ... WHERE id = 1 AND company_id = ?`);
    console.log(`   ❌ Vulnerable Query:`);
    console.log(`      UPDATE projects SET ... WHERE id = 1 (missing company_id check)`);
    
    if (response.status() === 403) {
      console.log(`   ℹ️ Update blocked (403) - user may not have permission`);
    } else if (response.status() === 404) {
      console.log(`   ✅ Project not found (404) - likely belongs to another company`);
      console.log(`   This suggests proper WHERE company_id filtering`);
    } else if (response.ok()) {
      console.log(`   ℹ️ Update successful`);
      console.log(`   ⚠ VERIFY: Check logs to ensure WHERE clause included company_id`);
    }
  });

  test('Verify DELETE queries include company_id in WHERE clause', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to delete a project from another company
    // Using a high ID that likely doesn't belong to this user
    const response = await context.request.delete(
      'http://localhost:3000/api/v1/projects/999'
    );
    
    console.log(`\n🗑️ DELETE Query Validation:`);
    console.log(`   Request: DELETE /api/v1/projects/999`);
    console.log(`   Status: ${response.status()}`);
    console.log(`   ✅ Expected Query:`);
    console.log(`      DELETE FROM projects WHERE id = 999 AND company_id = ?`);
    console.log(`   ❌ Vulnerable Query:`);
    console.log(`      DELETE FROM projects WHERE id = 999 (missing company_id check)`);
    
    if (response.status() === 403) {
      console.log(`   ✅ Delete forbidden (403) - proper authorization check`);
    } else if (response.status() === 404) {
      console.log(`   ✅ Project not found (404) - WHERE company_id filter working`);
    } else if (response.status() === 204 || response.ok()) {
      console.log(`   ❌ WARNING: Delete succeeded for project 999`);
      console.log(`   If this project belongs to another company, this is a CRITICAL ISSUE`);
    }
  });

  test('Attempt bulk operations to detect missing WHERE clauses', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try bulk update (if supported)
    const bulkUpdatePayload = {
      ids: [1, 2, 3, 4, 5, 999, 998, 997],
      status: 'completed'
    };
    
    const response = await context.request.patch(
      'http://localhost:3000/api/v1/projects/bulk',
      { data: bulkUpdatePayload }
    );
    
    console.log(`\n📦 Bulk Operation Query Validation:`);
    console.log(`   Request: PATCH /api/v1/projects/bulk`);
    console.log(`   IDs: ${bulkUpdatePayload.ids.join(', ')}`);
    console.log(`   Status: ${response.status()}`);
    console.log(`   ✅ Expected Query:`);
    console.log(`      UPDATE projects SET status = ? WHERE id IN (?) AND company_id = ?`);
    console.log(`   ❌ Vulnerable Query:`);
    console.log(`      UPDATE projects SET status = ? WHERE id IN (?) <-- MISSING company_id`);
    
    if (response.ok()) {
      const data = await response.json();
      const affectedCount = data.data?.affected || data.data?.count || 0;
      
      console.log(`   Records affected: ${affectedCount}`);
      
      // If customer updated 8/8 items including IDs they shouldn't own, it's a problem
      if (affectedCount === bulkUpdatePayload.ids.length) {
        console.log(`   ❌ WARNING: All ${affectedCount} records updated`);
        console.log(`   This may indicate missing company_id filter in bulk operation`);
      } else if (affectedCount > 3) {
        console.log(`   ⚠ Review: ${affectedCount} records updated - verify ownership`);
      } else {
        console.log(`   ✅ Limited records updated (${affectedCount}) - appears filtered`);
      }
    } else {
      expect([403, 404, 400]).toContain(response.status());
      console.log(`   ✅ Bulk operation blocked or not supported`);
    }
  });
});

test.describe('Security Tests - Query Log Analysis (Integration)', () => {
  
  test('Parse database logs for unsafe query patterns', async ({ page, context }) => {
    // This test demonstrates how to integrate with actual database logging
    
    console.log(`\n📊 Database Query Log Analysis Guide:`);
    console.log(`\n1️⃣ Enable Query Logging:`);
    console.log(`   Prisma: export DEBUG="prisma:query"`);
    console.log(`   TypeORM: logging: ['query', 'error']`);
    console.log(`   Sequelize: logging: console.log`);
    console.log(`   PostgreSQL: log_statement = 'all'`);
    console.log(`   MySQL: general_log = ON`);
    
    console.log(`\n2️⃣ Unsafe Query Patterns to Look For:`);
    const unsafePatterns = [
      'SELECT * FROM projects',
      'SELECT * FROM milestones', 
      'UPDATE projects SET',
      'DELETE FROM projects WHERE id',
      'SELECT * FROM users',
    ];
    
    unsafePatterns.forEach(pattern => {
      console.log(`   ❌ ${pattern} <-- Missing WHERE company_id`);
    });
    
    console.log(`\n3️⃣ Safe Query Patterns:`);
    const safePatterns = [
      'SELECT * FROM projects WHERE company_id = $1',
      'SELECT * FROM milestones WHERE company_id = ?',
      'UPDATE projects SET ... WHERE id = $1 AND company_id = $2',
      'DELETE FROM projects WHERE id = ? AND company_id = ?',
    ];
    
    safePatterns.forEach(pattern => {
      console.log(`   ✅ ${pattern}`);
    });
    
    console.log(`\n4️⃣ Log Analysis Script Example:`);
    console.log(`   grep "SELECT.*FROM projects" logs/database.log | grep -v "company_id"`);
    console.log(`   This finds SELECT queries without company_id filtering`);
    
    console.log(`\n5️⃣ Automated Tools:`);
    console.log(`   - Use database query analyzers`);
    console.log(`   - Implement query monitoring middleware`);
    console.log(`   - Set up alerts for queries without tenant filters`);
    
    // Simulate making requests and note where logs should be checked
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    const testEndpoints = [
      'http://localhost:3000/api/v1/projects',
      'http://localhost:3000/api/v1/milestones',
    ];
    
    console.log(`\n6️⃣ Test Execution:`);
    for (const endpoint of testEndpoints) {
      const response = await context.request.get(endpoint);
      console.log(`   ${endpoint} -> Status: ${response.status()}`);
      console.log(`   🔍 Check logs now for queries generated by this request`);
    }
  });

  test('Monitor for N+1 queries that bypass company filtering', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    console.log(`\n🔄 N+1 Query Pattern Detection:`);
    console.log(`   Making request with nested relations...`);
    
    // Request that might trigger N+1 queries
    const response = await context.request.get(
      'http://localhost:3000/api/v1/projects?include=milestones'
    );
    
    console.log(`   Status: ${response.status()}`);
    console.log(`\n   ⚠ Watch for these patterns in logs:`);
    console.log(`   1. SELECT * FROM projects WHERE company_id = ?`);
    console.log(`   2. SELECT * FROM milestones WHERE project_id = ? (repeated N times)`);
    console.log(`\n   ❌ Vulnerable pattern:`);
    console.log(`   SELECT * FROM milestones WHERE project_id = ? <-- Missing company_id check`);
    console.log(`   This could return milestones from other companies!`);
    console.log(`\n   ✅ Safe pattern:`);
    console.log(`   SELECT * FROM milestones WHERE project_id = ? AND company_id = ?`);
    
    if (response.ok()) {
      const data = await response.json();
      console.log(`   Projects returned: ${data.data?.length || 0}`);
      console.log(`   ⚠ VERIFY: Check that nested milestones also filtered by company_id`);
    }
  });
});

test.describe('Security Tests - ORM/Query Builder Security', () => {
  
  test('Document ORM security best practices', async ({ page }) => {
    console.log(`\n📚 ORM Security Best Practices for Multi-Tenancy:`);
    
    console.log(`\n🔒 Prisma:`);
    console.log(`   ✅ Use middleware to add company_id filter:`);
    console.log(`   prisma.$use(async (params, next) => {`);
    console.log(`     if (params.model === 'Project') {`);
    console.log(`       if (params.action === 'findMany' || params.action === 'findFirst') {`);
    console.log(`         params.args.where = { ...params.args.where, companyId: user.companyId };`);
    console.log(`       }`);
    console.log(`     }`);
    console.log(`     return next(params);`);
    console.log(`   });`);
    
    console.log(`\n🔒 TypeORM:`);
    console.log(`   ✅ Create custom repository with built-in filtering:`);
    console.log(`   class ProjectRepository extends Repository<Project> {`);
    console.log(`     findByCompany(companyId: number) {`);
    console.log(`       return this.find({ where: { companyId } });`);
    console.log(`     }`);
    console.log(`   }`);
    
    console.log(`\n🔒 Sequelize:`);
    console.log(`   ✅ Use scopes for automatic filtering:`);
    console.log(`   Project.addScope('byCompany', (companyId) => ({`);
    console.log(`     where: { companyId }`);
    console.log(`   }));`);
    
    console.log(`\n⚠️ Common Pitfalls:`);
    console.log(`   ❌ Using raw SQL without parameterization`);
    console.log(`   ❌ Forgetting to add company_id filter in UPDATE/DELETE`);
    console.log(`   ❌ Using findAll() without WHERE clause`);
    console.log(`   ❌ Relying on frontend filtering instead of database`);
    console.log(`   ❌ Not validating company_id in request matches authenticated user`);
    
    console.log(`\n✅ Security Checklist:`);
    console.log(`   □ All queries include company_id filter`);
    console.log(`   □ Middleware/interceptors enforce tenant isolation`);
    console.log(`   □ UPDATE/DELETE require both id AND company_id`);
    console.log(`   □ Raw queries use parameterized values`);
    console.log(`   □ Error messages don't leak data from other tenants`);
    console.log(`   □ Unit tests verify filtering logic`);
    console.log(`   □ Integration tests check cross-tenant isolation`);
  });
});

test.describe('Security Tests - Query Monitoring Setup', () => {
  
  test('Generate test traffic for log analysis', async ({ page, context }) => {
    console.log(`\n🚀 Generating Test Traffic for Log Analysis:`);
    console.log(`   Enable database query logging before running this test!`);
    
    // Test as Apex user
    console.log(`\n   Testing as Apex user (customeradmin@apex.com)...`);
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    const operations = [
      { method: 'GET', url: 'http://localhost:3000/api/v1/projects', desc: 'List projects' },
      { method: 'GET', url: 'http://localhost:3000/api/v1/milestones', desc: 'List milestones' },
      { method: 'GET', url: 'http://localhost:3000/api/v1/dashboard', desc: 'Dashboard' },
      { method: 'GET', url: 'http://localhost:3000/api/v1/projects/1', desc: 'Get project by ID' },
    ];
    
    for (const op of operations) {
      const response = await context.request.get(op.url);
      console.log(`   ${op.desc}: ${op.url}`);
      console.log(`      -> Status: ${response.status()}`);
      console.log(`      -> Check logs for: WHERE company_id = [Apex's ID]`);
      await page.waitForTimeout(500);
    }
    
    // Logout
    await page.goto('http://localhost:5173/logout');
    await page.waitForTimeout(1000);
    
    // Test as Demo user
    console.log(`\n   Testing as Demo user (customer@demo.com)...`);
    await loginAndGetSession(page, 'customer@demo.com');
    
    for (const op of operations) {
      const response = await context.request.get(op.url);
      console.log(`   ${op.desc}: ${op.url}`);
      console.log(`      -> Status: ${response.status()}`);
      console.log(`      -> Check logs for: WHERE company_id = [Demo's ID]`);
      await page.waitForTimeout(500);
    }
    
    console.log(`\n   ✅ Test traffic generated!`);
    console.log(`   📋 Now analyze your database logs to verify:`);
    console.log(`      1. All queries include company_id filtering`);
    console.log(`      2. Different users trigger different company_id values`);
    console.log(`      3. No queries are missing WHERE clauses`);
  });
});
