const { expect } = require('chai');

const {
  join: joinPath,
  delimiter: pathDelimiter
} = require('path');

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
        `diagram.bpmn${pathDelimiter}pdf`
      ]);

      // then
      expectExists('diagram.pdf', true);
      expectExists('diagram.png', false);
    });


    it('explicit file names', async function() {

      // when
      await runExport([
        `${ joinPath(__dirname, 'complex.bpmn') }${pathDelimiter}complex_export.pdf,complex_img.png`
      ]);

      // then
      expectExists('complex_export.pdf', true);
      expectExists('complex_img.png', true);
    });


    it('explicit, absolute path file names', async function() {

      // when
      await runExport([
        `diagram.bpmn${pathDelimiter}${ joinPath(__dirname, 'diagram_export.png') },pdf`
      ]);

      // then
      expectExists('diagram_export.png', true);
      expectExists('diagram_export.pdf', true);
    });


    it('multiple files', async function() {

      // when
      await runExport([
        `diagram.bpmn${pathDelimiter}png`,
        `complex.bpmn${pathDelimiter}png`
      ]);

      // then
      expectExists('diagram.png', true);
      expectExists('complex.png', true);
    });


    describe('with min-dimensions', function() {

      it('default', async function() {

        // when
        await runExport([
          `small.bpmn${pathDelimiter}small_default.png`,
          `vertical.bpmn${pathDelimiter}png`
        ]);

        // then
        expectExists('small_default.png', true);
        expectExists('vertical.png', true);
      });


      it('cli override', async function() {

        // when
        await runExport([
          `small.bpmn${pathDelimiter}small_custom_size.png`
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
          `title.bpmn${pathDelimiter}title_default.png`
        ]);

        // then
        expectExists('title_default.png', true);
      });


      it('explicit cli override', async function() {

        // when
        await runExport([
          `title.bpmn${pathDelimiter}custom_title.png`
        ], {
          title: 'FOO BAR'
        });

        // then
        expectExists('custom_title.png', true);
      });


      it('explicit cli opt-out', async function() {

        // when
        await runExport([
          `title.bpmn${pathDelimiter}no_title.png`
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
          `title.bpmn${pathDelimiter}no_footer.png`
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
          `title.bpmn${pathDelimiter}scaled.png`
        ], {
          scale: 0.5
        });

        // then
        expectExists('scaled.png', true);
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
