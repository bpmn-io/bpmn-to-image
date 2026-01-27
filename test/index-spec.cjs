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
  this.timeout(20000);


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
      expectExists(pathJoin(__dirname, 'subdiagrams-sub-1.png'), true);
      expectExists(pathJoin(__dirname, 'subdiagrams-sub-2.png'), true);
      expectExists(pathJoin(__dirname, 'subdiagrams-sub-2-1.png'), true);
      expectExists(pathJoin(__dirname, 'subdiagrams-sub-3.png'), true);
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

      expect(pdfDoc.getPageCount()).to.equal(5);
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
