const { expect } = require('chai');

const {
  join: joinPath,
  delimiter: pathDelimiter
} = require('node:path');

const {
  accessSync,
  readFileSync
} = require('node:fs');

const { execa } = require('execa');
const { PDFDocument } = require('pdf-lib');

const subdiagramInput = joinPath(__dirname, 'subdiagrams.bpmn');
const subdiagramPNG = joinPath(__dirname, 'subdiagrams.png');
const subdiagramPDF = joinPath(__dirname, 'subdiagrams.pdf');

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
          scale: 0.6
        });

        // then
        expectExists('scaled.png', true);
      });

    });
  });


  describe('with sub diagrams', function() {

    it('should export collapsed sub processes as separate images', async function() {

      await runExport([
        `${ subdiagramInput }${pathDelimiter}${ subdiagramPNG }`
      ], {
        subDiagrams: true
      });

      expectExists('subdiagrams.png', true);
      expectExists('subdiagrams-1utzm6g.png', true);
      expectExists('subdiagrams-1k00b0l.png', true);
      expectExists('subdiagrams-173ua2j.png', true);
      expectExists('subdiagrams-1elvc1o.png', true);
    });


    it('should merge all diagrams into a single PDF', async function() {

      await runExport([
        `${ subdiagramInput }${pathDelimiter}${ subdiagramPDF }`
      ], {
        subDiagrams: true
      });

      expectExists('subdiagrams.pdf', true);

      const pdfBuffer = readFileSync(subdiagramPDF);
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      expect(pdfDoc.getPageCount()).to.equal(5);
    });

  });


  describe('ignoring sub diagrams', function() {

    it('should export only main diagram as PNG when subDiagrams flag is not set', async function() {

      await runExport([
        `${ subdiagramInput }${pathDelimiter}subdiagrams-no-subs.png`
      ]);

      expectExists('subdiagrams-no-subs.png', true);
      expectExists('subdiagrams-no-subs-1utzm6g.png', false);
      expectExists('subdiagrams-no-subs-1k00b0l.png', false);
      expectExists('subdiagrams-no-subs-173ua2j.png', false);
      expectExists('subdiagrams-no-subs-1elvc1o.png', false);
    });


    it('should export only main diagram as PDF when subDiagrams flag is not set', async function() {

      await runExport([
        `${ subdiagramInput }${pathDelimiter}subdiagrams-no-subs.pdf`
      ]);

      expectExists('subdiagrams-no-subs.pdf', true);

      const pdfBuffer = readFileSync(joinPath(__dirname, 'subdiagrams-no-subs.pdf'));
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      expect(pdfDoc.getPageCount()).to.equal(1);
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
    scale,
    subDiagrams
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

  if (subDiagrams) {
    args = [
      ...args,
      '--subdiagrams'
    ];
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
