#!/usr/bin/env node

const meow = require('meow');

const path = require('path');

const {
  convertAll
} = require('./');


const cli = meow(`
  Usage

    $ bpmn-to-image <diagramFile>:<outputConfig> ...

  Options

    diagramFile                    Path to BPMN diagram
    outputConfig                   List of extension or output file paths

    --min-dimensions=<dimensions>  Minimum size in pixels (<width>x<height>)

    --title=<title>                Add explicit <title> to exported image
    --no-title                     Don't display title on exported image

    --no-footer                    Strip title and logo from image


  Examples

    # export to diagram.png
    $ bpmn-to-image diagram.bpmn:diagram.png

    # export diagram.png and /tmp/diagram.pdf
    $ bpmn-to-image diagram.bpmn:diagram.png,/tmp/diagram.pdf

    # export with minimum size of 500x300 pixels
    $ bpmn-to-image --min-dimensions=500x300 diagram.bpmn:png
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
    }
  }
});


const conversions = cli.input.map(function(conversion) {

  const delimiter = conversion.includes(path.delimiter) ? path.delimiter : ':';

  const [
    input,
    output
  ] = conversion.split(delimiter);

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
});

const footer = cli.flags.footer;

const title = cli.flags.title === false ? false : cli.flags.title;

const [ width, height ] = cli.flags.minDimensions.split('x').map(function(d) {
  return parseInt(d, 10);
});

convertAll(conversions, {
  minDimensions: { width, height },
  title,
  footer
}).catch(function(e) {
  console.error('failed to export diagram(s)');
  console.error(e);

  process.exit(1);
});
