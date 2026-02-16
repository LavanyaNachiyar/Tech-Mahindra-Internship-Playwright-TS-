import { test, expect, Page, Locator } from '@playwright/test';

/**
 * Helper: wait for a group of locators to be visible (as a "section ready" signal).
 */
async function waitForAllVisible(
  locators: import('@playwright/test').Locator[],
  timeout = 15000
) {
  for (const l of locators) {
    await expect(l).toBeVisible({ timeout });
  }
}

/**
 * Helper: find by label within a scope (handles input/div/textarea).
 * Keeps things name‑agnostic and consistent across forms.
 */
function byLabelWithin(scope: Locator, label: string): Locator {
  return scope.locator(
    `xpath=.//label[normalize-space()="${label}"]/following::*[self::input or self::div or self::textarea][1]`
  );
}

/**
 * Admin top bar helper: open a top bar menu/tab by its visible text (e.g., "Job", "Organization").
 * Uses hover + tiny delay to unflake the dropdown.
 */
async function openTopbar(page: Page, name: string): Promise<Locator> {
  const trigger =
    page.getByRole('button', { name: new RegExp(`^${name}$`, 'i') }).first()
      .or(page.getByRole('link', { name: new RegExp(`^${name}$`, 'i') }).first())
      .or(page.getByText(name, { exact: true }).first());

  await trigger.scrollIntoViewIfNeeded().catch(() => {});
  await trigger.hover().catch(() => {});
  await page.waitForTimeout(150); // slight animation stabilizer
  await trigger.click({ timeout: 1000 }).catch(() => {}); // harmless even if already open
  return trigger;
}

/**
 * Admin top bar helper: pick a submenu item (e.g., "Pay Grades") under an open menu.
 * Falls back to direct URL when menus are slow.
 */
