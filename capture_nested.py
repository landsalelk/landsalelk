from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3001")
            page.screenshot(path="nested_app_homepage.png", full_page=True)
            print("Nested app screenshot captured.")
        except Exception as e:
            print(f"Error capturing nested app screenshot: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
