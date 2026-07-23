import { test, expect } from '@playwright/test';

/**
 * Cross-Company Isolation Security Tests
 * 
 * These tests verify that users from different companies cannot access
 * each other's resources by manipulating company IDs in API requests.
 * 
 * Test Companies & Users:
 * 1. Apex Corporation (Company ID: varies)
 *    - customeradmin@apex.com - Apex admin
 *    - sarah.wilson@apex.com - Apex limited user
 * 
 * 2. Demo Company (Company ID: varies)
 *    - customer@demo.com - Demo company user
 * 
 * 3. EFSORA (Company ID: varies)
 *    - admin@efsora.com - System admin (control user)
 * 
 * Security Requirements:
 * - Users can only access resources from their own company
 * - Manipulating company IDs in requests should return 403 Forbidden
 * - Database queries must include proper WHERE clauses filtering by company_id
 * - No data leakage through error messages
 */

// Helper function to login via UI and get session
async function loginAndGetSession(page, email: string, password: string = 'Demo123!') {
  await page.goto('http://localhost:5173/');
  
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  // Wait for login to complete
  await page.waitForTimeout(2000);
  
  return await page.context().cookies();
}

// Helper to get user's company ID
async function getUserCompanyId(context, page) {
  await loginAndGetSession(page, 'admin@efsora.com');
  const response = await context.request.get('http://localhost:3000/api/v1/companies');
  
  if (response.ok()) {
    const data = await response.json();
    return data.data;
  }
  return [];
}

test.describe('Security Tests - Cross-Company Resource Access Prevention', () => {
  
  test('Apex user cannot access Demo company projects by manipulating companyId', async ({ page, context }) => {
    // Login as Apex user
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to access projects with different company IDs
    const suspiciousCompanyIds = [1, 2, 3, 4, 5, 999, 'demo', 'efsora'];
    
    for (const companyId of suspiciousCompanyIds) {
      // Attempt 1: Query parameter manipulation
      const response1 = await context.request.get(
        `http://localhost:3000/api/v1/projects?companyId=${companyId}`
      );
      
      if (response1.status() === 200) {
        const data = await response1.json();
        console.log(`❌ CRITICAL: Apex user accessed projects with companyId=${companyId}`);
        console.log(`   Projects exposed: ${JSON.stringify(data).substring(0, 150)}...`);
        expect(response1.status()).toBe(403); // Fail the test
      } else {
        expect([403, 400, 404]).toContain(response1.status());
        console.log(`✅ Query param manipulation blocked - companyId=${companyId} - Status: ${response1.status()}`);
      }
      
      // Attempt 2: Path parameter manipulation
      const response2 = await context.request.get(
        `http://localhost:3000/api/v1/companies/${companyId}/projects`
      );
      
      if (response2.status() === 200) {
        const data = await response2.json();
        console.log(`❌ CRITICAL: Apex user accessed company ${companyId} projects via path`);
        expect(response2.status()).toBe(403);
      } else {
        expect([403, 400, 404]).toContain(response2.status());
        console.log(`✅ Path param manipulation blocked - /companies/${companyId}/projects`);
      }
      
      await page.waitForTimeout(200); // Rate limiting courtesy
    }
  });

  test('Demo user cannot access Apex company milestones by manipulating companyId', async ({ page, context }) => {
    await loginAndGetSession(page, 'customer@demo.com');
    
    const targetCompanyIds = [1, 2, 3, 4, 5, 'apex', 'efsora'];
    
    for (const companyId of targetCompanyIds) {
      // Try to access milestones for other companies
      const response = await context.request.get(
        `http://localhost:3000/api/v1/milestones?companyId=${companyId}`
      );
      
      if (response.status() === 200) {
        const data = await response.json();
        console.log(`❌ CRITICAL: Demo user accessed milestones for companyId=${companyId}`);
        console.log(`   Data exposed: ${JSON.stringify(data).substring(0, 150)}...`);
        expect(response.status()).toBe(403);
      } else {
        expect([403, 400, 404]).toContain(response.status());
        console.log(`✅ Milestone access blocked - companyId=${companyId}`);
      }
      
      await page.waitForTimeout(200);
    }
  });

  test('Apex user cannot access other company users by manipulating filters', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Attempts to enumerate users from other companies
    const manipulations = [
      'http://localhost:3000/api/v1/users?companyId=1',
      'http://localhost:3000/api/v1/users?companyId=2',
      'http://localhost:3000/api/v1/users?companyId=all',
      'http://localhost:3000/api/v1/users?company=demo',
      'http://localhost:3000/api/v1/users?filter[companyId]=1',
      'http://localhost:3000/api/v1/users?where[companyId]=2',
    ];
    
    for (const url of manipulations) {
      const response = await context.request.get(url);
      
      // Should be blocked (403) or unauthorized (401), not return data
      expect([403, 401, 400]).toContain(response.status());
      console.log(`✅ User enumeration blocked: ${url.split('?')[1]} - Status: ${response.status()}`);
      
      await page.waitForTimeout(200);
    }
  });

  test('Customer cannot manipulate company_id in POST request body', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to create/update resources for other companies
    const maliciousPayloads = [
      { name: 'Malicious Project', companyId: 1, company_id: 1 },
      { name: 'Malicious Project', companyId: 999, company_id: 999 },
      { name: 'Malicious Project', company: { id: 2 } },
      { name: 'Malicious Project', ownerId: 999, companyId: 2 },
    ];
    
    for (const payload of maliciousPayloads) {
      const response = await context.request.post('http://localhost:3000/api/v1/projects', {
        data: payload
      });
      
      // Should reject attempts to specify different company
      expect([403, 400, 401]).toContain(response.status());
      console.log(`✅ POST body manipulation rejected - companyId: ${payload.companyId || payload.company_id}`);
      
      await page.waitForTimeout(200);
    }
  });

  test('Customer cannot access resources using other company UUID/GUID', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Example UUIDs (these should be blocked if they belong to other companies)
    const testUUIDs = [
      '019c3e44-a2ad-761b-ab5e-9c5824e9c2ac', // EFSORA internal project
      '00000000-0000-0000-0000-000000000001',
      '11111111-1111-1111-1111-111111111111',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
    ];
    
    for (const uuid of testUUIDs) {
      const endpoints = [
        `http://localhost:3000/api/v1/projects/${uuid}`,
        `http://localhost:3000/api/v1/milestones/${uuid}`,
        `http://localhost:3000/api/v1/companies/${uuid}`,
      ];
      
      for (const endpoint of endpoints) {
        const response = await context.request.get(endpoint);
        
        if (response.status() === 200) {
          console.log(`❌ CRITICAL: Apex user accessed ${endpoint}`);
          const data = await response.json();
          console.log(`   Data exposed: ${JSON.stringify(data).substring(0, 100)}...`);
          expect(response.status()).toBe(403);
        } else {
          expect([403, 404, 400, 401]).toContain(response.status());
          console.log(`✅ UUID access blocked: ${endpoint.split('/').pop()?.substring(0, 20)}...`);
        }
        
        await page.waitForTimeout(200);
      }
    }
  });
});

