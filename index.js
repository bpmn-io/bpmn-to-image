const puppeteer = require('puppeteer');

const {
  readFileSync
} = require('fs');


async function printDiagram(page, options) {

  const {
    input,
    outputs
  } = options;

  const diagramXML = readFileSync(input, 'utf8');

  await page.goto(`file://${__dirname}/skeleton.html`);

  const desiredViewport = await page.evaluate((diagramXML) => {
    return openDiagram(diagramXML);
  }, diagramXML);

  page.setViewport({
    width: desiredViewport.width,
    height: desiredViewport.height
  });

  await page.evaluate(() => {
    return resize();
  });

  for (const output of outputs) {

    if (output.endsWith('.pdf')) {
      await page.pdf({
        path: output,
        width: desiredViewport.width,
        height: desiredViewport.height
      });

      console.log(`wrote ${output}`);
    };

    if (output.endsWith('.png')) {
      await page.screenshot({
        path: output,
        clip: {
          x: 0,
          y: 0,
          width: desiredViewport.width,
          height: desiredViewport.height
        }
      });

      console.log(`wrote ${output}`);
    }
  }

}


async function withPage(fn) {
  let browser;

  try {
    browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    await fn(await browser.newPage());
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}


module.exports.convertAll = async function(conversions) {

  await withPage(async function(page) {

    for (const conversion of conversions) {

      const {
        input,
        outputs
      } = conversion;

      await printDiagram(page, {
        input,
        outputs
      });
    }

  });

};


module.exports.convert = async function(input, output) {
  return await convertAll({
    input,
    outputs: [ output ]
  });
};