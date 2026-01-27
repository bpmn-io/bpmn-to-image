const { expect } = require('chai');

const {
  accessSync,
  readFileSync
} = require('node:fs');

const {
  join: pathJoin
} = require('node:path');

const {
  convertAll,
  convert
} = require('bpmn-to-image');


const input = pathJoin(__dirname, 'diagram.bpmn');

const outputPNG = pathJoin(__dirname, 'diagram.png');
const outputPDF = pathJoin(__dirname, 'diagram.pdf');
const outputSVG = pathJoin(__dirname, 'diagram.svg');

const subdiagramInput = pathJoin(__dirname, 'subdiagrams.bpmn');
const subdiagramPNG = pathJoin(__dirname, 'subdiagrams.png');
const subdiagramPDF = pathJoin(__dirname, 'subdiagrams.pdf');

const { PDFDocument } = require('pdf-lib');


describe('index', function() {

  // tests may take some time
  this.timeout(30000);


  process.env.NO_CLEANUP || afterEach(async function() {

    await del([
      '*.png',
      '*.pdf',
      '*.svg'
    ], { cwd: __dirname });

  });


  describe('#convertAll', function() {

    it('should apply defaults', async function() {

      // when
      await convertAll([
        {
          input,
          outputs: [ outputPNG, outputPDF, outputSVG ]
        }
      ]);

      // then
      expectExists(outputPNG, true);
      expectExists(outputPDF, true);
      expectExists(outputSVG, true);
    });

  });



  describe('#convert', function() {

    it('should apply defaults', async function() {

      // when
      await convert(input, outputPNG);

      // then
      expectExists(outputPNG, true);
      expectExists(outputPDF, false);
    });

  });



  describe('with sub diagrams', function() {

    it('should export collapsed sub processes as separate images', async function() {

      // when
      await convertAll([
        {
          input: subdiagramInput,
          outputs: [ subdiagramPNG ]
        }
      ], {
        subDiagrams: true
      });

      // then
      expectExists(subdiagramPNG, true);
      expectExists(pathJoin(__dirname, 'subdiagrams-1utzm6g.png'), true);
      expectExists(pathJoin(__dirname, 'subdiagrams-1k00b0l.png'), true);
      expectExists(pathJoin(__dirname, 'subdiagrams-173ua2j.png'), true);
      expectExists(pathJoin(__dirname, 'subdiagrams-1elvc1o.png'), true);
    });


    it('should merge all diagrams into a single PDF', async function() {

      // when
      await convertAll([
        {
          input: subdiagramInput,
          outputs: [ subdiagramPDF ]
        }
      ], {
        subDiagrams: true
      });

      // then
      expectExists(subdiagramPDF, true);

      const pdfBuffer = readFileSync(subdiagramPDF);

      const pdfDoc = await PDFDocument.load(pdfBuffer);

      // Expect at least main + some subdiagrams
      expect(pdfDoc.getPageCount()).to.equal(5);
    });

  });


  describe('ignoring sub diagrams', function() {

    it('should export only main diagram as PNG when subDiagrams option is not set', async function() {

      // when
      await convertAll([
        {
          input: subdiagramInput,
          outputs: [ pathJoin(__dirname, 'subdiagrams-no-subs.png') ]
        }
      ]);

      // then
      expectExists(pathJoin(__dirname, 'subdiagrams-no-subs.png'), true);
      expectExists(pathJoin(__dirname, 'subdiagrams-no-subs-1utzm6g.png'), false);
      expectExists(pathJoin(__dirname, 'subdiagrams-no-subs-1k00b0l.png'), false);
      expectExists(pathJoin(__dirname, 'subdiagrams-no-subs-173ua2j.png'), false);
      expectExists(pathJoin(__dirname, 'subdiagrams-no-subs-1elvc1o.png'), false);
    });


    it('should export only main diagram as PDF when subDiagrams option is not set', async function() {

      // when
      await convertAll([
        {
          input: subdiagramInput,
          outputs: [ pathJoin(__dirname, 'subdiagrams-no-subs-main.pdf') ]
        }
      ]);

      // then
      expectExists(pathJoin(__dirname, 'subdiagrams-no-subs-main.pdf'), true);

      const pdfBuffer = readFileSync(pathJoin(__dirname, 'subdiagrams-no-subs-main.pdf'));

      const pdfDoc = await PDFDocument.load(pdfBuffer);

      expect(pdfDoc.getPageCount()).to.equal(1);
    });

  });

});


// helpers ////////////////////

function expectExists(path, exists) {
  try {
    accessSync(path);

    expect(true).to.equal(exists, `expected ${ path } to NOT exist`);
  } catch (e) {

    expect(false).to.equal(exists, `expected ${ path } to exist`);
  }
}

async function del(...args) {
  const deleteAsync = (await import('del')).deleteAsync;

  return deleteAsync(...args);
}
