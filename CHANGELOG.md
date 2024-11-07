# Changelog

All notable changes to [bpmn-to-image](https://github.com/bpmn-io/bpmn-to-image) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 0.9.0

* `DEPS`: update to `bpmn-js@18`

## 0.8.0

* `DEPS`: update to `puppeteer@23`
* `DEPS`: update to `bpmn-js@17`
* `CHORE`: replace dependency `npm-run-all` with `npm-run-all2@6`
* `DEPS`: update to `chalk@4`

## 0.7.0

* `DEPS`: update to `puppeteer@21`
* `DEPS`: update to `bpmn-js@16`

## 0.6.1

* `FIX`: allow installation on M1 Apples ([#23](https://github.com/bpmn-io/bpmn-to-image/pull/23))
* `DEPS`: update to `puppeteer@10`

## 0.6.0

* `CHORE`: run without sandbox ([#14](https://github.com/bpmn-io/bpmn-to-image/issues/14))
* `DEPS`: update to `bpmn-js@8`
* `DEPS`: update to `puppeteer@8`

## 0.5.1

* `CHORE`: do not publish dev assets

## 0.5.0

* `FEAT`: add `--scale` option to specify image scale factor
* `CHORE`: update to `bpmn-js@6.3.0`

## 0.4.0

* `FEAT`: add ability to export diagram as SVG ([#9](https://github.com/bpmn-io/bpmn-to-image/pull/9))

## 0.3.3

* `FIX`: enforce integer value on setting viewport ([#10](https://github.com/bpmn-io/bpmn-to-image/issues/10))

## 0.3.2

* `CHORE`: adjust error handling in cli

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
