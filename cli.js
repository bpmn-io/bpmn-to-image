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

    diagramFile     Path to BPMN diagram
    outputConfig    List of extension or output file paths

  Examples

    # export to diagram.png
    $ bpmn-to-image diagram.bpmn:diagram.png

    # export diagram.png and /tmp/diagram.pdf
    $ bpmn-to-image diagram.bpmn:diagram.png,/tmp/diagram.pdf
`);


const conversions = cli.input.map(function(conversion) {

  const [
    input,
    output
  ] = conversion.split(':');

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


convertAll(conversions).catch(function(e) {
  console.error('failed to export diagram(s)');
  console.error(e);

  process.exit(1);
});
