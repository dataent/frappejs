const dataent = require('dataentjs');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { getTmpDir } = require('dataentjs/server/utils');
const { getHTML } = require('dataentjs/common/print');
const { getRandomString } = require('dataentjs/utils');

async function makePDF(html, filepath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({
        path: filepath,
        format: 'A4'
    });
    await browser.close();
}

async function getPDFForElectron(doctype, name) {
    const { shell } = require('electron');
    const html = await getHTML(doctype, name);
    const filepath = path.join(dataent.electronSettings.directory, name + '.pdf');
    await makePDF(html, filepath);
    shell.openItem(filepath);
}

function setupExpressRoute() {
    if (!dataent.app) return;
    dataent.app.post('/api/method/pdf', dataent.asyncHandler(handlePDFRequest));
}

async function handlePDFRequest(req, res) {
    const args = req.body;
    const { doctype, name } = args;
    const html = await getHTML(doctype, name);

    const filepath = path.join(getTmpDir(), `dataent-pdf-${getRandomString()}.pdf`);
    await makePDF(html, filepath);

    const file = fs.createReadStream(filepath);
    const stat = fs.statSync(filepath);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${path.basename(filepath)}`);
    file.pipe(res);
}

module.exports = {
    makePDF,
    setupExpressRoute,
    getPDFForElectron
}
