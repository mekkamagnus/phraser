import { test, expect } from '@playwright/test';

test.describe('Phraser Application UI Tests', () => {
  test('should load the homepage successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('http://localhost:3001');
    
    // Wait for the page to load
    await expect(page).toHaveTitle(/Phraser/); // Adjust title expectation as needed
    
    // Check if main elements are present
    await expect(page.locator('text=Welcome')).toBeVisible();
    await expect(page.locator('text=Translate')).toBeVisible();
  });

  test('should handle translation input', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('http://localhost:3001');
    
    // Find the input field and enter text
    const inputField = page.locator('textarea[data-testid="source-input"]');
    await expect(inputField).toBeVisible();
    await inputField.fill('Hello world');
    
    // Find and click the translate button
    const translateButton = page.locator('button:has-text("Translate")');
    await expect(translateButton).toBeVisible();
    await translateButton.click();
    
    // Wait for the translation to appear
    await page.waitForResponse(response => response.url().includes('/api/translate'));
    
    // Check if translation appeared
    const translationResult = page.locator('[data-testid="translation-result"]');
    await expect(translationResult).toBeVisible();
  });

  test('should navigate to different pages', async ({ page }) => {
    // Test navigation to dashboard
    await page.goto('http://localhost:3001');
    const dashboardLink = page.locator('nav a:has-text("Dashboard")');
    if (await dashboardLink.count() > 0) {
      await dashboardLink.click();
      await expect(page).toHaveURL(/.*dashboard/);
    }
    
    // Test navigation to review page
    await page.goto('http://localhost:3001');
    const reviewLink = page.locator('nav a:has-text("Review")');
    if (await reviewLink.count() > 0) {
      await reviewLink.click();
      await expect(page).toHaveURL(/.*review/);
    }
    
    // Test navigation to tags page
    await page.goto('http://localhost:3001');
    const tagsLink = page.locator('nav a:has-text("Tags")');
    if (await tagsLink.count() > 0) {
      await tagsLink.click();
      await expect(page).toHaveURL(/.*tags/);
    }
  });
});