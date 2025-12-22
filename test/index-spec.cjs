const { expect } = require('chai');

const {
  accessSync
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


describe('index', function() {

  // tests may take some time
  this.timeout(10000);


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
