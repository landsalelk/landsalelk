const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  
  const baseUrl = 'http://localhost:3000';
  const report = {
    timestamp: new Date().toISOString(),
    pages: [],
    errors: [],
    workingFeatures: [],
    brokenFeatures: []
  };

  const routes = [
    '/',
    '/properties',
    '/agents',
    '/blog',
    '/auth/login',
    '/auth/register',
    '/auth/register/agent',
    '/become-agent',
    '/tools/mortgage-calculator',
    '/legal',
    '/kyc',
    '/terms',
    '/privacy',
    '/faq',
    '/dashboard',
    '/properties/create'
  ];

  console.log('Starting Audit...');

  for (const route of routes) {
    const url = `${baseUrl}${route}`;
    console.log(`Checking ${url}...`);
    
    // Create a new context/page for each route to prevent listener accumulation and state leakage
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Setup console listener
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Ignore expected 401 errors for guest users checking session
          // Ignore "missing scopes" which is the Appwrite guest error
          if (!text.includes('status of 401') && 
              !text.includes('missing scopes') &&
              !text.includes('User (role: guests)')) {
             report.errors.push({ route, message: text });
          }
        }
      });

      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      const status = response.status();
      const title = await page.title();

      if (status >= 200 && status < 400) {
        report.pages.push({ route, status, title, result: 'Pass' });
        report.workingFeatures.push(`Page Load: ${route}`);
      } else {
        report.pages.push({ route, status, title, result: 'Fail' });
        report.brokenFeatures.push(`Page Load: ${route} returned status ${status}`);
      }

      // Specific Checks
      if (route === '/') {
        const hero = await page.$('h1');
        if (hero) report.workingFeatures.push('Home: Hero Section');
        else report.brokenFeatures.push('Home: Hero Section Missing');
      }

      if (route === '/properties') {
         // Check if properties are listed (wait for them to load if needed)
         try {
            await page.waitForSelector('.animate-fade-in', { timeout: 5000 });
            const listings = await page.$$('.animate-fade-in'); 
            if (listings.length > 0) report.workingFeatures.push(`Properties: Found ${listings.length} listings`);
         } catch (e) {
            // Ignore if timeout, just means no listings found or different selector
         }
      }

    } catch (e) {
      console.error(`Error checking ${url}:`, e.message);
      report.errors.push({ route, message: e.message });
      report.brokenFeatures.push(`Critical Error: ${route} - ${e.message}`);
    } finally {
        await context.close();
    }
  }

  // Check a specific property page
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${baseUrl}/properties`, { waitUntil: 'networkidle' });
    
    const propertyLink = await page.$('a[href^="/properties/"]');
    if (propertyLink) {
        const href = await propertyLink.getAttribute('href');
        console.log(`Testing Dynamic Property Route: ${href}`);
        const response = await page.goto(`${baseUrl}${href}`, { waitUntil: 'networkidle' });
        if (response.status() === 200) {
            report.workingFeatures.push('Dynamic Property Page');
        } else {
            report.brokenFeatures.push(`Dynamic Property Page (${href}) failed`);
        }
    }
    await context.close();
  } catch(e) {
    console.log("Could not test dynamic property route");
  }

  await browser.close();

  // Save Report
  fs.writeFileSync('AUDIT_REPORT_FINAL.json', JSON.stringify(report, null, 2));
  console.log('Audit Complete. Report saved to AUDIT_REPORT_FINAL.json');
})();