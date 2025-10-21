from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Verify Calculator Wizard
    page.goto("http://localhost:3000/tools/calculators/wizard")
    page.wait_for_load_state("networkidle")
    page.screenshot(path="jules-scratch/verification/calculator_wizard.png")

    # Verify Break-Even Calculator
    page.goto("http://localhost:3000/tools/calculators/break-even")
    page.wait_for_load_state("networkidle")
    page.screenshot(path="jules-scratch/verification/break_even_calculator.png")

    # Verify Revenue Calculator
    page.goto("http://localhost:3000/tools/calculators/revenue")
    page.wait_for_load_state("networkidle")
    page.screenshot(path="jules-scratch/verification/revenue_calculator.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
