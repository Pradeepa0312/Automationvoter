const { chromium } = require('playwright');

const photoUrl = 'https://www.cutebabyvote.com/april-2026/?contest=photo-detail&photo_id=479473';

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startAutomation() {
    console.log('--- Automated Voting Script Started ---');
    const startTime = Date.now();
    const MAX_RUNTIME = 5.5 * 60 * 60 * 1000; // 5.5 hours (GitHub limit is 6h)

    while (true) {
        // Check if the contest has ended (May 1st, 2026)
        const currentDate = new Date();
        const deadline = new Date('2026-05-01');
        if (currentDate >= deadline) {
            console.log('--- CONTEST ENDED ---');
            console.log('Stopping automation as it is now May 1st or later.');
            break;
        }

        // Check if we have been running for too long
        if (Date.now() - startTime > MAX_RUNTIME) {
            console.log('Reached maximum runtime for this job. Exiting to allow next workflow run to take over.');
            break;
        }

        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        let waitTime = 5 * 60 * 1000; // Default retry: 5 minutes

        try {
            console.log(`\n[${new Date().toLocaleTimeString()}] Navigating to page...`);
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
                
                // After voting, wait at least 30 mins
                waitTime = 31 * 60 * 1000; 
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
                        console.log('Could not parse timer precisely, checking again in 5 minutes.');
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

        console.log(`Next check in ${Math.round(waitTime / 60000)} minutes...`);
        await wait(waitTime);
    }
}

startAutomation().catch(err => {
    console.error('Fatal error in automation loop:', err);
    process.exit(1);
});
