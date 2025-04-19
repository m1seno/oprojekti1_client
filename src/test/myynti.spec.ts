import { test, expect } from '@playwright/test';

test('myynnin luominen toimii oikein', async ({ page }) => {
  // Avaa kirjautumissivu
  await page.goto('http://localhost:5173/login');

  // Kirjaudu sisään
  await page.fill('input[type="email"]', 'admin@oprojekti1.com');
  await page.fill('input[type="password"]', 'salasana123');
  await page.click('button:has-text("Kirjaudu")');

  // Odota navigointia lipunmyyntiin
  await page.waitForURL('**/lipunmyynti');

  // Odotetaan että tapahtuma dropdown latautuu ja valitaan ensimmäinen
  await page.waitForSelector('select');
  await page.selectOption('select', { index: 1 });

  // Odotetaan että lippujen syöttökentät ilmestyvät
  await page.waitForSelector('input[type="number"]');

  // Täytetään lipun määrä ja sähköposti
  await page.fill('input[type="number"]', '2');
  await page.fill('input[type="email"]', 'asiakas@esimerkki.com');

  // Klikataan myyntinappia
  await page.click('button:has-text("Myy liput")');

  // Varmistetaan onnistumisviesti
  const successMessage = await page.locator('.text-blue-600');
  await expect(successMessage).toContainText('Myynti onnistui');
});


test('näyttää virheilmoituksen jos tapahtuma tai sähköposti puuttuu', async ({ page }) => {
  // Avaa kirjautumissivu ja kirjaudu ensin sisään
  await page.goto('http://localhost:5173/login');
  await page.fill('input[type="email"]', 'admin@oprojekti1.com');
  await page.fill('input[type="password"]', 'salasana123');
  await page.click('button:has-text("Kirjaudu")');
  await page.waitForURL('**/lipunmyynti');

  // Odota että myyntinappula on saatavilla
  await page.waitForSelector('button:has-text("Myy liput")');

  // Yritetään lähettää lomake ilman tietoja
  await page.click('button:has-text("Myy liput")');

  // Varmistetaan virheilmoitus
  const errorMessage = await page.locator('.text-blue-600');
  await expect(errorMessage).toHaveText('Täytä sähköposti ja valitse tapahtuma.');
});
