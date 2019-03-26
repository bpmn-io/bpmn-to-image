# Changelog

All notable changes to [bpmn-to-image](https://github.com/bpmn-io/bpmn-to-image) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 0.3.1

* `FIX`: include `bpmn-js` from correct location ([#5](https://github.com/bpmn-io/bpmn-to-image/issues/5))

## 0.3.0

* `FEAT`: use `bpmn-js@3` for rendering diagrams
* `FEAT`: support `;` as an option delimiter on Windows
* `FIX`: correct `#convertAll` not properly setting defaults

## 0.2.0

* `FEAT`: add minimum export dimensions, configurable via `--min-dimensions=<width>x<height>`
* `FEAT`: add customizable title (on per default); disable via `--no-title` option
* `FEAT`: add ability to remove footer all together via the `--no-footer` option

## 0.1.1

* `DOCS`: various documentation improvements

## 0.1.0

_Initial version._