var gutil = require('gulp-util');
var path = require('path');
var through = require('through2');

var pluginName = 'wrap-require';

function exec(id, s) {
  s = '\ndefine(\'' + id + "', function(require, module, exports) {\n\n" +
    s + '\n}); // ' + id + '\n';
  return s;
}

function fixIdWindows(id) {
  return id.replace(/\\/g, '/');
}

function wrap(options) {
  options = options || {};

  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError(new Error('Streaming not supported')));
      return cb();
    }

    // ignore _* files
    var filename = path.basename(file.path);
    if (filename[0] === '_') {
      return cb();
    }

    var id = path.relative(file.base || file.cwd,
      path.join(path.dirname(file.path), path.basename(file.path, options.ext || '.js')));
    id = fixIdWindows(id);
    var str = file.contents.toString();
    try {
      file.contents = new Buffer(exec(id, str));

    } catch (e) {
      this.emit('error', new gutil.PluginError(new Error('Error executing file ' + file.path + ': ' + e.toString())));
    }

    this.push(file);
    cb();
  });
}

module.exports = wrap;
