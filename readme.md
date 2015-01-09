# [gulp](http://gulpjs.com)-recess-plus [![Build Status](https://travis-ci.org/shellscape/gulp-recess-plus.svg)](https://travis-ci.org/shellscape/gulp-recess-plus)

> A fork of [gulp-recess](https://github.com/sindresorhus/gulp-recess) with added functionality.

> Lint CSS and LESS with [RECESS](https://github.com/twitter/recess).

*Issues with the output should be reported on the RECESS [issue tracker](https://github.com/twitter/recess/issues).*

## Install

```sh
$ npm install --save-dev gulp-recess-plus
```


## Usage

```js
var gulp = require('gulp');
var recess = require('gulp-recess-plus');

gulp.task('default', function () {
	return gulp.src('src/app.css')
		.pipe(recess())
		.pipe(recess.reporter())
		.pipe(gulp.dest('dist'));
});
```

## Inline options support

Inline recess configuration/option is now available for css/less files on a per-file basis. ala [jshint](http://jshint.com/docs/). For example:

```css
/* recess noIDs: true, noJSPrefix: true, noOverqualifying: true */

.fancy {
  border: 1px solid red;
}
```

The options available exactly mirror the programmatic options listed for [recess](https://github.com/twitter/recess). Options specified on a per-file basis will override the options passed to gulp-recess and also any options loaded by .recessrc.

## API

Options can be specified programmatically as part of the task configuration using the options below.
Additionally or alternatively, you can use a `.recessrc` file to specify the options.

The `compress` and `compile` options from RECESS are intentionally missing. Separate tasks
like [gulp-csso](https://github.com/ben-eb/gulp-csso) and [gulp-less](https://github.com/plus3network/gulp-less)
will do a much better job.

### recess(options)

Run recess on each file

```js
// default options
includePath: []				// Additional paths to look for `@import`'ed LESS files.
strictPropertyOrder: true	// Complains if not strict property order
noIDs: true					// Doesn't complain about using IDs in your stylesheets
noJSPrefix: true			// Doesn't complain about styling .js- prefixed classnames
noOverqualifying: true		// Doesn't complain about overqualified selectors (ie: div#foo.bar)
noUnderscores: true			// Doesn't complain about using underscores in your class names
noUniversalSelectors: true	// Doesn't complain about using the universal * selector
zeroUnits: true				// Doesn't complain if you add units to values of 0
```

Writes `.recess` object to each vinyl object:

```js
{
	success: true,			// Did it succeed?
	status: 'Perfect!',		// Recess status
	failureCount: 0,		// Number of errors
	results: [],			// Recess failure details
	errors: [],				// Recess errors
	options: {}				// The options passed to Recess
}
```

### recess.reporter(options)

Write the report on each failing file.  (Passing files write no output.)

```js
// default options
fail: true					// If true, it writes error event on failure
minimal: false				// If true, it only lists failure filenames omitting details
```


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
