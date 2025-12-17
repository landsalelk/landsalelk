// Simple browser error detection for PayHere
const puppeteer = require('puppeteer');

async function detectPayHereErrors() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Collect all console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });
  
  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
  });
  
  try {
    console.log('🧪 Testing PayHere integration...');
    
    // Navigate to the test page
    await page.goto('http://localhost:3000/dashboard/payments/test', { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    });
    
    // Wait for the page to load
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Check for specific PayHere errors
    const payHereCheck = await page.evaluate(() => {
      const results = {
        hasPayHereElements: false,
        payHereElementIds: [],
        hasErrors: false,
        errorMessages: [],
        pageTitle: document.title,
        hasPaymentButton: false,
        paymentButtonText: ''
      };
      
      // Look for PayHere related elements
      const payHereElements = document.querySelectorAll('[id*="payhere"], [class*="payhere"]');
      results.hasPayHereElements = payHereElements.length > 0;
      results.payHereElementIds = Array.from(payHereElements).map(el => el.id || el.className);
      
      // Look for payment buttons - fixed CSS selector
      const paymentButtons = document.querySelectorAll('button[type="submit"], button');
      results.hasPaymentButton = paymentButtons.length > 0;
      if (paymentButtons.length > 0) {
        results.paymentButtonText = paymentButtons[0].textContent || '';
      }
      
      // Check for error messages
      const errorElements = document.querySelectorAll('.error, .Error, [data-error], .text-red-500, .text-destructive');
      errorElements.forEach(el => {
        if (el.textContent && el.textContent.includes('PayHere')) {
          results.hasErrors = true;
          results.errorMessages.push(el.textContent.trim());
        }
      });
      
      return results;
    });
    
    console.log('📊 PayHere Analysis Results:');
    console.log('=====================================');
    console.log('Page Title:', payHereCheck.pageTitle);
    console.log('Has PayHere Elements:', payHereCheck.hasPayHereElements);
    console.log('PayHere Element IDs:', payHereCheck.payHereElementIds);
    console.log('Has Payment Button:', payHereCheck.hasPaymentButton);
    console.log('Payment Button Text:', payHereCheck.paymentButtonText);
    console.log('Has Errors:', payHereCheck.hasErrors);
    console.log('Error Messages:', payHereCheck.errorMessages);
    
    // Test clicking the payment button if it exists
    if (payHereCheck.hasPaymentButton) {
      console.log('\n🖱️  Testing payment button click...');
      
      try {
        await page.click('button[type="submit"]');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check for modal or errors after click
        const postClickCheck = await page.evaluate(() => {
          const modals = document.querySelectorAll('[role="dialog"], .modal, [class*="modal"], [id*="payhere"]');
          const newErrors = document.querySelectorAll('.error, .Error, [data-error]');
          
          return {
            modalCount: modals.length,
            modalIds: Array.from(modals).map(m => m.id || m.className),
            newErrorCount: newErrors.length,
            newErrorMessages: Array.from(newErrors).map(el => el.textContent?.trim())
          };
        });
        
        console.log('Post-click Results:');
        console.log('Modal Count:', postClickCheck.modalCount);
        console.log('Modal IDs:', postClickCheck.modalIds);
        console.log('New Error Count:', postClickCheck.newErrorCount);
        console.log('New Error Messages:', postClickCheck.newErrorMessages);
        
      } catch (clickError) {
        console.log('Button click failed:', clickError.message);
      }
    }
    
    // Final error summary
    console.log('\n📋 Console Messages Summary:');
    console.log('Total console messages:', consoleMessages.length);
    console.log('Error messages:', consoleMessages.filter(msg => msg.type === 'error').length);
    console.log('Warning messages:', consoleMessages.filter(msg => msg.type === 'warning').length);
    
    console.log('\n📋 Page Errors Summary:');
    console.log('Total page errors:', pageErrors.length);
    pageErrors.forEach((error, index) => {
      console.log(`Error ${index + 1}:`, error.message);
    });
    
    // Save screenshot
    await page.screenshot({ path: 'payhere-error-analysis.png', fullPage: true });
    console.log('\n📸 Screenshot saved as payhere-error-analysis.png');
    
    // Return comprehensive results
    return {
      payHereCheck,
      consoleMessages,
      pageErrors,
      hasCriticalErrors: pageErrors.length > 0 || payHereCheck.hasErrors
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { error: error.message };
  } finally {
    await browser.close();
  }
}

// Run the comprehensive error detection
detectPayHereErrors().then(results => {
  console.log('\n🏁 Test Complete!');
  if (results.hasCriticalErrors) {
    console.log('⚠️  Critical errors detected - PayHere integration may not be working properly');
  } else {
    console.log('✅ No critical errors detected - PayHere integration appears to be working');
  }
}).catch(console.error);