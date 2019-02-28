const { expect } = require('chai');

const fs = require('fs');
const path = require('path');

const {
  convertAll
} = require('..');


describe('convertAll', function() {

  let dir;

  beforeEach(function() {
    dir = fs.mkdtempSync('convertAll');
  });

  afterEach(function() {
    fs.rmdirSync(dir);
  })

  describe('defaults', function() {

    it('should work by default', async function() {

      // given
      const input = path.join(__dirname, 'diagram.bpmn');
      const outputs = [
        path.join(__dirname, 'diagram.png'),
        path.join(__dirname, 'diagram.pdf')
      ];

      await convertAll([
        {
          input,
          outputs
        }
      ]);

      expect(fs.existsSync(outputs[0]), 'png file should exist').to.be.true;
      expect(fs.existsSync(outputs[1]), 'pdf file should exist').to.be.true;
    });

  });
});
