const { expect } = require('chai');

const del = require('del');

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
        '--destination=pdf', 'diagram.bpmn'
      ]);

      // then
      expectExists('diagram.pdf', true);
      expectExists('diagram.png', false);
    });


    it('explicit file names', async function() {

      // when
      await runExport([
        '--destination=complex_export.pdf,complex_img.png',
        `${ joinPath(__dirname, 'complex.bpmn') }`
      ]);

      // then
      expectExists('complex_export.pdf', true);
      expectExists('complex_img.png', true);
    });


    it('explicit, absolute path file names', async function() {

      // when
      await runExport([
        `--destination=${ joinPath(__dirname, 'diagram_export.png') },pdf`,
        'diagram.bpmn'
      ]);

      // then
      expectExists('diagram_export.png', true);
      expectExists('diagram_export.pdf', true);
    });


    describe('with min-dimensions', function() {

      it('default', async function() {

        // when
        await runExport([
          '--destination=png', 'vertical.bpmn'
        ]);

        // then
        expectExists('vertical.png', true);
      });


      it('cli override', async function() {

        // when
        await runExport([
          '--destination=small_custom_size.png', 'small.bpmn'
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
          '--destination=title_default.png', 'title.bpmn'
        ]);

        // then
        expectExists('title_default.png', true);
      });


      it('explicit cli override', async function() {

        // when
        await runExport([
          '--destination=custom_title.png', 'title.bpmn'
        ], {
          title: 'FOO BAR'
        });

        // then
        expectExists('custom_title.png', true);
      });


      it('explicit cli opt-out', async function() {

        // when
        await runExport([
          '--destination=no_title.png', 'title.bpmn'
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
          '--destination=no_footer.png', 'title.bpmn'
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
          '--destination=scaled.png', 'title.bpmn'
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
