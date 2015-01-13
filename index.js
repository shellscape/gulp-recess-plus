'use strict';
var gutil = require('gulp-util'),
	through = require('through2'),
	chalk = require('chalk'),
	recess = require('recess'),
	RcLoader = require('rcloader'),
	pluginName = 'gulp-recess-plus';

/**
 * Loads inline options from css/less files.
 */
function loadInlineOptions (options, contents) {

  if (/\/\*\s?recess/.test(contents)) {
    var matches = contents.match(/\/\*\s?recess(.+?)\*\/|\/\/.*/),
    	pairs;

    if (matches.length > 1) {
    	// we could split on ',', but this is stricter
      pairs = matches[1].trim().match(/\w+(\s+)?:(\s+)?\w+(?=,?\s?)/g);

      // todo: improve the regex so this isn't needed
      pairs.forEach(pairs, function (part) {
        var bits = part.split(':'),
          key = bits[0].trim(),
          value = bits[1].trim();

        /* jshint evil: true */
        options[key] = eval(value);
      });
    }
  }

  return options;
}

// prevent RECESS from reading files
recess.Constructor.prototype.read = function () {
  setImmediate(function () {
    this.data = this.options.contents;
    this.parse();
  }.bind(this));
};

module.exports = function (options) {
  options = options || {};

  var rcLoader = new RcLoader('.recessrc', options),
  	contents;

  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError(pluginName, 'Streaming not supported'));
      return;
    }

    contents = file.contents.toString();

    options = rcLoader.for(file.path);
    options = loadInlineOptions(options, contents);
    options.contents = contents;

    recess(file.path, options, function (err, results) {
      if (err) {
        err.forEach(function (el) {
          var realError = new Error(el.message);

          // el is an instance of LessError, which does not inherit
          // from Error. PluginError expects an instance of Error.
          // create a real Error and map LessError properties to it.
          realError.columnNumber = el.column;
          realError.fileName = el.filename;
          realError.lineNumber = el.line;
          realError.stack = el.stack;
          realError.type = el.name;

          var recessError = new gutil.PluginError(pluginName, realError, {
            showStack: false
          });

          recessError.recess = {
            message: el.message,
            filename: el.filename,
            line: el.line,
            col: el.column
          };

          this.emit('error', recessError);
        }, this);
        this.push(file);
        return;
      }

      var data = results[0], // we only linted one file
      	failureCount = 0,
      	match;

      if (data.output.length > 2) {
        match = /([0-9]+) fail/i.exec(chalk.stripColor(data.output[2]));

        if (match) {
          failureCount = parseInt(match[1]);
        }
      }

      file.recess = {
        success: (data.output[1].indexOf('Busted') === -1),
        status: chalk.stripColor(data.output[1]).replace(/status: /i,'').trim(),
        failureCount: failureCount,
        results: data.output.slice(3),
        errors: data.errors,
        opt: options
      };

      cb(null, file);
    }.bind(this));
});
};

module.exports.reporter = function (options) {
  options = options || {};

  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError(pluginName, 'Streaming not supported'));
      return;
    }

    var recessDataForThisFile = file.recess;

    if (recessDataForThisFile && !recessDataForThisFile.success) {
      console.log(' [' + chalk.green(pluginName) + '] ' + file.relative + ': ' + chalk.red(recessDataForThisFile.status) + ' ' + recessDataForThisFile.failureCount+' failures');

      if (!options.minimal) {
        console.log(file.recess.results.join('\n'));
      }

      if (!options.hasOwnProperty('fail') || options.fail) {
        cb(new gutil.PluginError(pluginName, file.relative + ': ' + file.recess.status + ' ' + recessDataForThisFile.failureCount + ' failures', {
          fileName: file.path,
          showStack: false
        }));
        return;
      }
    }

    cb(null, file);
  });
};
