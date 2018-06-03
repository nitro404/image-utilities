# Image Utilities

[![NPM version][npm-version-image]][npm-url]
[![Build Status][build-status-image]][build-status-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Known Vulnerabilities][vulnerabilities-image]][vulnerabilities-url]
[![Downloads][npm-downloads-image]][npm-url]

A collection of useful image file helper functions.

## Server-Side Usage

```javascript
var imageUtilities = require("image-utilities");

imageUtilities.getImageInformation(
	"./data/image.png",
	function(error, info) {
		if(error) {
			return console.error(error);
		}

		return console.log(info);
	}
);
```

## Installation

To install this module:
```bash
npm install image-utilities
```

## Building

To build the distribution files for this module:
```bash
npm run build
```
or
```bash
gulp build
```

[npm-url]: https://www.npmjs.com/package/image-utilities
[npm-version-image]: https://img.shields.io/npm/v/image-utilities.svg
[npm-downloads-image]: http://img.shields.io/npm/dm/image-utilities.svg

[build-status-url]: https://travis-ci.org/nitro404/image-utilities
[build-status-image]: https://travis-ci.org/nitro404/image-utilities.svg?branch=master

[coverage-url]: https://coveralls.io/github/nitro404/image-utilities?branch=master
[coverage-image]: https://coveralls.io/repos/github/nitro404/image-utilities/badge.svg?branch=master

[vulnerabilities-url]: https://snyk.io/test/github/nitro404/image-utilities?targetFile=package.json
[vulnerabilities-image]: https://snyk.io/test/github/nitro404/image-utilities/badge.svg?targetFile=package.json
