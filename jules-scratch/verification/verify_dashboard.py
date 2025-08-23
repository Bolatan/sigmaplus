import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Navigate to the registration page
        await page.goto("http://localhost:5173/register")

        # Generate a unique email for registration
        import random
        import string
        random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
        email = f"testuser_{random_string}@example.com"
        password = "Password123"

        # Fill out the registration form
        await page.get_by_label("Name").fill("Test User")
        await page.get_by_label("Email").fill(email)
        await page.get_by_label("Password").fill(password)
        await page.get_by_label("Role").select_option("admin")

        # Click the register button
        await page.get_by_role("button", name="Register").click()

        # Wait for navigation to the dashboard or a redirect to login
        # After registration, the user is automatically logged in and redirected to the dashboard
        await expect(page).to_have_url("http://localhost:5173/dashboard", timeout=10000)

        # Take a screenshot of the dashboard
        await page.screenshot(path="jules-scratch/verification/dashboard.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
