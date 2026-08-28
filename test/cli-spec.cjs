const { expect } = require('chai');

const {
  join: joinPath
} = require('node:path');

const {
  accessSync
} = require('node:fs');

const { execa } = require('execa');

const conversionDelimiter = ':';

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
        `diagram.bpmn${conversionDelimiter}pdf`
      ]);

      // then
      expectExists('diagram.pdf', true);
      expectExists('diagram.png', false);
    });


    it('explicit file names', async function() {

      // when
      await runExport([
        `${ joinPath(__dirname, 'complex.bpmn') }${conversionDelimiter}complex_export.pdf,complex_img.png`
      ]);

      // then
      expectExists('complex_export.pdf', true);
      expectExists('complex_img.png', true);
    });


    it('explicit, absolute path file names', async function() {

      // when
      await runExport([
        `diagram.bpmn${conversionDelimiter}${ joinPath(__dirname, 'diagram_export.png') },pdf`
      ]);

      // then
      expectExists('diagram_export.png', true);
      expectExists('diagram_export.pdf', true);
    });


    it('multiple files', async function() {

      // when
      await runExport([
        `diagram.bpmn${conversionDelimiter}png`,
        `complex.bpmn${conversionDelimiter}png`
      ]);

      // then
      expectExists('diagram.png', true);
      expectExists('complex.png', true);
    });


    describe('with min-dimensions', function() {

      it('default', async function() {

        // when
        await runExport([
          `small.bpmn${conversionDelimiter}small_default.png`,
          `vertical.bpmn${conversionDelimiter}png`
        ]);

        // then
        expectExists('small_default.png', true);
        expectExists('vertical.png', true);
      });


      it('cli override', async function() {

        // when
        await runExport([
          `small.bpmn${conversionDelimiter}small_custom_size.png`
        ], {
          minDimensions: {
            width: 500,
            height: 400
          }
        });

        // then
        expectExists('small_custom_size.png', true);
      });

    });


    describe('with title', function() {

      it('from diagram name', async function() {

        // when
        await runExport([
          `title.bpmn${conversionDelimiter}title_default.png`
        ]);

        // then
        expectExists('title_default.png', true);
      });


      it('explicit cli override', async function() {

        // when
        await runExport([
          `title.bpmn${conversionDelimiter}custom_title.png`
        ], {
          title: 'FOO BAR'
        });

        // then
        expectExists('custom_title.png', true);
      });


      it('explicit cli opt-out', async function() {

        // when
        await runExport([
          `title.bpmn${conversionDelimiter}no_title.png`
        ], {
          title: false
        });

        // then
        expectExists('no_title.png', true);
      });

    });


    describe('without footer', function() {

      it('explicit cli opt-out', async function() {

        // when
        await runExport([
          `title.bpmn${conversionDelimiter}no_footer.png`
        ], {
          noFooter: true
        });

        // then
        expectExists('no_footer.png', true);
      });

    });


    describe('with custom scale factor', function() {

      it('explicit cli opt-out', async function() {

        // when
        await runExport([
          `title.bpmn${conversionDelimiter}scaled.png`
        ], {
          scale: 0.6
        });

        // then
        expectExists('scaled.png', true);
      });


      it('should reject legacy semicolon separator', async function() {

        // when
        const {
          exitCode,
          stderr
        } = await runCli([
          'diagram.bpmn;png'
        ]);

        // then
        expect(exitCode).to.equal(1);
        expect(stderr).to.contain('legacy `;` separator is not supported');
        expect(stderr).to.contain('<diagramFile>:<outputConfig>');
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
    noFooter,
    scale
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

  if (typeof scale !== 'undefined') {
    args = [
      ...args,
      `--scale=${scale}`
    ]
  }

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

function runCli(args) {
  return execa('../cli.js', args, {
    reject: false,
    cwd: __dirname
  });
}

function expectExists(localPath, exists) {

  const path = joinPath(__dirname, localPath);

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
