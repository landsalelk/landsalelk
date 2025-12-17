const puppeteer = require('puppeteer');

async function getConsoleDetails() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
  });
  
  try {
    console.log('Navigating to PayHere test page...');
    await page.goto('http://localhost:3000/dashboard/payments/test', { waitUntil: 'networkidle2', timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\nDetailed Console Messages:');
    console.log('==========================');
    consoleMessages.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.type.toUpperCase()}] ${msg.text}`);
    });
    
    if (consoleMessages.length === 0) {
      console.log('No console messages captured.');
    }
    
  } catch (error) {
    console.log('Navigation error:', error.message);
  } finally {
    await browser.close();
  }
}

getConsoleDetails();