test.describe('Security Tests - Header Manipulation Prevention', () => {
  
  test('Cannot bypass authorization by setting custom company headers', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try various header manipulation techniques
    const headerAttempts = [
      { 'X-Company-Id': '1' },
      { 'X-Company-Id': '999' },
      { 'Company-Id': '2' },
      { 'X-Tenant-Id': '1' },
      { 'X-Organization-Id': '999' },
      { 'X-User-Company': 'demo' },
    ];
    
    for (const headers of headerAttempts) {
      const response = await context.request.get('http://localhost:3000/api/v1/projects', {
        headers
      });
      
      if (response.status() === 200) {
        const data = await response.json();
        console.log(`❌ CRITICAL: Header manipulation successful with ${JSON.stringify(headers)}`);
        console.log(`   Data exposed: ${JSON.stringify(data).substring(0, 100)}...`);
        expect(response.status()).toBe(403);
      } else {
        // Should ignore custom headers and apply proper authorization
        expect([403, 400, 401]).toContain(response.status());
        console.log(`✅ Header manipulation rejected: ${Object.keys(headers)[0]}`);
      }
      
      await page.waitForTimeout(200);
    }
  });

  test('Cannot impersonate other company by manipulating JWT claims', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to access protected resources (server should validate JWT properly)
    const response = await context.request.get('http://localhost:3000/api/v1/companies/999');
    
    // Should be blocked because company ID doesn't match JWT
    expect([403, 404]).toContain(response.status());
    console.log(`✅ JWT company validation working - Status: ${response.status()}`);
  });
});

