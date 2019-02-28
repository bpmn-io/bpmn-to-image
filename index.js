const puppeteer = require('puppeteer');

const {
  basename,
  resolve
} = require('path');

const {
  readFileSync
} = require('fs');


async function printDiagram(page, options) {

  const {
    input,
    outputs,
    minDimensions,
    footer,
    title = true
  } = options;

  const diagramXML = readFileSync(input, 'utf8');

  const diagramTitle = title === false ? false : (
    title.length ? title : basename(input)
  );

  await page.goto(`file://${__dirname}/skeleton.html`);

  const desiredViewport = await page.evaluate((diagramXML, options) => {
    return openDiagram(diagramXML, options);
  }, diagramXML, {
    minDimensions,
    title: diagramTitle,
    footer
  });;

  page.setViewport({
    width: desiredViewport.width,
    height: desiredViewport.height
  });

  await page.evaluate(() => {
    return resize();
  });

  for (const output of outputs) {

    console.log(`writing ${output}`);

    if (output.endsWith('.pdf')) {
      await page.pdf({
        path: output,
        width: desiredViewport.width,
        height: desiredViewport.diagramHeight
      });
    } else

    if (output.endsWith('.png')) {
      await page.screenshot({
        path: output,
        clip: {
          x: 0,
          y: 0,
          width: desiredViewport.width,
          height: desiredViewport.diagramHeight
        }
      });
    } else {
      console.error(`Unknown output file format: ${output}`);
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


module.exports.convertAll = async function(conversions, options={}) {

  const {
    minDimensions,
    footer,
    title
  } = options;

  await withPage(async function(page) {

    for (const conversion of conversions) {

      const {
        input,
        outputs
      } = conversion;

      await printDiagram(page, {
        input,
        outputs,
        minDimensions,
        title,
        footer
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