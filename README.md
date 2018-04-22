# bpmn-to-image

[![Build Status](https://travis-ci.org/bpmn-io/bpmn-to-image.svg?branch=master)](https://travis-ci.org/bpmn-io/bpmn-to-image)

Convert [BPMN 2.0 diagrams](https://www.omg.org/spec/BPMN/2.0) to PDF documents or PNG files.


## Usage

This package exposes the `bpmn-to-image` command line utility that allows you to convert BPMN 2.0 diagrams to PNG and PDF documents:

```bash
$ bpmn-to-image --help

  Convert a BPMN 2.0 diagrams to PDF or PNG images

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
```


## Embedding

You may embed [bpmn-to-image](https://github.com/bpmn-io/bpmn-to-image) and use it as parts of your application:

```javascript
const {
  convertAll
} = require('bpmn-to-image');

await convertAll([
  {
    input: 'diagram.bpmn',
    outputs: [
      'diagram.pdf',
      'diagram.png'
    ]
  }
]);
```

This renders the BPMN diagram using [bpmn-js](https://github.com/bpmn-io/bpmn-js) and exports it to the specified output files using [Puppeteer](https://github.com/GoogleChrome/puppeteer).


## Install

```bash
npm install -g bpmn-to-image
```


## License

MIT