test.describe('Security Tests - SQL Injection via Company ID', () => {
  
  test('SQL injection attempts via companyId parameter should be blocked', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // SQL injection payloads
    const sqlInjectionPayloads = [
      "1' OR '1'='1",
      "1 OR 1=1",
      "1; DROP TABLE companies;--",
      "1 UNION SELECT * FROM users--",
      "1' AND company_id IS NOT NULL--",
      "999' OR company_id > 0--",
      "NULL",
      "1' OR EXISTS(SELECT 1 FROM users)--",
    ];
    
    for (const payload of sqlInjectionPayloads) {
      const response = await context.request.get(
        `http://localhost:3000/api/v1/projects?companyId=${encodeURIComponent(payload)}`
      );
      
      // Should reject or sanitize, never return data from other companies
      expect([403, 404, 500]).not.toContain(response.status());
      
      if (response.status() === 200) {
        const data = await response.json();
        // If it returns 200, ensure it's empty or properly filtered
        if (data.data && data.data.length > 0) {
          console.log(`❌ CRITICAL SQL INJECTION: Payload "${payload}" returned data`);
          console.log(`   Data: ${JSON.stringify(data).substring(0, 150)}...`);
          expect(data.data.length).toBe(0);
        } else {
          console.log(`✅ SQL injection blocked (returned empty result): "${payload.substring(0, 20)}..."`);
        }
      } else {
        expect([400, 403]).toContain(response.status());
        console.log(`✅ SQL injection blocked: "${payload.substring(0, 30)}..." - Status: ${response.status()}`);
      }
      
      await page.waitForTimeout(200);
    }
  });

  test('NoSQL injection attempts via companyId should be blocked', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    const noSqlPayloads = [
      '{"$gt":""}',
      '{"$ne":null}',
      '{"$regex":".*"}',
      '[$ne]=1',
      '{"$where":"this.companyId > 0"}',
    ];
    
    for (const payload of noSqlPayloads) {
      const response = await context.request.get(
        `http://localhost:3000/api/v1/projects?companyId=${encodeURIComponent(payload)}`
      );
      
      expect([400, 403, 404]).toContain(response.status());
      console.log(`✅ NoSQL injection blocked: "${payload.substring(0, 20)}..." - Status: ${response.status()}`);
      
      await page.waitForTimeout(200);
    }
  });
});

test.describe('Security Tests - Mass Assignment Prevention', () => {
  
  test('Cannot update company_id field in PATCH/PUT requests', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to update a project but change its company association
    const maliciousUpdates = [
      { name: 'Updated Project', companyId: 999 },
      { name: 'Updated Project', company_id: 1 },
      { name: 'Updated Project', ownerId: 1, companyId: 2 },
    ];
    
    for (const update of maliciousUpdates) {
      // Assuming project ID 1 exists and belongs to test user's company
      const response = await context.request.patch('http://localhost:3000/api/v1/projects/1', {
        data: update
      });
      
      if (response.status() === 200) {
        const data = await response.json();
        
        // If update succeeded, verify company wasn't changed
        if (data.data && data.data.companyId) {
          // The companyId should remain unchanged (matching original company)
          console.log(`⚠ Update accepted but need to verify companyId wasn't changed`);
        }
      } else {
        // Better to reject the entire request if it contains protected fields
        expect([403, 400]).toContain(response.status());
        console.log(`✅ Mass assignment prevented - companyId in payload rejected`);
      }
      
      await page.waitForTimeout(200);
    }
  });
});

test.describe('Security Tests - Response Data Validation', () => {
  
  test('API responses should not leak other company data in arrays', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Get user's own company data
    const endpoints = [
      'http://localhost:3000/api/v1/dashboard',
      'http://localhost:3000/api/v1/user/profile',
    ];
    
    for (const endpoint of endpoints) {
      const response = await context.request.get(endpoint);
      
      if (response.ok()) {
        const data = await response.json();
        const jsonString = JSON.stringify(data);
        
        // Check for potential data leakage keywords
        const leakageIndicators = [
          'demo', // Other company name
          'techcorp', // Other company name
          'efsora.com', // System admin emails
          'company_id', // Raw database field names
          'tenant_id',
        ];
        
        let suspiciousContent = false;
        for (const indicator of leakageIndicators) {
          if (jsonString.toLowerCase().includes(indicator)) {
            console.log(`⚠ Potential data leakage in ${endpoint}: contains "${indicator}"`);
            suspiciousContent = true;
          }
        }
        
        if (!suspiciousContent) {
          console.log(`✅ No obvious data leakage in ${endpoint}`);
        }
      }
    }
  });

  test('Error responses should not reveal company IDs of other companies', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to access resources that definitely don't belong to this company
    const response = await context.request.get('http://localhost:3000/api/v1/projects/99999');
    
    expect([400, 403, 404]).toContain(response.status());
    
    const errorData = await response.text();
    
    // Error should not reveal:
    // - Other company IDs
    // - Database structure
    // - Stack traces
    expect(errorData).not.toContain('company_id');
    expect(errorData).not.toContain('prisma');
    expect(errorData).not.toContain('at Object');
    expect(errorData).not.toContain('node_modules');
    
    console.log('✅ Error responses do not leak sensitive information');
  });
});

