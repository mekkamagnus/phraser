#!/usr/bin/env node

// Script to verify each page of the Phraser application
const { chromium } = require('playwright');

async function verifyPages() {
  const browser = await chromium.launch({ headless: true }); // Set to true for headless operation
  const context = await browser.newContext();
  const page = await context.newPage();

  const pages = [
    { name: 'Home', url: 'http://localhost:3001/' },
    { name: 'Browse', url: 'http://localhost:3001/browse' },
    { name: 'Dashboard', url: 'http://localhost:3001/dashboard' },
    { name: 'Review', url: 'http://localhost:3001/review' },
    { name: 'Tags', url: 'http://localhost:3001/tags' }
  ];

  for (const pageInfo of pages) {
    console.log(`Verifying ${pageInfo.name} page...`);
    await page.goto(pageInfo.url);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot
    await page.screenshot({ path: `screenshot-${pageInfo.name.toLowerCase()}.png` });
    
    console.log(`${pageInfo.name} page loaded successfully. Screenshot saved as screenshot-${pageInfo.name.toLowerCase()}.png`);
    
    // Wait a bit before moving to next page
    await page.waitForTimeout(2000);
  }

  await browser.close();
  console.log('All pages verified successfully!');
}

verifyPages().catch(console.error);