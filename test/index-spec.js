const { expect } = require('chai');

const {
  mkdtempSync,
  rmdirSync,
  accessSync
} = require('fs');

const path = require('path');

const {
  convertAll,
  convert
} = require('..');


const input = path.join(__dirname, 'diagram.bpmn');

const outputPNG = path.join(__dirname, 'diagram.png');
const outputPDF = path.join(__dirname, 'diagram.pdf');


describe('index', function() {

  // tests may take some time
  this.timeout(10000);

  let dir;

  beforeEach(function() {
    dir = mkdtempSync('index-spec');
  });

  afterEach(function() {
    rmdirSync(dir);
  })


  describe('#convertAll', function() {

    it('should apply defaults', async function() {

      // when
      await convertAll([
        {
          input,
          outputs: [ outputPNG, outputPDF ]
        }
      ]);

      // then
      expectExists(outputPNG, true);
      expectExists(outputPDF, true);
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