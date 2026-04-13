const { chromium } = require('playwright');

const photoUrl = 'https://www.cutebabyvote.com/april-2026/?contest=photo-detail&photo_id=479473';

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runVote() {
    // Check if the contest has ended (May 1st, 2026)
    const currentDate = new Date();
    const deadline = new Date('2026-05-01');
    if (currentDate >= deadline) {
        console.log('--- CONTEST ENDED ---');
        console.log('Stopping automation as it is now May 1st or later.');
        return;
    }

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    let waitTime = 30 * 60 * 1000; // Default 30 minutes

    try {
        console.log(`[${new Date().toLocaleTimeString()}] Navigating to page...`);
        await page.goto(photoUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Scroll down
        await page.evaluate(() => window.scrollBy(0, 800));
        await wait(3000);

        const voteButtonSelector = '.photo_vote';
        const timerSelector = '.pc-countdown';

        const voteButton = await page.$(voteButtonSelector);
        if (voteButton) {
            console.log('Vote button available! Clicking...');
            await voteButton.click();
            console.log('SUCCESS: Voted successfully!');
            waitTime = 31 * 60 * 1000; // Success! Wait 31 mins for next window
        } else {
            const timer = await page.$(timerSelector);
            if (timer) {
                const timerText = await timer.innerText();
                console.log(`Already voted. Timer says: ${timerText}`);
                
                // Try to parse wait time from timer text (e.g., "15 Mins 10 Secs")
                const minsMatch = timerText.match(/(\d+)\s*Min/i);
                if (minsMatch) {
                    const mins = parseInt(minsMatch[1]);
                    console.log(`Waiting for ${mins + 1} minutes...`);
                    waitTime = (mins + 1) * 60 * 1000;
                } else {
                    console.log('Could not parse timer precisely, waiting 5 minutes before checking again.');
                    waitTime = 5 * 60 * 1000;
                }
            } else {
                console.log('Button not found and no timer detected. Retrying in 5 minutes.');
                waitTime = 5 * 60 * 1000;
            }
        }
    } catch (error) {
        console.error('An error occurred during the voting process:', error.message);
        waitTime = 5 * 60 * 1000; // Retry in 5 minutes on error
    } finally {
        await browser.close();
    }

    console.log(`Next attempt in ${Math.round(waitTime / 60000)} minutes...`);
    await wait(waitTime);
    runVote(); // Recurse
}

console.log('--- Automated Voting Script Started ---');
console.log('Keep this window open to continue voting every 30 minutes.');
runVote();
