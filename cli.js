#!/usr/bin/env node

const meow = require('meow');
const path = require('path');
const {
  join: joinPath,
  delimiter: pathDelimiter
} = path;
const chalk = require('chalk');

const error = chalk.bold.red;

const {
  convertAll
} = require('./');


const cli = meow(`
  Usage

    $ bpmn-to-image --destination=<outputConfig> <diagramFile>

  Options

    diagramFile                    Path to BPMN diagram
    outputConfig                   List of extension or output file paths

    --min-dimensions=<dimensions>  Minimum size in pixels (<width>x<height>)

    --title=<title>                Add explicit <title> to exported image
    --no-title                     Don't display title on exported image

    --no-footer                    Strip title and logo from image

    --scale                        Scale factor for images (1)

  Examples

    # export to diagram.png
    $ bpmn-to-image --destination=diagram.png diagram.bpmn

    # export diagram.png and /tmp/diagram.pdf
    $ bpmn-to-image --destination=diagram.png,/tmp/diagram.pdf diagram.bpmn

    # export with minimum size of 500x300 pixels
    $ bpmn-to-image --min-dimensions=500x300 --destination=diagram.png diagram.bpmn
`, {
  flags: {
    minDimensions: {
      type: 'string',
      default: '400x300'
    },
    title: {
      default: true
    },
    footer: {
      default: true
    },
    scale: {
      default: 1
    },
    destination: {
      type: 'string'
    }
  }
});

if (cli.input.length == 0 || !cli.flags.destination)
  cli.showHelp(1);

const conversion = (function(conversion) {
  const input = conversion;
  const output = cli.flags.destination;
  const outputs = output.split(',').reduce(function(outputs, file, idx) {

    // just extension
    if (file.indexOf('.') === -1) {
      const baseName = path.basename(idx === 0 ? input : outputs[idx - 1]);

      const name = baseName.substring(0, baseName.lastIndexOf('.'));

      return [ ...outputs, `${name}.${file}` ];
    }

    return [ ...outputs, file ];
  }, []);

  return {
    input,
    outputs
  }
})(cli.input[0])

const footer = cli.flags.footer;

const title = cli.flags.title === false ? false : cli.flags.title;

const scale = cli.flags.scale !== undefined ? cli.flags.scale : 1;

const [ width, height ] = cli.flags.minDimensions.split('x').map(function(d) {
  return parseInt(d, 10);
});

convertAll([conversion], {
  minDimensions: { width, height },
  title,
  footer,
  deviceScaleFactor: scale
}).catch(function(e) {
  console.error('failed to export diagram(s)');
  console.error(e);

  process.exit(1);
});
