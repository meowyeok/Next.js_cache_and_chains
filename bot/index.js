const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 4000;

app.get('/visit', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).send('Missing url parameter');
    }

    console.log(`[+] Admin Bot received request to visit: ${url}`);
    res.send(`Bot is visiting: ${url}`); 

    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        const page = await browser.newPage();
        page.on('console', msg => console.log('[Bot Browser Console] ', msg.text()));

        await page.setCookie({
            name: 'flag',
            value: 'WSL{cache_p0isoning_XSS}',
            domain: 'web', 
            path: '/',
            httpOnly: false
        });

        console.log(`[+] Bot is navigating to: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 5000 });
        console.log(`[+] Successfully visited the page.`);
        
        await new Promise(r => setTimeout(r, 3000)); 
        await browser.close();
        console.log(`[+] Admin Bot finished.`);
    } catch (err) {
        console.error(`[-] Bot Error: ${err.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Admin Bot API listening on port ${PORT}`);
});