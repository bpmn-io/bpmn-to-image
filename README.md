# bpmn-to-image

Convert [BPMN 2.0 diagrams](https://www.omg.org/spec/BPMN/2.0) to PDF documents or PNG files.


## Usage

```bash
$ bpmn-to-image --help

  Convert a BPMN 2.0 diagrams to PDF or PNG images

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
```


## Install

```bash
npm install -g bpmn-to-image
```


## License

MIT