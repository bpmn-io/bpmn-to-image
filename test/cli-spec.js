const { expect } = require('chai');

const del = require('del');

const {
  accessSync
} = require('fs');

const execa = require('execa');


describe('cli', function() {

  // tests may take some time
  this.timeout(30000);


  process.env.NO_CLEANUP || afterEach(async function() {

    await del([
      '*.png',
      '*.pdf'
    ], { cwd: __dirname });

  });


  describe('should export images', function() {

    it('implicit file name', async function() {

      // when
      await runExport([
        'diagram.bpmn:pdf'
      ]);

      // then
      expectExists(`${__dirname}/diagram.pdf`, true);
      expectExists(`${__dirname}/diagram.png`, false);
    });


    it('explicit file names', async function() {

      // when
      await runExport([
        `${__dirname}/complex.bpmn:complex_export.pdf,complex_img.png`
      ]);

      // then
      expectExists(`${__dirname}/complex_export.pdf`, true);
      expectExists(`${__dirname}/complex_img.png`, true);
    });


    it('explicit, absolute path file names', async function() {

      // when
      await runExport([
        `diagram.bpmn:${__dirname}/diagram_export.png,pdf`
      ]);

      // then
      expectExists(`${__dirname}/diagram_export.png`, true);
      expectExists(`${__dirname}/diagram_export.pdf`, true);
    });


    it('multiple files', async function() {

      // when
      await runExport([
        `diagram.bpmn:png`,
        `complex.bpmn:png`
      ]);

      // then
      expectExists(`${__dirname}/diagram.png`, true);
      expectExists(`${__dirname}/complex.png`, true);
    });


    describe('with min-dimensions', function() {

      it('default', async function() {

        // when
        await runExport([
          `small.bpmn:small_default.png`
        ]);

        // then
        expectExists(`${__dirname}/small_default.png`, true);
      });


      it('cli overrides', async function() {

        // when
        await runExport([
          `small.bpmn:small_custom_size.png`
        ], {
          width: 500,
          height: 400
        });

        // then
        expectExists(`${__dirname}/small_custom_size.png`, true);
      });

    });

  });

});


async function runExport(conversions, minDimensions) {
  let args = [ ...conversions ];

  if (minDimensions) {
    args = [
      ...args,
      `--min-dimensions=${minDimensions.width}x${minDimensions.height}`
    ]
  };

  await execa('../cli.js', args, { cwd: __dirname });
}

function expectExists(path, exists) {
  try {
    accessSync(path);

    expect(true).to.equal(exists, `expected ${ path } to NOT exist`);
  } catch (e) {

    expect(false).to.equal(exists, `expected ${ path } to exist`);
  }
}