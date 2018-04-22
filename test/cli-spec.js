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
          `small.bpmn:small_default.png`,
          'vertical.bpmn:png'
        ]);

        // then
        expectExists(`${__dirname}/small_default.png`, true);
        expectExists(`${__dirname}/vertical.png`, true);
      });


      it('cli override', async function() {

        // when
        await runExport([
          `small.bpmn:small_custom_size.png`
        ], {
          minDimensions: {
            width: 500,
            height: 400
          }
        });

        // then
        expectExists(`${__dirname}/small_custom_size.png`, true);
      });

    });


    describe('with title', function() {

      it('from diagram name', async function() {

        // when
        await runExport([
          `title.bpmn:title_default.png`
        ]);

        // then
        expectExists(`${__dirname}/title_default.png`, true);
      });


      it('explicit cli override', async function() {

        // when
        await runExport([
          `title.bpmn:custom_title.png`
        ], {
          title: 'FOO BAR'
        });

        // then
        expectExists(`${__dirname}/custom_title.png`, true);
      });


      it('explicit cli opt-out', async function() {

        // when
        await runExport([
          `title.bpmn:no_title.png`
        ], {
          title: false
        });

        // then
        expectExists(`${__dirname}/no_title.png`, true);
      });

    });


    describe('without footer', function() {

      it('explicit cli opt-out', async function() {

        // when
        await runExport([
          `title.bpmn:no_footer.png`
        ], {
          noFooter: true
        });

        // then
        expectExists(`${__dirname}/no_footer.png`, true);
      });

    });

  });

});


// helpers ///////////////////

async function runExport(conversions, options = {}) {
  let args = [ ...conversions ];

  const {
    minDimensions,
    title,
    noFooter
  } = options;

  if (noFooter) {
    args = [
      ...args,
      '--no-footer'
    ];
  }

  if (minDimensions) {
    args = [
      ...args,
      `--min-dimensions=${minDimensions.width}x${minDimensions.height}`
    ]
  };

  if (typeof title !== 'undefined') {

    if (title === false) {
      args = [
        ...args,
        '--no-title'
      ];
    } else
    if (title !== true) {

      args = [
        ...args,
        `--title=${title}`
      ];
    }
  }

  await execa('../cli.js', args, {
    stdout: 'inherit',
    stderr: 'inherit',
    cwd: __dirname
  });
}

function expectExists(path, exists) {
  try {
    accessSync(path);

    expect(true).to.equal(exists, `expected ${ path } to NOT exist`);
  } catch (e) {

    expect(false).to.equal(exists, `expected ${ path } to exist`);
  }
}