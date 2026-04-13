const { chromium } = require('playwright');

(async () => {
    // Check if the contest has ended (May 1st, 2026)
    const currentDate = new Date();
    const deadline = new Date('2026-05-01');
    if (currentDate >= deadline) {
        console.log('--- CONTEST ENDED ---');
        console.log('The date is May 1st or later. The script will now stop.');
        return;
    }

    // Launch the browser in headless mode
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const photoUrl = 'https://www.cutebabyvote.com/april-2026/?contest=photo-detail&photo_id=479473';

    console.log(`Navigating to ${photoUrl}...`);
    await page.goto(photoUrl, { waitUntil: 'domcontentloaded' });

    // Scroll down to make sure the voting section is loaded and visible
    console.log('Scrolling down to the voting section...');
    await page.evaluate(() => {
        window.scrollBy(0, 800);
    });

    // Wait a bit for any dynamic content to settle
    await page.waitForTimeout(2000);

    // Selectors
    const voteButtonSelector = '.photo_vote';
    const timerSelector = '.pc-countdown';

    // Check for the vote button
    const voteButton = await page.$(voteButtonSelector);
    if (voteButton) {
        console.log('Vote button found! Clicking...');
        await voteButton.click();
        console.log('Successfully clicked the vote button.');
        
        // Wait to see if it transitions to a timer or shows a success message
        await page.waitForTimeout(3000);
        const hasTimerNow = await page.$(timerSelector);
        if (hasTimerNow) {
            console.log('Vote confirmed! The timer is now active.');
        } else {
            console.log('Vote clicked, but timer not detected. Please check the browser if possible.');
        }
    } else {
        // Check for the timer instead
        const timer = await page.$(timerSelector);
        if (timer) {
            const timerText = await timer.innerText();
            console.log(`The vote button is NOT available yet. Timer status: ${timerText}`);
            console.log('You can only vote once every 30 minutes.');
        } else {
            console.log('Neither the vote button nor the timer was found. Double-check the URL or page structure.');
        }
    }

    await browser.close();
    console.log('Done.');
})();
