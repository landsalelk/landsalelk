const puppeteer = require('puppeteer');

async function comprehensivePayHereErrorDetection() {
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    devtools: false
  });
  
  const page = await browser.newPage();
  
  // Enable request interception to catch all network requests
  await page.setRequestInterception(true);
  
  const networkErrors = [];
  const consoleMessages = [];
  const pageErrors = [];
  const payHereRequests = [];
  const failedRequests = [];
  
  // Monitor network requests
  page.on('request', request => {
    const url = request.url();
    if (url.includes('payhere') || url.includes('payment')) {
      payHereRequests.push({
        url: url,
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    }
    request.continue();
  });
  
  page.on('response', response => {
    const url = response.url();
    if (url.includes('payhere') || url.includes('payment')) {
      const status = response.status();
      if (status >= 400) {
        failedRequests.push({
          url: url,
          status: status,
          statusText: response.statusText(),
          timestamp: new Date().toISOString()
        });
      }
    }
  });
  
  // Monitor console messages
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({
      type: msg.type(),
      text: text,
      timestamp: new Date().toISOString()
    });
    
    // Look for PayHere-specific errors
    if (text.toLowerCase().includes('payhere') && msg.type() === 'error') {
      networkErrors.push({
        type: 'console-error',
        message: text,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Monitor page errors
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });
  
  try {
    console.log('🔍 Starting comprehensive PayHere error detection...\n');
    
    // Navigate to the test page
    console.log('📍 Navigating to PayHere test page...');
    await page.goto('http://localhost:3000/dashboard/payments/test', { 
      waitUntil: 'networkidle2',
      timeout: 15000 
    });
    
    // Wait for page to load
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Check if we're on a login page
    const isLoginPage = await page.evaluate(() => {
      return document.querySelector('input[type="email"], input[type="password"]') !== null;
    });
    
    if (isLoginPage) {
      console.log('🔐 Login page detected - PayHere test requires authentication');
      console.log('📸 Taking screenshot of login page...');
      await page.screenshot({ path: 'payhere-login-page.png', fullPage: true });
      
      // Try to create a simple test page that doesn't require authentication
      console.log('📝 Creating a simple PayHere test page...');
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>PayHere Test Page</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .container { max-width: 800px; margin: 0 auto; }
            .error { color: red; }
            .success { color: green; }
            button { padding: 10px 20px; margin: 10px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>PayHere Integration Test</h1>
            <div id="payhere-container"></div>
            <button id="test-button">Test PayHere Payment</button>
            <div id="results"></div>
          </div>
          <script>
            document.getElementById('test-button').addEventListener('click', function() {
              console.log('PayHere test button clicked');
              try {
                // Simulate PayHere SDK usage
                if (typeof Payhere !== 'undefined') {
                  console.log('PayHere SDK found');
                } else {
                  console.error('PayHere SDK not found');
                }
              } catch (error) {
                console.error('PayHere error:', error.message);
              }
            });
          </script>
        </body>
        </html>
      `);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Take initial screenshot
    await page.screenshot({ path: 'payhere-initial-page.png', fullPage: true });
    
    // Analyze the page
    const pageAnalysis = await page.evaluate(() => {
      const results = {
        title: document.title,
        hasPayHereElements: false,
        payHereElementIds: [],
        hasPaymentButton: false,
        paymentButtons: [],
        hasErrors: false,
        errorMessages: [],
        scripts: [],
        payHereScriptFound: false,
        payHereScriptUrl: null
      };
      
      // Look for PayHere elements
      const payHereElements = document.querySelectorAll('[id*="payhere"], [class*="payhere"]');
      results.hasPayHereElements = payHereElements.length > 0;
      results.payHereElementIds = Array.from(payHereElements).map(el => el.id || el.className);
      
      // Look for payment buttons
      const buttons = document.querySelectorAll('button');
      results.paymentButtons = Array.from(buttons).map(btn => ({
        text: btn.textContent?.trim() || '',
        id: btn.id,
        className: btn.className,
        type: btn.type
      }));
      results.hasPaymentButton = buttons.length > 0;
      
      // Check for error messages
      const errorElements = document.querySelectorAll('.error, .Error, [data-error], .text-red-500, .text-destructive, .bg-red-50');
      errorElements.forEach(el => {
        if (el.textContent && (el.textContent.includes('PayHere') || el.textContent.includes('payment'))) {
          results.hasErrors = true;
          results.errorMessages.push(el.textContent.trim());
        }
      });
      
      // Check for PayHere scripts
      const scripts = document.querySelectorAll('script');
      results.scripts = Array.from(scripts).map(script => ({
        src: script.src,
        text: script.textContent?.substring(0, 200) || ''
      }));
      
      // Look for PayHere-specific scripts
      const payHereScript = Array.from(scripts).find(script => 
        script.src.includes('payhere') || 
        script.textContent?.includes('Payhere') ||
        script.textContent?.includes('payhere')
      );
      
      if (payHereScript) {
        results.payHereScriptFound = true;
        results.payHereScriptUrl = payHereScript.src;
      }
      
      return results;
    });
    
    console.log('📊 Page Analysis Results:');
    console.log('=====================================');
    console.log('Page Title:', pageAnalysis.title);
    console.log('Has PayHere Elements:', pageAnalysis.hasPayHereElements);
    console.log('PayHere Element IDs:', pageAnalysis.payHereElementIds);
    console.log('Has Payment Button:', pageAnalysis.hasPaymentButton);
    console.log('Payment Buttons:', pageAnalysis.paymentButtons.map(btn => btn.text));
    console.log('PayHere Script Found:', pageAnalysis.payHereScriptFound);
    console.log('PayHere Script URL:', pageAnalysis.payHereScriptUrl);
    console.log('Has Errors:', pageAnalysis.hasErrors);
    console.log('Error Messages:', pageAnalysis.errorMessages);
    
    // Test clicking payment buttons
    if (pageAnalysis.hasPaymentButton) {
      console.log('\n🖱️  Testing payment button clicks...');
      
      for (const buttonInfo of pageAnalysis.paymentButtons) {
        if (buttonInfo.text.toLowerCase().includes('pay') || 
            buttonInfo.text.toLowerCase().includes('payment') ||
            buttonInfo.text.toLowerCase().includes('boost') ||
            buttonInfo.text.toLowerCase().includes('verify') ||
            buttonInfo.text.toLowerCase().includes('test')) {
          
          try {
            console.log(`Clicking button: "${buttonInfo.text}"`);
            
            // Find and click the button
            await page.evaluate((text) => {
              const buttons = Array.from(document.querySelectorAll('button'));
              const targetButton = buttons.find(btn => btn.textContent?.trim().includes(text));
              if (targetButton) {
                targetButton.click();
              }
            }, buttonInfo.text);
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Check for changes after click
            const postClickAnalysis = await page.evaluate(() => {
              const modals = document.querySelectorAll('[role="dialog"], .modal, [class*="modal"], [id*="payhere"]');
              const newErrors = document.querySelectorAll('.error, .Error, [data-error], .text-red-500');
              
              return {
                modalCount: modals.length,
                modalIds: Array.from(modals).map(m => m.id || m.className),
                newErrorCount: newErrors.length,
                newErrorMessages: Array.from(newErrors).map(el => el.textContent?.trim())
              };
            });
            
            console.log(`Post-click results for "${buttonInfo.text}":`);
            console.log('  Modal Count:', postClickAnalysis.modalCount);
            console.log('  Modal IDs:', postClickAnalysis.modalIds);
            console.log('  New Error Count:', postClickAnalysis.newErrorCount);
            console.log('  New Error Messages:', postClickAnalysis.newErrorMessages);
            
            // Take screenshot after click
            await page.screenshot({ path: `payhere-click-${buttonInfo.text.replace(/\s+/g, '-').toLowerCase()}.png`, fullPage: true });
            
          } catch (clickError) {
            console.log(`Error clicking button "${buttonInfo.text}":`, clickError.message);
          }
        }
      }
    }
    
    // Final analysis
    console.log('\n📋 Final Error Summary:');
    console.log('=====================================');
    console.log('Network Errors:', networkErrors.length);
    console.log('Console Messages:', consoleMessages.length);
    console.log('Page Errors:', pageErrors.length);
    console.log('Failed Requests:', failedRequests.length);
    console.log('PayHere Requests:', payHereRequests.length);
    
    if (networkErrors.length > 0) {
      console.log('\n🚨 Network Errors Found:');
      networkErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.message}`);
      });
    }
    
    if (failedRequests.length > 0) {
      console.log('\n🚨 Failed PayHere Requests:');
      failedRequests.forEach((req, index) => {
        console.log(`${index + 1}. ${req.url} - ${req.status} ${req.statusText}`);
      });
    }
    
    if (consoleMessages.length > 0) {
      console.log('\n📜 Console Messages:');
      const errorMessages = consoleMessages.filter(msg => msg.type === 'error');
      const warningMessages = consoleMessages.filter(msg => msg.type === 'warning');
      
      if (errorMessages.length > 0) {
        console.log('Error Messages:');
        errorMessages.forEach((msg, index) => {
          console.log(`${index + 1}. ${msg.text}`);
        });
      }
      
      if (warningMessages.length > 0) {
        console.log('Warning Messages:');
        warningMessages.forEach((msg, index) => {
          console.log(`${index + 1}. ${msg.text}`);
        });
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'payhere-final-analysis.png', fullPage: true });
    console.log('\n📸 Screenshots saved: payhere-initial-page.png, payhere-final-analysis.png');
    
    return {
      pageAnalysis,
      networkErrors,
      consoleMessages,
      pageErrors,
      failedRequests,
      payHereRequests,
      hasCriticalErrors: networkErrors.length > 0 || failedRequests.length > 0 || pageErrors.length > 0
    };
    
  } catch (error) {
    console.error('❌ Comprehensive test failed:', error.message);
    return { error: error.message };
  } finally {
    await browser.close();
  }
}

// Run the comprehensive error detection
comprehensivePayHereErrorDetection().then(results => {
  console.log('\n🏁 Comprehensive PayHere Error Detection Complete!');
  if (results.hasCriticalErrors) {
    console.log('⚠️  CRITICAL: PayHere integration errors detected!');
    console.log('Please review the detailed analysis above.');
  } else {
    console.log('✅ SUCCESS: No critical PayHere integration errors detected.');
  }
}).catch(console.error);