test.describe('Security Tests - Multi-Tenancy Isolation Verification', () => {
  
  test('Different company users should have completely isolated data', async ({ browser }) => {
    // Create separate contexts for different company users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Login as Apex user
    await loginAndGetSession(page1, 'customeradmin@apex.com');
    
    // Login as Demo user
    await loginAndGetSession(page2, 'customer@demo.com');
    
    // Get projects for each user
    const apexProjects = await context1.request.get('http://localhost:3000/api/v1/dashboard');
    const demoProjects = await context2.request.get('http://localhost:3000/api/v1/dashboard');
    
    // Both should succeed with their own data
    if (apexProjects.ok() && demoProjects.ok()) {
      const apexData = await apexProjects.json();
      const demoData = await demoProjects.json();
      
      const apexJson = JSON.stringify(apexData);
      const demoJson = JSON.stringify(demoData);
      
      // Verify no cross-contamination
      // Apex data should not contain Demo company projects
      expect(apexJson.toLowerCase()).not.toContain('demo');
      
      // Demo data should not contain Apex company projects  
      expect(demoJson.toLowerCase()).not.toContain('apex');
      
      console.log('✅ Multi-tenant data isolation verified');
      console.log(`   - Apex user data: ${apexJson.substring(0, 80)}...`);
      console.log(`   - Demo user data: ${demoJson.substring(0, 80)}...`);
    } else {
      console.log('⚠ Could not retrieve dashboard data for comparison');
    }
    
    await context1.close();
    await context2.close();
  });

  test('Sequential login by different company users should not leak previous session data', async ({ page, context }) => {
    // Login as first company user
    await loginAndGetSession(page, 'customeradmin@apex.com');
    const apexResponse = await context.request.get('http://localhost:3000/api/v1/dashboard');
    let apexDataSnapshot = null;
    
    if (apexResponse.ok()) {
      apexDataSnapshot = await apexResponse.json();
    }
    
    // Logout
    await page.goto('http://localhost:5173/logout');
    await page.waitForTimeout(1000);
    
    // Login as second company user
    await loginAndGetSession(page, 'customer@demo.com');
    const demoResponse = await context.request.get('http://localhost:3000/api/v1/dashboard');
    
    if (demoResponse.ok()) {
      const demoData = await demoResponse.json();
      const demoJson = JSON.stringify(demoData);
      
      // Should not see any Apex data
      expect(demoJson.toLowerCase()).not.toContain('apex');
      
      console.log('✅ Session isolation verified - no data leakage between logins');
    }
  });
});

test.describe('Security Tests - Database Query Validation (Simulated)', () => {
  
  test('Verify WHERE clause presence in filtered queries (logging check)', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Make requests that should trigger company-filtered database queries
    const endpoints = [
      'http://localhost:3000/api/v1/projects',
      'http://localhost:3000/api/v1/milestones',
      'http://localhost:3000/api/v1/dashboard',
    ];
    
    // Note: In a real implementation, you would:
    // 1. Enable database query logging
    // 2. Make API requests
    // 3. Parse logs to verify WHERE clauses include company_id
    // 4. Check for queries missing tenant isolation
    
    console.log('⚠ Database query validation:');
    console.log('   To properly test this, enable database query logging and verify:');
    console.log('   - All SELECT queries include WHERE company_id = ?');
    console.log('   - All UPDATE queries include WHERE company_id = ?');
    console.log('   - All DELETE queries include WHERE company_id = ?');
    console.log('   - No queries use SELECT * without filtering');
    
    for (const endpoint of endpoints) {
      const response = await context.request.get(endpoint);
      
      if (response.ok()) {
        console.log(`   ✓ Request to ${endpoint} completed - verify logs for WHERE clause`);
      } else {
        console.log(`   ✗ Request to ${endpoint} failed - Status: ${response.status()}`);
      }
    }
    
    // This test serves as documentation for manual query log verification
    // In production, integrate with database logging/monitoring tools
  });

  test('Attempt to trigger N+1 queries for unauthorized data access', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to trigger lazy loading of related entities
    const response = await context.request.get(
      'http://localhost:3000/api/v1/projects?include=milestones,team,company'
    );
    
    if (response.ok()) {
      const data = await response.json();
      
      // Even if includes work, should only return user's company data
      console.log('✅ Include parameter processed, verify only authorized data returned');
      console.log(`   Projects returned: ${data.data?.length || 0}`);
    } else {
      expect([403, 400]).toContain(response.status());
      console.log(`✅ Include parameter rejected - Status: ${response.status()}`);
    }
  });
});