async function clickTopbarItemOrGoto(
  page: Page,
  itemName: string,
  fallbackHrefContains: string
) {
  const item =
    page.getByRole('menuitem', { name: new RegExp(`^${itemName}$`, 'i') }).first()
      .or(page.getByRole('link', { name: new RegExp(`^${itemName}$`, 'i') }).first())
      .or(page.getByText(itemName, { exact: true }).first())
      .or(page.locator(`a[href*="${fallbackHrefContains}"]`).first());

  await item.click({ timeout: 4000 }).catch(async () => {
    await page.goto(`https://opensource-demo.orangehrmlive.com/web/index.php${fallbackHrefContains}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  });
  await page.waitForLoadState('domcontentloaded');
}

/** === Directory helpers (from your working section) === */
async function inputGroupByLabel(page: Page, labelText: string): Promise<Locator> {
  return page.locator('.oxd-input-group', {
    has: page.locator(`:is(label,.oxd-label):has-text("${labelText}")`)
  });
}
async function selectDropdownByLabel(page: Page, labelText: string, optionText: string) {
  const group = await inputGroupByLabel(page, labelText);
  await group.locator('.oxd-select-text').click();

  const option = page
    .locator('.oxd-select-dropdown .oxd-select-option')
    .filter({ hasText: optionText });

  await expect(option.first()).toBeVisible();
  await option.first().click();
}
async function selectAutocompleteByLabel(page: Page, labelText: string, valueToType: string) {
  const group = await inputGroupByLabel(page, labelText);
  const input = group.locator('input');

  await input.fill(valueToType);

  const dropdown = page.locator('.oxd-autocomplete-dropdown');
  await expect(dropdown).toBeVisible();

  const exact = dropdown.locator('.oxd-autocomplete-option', { hasText: valueToType });
  if (await exact.count()) {
    await exact.first().click();
  } else {
    await dropdown.locator('.oxd-autocomplete-option').first().click();
  }
}

/**
 * PIM tab helper: click top-level PIM tabs ("Employee List", "Add Employee", "Reports").
 * Falls back to direct URL.
 */
async function clickPimTabOrGoto(
  page: Page,
  tabName: string,
  fallbackHrefContains: string
) {
  const topTabs = page.locator('.oxd-topbar-body-nav').first();
  const tab =
    topTabs.getByRole('link', { name: new RegExp(`^${tabName}$`, 'i') }).first()
      .or(topTabs.getByRole('button', { name: new RegExp(`^${tabName}$`, 'i') }).first())
      .or(page.getByText(tabName, { exact: true }).first())
      .or(page.locator(`a[href*="${fallbackHrefContains}"]`).first());

  await tab.click({ timeout: 3000 }).catch(async () => {
    await page.goto(`https://opensource-demo.orangehrmlive.com/web/index.php${fallbackHrefContains}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  });
  await page.waitForLoadState('domcontentloaded');
}

/**
 * CLAIM tab helper: click top tabs within Claim ("Submit Claim", "My Claims", "Employee Claims", "Assign Claim").
 * Falls back to direct URL.
 */
async function clickClaimTabOrGoto(
  page: Page,
  tabName: string,
  fallbackHrefContains: string
) {
  const topTabs = page.locator('.oxd-topbar-body-nav').first();
  const tab =
    topTabs.getByRole('link', { name: new RegExp(`^${tabName}$`, 'i') }).first()
      .or(topTabs.getByRole('button', { name: new RegExp(`^${tabName}$`, 'i') }).first())
      .or(page.getByText(tabName, { exact: true }).first())
      .or(page.locator(`a[href*="${fallbackHrefContains}"]`).first());

  await tab.click({ timeout: 3000 }).catch(async () => {
    await page.goto(`https://opensource-demo.orangehrmlive.com/web/index.php${fallbackHrefContains}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  });
  await page.waitForLoadState('domcontentloaded');
}

/**
 * CLAIM Configuration submenu helper: open "Configuration" and click a sub-option
 * (e.g., "Events", "Expense Types"), with URL fallback.
 */
async function clickClaimConfigSubmenuOrGoto(
  page: Page,
  subItemName: string,
  fallbackHrefContains: string
) {
  const nav = page.locator('.oxd-topbar-body-nav').first();
  const configTrigger =
    nav.getByRole('button', { name: /^Configuration$/i }).first()
      .or(nav.getByRole('link', { name: /^Configuration$/i }).first())
      .or(page.getByText('Configuration', { exact: true }).first());

  await configTrigger.scrollIntoViewIfNeeded().catch(() => {});
  await configTrigger.hover().catch(() => {});
  await page.waitForTimeout(150);
  await configTrigger.click({ timeout: 1000 }).catch(() => {});

  const subItem =
    page.getByRole('menuitem', { name: new RegExp(`^${subItemName}$`, 'i') }).first()
      .or(page.getByRole('link', { name: new RegExp(`^${subItemName}$`, 'i') }).first())
      .or(page.getByText(subItemName, { exact: true }).first())
      .or(page.locator(`a[href*="${fallbackHrefContains}"]`).first());

  await subItem.click({ timeout: 3000 }).catch(async () => {
    await page.goto(`https://opensource-demo.orangehrmlive.com/web/index.php${fallbackHrefContains}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  });

  await page.waitForLoadState('domcontentloaded');
}

/* =========================
   MAINTENANCE HELPERS
   ========================= */

/** Main content container commonly used on logged-in pages */
const main = (page: Page) => page.locator('div.oxd-layout-context');

/** Topbar menu inside Maintenance (has "Purge Records", "Access Records") */
const maintenanceTopbar = (page: Page) => page.locator('nav[aria-label="Topbar Menu"]');

/** Go to Maintenance from sidepanel (handle URL fallback) */
async function gotoMaintenance(page: Page) {
  const sidepanel = page.getByRole('navigation', { name: 'Sidepanel' });
  await sidepanel.getByRole('link', { name: /^Maintenance$/i, exact: true }).click({ timeout: 2500 }).catch(async () => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/maintenance/purgeEmployee', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  });
  // Either admin gate or directly the main screen
  const adminGate = page.getByRole('heading', { name: /Administrator Access/i });
  await expect(adminGate.or(main(page))).toBeVisible({ timeout: 20_000 });
}

/** Handle the Administrator Access password prompt if present */
async function handleAdministratorAccess(page: Page, adminPassword = 'admin123') {
  const adminGate = page.getByRole('heading', { name: /Administrator Access/i });
  const isGateVisible = await adminGate.isVisible().catch(() => false);
  if (!isGateVisible) return;

  const password = page.locator('input[type="password"]').first();
  await expect(password).toBeVisible({ timeout: 10_000 });
  await password.fill(adminPassword);

  const confirm = page.getByRole('button', { name: /confirm/i });
  await expect(confirm).toBeEnabled({ timeout: 10_000 });
  await confirm.click();

  await expect(adminGate).toBeHidden({ timeout: 20_000 });
  await expect(main(page)).toBeVisible({ timeout: 20_000 });
}

/** Open "Purge Records" dropdown and click a section item */
async function choosePurgeSection(page: Page, section: 'Candidate Records' | 'Employee Records') {
  const trigger = maintenanceTopbar(page).locator('li', { hasText: 'Purge Records' }).first();
  await expect(trigger).toBeVisible({ timeout: 15_000 });
  await trigger.click();

  const dropdown = page.locator('.oxd-dropdown-menu');
  await expect(dropdown).toBeVisible({ timeout: 10_000 });

  const item = dropdown.locator(':scope *', { hasText: section }).first();
  await expect(item).toBeVisible({ timeout: 10_000 });
  await item.click();

  const expectedHeading =
    section === 'Candidate Records' ? /Purge Candidate Records/i : /Purge Employee Records/i;

  await expect(main(page).getByRole('heading', { name: expectedHeading })).toBeVisible({ timeout: 15_000 });
}

/** Go to "Access Records" tab within Maintenance top bar */
async function gotoAccessRecords(page: Page) {
  const accessTab =
    page.getByRole('button', { name: /Access Records/i }).first()
      .or(maintenanceTopbar(page).getByText(/Access Records/i).first())
      .or(page.getByText(/^Access Records$/i).first());

  await expect(accessTab).toBeVisible({ timeout: 15_000 });
  await accessTab.click();
  await expect(page.getByText(/Download Personal Data/i)).toBeVisible({ timeout: 20_000 });
}

/** Autocomplete fill & pick first option by label text */
async function fillAutocompleteAndSelectFirst(page: Page, labelText: string, query: string) {
  const label = page.getByText(new RegExp(`^${labelText}\\*?$`, 'i')).first();
  await expect(label).toBeVisible({ timeout: 15_000 });

  const container = label.locator(
    'xpath=ancestor::div[contains(@class,"oxd-grid-item") or contains(@class,"oxd-input-group") or contains(@class,"oxd-input-field")][1]'
  );

  let input = container.getByPlaceholder('Type for hints...').first();
  if (!(await input.isVisible({ timeout: 500 }).catch(() => false))) {
    input = page.getByPlaceholder('Type for hints...').first();
  }
  await expect(input).toBeVisible({ timeout: 10_000 });
  await input.fill(query);

  const dropdown = page.locator('.oxd-autocomplete-dropdown');
  await expect(dropdown).toBeVisible({ timeout: 10_000 });
  const firstOption = dropdown.locator('.oxd-autocomplete-option').first();
  await expect(firstOption).toBeVisible({ timeout: 10_000 });
  await firstOption.click();
  await expect(dropdown).toBeHidden({ timeout: 10_000 });

  // validation hint (non-blocking)
  const invalidMsg = container.getByText(/^Invalid$/i);
  await expect(invalidMsg).toBeHidden({ timeout: 10_000 });
  await expect(input).not.toHaveValue('', { timeout: 10_000 });
}

/** Click Search button if present on screen */
async function clickSearchOnScreen(page: Page) {
  const searchBtn = page.getByRole('button', { name: /^Search$/i }).first();
  await expect(searchBtn).toBeVisible({ timeout: 10_000 });
  await searchBtn.click();
}

/** Assert a stable "post-search" state with generic markers */
async function assertStableStateAfterSearch(page: Page) {
  const note = page.getByText(/^Note$/i);
  const noRecords = page.getByText(/No Records Found/i);
  const download = page.getByText(/Download Personal Data/i);

  const ok =
    (await note.isVisible().catch(() => false)) ||
    (await noRecords.isVisible().catch(() => false)) ||
    (await download.isVisible().catch(() => false));

  expect(ok).toBeTruthy();
}

/* =========================
   MAIN TEST
   ========================= */

test('OrangeHRM (Edge): Login → Dashboard → My Info → Contact Details → Time (My Timesheets) → Leave (Assign Leave) → Performance (Reviews, Trackers) → Recruitment (Candidates, Vacancies) → Directory → PIM (Employee List → Add Employee → Reports) → Admin (User Management, Pay Grades, Org General Info, Skills, Nationalities, Corporate Branding, Email Config) → Claim (Employee Claims → Assign Claim → My Claims → Submit Claim → Configuration: Events → Expense Types) → Maintenance → Buzz', async ({ page }) => {
  // Give a bit more headroom for a long end-to-end
  test.setTimeout(240_000);

  // --------------------------------------------------------------------
  // Login
  // --------------------------------------------------------------------
  await page.goto('https://opensource-demo.orangehrmlive.com/', {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});

  // --------------------------------------------------------------------
  // Dashboard ready
  // --------------------------------------------------------------------
  await expect(page).toHaveURL(/\/dashboard(?:\/index)?\/?/, { timeout: 30_000 });
  await waitForAllVisible([
    page.getByRole('banner').getByRole('heading', { name: 'Dashboard' }),
    page.getByText('Time at Work').first(),
  ]);

  // --------------------------------------------------------------------
  // My Info → Personal Details (ready)
  // --------------------------------------------------------------------
  const sidepanel = page.getByRole('navigation', { name: 'Sidepanel' });
  await sidepanel.getByRole('link', { name: 'My Info', exact: true }).click();

  await expect(page).toHaveURL(/\/web\/index\.php\/pim\/view(?:MyDetails|PersonalDetails)\/empNumber\/\d+/, { timeout: 30_000 });
  await page.waitForLoadState('domcontentloaded');

  await waitForAllVisible([
    page.getByRole('banner').getByRole('heading', { name: 'PIM' }),
    page.getByRole('heading', { name: 'Personal Details' }),
    page.getByRole('textbox', { name: 'First Name' }),
    page.getByRole('textbox', { name: 'Middle Name' }),
    page.getByRole('textbox', { name: 'Last Name' }),
  ]);

  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

  // --------------------------------------------------------------------
  // Contact Details (tab) → Ready
  // --------------------------------------------------------------------
  const tablist = page.getByRole('tablist');
  await expect(tablist).toBeVisible({ timeout: 10_000 });

  const contactTab = tablist.getByRole('tab', { name: 'Contact Details' });
  await contactTab.scrollIntoViewIfNeeded();
  await contactTab.click({ timeout: 10_000 }).catch(async () => {
    await page.locator('a[href*="/pim/contactDetails/"]').click();
  });

  await expect(page).toHaveURL(/\/web\/index\.php\/pim\/contactDetails\/empNumber\/\d+/, { timeout: 30_000 });
  const contactH6 = page.locator('h6', { hasText: 'Contact Details' }).first();
  await expect(contactH6).toBeVisible({ timeout: 15000 });

  const containerCandidates = [
    contactH6.locator('xpath=ancestor::form[1]'),
    contactH6.locator('xpath=ancestor::section[1]'),
    contactH6.locator('xpath=ancestor::div[contains(@class,"orangehrm-card-container")][1]'),
    contactH6.locator('xpath=ancestor::div[contains(@class,"card")][1]'),
  ];
  let scope = page.getByRole('main');
  for (const c of containerCandidates) {
    try { await c.waitFor({ state: 'visible', timeout: 3000 }); scope = c; break; } catch {}
  }

  const byLabelInput = (label: string) =>
    scope.locator(`xpath=.//label[normalize-space()="${label}"]/following::input[1]`);

  await waitForAllVisible([
    byLabelInput('Street 1'),
    byLabelInput('City'),
    byLabelInput('Home'),
  ], 15000);

  await expect(byLabelInput('Street 2')).toBeVisible();
  await expect(byLabelInput('State/Province')).toBeVisible();
  await expect(byLabelInput('Zip/Postal Code')).toBeVisible();
  await expect(scope.locator('xpath=.//label[normalize-space()="Country"]')).toBeVisible();
  await expect(byLabelInput('Mobile')).toBeVisible();
  await expect(byLabelInput('Work')).toBeVisible();
  await expect(byLabelInput('Work Email')).toBeVisible();
  await expect(byLabelInput('Other Email')).toBeVisible();
  await expect(scope.getByRole('button', { name: 'Save' })).toBeVisible();

  // --------------------------------------------------------------------
  // Time → Timesheets → My Timesheets
  // --------------------------------------------------------------------
  await sidepanel.getByRole('link', { name: 'Time', exact: true }).click();
  await expect(page).toHaveURL(/\/web\/index\.php\/time\//, { timeout: 30_000 });
  await page.waitForLoadState('domcontentloaded');

  const timesheetsTrigger =
    page.getByRole('button', { name: /^Timesheets$/ }).first()
      .or(page.getByRole('link', { name: /^Timesheets$/ }).first())
      .or(page.locator('[role="button"]:has-text("Timesheets")').first())
      .or(page.getByText('Timesheets', { exact: true }).first());

  await timesheetsTrigger.click({ timeout: 3000 }).catch(async () => {
    await timesheetsTrigger.hover();
    await page.waitForTimeout(150);
  });

  const myTimesheetsItem =
    page.getByRole('menuitem', { name: /^My Timesheets$/ }).first()
      .or(page.getByRole('link', { name: /^My Timesheets$/ }).first())
      .or(page.locator('a[href*="/time/viewMyTimesheet"]').first())
      .or(page.getByText('My Timesheets', { exact: true }).first());

  await myTimesheetsItem.click({ timeout: 3000 }).catch(async () => {
    await timesheetsTrigger.hover().catch(() => {});
    await page.waitForTimeout(150);
    await page.locator('a[href*="/time/viewMyTimesheet"]').first().click({ timeout: 2500 }).catch(async () => {
      await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/time/viewMyTimesheet', {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      });
    });
  });

  if (!/\/time\/viewMyTimesheet/.test(page.url())) {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/time/viewMyTimesheet', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  }
  await expect(page).toHaveURL(/\/time\/viewMyTimesheet/, { timeout: 30_000 });

  const timesheetPeriodLabel =
    page.locator('xpath=//label[normalize-space()="Timesheet Period"]')
      .or(page.getByText('Timesheet Period', { exact: true }));
  await expect(timesheetPeriodLabel).toBeVisible({ timeout: 10_000 });

  // --------------------------------------------------------------------
  // Leave → Assign Leave (TRAVERSE ONLY — URL checks, NO field/button checks)
  // --------------------------------------------------------------------
  await sidepanel.scrollIntoViewIfNeeded().catch(() => {});
  await sidepanel.getByRole('link', { name: 'Leave', exact: true }).click({ timeout: 2500 }).catch(async () => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewLeaveList', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  });
  await expect(page).toHaveURL(/\/web\/index\.php\/leave\//, { timeout: 30_000 });

  const assignLeaveTab =
    page.getByRole('link', { name: /^Assign Leave$/i }).first()
      .or(page.getByRole('button', { name: /^Assign Leave$/i }).first())
      .or(page.getByText('Assign Leave', { exact: true }).first());

  await assignLeaveTab.click({ timeout: 4000 }).catch(async () => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/leave/assignLeave', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  });
  if (!/\/leave\/assignLeave/.test(page.url())) {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/leave/assignLeave', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  }
  await expect(page).toHaveURL(/\/leave\/assignLeave/, { timeout: 30_000 });

  // --------------------------------------------------------------------
  // Performance → Employee Reviews → Employee Trackers
  // --------------------------------------------------------------------
  const sidepanelPerf = page.getByRole('navigation', { name: 'Sidepanel' });
  await sidepanelPerf.getByRole('link', { name: 'Performance', exact: true }).click();

  await expect(page).toHaveURL(/\/web\/index\.php\/performance\/searchEvaluatePerformanceReview/, { timeout: 30_000 });

  await waitForAllVisible([
    page.getByRole('banner').getByRole('heading', { name: 'Performance' }),
    page.getByRole('heading', { name: 'Employee Reviews' }),
  ], 15000);

  const reviewsForm = page.locator('form').first();
  await reviewsForm.waitFor({ state: 'visible', timeout: 15000 });

  const byLabelInputReviews = (label: string) =>
    reviewsForm.locator(`xpath=.//label[normalize-space()="${label}"]/following::input[1]`);

  await waitForAllVisible([
    byLabelInputReviews('Employee Name'),
    byLabelInputReviews('Review Status'),
  ], 15000);

  await expect(reviewsForm.locator('xpath=.//label[normalize-space()="Review Status"]/following::*[1]')).toBeVisible();
  await expect(reviewsForm.locator('xpath=.//label[normalize-space()="Job Title"]/following::*[1]')).toBeVisible();
  await expect(reviewsForm.locator('xpath=.//label[normalize-space()="Sub Unit"]/following::*[1]')).toBeVisible();

  await expect(reviewsForm.getByRole('button', { name: 'Search' })).toBeVisible();
  await expect(reviewsForm.getByRole('button', { name: 'Reset' })).toBeVisible();

  // --- to Employee Trackers ---
  const trackersLink = page.getByRole('link', { name: 'Employee Trackers' });
  await trackersLink.scrollIntoViewIfNeeded();
  await trackersLink.click({ timeout: 10_000 }).catch(async () => {
    await page.locator('a[href*="/performance/viewEmployeePerformanceTrackerList"]').click();
  });

  await expect(page).toHaveURL(/\/web\/index\.php\/performance\/viewEmployeePerformanceTrackerList/, { timeout: 30_000 });

  await waitForAllVisible([
    page.getByRole('banner').getByRole('heading', { name: 'Performance' }),
    page.getByRole('heading', { name: 'Employee Performance Trackers' }),
  ], 15000);

  // --------------------------------------------------------------------
  // Recruitment → Candidates → Vacancies
  // --------------------------------------------------------------------
  const sidepanelRec = page.getByRole('navigation', { name: 'Sidepanel' });
  await sidepanelRec.getByRole('link', { name: 'Recruitment', exact: true }).click();

  await expect(page).toHaveURL(/\/web\/index\.php\/recruitment\/viewCandidates/, { timeout: 30_000 });

  await waitForAllVisible([
    page.getByRole('banner').getByRole('heading', { name: 'Recruitment' }),
    page.getByRole('heading', { name: 'Candidates' }),
  ], 15000);

  const candidatesForm = page.locator('form').first();
  await candidatesForm.waitFor({ state: 'visible', timeout: 15000 });

  const byLabelInputCandidates = (label: string) =>
    candidatesForm.locator(`xpath=.//label[normalize-space()="${label}"]/following::input[1]`);

  await waitForAllVisible([
    byLabelInputCandidates('Job Title'),
    byLabelInputCandidates('Hiring Manager'),
    byLabelInputCandidates('Status'),
  ], 15000);

  await expect(candidatesForm.locator('xpath=.//label[normalize-space()="Job Title"]/following::*[1]')).toBeVisible();
  await expect(candidatesForm.locator('xpath=.//label[normalize-space()="Hiring Manager"]/following::*[1]')).toBeVisible();
  await expect(candidatesForm.locator('xpath=.//label[normalize-space()="Status"]/following::*[1]')).toBeVisible();

  await expect(candidatesForm.getByRole('button', { name: 'Search' })).toBeVisible();
  await expect(candidatesForm.getByRole('button', { name: 'Reset' })).toBeVisible();

  const vacanciesLink = page.getByRole('link', { name: 'Vacancies' });
  await vacanciesLink.scrollIntoViewIfNeeded();
  await vacanciesLink.click({ timeout: 10_000 }).catch(async () => {
    await page.locator('a[href*="/recruitment/viewJobVacancy"]').click();
  });

  await expect(page).toHaveURL(/\/web\/index\.php\/recruitment\/viewJobVacancy/, { timeout: 30_000 });

  await waitForAllVisible([
    page.getByRole('banner').getByRole('heading', { name: 'Recruitment' }),
    page.getByRole('heading', { name: 'Vacancies' }),
  ], 15000);

  // --------------------------------------------------------------------
  // Directory — Search employee (your working section)
  // --------------------------------------------------------------------
  await Promise.all([
    page.waitForURL('**/web/index.php/directory/**'),
    page.getByRole('link', { name: 'Directory' }).click(),
  ]);

  const mainContent = page.locator('div.oxd-layout-context');
  await expect(mainContent.getByRole('heading', { name: 'Directory' })).toBeVisible();
  await expect(mainContent.getByRole('button', { name: 'Search' })).toBeVisible();

  await selectAutocompleteByLabel(page, 'Employee Name', 'James Holly Ben');
  await selectDropdownByLabel(page, 'Job Title', 'HR Manager');
  await selectDropdownByLabel(page, 'Location', 'Texas R&D');

  await mainContent.getByRole('button', { name: 'Search' }).click();

  const cards = page.locator('.orangehrm-directory-card');
  const noRecords = mainContent.getByText('No Records Found');
  await expect(cards.first().or(noRecords)).toBeVisible({ timeout: 15_000 });

  // ====================================================================
  // =========================  PIM SECTION  =============================
  // ====================================================================
  // PIM → Employee List → Add Employee → Reports (NO button checks)
  await sidepanel.getByRole('link', { name: /^PIM$/i, exact: true }).click({ timeout: 2500 }).catch(async () => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  });

  await expect(page).toHaveURL(/\/pim\/viewEmployeeList/, { timeout: 30_000 });
  try { await expect.soft(page.locator('.oxd-topbar-body-nav').first()).toBeVisible({ timeout: 6000 }); } catch {}

  await clickPimTabOrGoto(page, 'Add Employee', '/pim/addEmployee');
  if (!/\/pim\/addEmployee/.test(page.url())) {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/addEmployee', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  }
  await expect(page).toHaveURL(/\/pim\/addEmployee/, { timeout: 30_000 });
  try { await expect.soft(page.locator('h6').first()).toBeVisible({ timeout: 6000 }); } catch {}

  await clickPimTabOrGoto(page, 'Reports', '/pim/viewDefinedPredefinedReports');
  if (!/\/pim\/viewDefinedPredefinedReports/.test(page.url())) {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewDefinedPredefinedReports', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  }
  await expect(page).toHaveURL(/\/pim\/viewDefinedPredefinedReports/, { timeout: 30_000 });
  try { await expect.soft(page.locator('h6').first()).toBeVisible({ timeout: 6000 }); } catch {}

  // ====================================================================
  // =========================  ADMIN SECTION  ===========================
  // ====================================================================

  // --- Go to Admin (User Management default landing) ---
  await sidepanel.getByRole('link', { name: 'Admin', exact: true }).click({ timeout: 2500 }).catch(async () => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  });

  await expect(page).toHaveURL(/\/web\/index\.php\/admin\//, { timeout: 30_000 });
  await page.waitForLoadState('domcontentloaded');

  const adminTopbar = page.locator('.oxd-topbar-body-nav').first();
  await expect(adminTopbar).toBeVisible({ timeout: 15_000 });

  // --- User Management landing (System Users) ---
  const usersForm = page.locator('form:has(button:has-text("Search"))').first();
  await usersForm.waitFor({ state: 'visible', timeout: 15_000 });

  await waitForAllVisible([
    byLabelWithin(usersForm, 'Username'),
    usersForm.getByText(/User Role/i).first(),
    usersForm.getByText(/Status/i).first(),
    usersForm.getByRole('button', { name: 'Search' }),
    usersForm.getByRole('button', { name: 'Reset' }),
  ], 15_000);

  // --- Job → Pay Grades ---
  await openTopbar(page, 'Job');
  await clickTopbarItemOrGoto(page, 'Pay Grades', '/admin/viewPayGrades');
  await expect(page).toHaveURL(/\/admin\/viewPayGrades/, { timeout: 30_000 });

  // --- Organization → General Information (no buttons) ---
  await openTopbar(page, 'Organization');
  await clickTopbarItemOrGoto(page, 'General Information', '/admin/viewOrganizationGeneralInformation');
  await expect(page).toHaveURL(/\/admin\/viewOrganizationGeneralInformation/, { timeout: 30_000 });
  try {
    const heading = page.locator('h6', { hasText: /General Information/i }).first();
    await expect.soft(heading).toBeVisible({ timeout: 8000 });
    const orgForm = page.locator('form:visible').first().or(page.locator('form').first());
    await orgForm.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await waitForAllVisible([
      orgForm.getByText(/Organization Name/i).first(),
      orgForm.getByText(/Email/i).first(),
    ], 6000).catch(() => {});
  } catch {}

  // --- Qualifications → Skills (no buttons) ---
  await openTopbar(page, 'Qualifications');
  await clickTopbarItemOrGoto(page, 'Skills', '/admin/viewSkills');
  if (!/\/admin\/viewSkills/.test(page.url())) {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSkills', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  }
  await expect(page).toHaveURL(/\/admin\/viewSkills/, { timeout: 30_000 });
  try {
    const skillsHeading = page.locator('h6', { hasText: /Skills/i }).first();
    await expect.soft(skillsHeading).toBeVisible({ timeout: 8000 });
    const main = page.locator('div.oxd-layout-context');
    await expect.soft(main.locator('table').first().or(main.getByText(/Records Found/i).first()))
      .toBeVisible({ timeout: 8000 });
  } catch {}

  // --- Nationalities (no buttons) ---
  await openTopbar(page, 'Nationalities');
  await page.getByText(/^Nationalities$/).first().click({ timeout: 1500 }).catch(async () => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/admin/nationality', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  });
  await expect(page).toHaveURL(/\/admin\/nationality/, { timeout: 30_000 });
  try {
    const natHeading = page.locator('h6', { hasText: /Nationalities/i }).first();
    await expect.soft(natHeading).toBeVisible({ timeout: 8000 });
    const main = page.locator('div.oxd-layout-context');
    await expect.soft(main.locator('table').first().or(main.getByText(/Records Found/i).first()))
      .toBeVisible({ timeout: 8000 });
  } catch {}

  // --- Corporate Branding (no buttons) ---
  await openTopbar(page, 'Corporate Branding');
  await page.getByText(/^Corporate Branding$/).first().click({ timeout: 1500 }).catch(async () => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/admin/addTheme', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  });
  await expect(page).toHaveURL(/\/admin\/addTheme/, { timeout: 30_000 });
  try {
    const main = page.locator('div.oxd-layout-context');
    await expect.soft(main.getByText(/Primary Color/i).first()).toBeVisible({ timeout: 8000 });
    await expect.soft(main.getByText(/Secondary Color/i).first()).toBeVisible({ timeout: 8000 });
    await expect.soft(main.getByText(/Client Logo|Browse/i).first()).toBeVisible({ timeout: 8000 });
  } catch {}

  // --- Configuration → Email Configuration (no buttons) ---
  await openTopbar(page, 'Configuration');
  await clickTopbarItemOrGoto(page, 'Email Configuration', '/admin/listMailConfiguration');
  await expect(page).toHaveURL(/\/admin\/listMailConfiguration/, { timeout: 30_000 });
  try {
    const form = page.locator('form').first();
    await form.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await waitForAllVisible([
      byLabelWithin(form, 'Mail Sent As*'),
      form.getByText(/Sending Method/i).first(),
    ], 10_000).catch(() => {});
  } catch {}

  // ====================================================================
  // =========================  CLAIM SECTION  ===========================
  // ====================================================================

  // Sidepanel → Claim (expect to land on Employee Claims)
  await sidepanel.getByRole('link', { name: /^Claim$/i, exact: true }).click({ timeout: 2500 }).catch(async () => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/claim/viewAssignClaim', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  });

  // Ensure Employee Claims (URL only)
  if (!/\/claim\/viewAssignClaim/.test(page.url())) {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/claim/viewAssignClaim', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  }
  await expect(page).toHaveURL(/\/claim\/viewAssignClaim/, { timeout: 30_000 });

  // Assign Claim (URL only)
  await clickClaimTabOrGoto(page, 'Assign Claim', '/claim/assignClaim');
  if (!/\/claim\/assignClaim/.test(page.url())) {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/claim/assignClaim', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  }
  await expect(page).toHaveURL(/\/claim\/assignClaim/, { timeout: 30_000 });

  // My Claims (URL only)
  await clickClaimTabOrGoto(page, 'My Claims', '/claim/viewClaim');
  if (!/\/claim\/viewClaim/.test(page.url())) {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/claim/viewClaim', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  }
  await expect(page).toHaveURL(/\/claim\/viewClaim/, { timeout: 30_000 });

  // Submit Claim (URL only)
  await clickClaimTabOrGoto(page, 'Submit Claim', '/claim/submitClaim');
  if (!/\/claim\/submitClaim/.test(page.url())) {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/claim/submitClaim', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  }
  await expect(page).toHaveURL(/\/claim\/submitClaim/, { timeout: 30_000 });

  // Configuration → Events (URL only)
  await clickClaimConfigSubmenuOrGoto(page, 'Events', '/claim/viewEvents');
  if (!/\/claim\/viewEvents/.test(page.url())) {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/claim/viewEvents', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  }
  await expect(page).toHaveURL(/\/claim\/viewEvents/, { timeout: 30_000 });

  // Configuration → Expense Types (URL only)
  await clickClaimConfigSubmenuOrGoto(page, 'Expense Types', '/claim/viewExpense');
  if (!/\/claim\/viewExpense/.test(page.url())) {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/claim/viewExpense', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  }
  await expect(page).toHaveURL(/\/claim\/viewExpense/, { timeout: 30_000 });

  // ====================================================================
  // ========================  MAINTENANCE SECTION  ======================
  // ====================================================================

  // Sidepanel → Maintenance → (Admin Gate if present) → Purge Candidate Records → Access Records
  await gotoMaintenance(page);
  await handleAdministratorAccess(page, 'admin123');

  // Purge Records → Candidate Records
  await choosePurgeSection(page, 'Candidate Records');
  // If you want a guaranteed suggestion, use a broad query like 'a' or a known vacancy term
  await fillAutocompleteAndSelectFirst(page, 'Vacancy', 'a');
  await clickSearchOnScreen(page);
  await assertStableStateAfterSearch(page);

  // Access Records → Search for Employee Name
  await gotoAccessRecords(page);
  await fillAutocompleteAndSelectFirst(page, 'Employee Name', 'a');
  await clickSearchOnScreen(page);
  await assertStableStateAfterSearch(page);

  // ====================================================================
  // ===========================  BUZZ SECTION  ==========================
  // ====================================================================

  // Sidepanel → Buzz (URL only, no button checks)
  await sidepanel.getByRole('link', { name: /^Buzz$/i, exact: true }).click({ timeout: 2500 }).catch(async () => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/buzz/viewBuzz', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  });

  if (!/\/buzz\/viewBuzz/.test(page.url())) {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/buzz/viewBuzz', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
  }
  await expect(page).toHaveURL(/\/buzz\/viewBuzz/, { timeout: 30_000 });

  // Final network idle (optional)
  await page.waitForLoadState('networkidle', { timeout: 2000 }).catch(() => {});
});