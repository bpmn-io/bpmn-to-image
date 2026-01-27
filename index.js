import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';

import {
  basename,
} from 'node:path';

import {
  readFileSync,
  writeFileSync
} from 'node:fs';


/** @typedef { import('puppeteer').Page } Page */
/** @typedef { PrintOptions } any */

/**
 * @param { Page } page
 * @param { PrintOptions } options
 *
 * @return {Promise<void>}
 */
async function printDiagram(page, options) {

  const {
    input,
    outputs,
    minDimensions,
    footer,
    title = true,
    deviceScaleFactor,
    subDiagrams = false
  } = options;

  const diagramXML = readFileSync(input, 'utf8');

  const diagramTitle = title === false ? false : (
    (typeof title === 'string' && title.length) ? title : basename(input)
  );

  await page.goto(new URL('./skeleton.html', import.meta.url));

  const viewerScript = import.meta.resolve('bpmn-js/dist/bpmn-viewer.production.min.js');

  const diagrams = await page.evaluate(async function(diagramXML, options) {

    const {
      viewerScript
    } = options;

    await loadScript(viewerScript);

    return importDiagram(diagramXML);
  }, diagramXML, {
    viewerScript
  });

  if (!diagrams.length) {
    throw new Error('no BPMN diagrams found in input');
  }

  const diagramsToExport = [ diagrams[0] ];

  if (subDiagrams) {
    diagramsToExport.push(
      ...diagrams.filter(function(diagram) {
        return diagram.isSubProcess && diagram.isCollapsed;
      })
    );
  }

  const pdfOutputs = outputs.filter(o => o.endsWith('.pdf'));
  const otherOutputs = outputs.filter(o => !o.endsWith('.pdf'));

  const pdfBuffers = new Map(pdfOutputs.map(o => [ o, [] ]));

  for (let diagramIndex = 0; diagramIndex < diagramsToExport.length; diagramIndex++) {

    const diagram = diagramsToExport[diagramIndex];

    const diagramSpecificTitle = diagramIndex === 0 || !diagramTitle
      ? diagramTitle
      : `${diagramTitle} – ${diagram.name || diagram.elementId}`;

    const desiredViewport = await page.evaluate(async function(diagramId, openOptions) {
      return openAndCompute(diagramId, openOptions);
    }, diagram.id, {
      minDimensions,
      title: diagramSpecificTitle,
      footer
    });

    page.setViewport({
      width: Math.round(desiredViewport.width),
      height: Math.round(desiredViewport.height),
      deviceScaleFactor
    });

    await page.evaluate(() => resize());

    for (const output of otherOutputs) {

      const targetOutput = diagramIndex === 0 ? output : addSuffix(output, `-sub${diagramIndex}`);

      console.log(`writing ${targetOutput}`);

      if (output.endsWith('.png')) {
        await page.screenshot({
          path: targetOutput,
          clip: {
            x: 0,
            y: 0,
            width: desiredViewport.width,
            height: desiredViewport.diagramHeight
          }
        });
      } else
      if (output.endsWith('.svg')) {

        const svg = await page.evaluate(() => toSVG());

        writeFileSync(targetOutput, svg, 'utf8');
      } else {
        console.error(`Unknown output file format: ${output}`);
      }
    }

    for (const output of pdfOutputs) {
      const buffer = await page.pdf({
        width: desiredViewport.width,
        height: desiredViewport.diagramHeight,
        printBackground: true
      });

      pdfBuffers.get(output).push(buffer);
    }
  }

  for (const [ output, buffers ] of pdfBuffers.entries()) {

    if (!buffers.length) {
      continue;
    }

    console.log(`writing ${output}`);

    const merged = await mergePdf(buffers);

    writeFileSync(output, merged);
  }

}


async function withPage(fn) {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new'
    });

    await fn(await browser.newPage());
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}


export async function convertAll(conversions, options={}) {

  const {
    minDimensions,
    footer,
    title,
    deviceScaleFactor,
    subDiagrams
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
        footer,
        deviceScaleFactor,
        subDiagrams
      });
    }

  });

}

export async function convert(input, output) {
  return await convertAll([
    {
      input,
      outputs: [ output ]
    }
  ]);
}

/**
 * Add a suffix before the file extension.
 *
 * @param {string} filePath
 * @param {string} suffix
 * @return {string}
 */
function addSuffix(filePath, suffix) {

  const lastDot = filePath.lastIndexOf('.');

  if (lastDot === -1) {
    return `${filePath}${suffix}`;
  }

  return `${filePath.substring(0, lastDot)}${suffix}${filePath.substring(lastDot)}`;
}

/**
 * Merge multiple PDF buffers into a single document.
 *
 * @param {Array<Uint8Array>} buffers
 * @return {Promise<Uint8Array>}
 */
async function mergePdf(buffers) {

  const mergedPdf = await PDFDocument.create();

  for (const buffer of buffers) {
    const doc = await PDFDocument.load(buffer);

    const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());

    copiedPages.forEach(page => mergedPdf.addPage(page));
  }

  return mergedPdf.save();
}