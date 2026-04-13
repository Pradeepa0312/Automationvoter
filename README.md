# CuteBabyVote Automation

This script automates voting for "Dheekshidhan" in the April 2026 contest.

## How to use

1. **Prerequisites**: Ensure you have [Node.js](https://nodejs.org/) installed on your Windows machine.
2. **Install Dependencies**: Open your terminal and run:
   ```bash
   npm install playwright
   npx playwright install chromium
   ```
3. **Run Once**:
   ```bash
   node vote.js
   ```
4. **Run Automatically (Every 30 mins)**:
   ```bash
   node auto_vote.js
   ```

Keep the terminal window open if you use `auto_vote.js`. It will automatically check the timer and vote as soon as the button becomes available.

## Features
- Automatically scrolls to the voting button.
- Detects if the button is available.
- If the button is hidden behind a timer, it will display the remaining time.
- Runs headlessly (background), but you can change `headless: true` to `false` in `vote.js` to see the browser window.
