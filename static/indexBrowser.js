(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))

},{"_process":2}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
(function (global){(function (){
var path = require('path')
var isMonit=false
var barChart;
var barChart2;
var uid
var appsName
function setUserId(userid){
    uid = userid
}

function getHumanPeriod ( time ) {

    var second = 1000
    var minute = 60000
    var hour = 3600000
    var day = 86400000

    var resultTime = time
    var d, h, m, s
    var result = ''

    d = Math.floor(resultTime / day)
    if (d > 0) {
        resultTime = resultTime % day
    }
    h = Math.floor(resultTime / hour)
    if (h > 0) {
        resultTime = resultTime % hour
    }
    m = Math.floor(resultTime / minute)
    if (m > 0) {
        resultTime = resultTime % minute
    }
    s = Math.floor(resultTime / second)

    if (d > 0) {
        result += d + 'd '
    }
    if (h > 0) {
        result += h + 'h '
    }
    if (m > 0) {
        result += m + 'm '
    }

    result += s + 's'

    return result
}

function getHumanBytes (bytes, precision) {
    //console.log('bytes', bytes)

    var kilobyte = 1024
    var megabyte = kilobyte * 1024
    var gigabyte = megabyte * 1024
    var terabyte = gigabyte * 1024

    if ((bytes >= 0) &&
        (bytes < kilobyte)) {

        return bytes + ' B'
    }
    else if ((bytes >= kilobyte) &&
        (bytes < megabyte)) {

        return (bytes / kilobyte).toFixed(precision) + ' KB'
    }
    else if ((bytes >= megabyte) &&
        (bytes < gigabyte)) {

        return (bytes / megabyte).toFixed(precision) + ' MB'
    }
    else if ((bytes >= gigabyte) &&
        (bytes < terabyte)) {

        return (bytes / gigabyte).toFixed(precision) + ' GB'
    }
    else if (bytes >= terabyte) {
        return (bytes / terabyte).toFixed(precision) + ' TB'
    }
    else {
        return bytes + ' B'
    }
}

function listFormat ( type, value ) {

    switch (type) {
        case 'script':
            return value ? path.basename(value) : 'N/C'
        case 'memory':
            return value ? getHumanBytes(value) : 'N/C'
        case 'uptime':
            return value > 0 ? getHumanPeriod(value) : 'N/C'
        case 'pid':
            return value || 'N/C'
        case 'host':
            return value ? value.replace('http://',''): 'N/C'
        case 'status':
            return value == 'up' ? "up" : "down"
        case 'enabled':
            return value ? "yes" : "no"
        case 'port':
            return value || 'N/C'
        case 'run':
            return value != ':' ? value : 'N/C'
        default:
            return value
    }
    return ''
}

function getList () {
    $.ajax({
        url: '/apps/list',
        method: 'POST',
        data:{uid:uid},
        success: function (response) {
            $('#content').empty()
            $('#Header').html("Список приложений")
            var inputElement = document.createElement('table');
            inputElement.id = 'listTable'
            inputElement.className = 'centered'
            document.getElementById("content").appendChild(inputElement);
            isMonit=false
            if (timerId!=null){
                clearInterval(timerId)
            }
            var toTable='<thead><tr><th>Id</th><th>Имя приложения</th><th>PID</th><th>Скрипт запуска</th><th>Группа</th><th>Статус</th> ' +
                '<th>Доступность</th><th>Хост</th><th>Порт</th><th>Время работы</th></tr></thead><tbody>'
            appsName=[]
            JSON.parse(response)['data'].forEach(element =>{
                appsName.push(element.name)
                    toTable+= '<tr><td>'+ element.id +'</td><td>' +element.name+ '</td><td>'+
                        listFormat("pid",element.pid)+ '</td><td>'+listFormat("script",element.script)+'</td><td>'+
                    element.group +'</td><td '+ (element.status == 'up' ? "style=\"color:#77DD77\"" : "style=\"color:red\"")+ '>'+
                        element.status+'</td><td '+ (element.enabled == true ? "style=\"color:#77DD77\"" : "style=\"color:red\"")+ '>'+
                        element.enabled + '</td><td>' + element.host + '</td><td>' + listFormat("port",element.port)+ '</td> <td>'+ listFormat('uptime', element.status == 'up' ? Date.now() - element.started : null) + '</td></tr>'
                }
            )
            toTable+='</tbody>'
            $('#listTable').append(toTable)

        }
    });
}

function fetchData( ) {
    $.ajax({
        url: '/apps/monit',
        method:   'POST',
        data: {appsName:appsName},
        //  dataType: 'json',
        success:  function(rawData) {
            if(isMonit) {
                let data = JSON.parse(rawData)['data']
                for (var i = 0; i < data.length; i++) {

                    barChart.data.datasets[i].data.push(
                        {
                            x: getHumanPeriod(barChart.data.labels.length * 2000),
                            y: data[i]['cpu']
                        }
                    )
                    barChart2.data.datasets[i].data.push(
                        {
                            x: getHumanPeriod(barChart2.data.labels.length * 2000),
                            y: data[i]['mem']
                        }
                    )
                }
                barChart.data.labels.push(getHumanPeriod(barChart.data.labels.length * 2000))
                barChart2.data.labels.push(getHumanPeriod(barChart2.data.labels.length * 2000))
                barChart.update()
                barChart2.update()
            }
        },
        error: function (error){
            console.log(error)
        }
    });
}
var timerId;
function getMonit(){
    $.ajax({
        url: '/apps/monit',
        data: {appsName:appsName},
        method: 'POST',
        success: function (response) {
            $('#content').empty()
            $('#Header').html("Мониторинг приложений")
            var inputElement = document.createElement('canvas');
            inputElement.id = 'CanvasCPU'
            inputElement.width = 600
            inputElement.height = 400
            document.getElementById("content").appendChild(inputElement);
            inputElement = document.createElement('canvas');
            inputElement.id = 'CanvasMemory'
            inputElement.width = 600
            inputElement.height = 400
            document.getElementById("content").appendChild(inputElement);
            isMonit=true
            if (timerId!=null){
                clearInterval(timerId)
            }
            if(barChart!=null & barChart2!=null) {
                barChart.clear()
                barChart2.clear()
                barChart.destroy()
                barChart2.destroy()
            }


            var CanvasCPU = document.getElementById("CanvasCPU");
            var CanvasMemory = document.getElementById("CanvasMemory");

            barChart = new Chart(CanvasCPU, {
                type: 'line',
                label:"Memory",
                data: {
                    labels: ["0s"],
                    datasets: []
                },
                options: {
                    responsive: false,

                    scales: {
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Время'
                            }
                        }],
                        yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Использование CPU, %'
                            }
                        }]
                    }
                }
            });

            barChart2 = new Chart(CanvasMemory, {
                type: 'line',
                label:"Memory",
                data: {
                    labels: ["0s"],
                    datasets: []
                },
                options: {
                    responsive: false,

                    scales: {
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Время'
                            }
                        }],
                        yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Память, байты'
                            }
                        }]
                    }
                }
            });
            let colors =  ['rgba(255,99,132,0.6)', 'rgba(255,99,132,0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
                'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'
            ]
            var i = 0
            JSON.parse(response)['data'].forEach(element => {
                barChart.data.datasets.push({
                    label: element.name+'(PID:'+element.pid+')',
                    data: [element.cpu],
                    fill: false,
                    backgroundColor: colors[i],
                    borderColor: colors[i]
                })
                barChart2.data.datasets.push({
                    label:  element.name+'(PID:'+element.pid+')',
                    data: [element.mem],
                    fill: false,
                    backgroundColor: colors[i],
                    borderColor: colors[i]
                })
                i > colors.length - 1 ? i = 0 : i++
            })
            barChart.update()
            barChart2.update()
            timerId = setInterval(fetchData, 2000)
        }
    });
}

function startStop(){
    $.ajax({
        url: '/apps/list',
        method: 'POST',
        data:{uid:uid},
        success: function (response) {
            $('#content').empty()
            var inputElement = document.createElement('ul');
            inputElement.id = 'listManage'
            document.getElementById("content").appendChild(inputElement);
            var h4Element = document.createElement('h4');
            h4Element.innerHTML = "Приложения:"
            document.getElementById("listManage").appendChild(h4Element);
            $('#Header').html("Запуск/Остановка приложений")
            if (timerId!=null){
                clearInterval(timerId)
            }
            JSON.parse(response)['data'].forEach(element => {
                var liElement = document.createElement('li');
                liElement.className = "monit"
                var labelElement = document.createElement('label');
                labelElement.style = "font-size: medium"
                labelElement.innerHTML = element.name+'(PID:'+element.pid+')'
                var buttonElement = document.createElement('button');
                buttonElement.type = "submit"
                buttonElement.className="btn"
                buttonElement.innerHTML=(element.status == 'up')?'Остановить':'Запустить';
                (element.status == 'up')?
                    buttonElement.addEventListener('click', function(){
                        StopApp(element.name);
                })
                    :
                    buttonElement.addEventListener('click', function(){
                        StartApp(element.name);
                    })
                labelElement.appendChild(buttonElement)
                liElement.appendChild(labelElement)
                document.getElementById("listManage").appendChild(liElement)
                }
            )
        }
    })
    $.ajax({
        url: '/apps/groups',
        method: 'POST',
        data:{uid:uid},
        JSON: true,
        success: function (response) {
            var data = JSON.parse(response)['data']
            getGroups(data)
        }
    })

}

function StartApp( name ){
   // $('#buttonLaunch').remove()
   // $( "#listManage :checked" ).each(function (){
        $.ajax({
            url: '/app/start',
            method: 'POST',
            data: {app:{name: name}},
            json: true,

        })
    startStop()
      //  console.log(this.value)
   // })

}

function StopApp( name ){
    // $('#buttonLaunch').remove()
    // $( "#listManage :checked" ).each(function (){
    $.ajax({
        url: '/app/stop',
        method: 'POST',
        data: {app:{name: name}},
        json: true,

    })
    //  console.log(this.value)
    // })
    startStop()
}

var jsonfiledata = ""

function LoadSettings( data ){

    $.ajax({
        url: '/config/load',
        method: 'POST',

        data: {jsonFile: {data:data}, options: {
                name: 'config',
                value: ''
            }},
        json: true,

    })

    startStop()
}


function getAppTemplate (name,group, script, watch, log, host, port, keep, attempt ) {
    return {
        id: '',
        name: name || '',
        group: group || 'main',
        uid: '',
        gid: '',
        script: script || '',
        env: '',
        params:  '',
        created: new Date().getTime(),
        started: '',
        watch: {
            enabled: watch ? true : false,
            path: watch|| '',
            excludes: []//commander.exclude ? commander.exclude.split(',') : []
        },
        timer: null,
        stopped: false,
        attempted: false,
        enabled: true,
        stdout: null,
        files: {
            pid: '',// commander.pid || '',
            log: log || ''
        },
        host: host || '',
        port: port || '',
        pid: '',
        keep: keep,
        curAttempt: 0,
        attempt: attempt || 3,
        status: 'down',
        stats: {
            uptime: 0,
            started: 0,
            crashed: 0,
            stopped: 0,
            restarted: 0,
            memory: 0,
            cpu: 0
        }
    }
}

function buildFormAddEdit(){
    var formElement = document.createElement('form');
    formElement.className = "col s12"

    const namefield = ['App name', 'Group name', 'Script path','Host name', 'Port', 'Watch path', 'Log path'];
    const IDs = ['name','group','script','host','port','watch','log']
    var i = 0
    namefield.forEach(element =>{
        var divElement = document.createElement('div')
        var inputElement = document.createElement('input');
        var labelElement = document.createElement('label');
        divElement.className = "row"
        inputElement.placeholder = element
        inputElement.id = IDs[i]
        labelElement.innerHTML = element
        divElement.appendChild(labelElement)
        divElement.appendChild(inputElement)
        formElement.appendChild(divElement)
        i++
    });
    var checkboxKeepElement = document.createElement('input');
    checkboxKeepElement.setAttribute("type", "checkbox");
    checkboxKeepElement.id = "checkboxKeep"

    var pElem = document.createElement('p');
    var labelElem = document.createElement('label');
    var spanElem = document.createElement('span');
    spanElem.innerHTML = "Keep alive app"
    labelElem.appendChild(checkboxKeepElement);
    labelElem.appendChild(spanElem)
    pElem.appendChild(labelElem)
    formElement.appendChild(pElem)

    var divElement = document.createElement('div')
    var inputElement = document.createElement('input');
    var labelElement = document.createElement('label');
    divElement.className = "row"
    inputElement.placeholder = "Attempts"
    inputElement.id = "keepcount"
    labelElement.innerHTML = "Attempts"
    divElement.appendChild(labelElement)
    divElement.appendChild(inputElement)
    formElement.appendChild(divElement)
    document.getElementById("content").appendChild(formElement);
}

function getAdd(){
    $('#content').empty()
    $('#Header').html("Добавление приложения")
    if (timerId!=null){
        clearInterval(timerId)
    }
    buildFormAddEdit()


    var buttonElement = document.createElement('button');
    buttonElement.type = "submit"
    buttonElement.className="btn"
    buttonElement.innerHTML= "Добавить"
    buttonElement.addEventListener('click', function() {
        var name = $('#name').val()
        var group = $('#group').val()
        var script = $('#script').val()
        var watch = $('#watch').val()
        var log = $('#log').val()
        var host = $('#host').val()
        var port = $('#port').val()

        var keep = $('#checkboxKeep').is(':checked')
        var attempt = parseInt($('#keepcount').val())
        var app = getAppTemplate(name,group,script,watch,log,host,port,keep,attempt)
        $.ajax({
            url: '/apps',
            method: 'PUT',
            data: {app: app,
                    uid:uid},
            json: true,
            success: function (response) {
                getList()
            }

        })
    })
  //  formElement.appendChild(buttonElement)


    document.getElementById("content").appendChild(buttonElement);
}

async function getRole(){
    var result=false
   await $.ajax({
        url: '/role',
        data: {uid:uid},
        method: 'POST',
        success: function (response) {
            if (JSON.parse(response)['data'] == "admin"){
                result = true
            }else{result=false}
        },
        error: function (error){
            if(error!=null)
                result = false
        }
    })
    return result
}

function ShowSettings(  ){
    $.ajax({
        url: '/config/getsettings',
        method: 'POST',
        data: {uid:uid},
        success: function (response) {
            var settings = JSON.parse(response)['data'][0]
            $('#content').empty()
            $('#Header').html("Настройки")
            if (timerId!=null){
                clearInterval(timerId)
            }
            var formElement = document.createElement('form');
            getRole().then(value=>{
                if (value){
                    var labelElement = document.createElement('label');
                    labelElement.innerHTML = 'Загрузка списка приложений из json:'
                    var pElem = document.createElement('p');
                    pElem.appendChild(labelElement)
                    formElement.appendChild(pElem);
                    var inputElement = document.createElement('input');
                    inputElement.className = "waves-effect waves-light btn"
                    inputElement.type = "file"
                    inputElement.name = "appsFile"
                    inputElement.accept = ".json"
                    inputElement.addEventListener('change', function () {
                        var file = this.files[0];
                        var reader = new FileReader;
                        reader.onloadend = function () {
                            jsonfiledata = reader.result
                        };
                        reader.readAsText(file);
                    })
                    var pElem2 = document.createElement('p');
                    pElem2.appendChild(inputElement)
                    formElement.appendChild(pElem2);


                    var buttonElement = document.createElement('button');
                    buttonElement.type = "button"
                    buttonElement.className = "btn"
                    buttonElement.innerHTML = "Загрузить"
                    buttonElement.addEventListener('click', function () {
                        //  console.log("fileName");
                        // $("input[name='appsFile']").each(function() {
                        // var fileName = $(this).val()//().split('/').pop().split('\\').pop();
                        if (jsonfiledata != null) {
                            LoadSettings(jsonfiledata)
                        }
                        // });
                    })
                    var pElem3 = document.createElement('p');
                    pElem3.appendChild(buttonElement)
                    formElement.appendChild(pElem3)

                    var pathinput = document.createElement("input");
                    pathinput.setAttribute("type", "text");
                    pathinput.setAttribute("placeholder", "Введите путь для сохранения");
                    pathinput.id = "pathInput"
                    var pElem4 = document.createElement('p');
                    pElem4.appendChild(pathinput)
                    formElement.appendChild(pElem4)

                    var buttonElement2 = document.createElement('button');
                    buttonElement2.type = "button"
                    buttonElement2.className = "btn"
                    buttonElement2.innerHTML = "Сохранить"
                    buttonElement2.addEventListener('click', function () {
                        $.ajax({
                            url: '/config/save',
                            data: {file:$('#pathInput').val()},
                            method: 'POST',
                            success: function (response) {
                                getList()
                            }
                        })
                    })
                    var pElem5 = document.createElement('p');
                    pElem5.appendChild(buttonElement2)
                    formElement.appendChild(pElem5)

                    document.getElementById("content").appendChild(formElement);

                }
            })
            var divElem = document.createElement("div");
            var divElem2 = document.createElement("div")

            var emailinput = document.createElement("input");
            emailinput.setAttribute("type", "text");
            emailinput.setAttribute("value", settings.toemail);
            emailinput.setAttribute("placeholder", "Email to messages");
            emailinput.id = "emailInput"
            divElem.appendChild(emailinput)
            divElem.className = "input-field col s6"

            var buttonElement = document.createElement('button');
            buttonElement.type = "button"
            buttonElement.className = "btn"
            buttonElement.innerHTML = "Сохранить"
            buttonElement.addEventListener('click', function () {
                $.ajax({
                    url: '/config/setemail',
                    method: 'POST',
                    data: {email:$('#emailInput').val(),uid:uid},
                    success: function (response) {
                        ShowSettings()
                    }
                })

            })


            divElem.appendChild(buttonElement)
            divElem2.className = "row"
            divElem2.appendChild(divElem)
            formElement.className = "col s12"
            formElement.appendChild(divElem2)

            var checkboxExitElement = document.createElement('input');
            var checkboxCloseElement = document.createElement('input');
            var checkboxCrashElement = document.createElement('input');
            checkboxExitElement.setAttribute("type", "checkbox");
            checkboxCloseElement.setAttribute("type", "checkbox");
            checkboxCrashElement.setAttribute("type", "checkbox");
            checkboxCloseElement.name = "checkboxClose"
            checkboxExitElement.name = "checkboxExit"
            checkboxCrashElement.name = "checkboxCrash"
            checkboxCloseElement.checked = settings.sentclose
            checkboxCrashElement.checked = settings.sentcrash
            checkboxExitElement.checked = settings.sentexit

            checkboxCloseElement.addEventListener('change', function (){

                $.ajax({
                    url: '/config/closesend',
                    method: 'POST',
                    data: {flag: this.checked, uid:uid},
                    json: true,

                })
            })
            checkboxExitElement.addEventListener('change', function (){
                $.ajax({
                    url: '/config/exitsend',
                    method: 'POST',
                    data: {flag: this.checked, uid:uid},
                    json: true,

                })
            })
            checkboxCrashElement.addEventListener('change', function (){

                $.ajax({
                    url: '/config/crashsend',
                    method: 'POST',
                    data: {flag: this.checked, uid:uid},
                    json: true,

                })
            })
           // formElement = document.createElement('form');
            var pElem = document.createElement('p');
            var labelElem = document.createElement('label');
            var spanElem = document.createElement('span');
            spanElem.innerHTML = "Посылать сообщение при закрытии приложения"
            labelElem.appendChild(checkboxCloseElement);
            labelElem.appendChild(spanElem)
            pElem.appendChild(labelElem)
            formElement.appendChild(pElem)
            var pElem2 = document.createElement('p');
            var labelElem2 = document.createElement('label');
            var spanElem2 = document.createElement('span');
            spanElem2.innerHTML = "Посылать сообщение при выходе из приложения"
            labelElem2.appendChild(checkboxExitElement);
            labelElem2.appendChild(spanElem2)
            pElem2.appendChild(labelElem2)
            formElement.appendChild(pElem2)
            var pElem3 = document.createElement('p');
            var labelElem3 = document.createElement('label');
            var spanElem3 = document.createElement('span');
            spanElem3.innerHTML = "Посылать сообщение при аварийном завершении"
            labelElem3.appendChild(checkboxCrashElement);
            labelElem3.appendChild(spanElem3)
            pElem3.appendChild(labelElem3)
            formElement.appendChild(pElem3)

            document.getElementById("content").appendChild(formElement);
        }
    });
}

function getGroups(data){
    var h4Element = document.createElement('h4');
    h4Element.innerHTML = "Группы:"
    document.getElementById("listManage").appendChild(h4Element)
    data.forEach(elem=>{
        var liElement = document.createElement('li');
        liElement.className = "group"

        var labelElement = document.createElement('label');
        labelElement.innerHTML = elem
        labelElement.style = "font-size: medium"
        labelElement.innerHTML = elem
        var buttonElement = document.createElement('button');
        buttonElement.type = "submit"
        buttonElement.className="btn"
        buttonElement.innerHTML='Запустить';
            buttonElement.addEventListener('click', function(){
                $.ajax({
                    url: '/apps/start',
                    method: 'POST',
                    data: {options: [{name:"group", value:elem}, {name:"uid",value:uid}]},
                    json: true,
                    success: function (response) {
                        startStop()
                    }
                })
            })
        var buttonElement2 = document.createElement('button');
        buttonElement2.type = "submit"
        buttonElement2.className="btn"
        buttonElement2.innerHTML='Остановить';
            buttonElement2.addEventListener('click', function(){
                $.ajax({
                    url: '/apps/stop',
                    method: 'POST',
                    data: {options: [{name:"group", value:elem}, {name:"uid",value:uid}]},
                    json: true,
                    success: function (response) {
                        startStop()
                    }
                })
            })
        labelElement.appendChild(buttonElement)
        labelElement.appendChild(buttonElement2)
        liElement.appendChild(labelElement)
        document.getElementById("listManage").appendChild(liElement)
        }
    )
}

function getEdit(){
    $.ajax({
        url: '/apps/list',
        method: 'POST',
        data:{uid:uid},
        success: function (response) {
            $('#content').empty()
            var inputElement = document.createElement('ul');
            inputElement.id = 'listManage'
            document.getElementById("content").appendChild(inputElement);
            var h4Element = document.createElement('h4');
            h4Element.innerHTML = "Приложения:"
            document.getElementById("listManage").appendChild(h4Element);
            $('#Header').html("Редактирование приложений")
            if (timerId!=null){
                clearInterval(timerId)
            }
            JSON.parse(response)['data'].forEach(element => {
                    var liElement = document.createElement('li');
                    liElement.className = "monit"
                    var labelElement = document.createElement('label');
                    labelElement.style = "font-size: medium"

                    var buttonElement = document.createElement('button');
                    buttonElement.type = "submit"
                    buttonElement.className="btn"
                    buttonElement.innerHTML= element.name
                    buttonElement.addEventListener('click', function(){
                        appEdit(element)
                    })
                    labelElement.appendChild(buttonElement)
                    liElement.appendChild(labelElement)
                    document.getElementById("listManage").appendChild(liElement)
                }
            )
        }
    })
}
function appEdit(app){
    $('#content').empty()
    $('#Header').html("Редактирование приложения \""+app.name+"\"")
    buildFormAddEdit()
    const IDs = ['name','group','script','host','port','watch','log']
    const value = [app.name,app.group,app.script,app.host,app.port,app.watch.path,app.log]
    var i = 0
    IDs.forEach(id=>{
        $('#'+id).val(value[i]);
        i++
        }
    )
    document.getElementById('checkboxKeep').checked = app.keep
    //$('#checkboxKeep').checked = app.keep
    $('#keepcount').val(app.attempt)
    var buttonElement = document.createElement('button');
    buttonElement.type = "submit"
    buttonElement.className="btn"
    buttonElement.innerHTML= "Добавить"
    buttonElement.addEventListener('click', function() {
        var name = $('#name').val()
        var group = $('#group').val()
        var script = $('#script').val()
        var watch = $('#watch').val()
        var log = $('#log').val()
        var host = $('#host').val()
        var port = $('#port').val()

        var keep = $('#checkboxKeep').is(':checked')
        var attempt = parseInt($('#keepcount').val())
        var appNow = getAppTemplate(name,group,script,watch,log,host,port,keep,attempt)
        $.ajax({
            url: '/app',
            method: 'POST',
            data: {options: [{name:'name',value:name},{name:'group',value:group},
                    {name:'script',value:script},{name:'watch',value:watch},{name:'log',value:log},
                    {name:'host',value:host},{name:'port',value:port},{name:'keep',value:keep},{name:'attempt',value:attempt}],
                search: app.name,
                uid:uid},
            json: true,
            success: function (response) {
                getList()
            }

        })
    })
    document.getElementById("content").appendChild(buttonElement);

   // document.getElementById("name").val(app.name)
}
/*<form>
    <p><input placeholder="Название задания" name="nametask"></p>
    <p><textarea placeholder="Описание задания"></textarea></p>
    <p> Статус задачи:
        <input type="radio" name="status" id="1" checked="checked"> <label htmlFor="1">В процессе</label>
            <input type="radio" id="2" name="status"><label htmlFor="2">Выполнено</label>
                <input type="radio" id="3" name="status"><label htmlFor="3">Провалено</label>
    </p>
    <p> Ожидаемая дата выполнения: <input type="date" placeholder="Название задачи" id="date" name="date"/>
        <p><input type="file" name="f" multiple>
            <p><input type="submit" value="Добавить новую задачу"
                      formAction="server.js" formMethod="post"></p>
</form>*/


global.setUserId = setUserId
global.getEdit = getEdit
global.getAdd = getAdd
global.ShowSettings=ShowSettings
global.getList = getList
global.getMonit = getMonit
global.startStop = startStop
global.StartApp = StartApp
global.StopApp = StopApp
/*
 barChart.data.datasets.push({
                        label: '{{name}}(PID:{{pid}})',
                        data: [{{mem}}],
                        fill: false,
                        backgroundColor: colors[i],
                        borderColor: colors[i]
                    })
                    barChart2.data.datasets.push({
                        label: '{{name}}(PID:{{pid}})',
                        data: [{{cpu}}],
                        fill: false,
                        backgroundColor: colors[i],
                        borderColor: colors[i]
                    })
                    i > colors.length - 1 ? i = 0 : i++
                })
                barChart.update()
                barChart2.update()

                fetchData( barChart, barChart2 )

*/

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"path":1}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsInN0YXRpYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDamhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyAncGF0aCcgbW9kdWxlIGV4dHJhY3RlZCBmcm9tIE5vZGUuanMgdjguMTEuMSAob25seSB0aGUgcG9zaXggcGFydClcbi8vIHRyYW5zcGxpdGVkIHdpdGggQmFiZWxcblxuLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gYXNzZXJ0UGF0aChwYXRoKSB7XG4gIGlmICh0eXBlb2YgcGF0aCAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdQYXRoIG11c3QgYmUgYSBzdHJpbmcuIFJlY2VpdmVkICcgKyBKU09OLnN0cmluZ2lmeShwYXRoKSk7XG4gIH1cbn1cblxuLy8gUmVzb2x2ZXMgLiBhbmQgLi4gZWxlbWVudHMgaW4gYSBwYXRoIHdpdGggZGlyZWN0b3J5IG5hbWVzXG5mdW5jdGlvbiBub3JtYWxpemVTdHJpbmdQb3NpeChwYXRoLCBhbGxvd0Fib3ZlUm9vdCkge1xuICB2YXIgcmVzID0gJyc7XG4gIHZhciBsYXN0U2VnbWVudExlbmd0aCA9IDA7XG4gIHZhciBsYXN0U2xhc2ggPSAtMTtcbiAgdmFyIGRvdHMgPSAwO1xuICB2YXIgY29kZTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPD0gcGF0aC5sZW5ndGg7ICsraSkge1xuICAgIGlmIChpIDwgcGF0aC5sZW5ndGgpXG4gICAgICBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgIGVsc2UgaWYgKGNvZGUgPT09IDQ3IC8qLyovKVxuICAgICAgYnJlYWs7XG4gICAgZWxzZVxuICAgICAgY29kZSA9IDQ3IC8qLyovO1xuICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xuICAgICAgaWYgKGxhc3RTbGFzaCA9PT0gaSAtIDEgfHwgZG90cyA9PT0gMSkge1xuICAgICAgICAvLyBOT09QXG4gICAgICB9IGVsc2UgaWYgKGxhc3RTbGFzaCAhPT0gaSAtIDEgJiYgZG90cyA9PT0gMikge1xuICAgICAgICBpZiAocmVzLmxlbmd0aCA8IDIgfHwgbGFzdFNlZ21lbnRMZW5ndGggIT09IDIgfHwgcmVzLmNoYXJDb2RlQXQocmVzLmxlbmd0aCAtIDEpICE9PSA0NiAvKi4qLyB8fCByZXMuY2hhckNvZGVBdChyZXMubGVuZ3RoIC0gMikgIT09IDQ2IC8qLiovKSB7XG4gICAgICAgICAgaWYgKHJlcy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICB2YXIgbGFzdFNsYXNoSW5kZXggPSByZXMubGFzdEluZGV4T2YoJy8nKTtcbiAgICAgICAgICAgIGlmIChsYXN0U2xhc2hJbmRleCAhPT0gcmVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgaWYgKGxhc3RTbGFzaEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJlcyA9ICcnO1xuICAgICAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXMgPSByZXMuc2xpY2UoMCwgbGFzdFNsYXNoSW5kZXgpO1xuICAgICAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gcmVzLmxlbmd0aCAtIDEgLSByZXMubGFzdEluZGV4T2YoJy8nKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBsYXN0U2xhc2ggPSBpO1xuICAgICAgICAgICAgICBkb3RzID0gMDtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChyZXMubGVuZ3RoID09PSAyIHx8IHJlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJlcyA9ICcnO1xuICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSAwO1xuICAgICAgICAgICAgbGFzdFNsYXNoID0gaTtcbiAgICAgICAgICAgIGRvdHMgPSAwO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChhbGxvd0Fib3ZlUm9vdCkge1xuICAgICAgICAgIGlmIChyZXMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHJlcyArPSAnLy4uJztcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXMgPSAnLi4nO1xuICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gMjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHJlcy5sZW5ndGggPiAwKVxuICAgICAgICAgIHJlcyArPSAnLycgKyBwYXRoLnNsaWNlKGxhc3RTbGFzaCArIDEsIGkpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmVzID0gcGF0aC5zbGljZShsYXN0U2xhc2ggKyAxLCBpKTtcbiAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSBpIC0gbGFzdFNsYXNoIC0gMTtcbiAgICAgIH1cbiAgICAgIGxhc3RTbGFzaCA9IGk7XG4gICAgICBkb3RzID0gMDtcbiAgICB9IGVsc2UgaWYgKGNvZGUgPT09IDQ2IC8qLiovICYmIGRvdHMgIT09IC0xKSB7XG4gICAgICArK2RvdHM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvdHMgPSAtMTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gX2Zvcm1hdChzZXAsIHBhdGhPYmplY3QpIHtcbiAgdmFyIGRpciA9IHBhdGhPYmplY3QuZGlyIHx8IHBhdGhPYmplY3Qucm9vdDtcbiAgdmFyIGJhc2UgPSBwYXRoT2JqZWN0LmJhc2UgfHwgKHBhdGhPYmplY3QubmFtZSB8fCAnJykgKyAocGF0aE9iamVjdC5leHQgfHwgJycpO1xuICBpZiAoIWRpcikge1xuICAgIHJldHVybiBiYXNlO1xuICB9XG4gIGlmIChkaXIgPT09IHBhdGhPYmplY3Qucm9vdCkge1xuICAgIHJldHVybiBkaXIgKyBiYXNlO1xuICB9XG4gIHJldHVybiBkaXIgKyBzZXAgKyBiYXNlO1xufVxuXG52YXIgcG9zaXggPSB7XG4gIC8vIHBhdGgucmVzb2x2ZShbZnJvbSAuLi5dLCB0bylcbiAgcmVzb2x2ZTogZnVuY3Rpb24gcmVzb2x2ZSgpIHtcbiAgICB2YXIgcmVzb2x2ZWRQYXRoID0gJyc7XG4gICAgdmFyIHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcbiAgICB2YXIgY3dkO1xuXG4gICAgZm9yICh2YXIgaSA9IGFyZ3VtZW50cy5sZW5ndGggLSAxOyBpID49IC0xICYmICFyZXNvbHZlZEFic29sdXRlOyBpLS0pIHtcbiAgICAgIHZhciBwYXRoO1xuICAgICAgaWYgKGkgPj0gMClcbiAgICAgICAgcGF0aCA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAoY3dkID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgY3dkID0gcHJvY2Vzcy5jd2QoKTtcbiAgICAgICAgcGF0aCA9IGN3ZDtcbiAgICAgIH1cblxuICAgICAgYXNzZXJ0UGF0aChwYXRoKTtcblxuICAgICAgLy8gU2tpcCBlbXB0eSBlbnRyaWVzXG4gICAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHJlc29sdmVkUGF0aCA9IHBhdGggKyAnLycgKyByZXNvbHZlZFBhdGg7XG4gICAgICByZXNvbHZlZEFic29sdXRlID0gcGF0aC5jaGFyQ29kZUF0KDApID09PSA0NyAvKi8qLztcbiAgICB9XG5cbiAgICAvLyBBdCB0aGlzIHBvaW50IHRoZSBwYXRoIHNob3VsZCBiZSByZXNvbHZlZCB0byBhIGZ1bGwgYWJzb2x1dGUgcGF0aCwgYnV0XG4gICAgLy8gaGFuZGxlIHJlbGF0aXZlIHBhdGhzIHRvIGJlIHNhZmUgKG1pZ2h0IGhhcHBlbiB3aGVuIHByb2Nlc3MuY3dkKCkgZmFpbHMpXG5cbiAgICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgICByZXNvbHZlZFBhdGggPSBub3JtYWxpemVTdHJpbmdQb3NpeChyZXNvbHZlZFBhdGgsICFyZXNvbHZlZEFic29sdXRlKTtcblxuICAgIGlmIChyZXNvbHZlZEFic29sdXRlKSB7XG4gICAgICBpZiAocmVzb2x2ZWRQYXRoLmxlbmd0aCA+IDApXG4gICAgICAgIHJldHVybiAnLycgKyByZXNvbHZlZFBhdGg7XG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiAnLyc7XG4gICAgfSBlbHNlIGlmIChyZXNvbHZlZFBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHJlc29sdmVkUGF0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcuJztcbiAgICB9XG4gIH0sXG5cbiAgbm9ybWFsaXplOiBmdW5jdGlvbiBub3JtYWxpemUocGF0aCkge1xuICAgIGFzc2VydFBhdGgocGF0aCk7XG5cbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHJldHVybiAnLic7XG5cbiAgICB2YXIgaXNBYnNvbHV0ZSA9IHBhdGguY2hhckNvZGVBdCgwKSA9PT0gNDcgLyovKi87XG4gICAgdmFyIHRyYWlsaW5nU2VwYXJhdG9yID0gcGF0aC5jaGFyQ29kZUF0KHBhdGgubGVuZ3RoIC0gMSkgPT09IDQ3IC8qLyovO1xuXG4gICAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gICAgcGF0aCA9IG5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHBhdGgsICFpc0Fic29sdXRlKTtcblxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCAmJiAhaXNBYnNvbHV0ZSkgcGF0aCA9ICcuJztcbiAgICBpZiAocGF0aC5sZW5ndGggPiAwICYmIHRyYWlsaW5nU2VwYXJhdG9yKSBwYXRoICs9ICcvJztcblxuICAgIGlmIChpc0Fic29sdXRlKSByZXR1cm4gJy8nICsgcGF0aDtcbiAgICByZXR1cm4gcGF0aDtcbiAgfSxcblxuICBpc0Fic29sdXRlOiBmdW5jdGlvbiBpc0Fic29sdXRlKHBhdGgpIHtcbiAgICBhc3NlcnRQYXRoKHBhdGgpO1xuICAgIHJldHVybiBwYXRoLmxlbmd0aCA+IDAgJiYgcGF0aC5jaGFyQ29kZUF0KDApID09PSA0NyAvKi8qLztcbiAgfSxcblxuICBqb2luOiBmdW5jdGlvbiBqb2luKCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgcmV0dXJuICcuJztcbiAgICB2YXIgam9pbmVkO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgYXJnID0gYXJndW1lbnRzW2ldO1xuICAgICAgYXNzZXJ0UGF0aChhcmcpO1xuICAgICAgaWYgKGFyZy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChqb2luZWQgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICBqb2luZWQgPSBhcmc7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBqb2luZWQgKz0gJy8nICsgYXJnO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoam9pbmVkID09PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gJy4nO1xuICAgIHJldHVybiBwb3NpeC5ub3JtYWxpemUoam9pbmVkKTtcbiAgfSxcblxuICByZWxhdGl2ZTogZnVuY3Rpb24gcmVsYXRpdmUoZnJvbSwgdG8pIHtcbiAgICBhc3NlcnRQYXRoKGZyb20pO1xuICAgIGFzc2VydFBhdGgodG8pO1xuXG4gICAgaWYgKGZyb20gPT09IHRvKSByZXR1cm4gJyc7XG5cbiAgICBmcm9tID0gcG9zaXgucmVzb2x2ZShmcm9tKTtcbiAgICB0byA9IHBvc2l4LnJlc29sdmUodG8pO1xuXG4gICAgaWYgKGZyb20gPT09IHRvKSByZXR1cm4gJyc7XG5cbiAgICAvLyBUcmltIGFueSBsZWFkaW5nIGJhY2tzbGFzaGVzXG4gICAgdmFyIGZyb21TdGFydCA9IDE7XG4gICAgZm9yICg7IGZyb21TdGFydCA8IGZyb20ubGVuZ3RoOyArK2Zyb21TdGFydCkge1xuICAgICAgaWYgKGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQpICE9PSA0NyAvKi8qLylcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHZhciBmcm9tRW5kID0gZnJvbS5sZW5ndGg7XG4gICAgdmFyIGZyb21MZW4gPSBmcm9tRW5kIC0gZnJvbVN0YXJ0O1xuXG4gICAgLy8gVHJpbSBhbnkgbGVhZGluZyBiYWNrc2xhc2hlc1xuICAgIHZhciB0b1N0YXJ0ID0gMTtcbiAgICBmb3IgKDsgdG9TdGFydCA8IHRvLmxlbmd0aDsgKyt0b1N0YXJ0KSB7XG4gICAgICBpZiAodG8uY2hhckNvZGVBdCh0b1N0YXJ0KSAhPT0gNDcgLyovKi8pXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICB2YXIgdG9FbmQgPSB0by5sZW5ndGg7XG4gICAgdmFyIHRvTGVuID0gdG9FbmQgLSB0b1N0YXJ0O1xuXG4gICAgLy8gQ29tcGFyZSBwYXRocyB0byBmaW5kIHRoZSBsb25nZXN0IGNvbW1vbiBwYXRoIGZyb20gcm9vdFxuICAgIHZhciBsZW5ndGggPSBmcm9tTGVuIDwgdG9MZW4gPyBmcm9tTGVuIDogdG9MZW47XG4gICAgdmFyIGxhc3RDb21tb25TZXAgPSAtMTtcbiAgICB2YXIgaSA9IDA7XG4gICAgZm9yICg7IGkgPD0gbGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmIChpID09PSBsZW5ndGgpIHtcbiAgICAgICAgaWYgKHRvTGVuID4gbGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKHRvLmNoYXJDb2RlQXQodG9TdGFydCArIGkpID09PSA0NyAvKi8qLykge1xuICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYGZyb21gIGlzIHRoZSBleGFjdCBiYXNlIHBhdGggZm9yIGB0b2AuXG4gICAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nL2Zvby9iYXInOyB0bz0nL2Zvby9iYXIvYmF6J1xuICAgICAgICAgICAgcmV0dXJuIHRvLnNsaWNlKHRvU3RhcnQgKyBpICsgMSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICAvLyBXZSBnZXQgaGVyZSBpZiBgZnJvbWAgaXMgdGhlIHJvb3RcbiAgICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvJzsgdG89Jy9mb28nXG4gICAgICAgICAgICByZXR1cm4gdG8uc2xpY2UodG9TdGFydCArIGkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChmcm9tTGVuID4gbGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQgKyBpKSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGB0b2AgaXMgdGhlIGV4YWN0IGJhc2UgcGF0aCBmb3IgYGZyb21gLlxuICAgICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy9mb28vYmFyL2Jheic7IHRvPScvZm9vL2JhcidcbiAgICAgICAgICAgIGxhc3RDb21tb25TZXAgPSBpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYHRvYCBpcyB0aGUgcm9vdC5cbiAgICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vJzsgdG89Jy8nXG4gICAgICAgICAgICBsYXN0Q29tbW9uU2VwID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICB2YXIgZnJvbUNvZGUgPSBmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0ICsgaSk7XG4gICAgICB2YXIgdG9Db2RlID0gdG8uY2hhckNvZGVBdCh0b1N0YXJ0ICsgaSk7XG4gICAgICBpZiAoZnJvbUNvZGUgIT09IHRvQ29kZSlcbiAgICAgICAgYnJlYWs7XG4gICAgICBlbHNlIGlmIChmcm9tQ29kZSA9PT0gNDcgLyovKi8pXG4gICAgICAgIGxhc3RDb21tb25TZXAgPSBpO1xuICAgIH1cblxuICAgIHZhciBvdXQgPSAnJztcbiAgICAvLyBHZW5lcmF0ZSB0aGUgcmVsYXRpdmUgcGF0aCBiYXNlZCBvbiB0aGUgcGF0aCBkaWZmZXJlbmNlIGJldHdlZW4gYHRvYFxuICAgIC8vIGFuZCBgZnJvbWBcbiAgICBmb3IgKGkgPSBmcm9tU3RhcnQgKyBsYXN0Q29tbW9uU2VwICsgMTsgaSA8PSBmcm9tRW5kOyArK2kpIHtcbiAgICAgIGlmIChpID09PSBmcm9tRW5kIHx8IGZyb20uY2hhckNvZGVBdChpKSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgaWYgKG91dC5sZW5ndGggPT09IDApXG4gICAgICAgICAgb3V0ICs9ICcuLic7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBvdXQgKz0gJy8uLic7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTGFzdGx5LCBhcHBlbmQgdGhlIHJlc3Qgb2YgdGhlIGRlc3RpbmF0aW9uIChgdG9gKSBwYXRoIHRoYXQgY29tZXMgYWZ0ZXJcbiAgICAvLyB0aGUgY29tbW9uIHBhdGggcGFydHNcbiAgICBpZiAob3V0Lmxlbmd0aCA+IDApXG4gICAgICByZXR1cm4gb3V0ICsgdG8uc2xpY2UodG9TdGFydCArIGxhc3RDb21tb25TZXApO1xuICAgIGVsc2Uge1xuICAgICAgdG9TdGFydCArPSBsYXN0Q29tbW9uU2VwO1xuICAgICAgaWYgKHRvLmNoYXJDb2RlQXQodG9TdGFydCkgPT09IDQ3IC8qLyovKVxuICAgICAgICArK3RvU3RhcnQ7XG4gICAgICByZXR1cm4gdG8uc2xpY2UodG9TdGFydCk7XG4gICAgfVxuICB9LFxuXG4gIF9tYWtlTG9uZzogZnVuY3Rpb24gX21ha2VMb25nKHBhdGgpIHtcbiAgICByZXR1cm4gcGF0aDtcbiAgfSxcblxuICBkaXJuYW1lOiBmdW5jdGlvbiBkaXJuYW1lKHBhdGgpIHtcbiAgICBhc3NlcnRQYXRoKHBhdGgpO1xuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcuJztcbiAgICB2YXIgY29kZSA9IHBhdGguY2hhckNvZGVBdCgwKTtcbiAgICB2YXIgaGFzUm9vdCA9IGNvZGUgPT09IDQ3IC8qLyovO1xuICAgIHZhciBlbmQgPSAtMTtcbiAgICB2YXIgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcbiAgICBmb3IgKHZhciBpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDE7IC0taSkge1xuICAgICAgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcbiAgICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xuICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XG4gICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvclxuICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZW5kID09PSAtMSkgcmV0dXJuIGhhc1Jvb3QgPyAnLycgOiAnLic7XG4gICAgaWYgKGhhc1Jvb3QgJiYgZW5kID09PSAxKSByZXR1cm4gJy8vJztcbiAgICByZXR1cm4gcGF0aC5zbGljZSgwLCBlbmQpO1xuICB9LFxuXG4gIGJhc2VuYW1lOiBmdW5jdGlvbiBiYXNlbmFtZShwYXRoLCBleHQpIHtcbiAgICBpZiAoZXh0ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGV4dCAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiZXh0XCIgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgIGFzc2VydFBhdGgocGF0aCk7XG5cbiAgICB2YXIgc3RhcnQgPSAwO1xuICAgIHZhciBlbmQgPSAtMTtcbiAgICB2YXIgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcbiAgICB2YXIgaTtcblxuICAgIGlmIChleHQgIT09IHVuZGVmaW5lZCAmJiBleHQubGVuZ3RoID4gMCAmJiBleHQubGVuZ3RoIDw9IHBhdGgubGVuZ3RoKSB7XG4gICAgICBpZiAoZXh0Lmxlbmd0aCA9PT0gcGF0aC5sZW5ndGggJiYgZXh0ID09PSBwYXRoKSByZXR1cm4gJyc7XG4gICAgICB2YXIgZXh0SWR4ID0gZXh0Lmxlbmd0aCAtIDE7XG4gICAgICB2YXIgZmlyc3ROb25TbGFzaEVuZCA9IC0xO1xuICAgICAgZm9yIChpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcbiAgICAgICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgcGF0aCBzZXBhcmF0b3IgdGhhdCB3YXMgbm90IHBhcnQgb2YgYSBzZXQgb2YgcGF0aFxuICAgICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XG4gICAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xuICAgICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChmaXJzdE5vblNsYXNoRW5kID09PSAtMSkge1xuICAgICAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3IsIHJlbWVtYmVyIHRoaXMgaW5kZXggaW4gY2FzZVxuICAgICAgICAgICAgLy8gd2UgbmVlZCBpdCBpZiB0aGUgZXh0ZW5zaW9uIGVuZHMgdXAgbm90IG1hdGNoaW5nXG4gICAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICAgICAgICAgIGZpcnN0Tm9uU2xhc2hFbmQgPSBpICsgMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGV4dElkeCA+PSAwKSB7XG4gICAgICAgICAgICAvLyBUcnkgdG8gbWF0Y2ggdGhlIGV4cGxpY2l0IGV4dGVuc2lvblxuICAgICAgICAgICAgaWYgKGNvZGUgPT09IGV4dC5jaGFyQ29kZUF0KGV4dElkeCkpIHtcbiAgICAgICAgICAgICAgaWYgKC0tZXh0SWR4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIFdlIG1hdGNoZWQgdGhlIGV4dGVuc2lvbiwgc28gbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyIHBhdGhcbiAgICAgICAgICAgICAgICAvLyBjb21wb25lbnRcbiAgICAgICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBFeHRlbnNpb24gZG9lcyBub3QgbWF0Y2gsIHNvIG91ciByZXN1bHQgaXMgdGhlIGVudGlyZSBwYXRoXG4gICAgICAgICAgICAgIC8vIGNvbXBvbmVudFxuICAgICAgICAgICAgICBleHRJZHggPSAtMTtcbiAgICAgICAgICAgICAgZW5kID0gZmlyc3ROb25TbGFzaEVuZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXJ0ID09PSBlbmQpIGVuZCA9IGZpcnN0Tm9uU2xhc2hFbmQ7ZWxzZSBpZiAoZW5kID09PSAtMSkgZW5kID0gcGF0aC5sZW5ndGg7XG4gICAgICByZXR1cm4gcGF0aC5zbGljZShzdGFydCwgZW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICBpZiAocGF0aC5jaGFyQ29kZUF0KGkpID09PSA0NyAvKi8qLykge1xuICAgICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcbiAgICAgICAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xuICAgICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChlbmQgPT09IC0xKSB7XG4gICAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3IsIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91clxuICAgICAgICAgIC8vIHBhdGggY29tcG9uZW50XG4gICAgICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XG4gICAgICAgICAgZW5kID0gaSArIDE7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGVuZCA9PT0gLTEpIHJldHVybiAnJztcbiAgICAgIHJldHVybiBwYXRoLnNsaWNlKHN0YXJ0LCBlbmQpO1xuICAgIH1cbiAgfSxcblxuICBleHRuYW1lOiBmdW5jdGlvbiBleHRuYW1lKHBhdGgpIHtcbiAgICBhc3NlcnRQYXRoKHBhdGgpO1xuICAgIHZhciBzdGFydERvdCA9IC0xO1xuICAgIHZhciBzdGFydFBhcnQgPSAwO1xuICAgIHZhciBlbmQgPSAtMTtcbiAgICB2YXIgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcbiAgICAvLyBUcmFjayB0aGUgc3RhdGUgb2YgY2hhcmFjdGVycyAoaWYgYW55KSB3ZSBzZWUgYmVmb3JlIG91ciBmaXJzdCBkb3QgYW5kXG4gICAgLy8gYWZ0ZXIgYW55IHBhdGggc2VwYXJhdG9yIHdlIGZpbmRcbiAgICB2YXIgcHJlRG90U3RhdGUgPSAwO1xuICAgIGZvciAodmFyIGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICB2YXIgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcbiAgICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xuICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXG4gICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XG4gICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgICAgIHN0YXJ0UGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICBpZiAoZW5kID09PSAtMSkge1xuICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyXG4gICAgICAgIC8vIGV4dGVuc2lvblxuICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICAgICAgZW5kID0gaSArIDE7XG4gICAgICB9XG4gICAgICBpZiAoY29kZSA9PT0gNDYgLyouKi8pIHtcbiAgICAgICAgICAvLyBJZiB0aGlzIGlzIG91ciBmaXJzdCBkb3QsIG1hcmsgaXQgYXMgdGhlIHN0YXJ0IG9mIG91ciBleHRlbnNpb25cbiAgICAgICAgICBpZiAoc3RhcnREb3QgPT09IC0xKVxuICAgICAgICAgICAgc3RhcnREb3QgPSBpO1xuICAgICAgICAgIGVsc2UgaWYgKHByZURvdFN0YXRlICE9PSAxKVxuICAgICAgICAgICAgcHJlRG90U3RhdGUgPSAxO1xuICAgICAgfSBlbHNlIGlmIChzdGFydERvdCAhPT0gLTEpIHtcbiAgICAgICAgLy8gV2Ugc2F3IGEgbm9uLWRvdCBhbmQgbm9uLXBhdGggc2VwYXJhdG9yIGJlZm9yZSBvdXIgZG90LCBzbyB3ZSBzaG91bGRcbiAgICAgICAgLy8gaGF2ZSBhIGdvb2QgY2hhbmNlIGF0IGhhdmluZyBhIG5vbi1lbXB0eSBleHRlbnNpb25cbiAgICAgICAgcHJlRG90U3RhdGUgPSAtMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3RhcnREb3QgPT09IC0xIHx8IGVuZCA9PT0gLTEgfHxcbiAgICAgICAgLy8gV2Ugc2F3IGEgbm9uLWRvdCBjaGFyYWN0ZXIgaW1tZWRpYXRlbHkgYmVmb3JlIHRoZSBkb3RcbiAgICAgICAgcHJlRG90U3RhdGUgPT09IDAgfHxcbiAgICAgICAgLy8gVGhlIChyaWdodC1tb3N0KSB0cmltbWVkIHBhdGggY29tcG9uZW50IGlzIGV4YWN0bHkgJy4uJ1xuICAgICAgICBwcmVEb3RTdGF0ZSA9PT0gMSAmJiBzdGFydERvdCA9PT0gZW5kIC0gMSAmJiBzdGFydERvdCA9PT0gc3RhcnRQYXJ0ICsgMSkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aC5zbGljZShzdGFydERvdCwgZW5kKTtcbiAgfSxcblxuICBmb3JtYXQ6IGZ1bmN0aW9uIGZvcm1hdChwYXRoT2JqZWN0KSB7XG4gICAgaWYgKHBhdGhPYmplY3QgPT09IG51bGwgfHwgdHlwZW9mIHBhdGhPYmplY3QgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgXCJwYXRoT2JqZWN0XCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIE9iamVjdC4gUmVjZWl2ZWQgdHlwZSAnICsgdHlwZW9mIHBhdGhPYmplY3QpO1xuICAgIH1cbiAgICByZXR1cm4gX2Zvcm1hdCgnLycsIHBhdGhPYmplY3QpO1xuICB9LFxuXG4gIHBhcnNlOiBmdW5jdGlvbiBwYXJzZShwYXRoKSB7XG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcblxuICAgIHZhciByZXQgPSB7IHJvb3Q6ICcnLCBkaXI6ICcnLCBiYXNlOiAnJywgZXh0OiAnJywgbmFtZTogJycgfTtcbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHJldHVybiByZXQ7XG4gICAgdmFyIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoMCk7XG4gICAgdmFyIGlzQWJzb2x1dGUgPSBjb2RlID09PSA0NyAvKi8qLztcbiAgICB2YXIgc3RhcnQ7XG4gICAgaWYgKGlzQWJzb2x1dGUpIHtcbiAgICAgIHJldC5yb290ID0gJy8nO1xuICAgICAgc3RhcnQgPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIHZhciBzdGFydERvdCA9IC0xO1xuICAgIHZhciBzdGFydFBhcnQgPSAwO1xuICAgIHZhciBlbmQgPSAtMTtcbiAgICB2YXIgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcbiAgICB2YXIgaSA9IHBhdGgubGVuZ3RoIC0gMTtcblxuICAgIC8vIFRyYWNrIHRoZSBzdGF0ZSBvZiBjaGFyYWN0ZXJzIChpZiBhbnkpIHdlIHNlZSBiZWZvcmUgb3VyIGZpcnN0IGRvdCBhbmRcbiAgICAvLyBhZnRlciBhbnkgcGF0aCBzZXBhcmF0b3Igd2UgZmluZFxuICAgIHZhciBwcmVEb3RTdGF0ZSA9IDA7XG5cbiAgICAvLyBHZXQgbm9uLWRpciBpbmZvXG4gICAgZm9yICg7IGkgPj0gc3RhcnQ7IC0taSkge1xuICAgICAgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcbiAgICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xuICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXG4gICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XG4gICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgICAgIHN0YXJ0UGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICBpZiAoZW5kID09PSAtMSkge1xuICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyXG4gICAgICAgIC8vIGV4dGVuc2lvblxuICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICAgICAgZW5kID0gaSArIDE7XG4gICAgICB9XG4gICAgICBpZiAoY29kZSA9PT0gNDYgLyouKi8pIHtcbiAgICAgICAgICAvLyBJZiB0aGlzIGlzIG91ciBmaXJzdCBkb3QsIG1hcmsgaXQgYXMgdGhlIHN0YXJ0IG9mIG91ciBleHRlbnNpb25cbiAgICAgICAgICBpZiAoc3RhcnREb3QgPT09IC0xKSBzdGFydERvdCA9IGk7ZWxzZSBpZiAocHJlRG90U3RhdGUgIT09IDEpIHByZURvdFN0YXRlID0gMTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGFydERvdCAhPT0gLTEpIHtcbiAgICAgICAgLy8gV2Ugc2F3IGEgbm9uLWRvdCBhbmQgbm9uLXBhdGggc2VwYXJhdG9yIGJlZm9yZSBvdXIgZG90LCBzbyB3ZSBzaG91bGRcbiAgICAgICAgLy8gaGF2ZSBhIGdvb2QgY2hhbmNlIGF0IGhhdmluZyBhIG5vbi1lbXB0eSBleHRlbnNpb25cbiAgICAgICAgcHJlRG90U3RhdGUgPSAtMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3RhcnREb3QgPT09IC0xIHx8IGVuZCA9PT0gLTEgfHxcbiAgICAvLyBXZSBzYXcgYSBub24tZG90IGNoYXJhY3RlciBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIGRvdFxuICAgIHByZURvdFN0YXRlID09PSAwIHx8XG4gICAgLy8gVGhlIChyaWdodC1tb3N0KSB0cmltbWVkIHBhdGggY29tcG9uZW50IGlzIGV4YWN0bHkgJy4uJ1xuICAgIHByZURvdFN0YXRlID09PSAxICYmIHN0YXJ0RG90ID09PSBlbmQgLSAxICYmIHN0YXJ0RG90ID09PSBzdGFydFBhcnQgKyAxKSB7XG4gICAgICBpZiAoZW5kICE9PSAtMSkge1xuICAgICAgICBpZiAoc3RhcnRQYXJ0ID09PSAwICYmIGlzQWJzb2x1dGUpIHJldC5iYXNlID0gcmV0Lm5hbWUgPSBwYXRoLnNsaWNlKDEsIGVuZCk7ZWxzZSByZXQuYmFzZSA9IHJldC5uYW1lID0gcGF0aC5zbGljZShzdGFydFBhcnQsIGVuZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzdGFydFBhcnQgPT09IDAgJiYgaXNBYnNvbHV0ZSkge1xuICAgICAgICByZXQubmFtZSA9IHBhdGguc2xpY2UoMSwgc3RhcnREb3QpO1xuICAgICAgICByZXQuYmFzZSA9IHBhdGguc2xpY2UoMSwgZW5kKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldC5uYW1lID0gcGF0aC5zbGljZShzdGFydFBhcnQsIHN0YXJ0RG90KTtcbiAgICAgICAgcmV0LmJhc2UgPSBwYXRoLnNsaWNlKHN0YXJ0UGFydCwgZW5kKTtcbiAgICAgIH1cbiAgICAgIHJldC5leHQgPSBwYXRoLnNsaWNlKHN0YXJ0RG90LCBlbmQpO1xuICAgIH1cblxuICAgIGlmIChzdGFydFBhcnQgPiAwKSByZXQuZGlyID0gcGF0aC5zbGljZSgwLCBzdGFydFBhcnQgLSAxKTtlbHNlIGlmIChpc0Fic29sdXRlKSByZXQuZGlyID0gJy8nO1xuXG4gICAgcmV0dXJuIHJldDtcbiAgfSxcblxuICBzZXA6ICcvJyxcbiAgZGVsaW1pdGVyOiAnOicsXG4gIHdpbjMyOiBudWxsLFxuICBwb3NpeDogbnVsbFxufTtcblxucG9zaXgucG9zaXggPSBwb3NpeDtcblxubW9kdWxlLmV4cG9ydHMgPSBwb3NpeDtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJ2YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxyXG52YXIgaXNNb25pdD1mYWxzZVxyXG52YXIgYmFyQ2hhcnQ7XHJcbnZhciBiYXJDaGFydDI7XHJcbnZhciB1aWRcclxudmFyIGFwcHNOYW1lXHJcbmZ1bmN0aW9uIHNldFVzZXJJZCh1c2VyaWQpe1xyXG4gICAgdWlkID0gdXNlcmlkXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEh1bWFuUGVyaW9kICggdGltZSApIHtcclxuXHJcbiAgICB2YXIgc2Vjb25kID0gMTAwMFxyXG4gICAgdmFyIG1pbnV0ZSA9IDYwMDAwXHJcbiAgICB2YXIgaG91ciA9IDM2MDAwMDBcclxuICAgIHZhciBkYXkgPSA4NjQwMDAwMFxyXG5cclxuICAgIHZhciByZXN1bHRUaW1lID0gdGltZVxyXG4gICAgdmFyIGQsIGgsIG0sIHNcclxuICAgIHZhciByZXN1bHQgPSAnJ1xyXG5cclxuICAgIGQgPSBNYXRoLmZsb29yKHJlc3VsdFRpbWUgLyBkYXkpXHJcbiAgICBpZiAoZCA+IDApIHtcclxuICAgICAgICByZXN1bHRUaW1lID0gcmVzdWx0VGltZSAlIGRheVxyXG4gICAgfVxyXG4gICAgaCA9IE1hdGguZmxvb3IocmVzdWx0VGltZSAvIGhvdXIpXHJcbiAgICBpZiAoaCA+IDApIHtcclxuICAgICAgICByZXN1bHRUaW1lID0gcmVzdWx0VGltZSAlIGhvdXJcclxuICAgIH1cclxuICAgIG0gPSBNYXRoLmZsb29yKHJlc3VsdFRpbWUgLyBtaW51dGUpXHJcbiAgICBpZiAobSA+IDApIHtcclxuICAgICAgICByZXN1bHRUaW1lID0gcmVzdWx0VGltZSAlIG1pbnV0ZVxyXG4gICAgfVxyXG4gICAgcyA9IE1hdGguZmxvb3IocmVzdWx0VGltZSAvIHNlY29uZClcclxuXHJcbiAgICBpZiAoZCA+IDApIHtcclxuICAgICAgICByZXN1bHQgKz0gZCArICdkICdcclxuICAgIH1cclxuICAgIGlmIChoID4gMCkge1xyXG4gICAgICAgIHJlc3VsdCArPSBoICsgJ2ggJ1xyXG4gICAgfVxyXG4gICAgaWYgKG0gPiAwKSB7XHJcbiAgICAgICAgcmVzdWx0ICs9IG0gKyAnbSAnXHJcbiAgICB9XHJcblxyXG4gICAgcmVzdWx0ICs9IHMgKyAncydcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEh1bWFuQnl0ZXMgKGJ5dGVzLCBwcmVjaXNpb24pIHtcclxuICAgIC8vY29uc29sZS5sb2coJ2J5dGVzJywgYnl0ZXMpXHJcblxyXG4gICAgdmFyIGtpbG9ieXRlID0gMTAyNFxyXG4gICAgdmFyIG1lZ2FieXRlID0ga2lsb2J5dGUgKiAxMDI0XHJcbiAgICB2YXIgZ2lnYWJ5dGUgPSBtZWdhYnl0ZSAqIDEwMjRcclxuICAgIHZhciB0ZXJhYnl0ZSA9IGdpZ2FieXRlICogMTAyNFxyXG5cclxuICAgIGlmICgoYnl0ZXMgPj0gMCkgJiZcclxuICAgICAgICAoYnl0ZXMgPCBraWxvYnl0ZSkpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIGJ5dGVzICsgJyBCJ1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoKGJ5dGVzID49IGtpbG9ieXRlKSAmJlxyXG4gICAgICAgIChieXRlcyA8IG1lZ2FieXRlKSkge1xyXG5cclxuICAgICAgICByZXR1cm4gKGJ5dGVzIC8ga2lsb2J5dGUpLnRvRml4ZWQocHJlY2lzaW9uKSArICcgS0InXHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICgoYnl0ZXMgPj0gbWVnYWJ5dGUpICYmXHJcbiAgICAgICAgKGJ5dGVzIDwgZ2lnYWJ5dGUpKSB7XHJcblxyXG4gICAgICAgIHJldHVybiAoYnl0ZXMgLyBtZWdhYnl0ZSkudG9GaXhlZChwcmVjaXNpb24pICsgJyBNQidcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKChieXRlcyA+PSBnaWdhYnl0ZSkgJiZcclxuICAgICAgICAoYnl0ZXMgPCB0ZXJhYnl0ZSkpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIChieXRlcyAvIGdpZ2FieXRlKS50b0ZpeGVkKHByZWNpc2lvbikgKyAnIEdCJ1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoYnl0ZXMgPj0gdGVyYWJ5dGUpIHtcclxuICAgICAgICByZXR1cm4gKGJ5dGVzIC8gdGVyYWJ5dGUpLnRvRml4ZWQocHJlY2lzaW9uKSArICcgVEInXHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gYnl0ZXMgKyAnIEInXHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxpc3RGb3JtYXQgKCB0eXBlLCB2YWx1ZSApIHtcclxuXHJcbiAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICBjYXNlICdzY3JpcHQnOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgPyBwYXRoLmJhc2VuYW1lKHZhbHVlKSA6ICdOL0MnXHJcbiAgICAgICAgY2FzZSAnbWVtb3J5JzpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID8gZ2V0SHVtYW5CeXRlcyh2YWx1ZSkgOiAnTi9DJ1xyXG4gICAgICAgIGNhc2UgJ3VwdGltZSc6XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IDAgPyBnZXRIdW1hblBlcmlvZCh2YWx1ZSkgOiAnTi9DJ1xyXG4gICAgICAgIGNhc2UgJ3BpZCc6XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSB8fCAnTi9DJ1xyXG4gICAgICAgIGNhc2UgJ2hvc3QnOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgPyB2YWx1ZS5yZXBsYWNlKCdodHRwOi8vJywnJyk6ICdOL0MnXHJcbiAgICAgICAgY2FzZSAnc3RhdHVzJzpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09ICd1cCcgPyBcInVwXCIgOiBcImRvd25cIlxyXG4gICAgICAgIGNhc2UgJ2VuYWJsZWQnOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgPyBcInllc1wiIDogXCJub1wiXHJcbiAgICAgICAgY2FzZSAncG9ydCc6XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSB8fCAnTi9DJ1xyXG4gICAgICAgIGNhc2UgJ3J1bic6XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSAhPSAnOicgPyB2YWx1ZSA6ICdOL0MnXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlXHJcbiAgICB9XHJcbiAgICByZXR1cm4gJydcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TGlzdCAoKSB7XHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogJy9hcHBzL2xpc3QnLFxyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIGRhdGE6e3VpZDp1aWR9LFxyXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAkKCcjY29udGVudCcpLmVtcHR5KClcclxuICAgICAgICAgICAgJCgnI0hlYWRlcicpLmh0bWwoXCLQodC/0LjRgdC+0Log0L/RgNC40LvQvtC20LXQvdC40LlcIilcclxuICAgICAgICAgICAgdmFyIGlucHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcbiAgICAgICAgICAgIGlucHV0RWxlbWVudC5pZCA9ICdsaXN0VGFibGUnXHJcbiAgICAgICAgICAgIGlucHV0RWxlbWVudC5jbGFzc05hbWUgPSAnY2VudGVyZWQnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVudFwiKS5hcHBlbmRDaGlsZChpbnB1dEVsZW1lbnQpO1xyXG4gICAgICAgICAgICBpc01vbml0PWZhbHNlXHJcbiAgICAgICAgICAgIGlmICh0aW1lcklkIT1udWxsKXtcclxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXJJZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdG9UYWJsZT0nPHRoZWFkPjx0cj48dGg+SWQ8L3RoPjx0aD7QmNC80Y8g0L/RgNC40LvQvtC20LXQvdC40Y88L3RoPjx0aD5QSUQ8L3RoPjx0aD7QodC60YDQuNC/0YIg0LfQsNC/0YPRgdC60LA8L3RoPjx0aD7Qk9GA0YPQv9C/0LA8L3RoPjx0aD7QodGC0LDRgtGD0YE8L3RoPiAnICtcclxuICAgICAgICAgICAgICAgICc8dGg+0JTQvtGB0YLRg9C/0L3QvtGB0YLRjDwvdGg+PHRoPtCl0L7RgdGCPC90aD48dGg+0J/QvtGA0YI8L3RoPjx0aD7QktGA0LXQvNGPINGA0LDQsdC+0YLRizwvdGg+PC90cj48L3RoZWFkPjx0Ym9keT4nXHJcbiAgICAgICAgICAgIGFwcHNOYW1lPVtdXHJcbiAgICAgICAgICAgIEpTT04ucGFyc2UocmVzcG9uc2UpWydkYXRhJ10uZm9yRWFjaChlbGVtZW50ID0+e1xyXG4gICAgICAgICAgICAgICAgYXBwc05hbWUucHVzaChlbGVtZW50Lm5hbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgdG9UYWJsZSs9ICc8dHI+PHRkPicrIGVsZW1lbnQuaWQgKyc8L3RkPjx0ZD4nICtlbGVtZW50Lm5hbWUrICc8L3RkPjx0ZD4nK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0Rm9ybWF0KFwicGlkXCIsZWxlbWVudC5waWQpKyAnPC90ZD48dGQ+JytsaXN0Rm9ybWF0KFwic2NyaXB0XCIsZWxlbWVudC5zY3JpcHQpKyc8L3RkPjx0ZD4nK1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZ3JvdXAgKyc8L3RkPjx0ZCAnKyAoZWxlbWVudC5zdGF0dXMgPT0gJ3VwJyA/IFwic3R5bGU9XFxcImNvbG9yOiM3N0RENzdcXFwiXCIgOiBcInN0eWxlPVxcXCJjb2xvcjpyZWRcXFwiXCIpKyAnPicrXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc3RhdHVzKyc8L3RkPjx0ZCAnKyAoZWxlbWVudC5lbmFibGVkID09IHRydWUgPyBcInN0eWxlPVxcXCJjb2xvcjojNzdERDc3XFxcIlwiIDogXCJzdHlsZT1cXFwiY29sb3I6cmVkXFxcIlwiKSsgJz4nK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmVuYWJsZWQgKyAnPC90ZD48dGQ+JyArIGVsZW1lbnQuaG9zdCArICc8L3RkPjx0ZD4nICsgbGlzdEZvcm1hdChcInBvcnRcIixlbGVtZW50LnBvcnQpKyAnPC90ZD4gPHRkPicrIGxpc3RGb3JtYXQoJ3VwdGltZScsIGVsZW1lbnQuc3RhdHVzID09ICd1cCcgPyBEYXRlLm5vdygpIC0gZWxlbWVudC5zdGFydGVkIDogbnVsbCkgKyAnPC90ZD48L3RyPidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICB0b1RhYmxlKz0nPC90Ym9keT4nXHJcbiAgICAgICAgICAgICQoJyNsaXN0VGFibGUnKS5hcHBlbmQodG9UYWJsZSlcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZldGNoRGF0YSggKSB7XHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogJy9hcHBzL21vbml0JyxcclxuICAgICAgICBtZXRob2Q6ICAgJ1BPU1QnLFxyXG4gICAgICAgIGRhdGE6IHthcHBzTmFtZTphcHBzTmFtZX0sXHJcbiAgICAgICAgLy8gIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICAgICAgc3VjY2VzczogIGZ1bmN0aW9uKHJhd0RhdGEpIHtcclxuICAgICAgICAgICAgaWYoaXNNb25pdCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKHJhd0RhdGEpWydkYXRhJ11cclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBiYXJDaGFydC5kYXRhLmRhdGFzZXRzW2ldLmRhdGEucHVzaChcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogZ2V0SHVtYW5QZXJpb2QoYmFyQ2hhcnQuZGF0YS5sYWJlbHMubGVuZ3RoICogMjAwMCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBkYXRhW2ldWydjcHUnXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgIGJhckNoYXJ0Mi5kYXRhLmRhdGFzZXRzW2ldLmRhdGEucHVzaChcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogZ2V0SHVtYW5QZXJpb2QoYmFyQ2hhcnQyLmRhdGEubGFiZWxzLmxlbmd0aCAqIDIwMDApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogZGF0YVtpXVsnbWVtJ11cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJhckNoYXJ0LmRhdGEubGFiZWxzLnB1c2goZ2V0SHVtYW5QZXJpb2QoYmFyQ2hhcnQuZGF0YS5sYWJlbHMubGVuZ3RoICogMjAwMCkpXHJcbiAgICAgICAgICAgICAgICBiYXJDaGFydDIuZGF0YS5sYWJlbHMucHVzaChnZXRIdW1hblBlcmlvZChiYXJDaGFydDIuZGF0YS5sYWJlbHMubGVuZ3RoICogMjAwMCkpXHJcbiAgICAgICAgICAgICAgICBiYXJDaGFydC51cGRhdGUoKVxyXG4gICAgICAgICAgICAgICAgYmFyQ2hhcnQyLnVwZGF0ZSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbiAoZXJyb3Ipe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcilcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG52YXIgdGltZXJJZDtcclxuZnVuY3Rpb24gZ2V0TW9uaXQoKXtcclxuICAgICQuYWpheCh7XHJcbiAgICAgICAgdXJsOiAnL2FwcHMvbW9uaXQnLFxyXG4gICAgICAgIGRhdGE6IHthcHBzTmFtZTphcHBzTmFtZX0sXHJcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICQoJyNjb250ZW50JykuZW1wdHkoKVxyXG4gICAgICAgICAgICAkKCcjSGVhZGVyJykuaHRtbChcItCc0L7QvdC40YLQvtGA0LjQvdCzINC/0YDQuNC70L7QttC10L3QuNC5XCIpXHJcbiAgICAgICAgICAgIHZhciBpbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICAgICAgaW5wdXRFbGVtZW50LmlkID0gJ0NhbnZhc0NQVSdcclxuICAgICAgICAgICAgaW5wdXRFbGVtZW50LndpZHRoID0gNjAwXHJcbiAgICAgICAgICAgIGlucHV0RWxlbWVudC5oZWlnaHQgPSA0MDBcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW50XCIpLmFwcGVuZENoaWxkKGlucHV0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIGlucHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgICAgICAgICBpbnB1dEVsZW1lbnQuaWQgPSAnQ2FudmFzTWVtb3J5J1xyXG4gICAgICAgICAgICBpbnB1dEVsZW1lbnQud2lkdGggPSA2MDBcclxuICAgICAgICAgICAgaW5wdXRFbGVtZW50LmhlaWdodCA9IDQwMFxyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoaW5wdXRFbGVtZW50KTtcclxuICAgICAgICAgICAgaXNNb25pdD10cnVlXHJcbiAgICAgICAgICAgIGlmICh0aW1lcklkIT1udWxsKXtcclxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXJJZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihiYXJDaGFydCE9bnVsbCAmIGJhckNoYXJ0MiE9bnVsbCkge1xyXG4gICAgICAgICAgICAgICAgYmFyQ2hhcnQuY2xlYXIoKVxyXG4gICAgICAgICAgICAgICAgYmFyQ2hhcnQyLmNsZWFyKClcclxuICAgICAgICAgICAgICAgIGJhckNoYXJ0LmRlc3Ryb3koKVxyXG4gICAgICAgICAgICAgICAgYmFyQ2hhcnQyLmRlc3Ryb3koKVxyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgdmFyIENhbnZhc0NQVSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiQ2FudmFzQ1BVXCIpO1xyXG4gICAgICAgICAgICB2YXIgQ2FudmFzTWVtb3J5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJDYW52YXNNZW1vcnlcIik7XHJcblxyXG4gICAgICAgICAgICBiYXJDaGFydCA9IG5ldyBDaGFydChDYW52YXNDUFUsIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGxhYmVsOlwiTWVtb3J5XCIsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiBbXCIwc1wiXSxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhc2V0czogW11cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2l2ZTogZmFsc2UsXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4QXhlczogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlTGFiZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU3RyaW5nOiAn0JLRgNC10LzRjydcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHlBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVMYWJlbDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHJpbmc6ICfQmNGB0L/QvtC70YzQt9C+0LLQsNC90LjQtSBDUFUsICUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGJhckNoYXJ0MiA9IG5ldyBDaGFydChDYW52YXNNZW1vcnksIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgIGxhYmVsOlwiTWVtb3J5XCIsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiBbXCIwc1wiXSxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhc2V0czogW11cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2l2ZTogZmFsc2UsXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4QXhlczogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlTGFiZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU3RyaW5nOiAn0JLRgNC10LzRjydcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHlBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVMYWJlbDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHJpbmc6ICfQn9Cw0LzRj9GC0YwsINCx0LDQudGC0YsnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbGV0IGNvbG9ycyA9ICBbJ3JnYmEoMjU1LDk5LDEzMiwwLjYpJywgJ3JnYmEoMjU1LDk5LDEzMiwwLjYpJywgJ3JnYmEoNTQsIDE2MiwgMjM1LCAwLjYpJywgJ3JnYmEoMjU1LCAyMDYsIDg2LCAwLjYpJyxcclxuICAgICAgICAgICAgICAgICdyZ2JhKDc1LCAxOTIsIDE5MiwgMC42KScsICdyZ2JhKDE1MywgMTAyLCAyNTUsIDAuNiknLCAncmdiYSgyNTUsIDE1OSwgNjQsIDAuNiknLFxyXG4gICAgICAgICAgICAgICAgJ3JnYmEoMjU1LCA5OSwgMTMyLCAwLjYpJywgJ3JnYmEoNTQsIDE2MiwgMjM1LCAwLjYpJywgJ3JnYmEoMjU1LCAyMDYsIDg2LCAwLjYpJyxcclxuICAgICAgICAgICAgICAgICdyZ2JhKDc1LCAxOTIsIDE5MiwgMC42KScsICdyZ2JhKDE1MywgMTAyLCAyNTUsIDAuNiknXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgdmFyIGkgPSAwXHJcbiAgICAgICAgICAgIEpTT04ucGFyc2UocmVzcG9uc2UpWydkYXRhJ10uZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgICAgIGJhckNoYXJ0LmRhdGEuZGF0YXNldHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGVsZW1lbnQubmFtZSsnKFBJRDonK2VsZW1lbnQucGlkKycpJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBbZWxlbWVudC5jcHVdLFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3JzW2ldLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBjb2xvcnNbaV1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBiYXJDaGFydDIuZGF0YS5kYXRhc2V0cy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogIGVsZW1lbnQubmFtZSsnKFBJRDonK2VsZW1lbnQucGlkKycpJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBbZWxlbWVudC5tZW1dLFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3JzW2ldLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBjb2xvcnNbaV1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBpID4gY29sb3JzLmxlbmd0aCAtIDEgPyBpID0gMCA6IGkrK1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBiYXJDaGFydC51cGRhdGUoKVxyXG4gICAgICAgICAgICBiYXJDaGFydDIudXBkYXRlKClcclxuICAgICAgICAgICAgdGltZXJJZCA9IHNldEludGVydmFsKGZldGNoRGF0YSwgMjAwMClcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gc3RhcnRTdG9wKCl7XHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogJy9hcHBzL2xpc3QnLFxyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIGRhdGE6e3VpZDp1aWR9LFxyXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAkKCcjY29udGVudCcpLmVtcHR5KClcclxuICAgICAgICAgICAgdmFyIGlucHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XHJcbiAgICAgICAgICAgIGlucHV0RWxlbWVudC5pZCA9ICdsaXN0TWFuYWdlJ1xyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoaW5wdXRFbGVtZW50KTtcclxuICAgICAgICAgICAgdmFyIGg0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0Jyk7XHJcbiAgICAgICAgICAgIGg0RWxlbWVudC5pbm5lckhUTUwgPSBcItCf0YDQuNC70L7QttC10L3QuNGPOlwiXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGlzdE1hbmFnZVwiKS5hcHBlbmRDaGlsZChoNEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAkKCcjSGVhZGVyJykuaHRtbChcItCX0LDQv9GD0YHQui/QntGB0YLQsNC90L7QstC60LAg0L/RgNC40LvQvtC20LXQvdC40LlcIilcclxuICAgICAgICAgICAgaWYgKHRpbWVySWQhPW51bGwpe1xyXG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcklkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIEpTT04ucGFyc2UocmVzcG9uc2UpWydkYXRhJ10uZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciBsaUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xyXG4gICAgICAgICAgICAgICAgbGlFbGVtZW50LmNsYXNzTmFtZSA9IFwibW9uaXRcIlxyXG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XHJcbiAgICAgICAgICAgICAgICBsYWJlbEVsZW1lbnQuc3R5bGUgPSBcImZvbnQtc2l6ZTogbWVkaXVtXCJcclxuICAgICAgICAgICAgICAgIGxhYmVsRWxlbWVudC5pbm5lckhUTUwgPSBlbGVtZW50Lm5hbWUrJyhQSUQ6JytlbGVtZW50LnBpZCsnKSdcclxuICAgICAgICAgICAgICAgIHZhciBidXR0b25FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50LnR5cGUgPSBcInN1Ym1pdFwiXHJcbiAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50LmNsYXNzTmFtZT1cImJ0blwiXHJcbiAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50LmlubmVySFRNTD0oZWxlbWVudC5zdGF0dXMgPT0gJ3VwJyk/J9Ce0YHRgtCw0L3QvtCy0LjRgtGMJzon0JfQsNC/0YPRgdGC0LjRgtGMJztcclxuICAgICAgICAgICAgICAgIChlbGVtZW50LnN0YXR1cyA9PSAndXAnKT9cclxuICAgICAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgU3RvcEFwcChlbGVtZW50Lm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICA6XHJcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFN0YXJ0QXBwKGVsZW1lbnQubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIGxhYmVsRWxlbWVudC5hcHBlbmRDaGlsZChidXR0b25FbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgbGlFbGVtZW50LmFwcGVuZENoaWxkKGxhYmVsRWxlbWVudClcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGlzdE1hbmFnZVwiKS5hcHBlbmRDaGlsZChsaUVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIClcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG4gICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6ICcvYXBwcy9ncm91cHMnLFxyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIGRhdGE6e3VpZDp1aWR9LFxyXG4gICAgICAgIEpTT046IHRydWUsXHJcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gSlNPTi5wYXJzZShyZXNwb25zZSlbJ2RhdGEnXVxyXG4gICAgICAgICAgICBnZXRHcm91cHMoZGF0YSlcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gU3RhcnRBcHAoIG5hbWUgKXtcclxuICAgLy8gJCgnI2J1dHRvbkxhdW5jaCcpLnJlbW92ZSgpXHJcbiAgIC8vICQoIFwiI2xpc3RNYW5hZ2UgOmNoZWNrZWRcIiApLmVhY2goZnVuY3Rpb24gKCl7XHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiAnL2FwcC9zdGFydCcsXHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICBkYXRhOiB7YXBwOntuYW1lOiBuYW1lfX0sXHJcbiAgICAgICAgICAgIGpzb246IHRydWUsXHJcblxyXG4gICAgICAgIH0pXHJcbiAgICBzdGFydFN0b3AoKVxyXG4gICAgICAvLyAgY29uc29sZS5sb2codGhpcy52YWx1ZSlcclxuICAgLy8gfSlcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIFN0b3BBcHAoIG5hbWUgKXtcclxuICAgIC8vICQoJyNidXR0b25MYXVuY2gnKS5yZW1vdmUoKVxyXG4gICAgLy8gJCggXCIjbGlzdE1hbmFnZSA6Y2hlY2tlZFwiICkuZWFjaChmdW5jdGlvbiAoKXtcclxuICAgICQuYWpheCh7XHJcbiAgICAgICAgdXJsOiAnL2FwcC9zdG9wJyxcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBkYXRhOiB7YXBwOntuYW1lOiBuYW1lfX0sXHJcbiAgICAgICAganNvbjogdHJ1ZSxcclxuXHJcbiAgICB9KVxyXG4gICAgLy8gIGNvbnNvbGUubG9nKHRoaXMudmFsdWUpXHJcbiAgICAvLyB9KVxyXG4gICAgc3RhcnRTdG9wKClcclxufVxyXG5cclxudmFyIGpzb25maWxlZGF0YSA9IFwiXCJcclxuXHJcbmZ1bmN0aW9uIExvYWRTZXR0aW5ncyggZGF0YSApe1xyXG5cclxuICAgICQuYWpheCh7XHJcbiAgICAgICAgdXJsOiAnL2NvbmZpZy9sb2FkJyxcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuXHJcbiAgICAgICAgZGF0YToge2pzb25GaWxlOiB7ZGF0YTpkYXRhfSwgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ2NvbmZpZycsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogJydcclxuICAgICAgICAgICAgfX0sXHJcbiAgICAgICAganNvbjogdHJ1ZSxcclxuXHJcbiAgICB9KVxyXG5cclxuICAgIHN0YXJ0U3RvcCgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBnZXRBcHBUZW1wbGF0ZSAobmFtZSxncm91cCwgc2NyaXB0LCB3YXRjaCwgbG9nLCBob3N0LCBwb3J0LCBrZWVwLCBhdHRlbXB0ICkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpZDogJycsXHJcbiAgICAgICAgbmFtZTogbmFtZSB8fCAnJyxcclxuICAgICAgICBncm91cDogZ3JvdXAgfHwgJ21haW4nLFxyXG4gICAgICAgIHVpZDogJycsXHJcbiAgICAgICAgZ2lkOiAnJyxcclxuICAgICAgICBzY3JpcHQ6IHNjcmlwdCB8fCAnJyxcclxuICAgICAgICBlbnY6ICcnLFxyXG4gICAgICAgIHBhcmFtczogICcnLFxyXG4gICAgICAgIGNyZWF0ZWQ6IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxyXG4gICAgICAgIHN0YXJ0ZWQ6ICcnLFxyXG4gICAgICAgIHdhdGNoOiB7XHJcbiAgICAgICAgICAgIGVuYWJsZWQ6IHdhdGNoID8gdHJ1ZSA6IGZhbHNlLFxyXG4gICAgICAgICAgICBwYXRoOiB3YXRjaHx8ICcnLFxyXG4gICAgICAgICAgICBleGNsdWRlczogW10vL2NvbW1hbmRlci5leGNsdWRlID8gY29tbWFuZGVyLmV4Y2x1ZGUuc3BsaXQoJywnKSA6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aW1lcjogbnVsbCxcclxuICAgICAgICBzdG9wcGVkOiBmYWxzZSxcclxuICAgICAgICBhdHRlbXB0ZWQ6IGZhbHNlLFxyXG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgc3Rkb3V0OiBudWxsLFxyXG4gICAgICAgIGZpbGVzOiB7XHJcbiAgICAgICAgICAgIHBpZDogJycsLy8gY29tbWFuZGVyLnBpZCB8fCAnJyxcclxuICAgICAgICAgICAgbG9nOiBsb2cgfHwgJydcclxuICAgICAgICB9LFxyXG4gICAgICAgIGhvc3Q6IGhvc3QgfHwgJycsXHJcbiAgICAgICAgcG9ydDogcG9ydCB8fCAnJyxcclxuICAgICAgICBwaWQ6ICcnLFxyXG4gICAgICAgIGtlZXA6IGtlZXAsXHJcbiAgICAgICAgY3VyQXR0ZW1wdDogMCxcclxuICAgICAgICBhdHRlbXB0OiBhdHRlbXB0IHx8IDMsXHJcbiAgICAgICAgc3RhdHVzOiAnZG93bicsXHJcbiAgICAgICAgc3RhdHM6IHtcclxuICAgICAgICAgICAgdXB0aW1lOiAwLFxyXG4gICAgICAgICAgICBzdGFydGVkOiAwLFxyXG4gICAgICAgICAgICBjcmFzaGVkOiAwLFxyXG4gICAgICAgICAgICBzdG9wcGVkOiAwLFxyXG4gICAgICAgICAgICByZXN0YXJ0ZWQ6IDAsXHJcbiAgICAgICAgICAgIG1lbW9yeTogMCxcclxuICAgICAgICAgICAgY3B1OiAwXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBidWlsZEZvcm1BZGRFZGl0KCl7XHJcbiAgICB2YXIgZm9ybUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb3JtJyk7XHJcbiAgICBmb3JtRWxlbWVudC5jbGFzc05hbWUgPSBcImNvbCBzMTJcIlxyXG5cclxuICAgIGNvbnN0IG5hbWVmaWVsZCA9IFsnQXBwIG5hbWUnLCAnR3JvdXAgbmFtZScsICdTY3JpcHQgcGF0aCcsJ0hvc3QgbmFtZScsICdQb3J0JywgJ1dhdGNoIHBhdGgnLCAnTG9nIHBhdGgnXTtcclxuICAgIGNvbnN0IElEcyA9IFsnbmFtZScsJ2dyb3VwJywnc2NyaXB0JywnaG9zdCcsJ3BvcnQnLCd3YXRjaCcsJ2xvZyddXHJcbiAgICB2YXIgaSA9IDBcclxuICAgIG5hbWVmaWVsZC5mb3JFYWNoKGVsZW1lbnQgPT57XHJcbiAgICAgICAgdmFyIGRpdkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgIHZhciBpbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICAgIHZhciBsYWJlbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xyXG4gICAgICAgIGRpdkVsZW1lbnQuY2xhc3NOYW1lID0gXCJyb3dcIlxyXG4gICAgICAgIGlucHV0RWxlbWVudC5wbGFjZWhvbGRlciA9IGVsZW1lbnRcclxuICAgICAgICBpbnB1dEVsZW1lbnQuaWQgPSBJRHNbaV1cclxuICAgICAgICBsYWJlbEVsZW1lbnQuaW5uZXJIVE1MID0gZWxlbWVudFxyXG4gICAgICAgIGRpdkVsZW1lbnQuYXBwZW5kQ2hpbGQobGFiZWxFbGVtZW50KVxyXG4gICAgICAgIGRpdkVsZW1lbnQuYXBwZW5kQ2hpbGQoaW5wdXRFbGVtZW50KVxyXG4gICAgICAgIGZvcm1FbGVtZW50LmFwcGVuZENoaWxkKGRpdkVsZW1lbnQpXHJcbiAgICAgICAgaSsrXHJcbiAgICB9KTtcclxuICAgIHZhciBjaGVja2JveEtlZXBFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgIGNoZWNrYm94S2VlcEVsZW1lbnQuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcImNoZWNrYm94XCIpO1xyXG4gICAgY2hlY2tib3hLZWVwRWxlbWVudC5pZCA9IFwiY2hlY2tib3hLZWVwXCJcclxuXHJcbiAgICB2YXIgcEVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICB2YXIgbGFiZWxFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcclxuICAgIHZhciBzcGFuRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgIHNwYW5FbGVtLmlubmVySFRNTCA9IFwiS2VlcCBhbGl2ZSBhcHBcIlxyXG4gICAgbGFiZWxFbGVtLmFwcGVuZENoaWxkKGNoZWNrYm94S2VlcEVsZW1lbnQpO1xyXG4gICAgbGFiZWxFbGVtLmFwcGVuZENoaWxkKHNwYW5FbGVtKVxyXG4gICAgcEVsZW0uYXBwZW5kQ2hpbGQobGFiZWxFbGVtKVxyXG4gICAgZm9ybUVsZW1lbnQuYXBwZW5kQ2hpbGQocEVsZW0pXHJcblxyXG4gICAgdmFyIGRpdkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgdmFyIGlucHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICB2YXIgbGFiZWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcclxuICAgIGRpdkVsZW1lbnQuY2xhc3NOYW1lID0gXCJyb3dcIlxyXG4gICAgaW5wdXRFbGVtZW50LnBsYWNlaG9sZGVyID0gXCJBdHRlbXB0c1wiXHJcbiAgICBpbnB1dEVsZW1lbnQuaWQgPSBcImtlZXBjb3VudFwiXHJcbiAgICBsYWJlbEVsZW1lbnQuaW5uZXJIVE1MID0gXCJBdHRlbXB0c1wiXHJcbiAgICBkaXZFbGVtZW50LmFwcGVuZENoaWxkKGxhYmVsRWxlbWVudClcclxuICAgIGRpdkVsZW1lbnQuYXBwZW5kQ2hpbGQoaW5wdXRFbGVtZW50KVxyXG4gICAgZm9ybUVsZW1lbnQuYXBwZW5kQ2hpbGQoZGl2RWxlbWVudClcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVudFwiKS5hcHBlbmRDaGlsZChmb3JtRWxlbWVudCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEFkZCgpe1xyXG4gICAgJCgnI2NvbnRlbnQnKS5lbXB0eSgpXHJcbiAgICAkKCcjSGVhZGVyJykuaHRtbChcItCU0L7QsdCw0LLQu9C10L3QuNC1INC/0YDQuNC70L7QttC10L3QuNGPXCIpXHJcbiAgICBpZiAodGltZXJJZCE9bnVsbCl7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcklkKVxyXG4gICAgfVxyXG4gICAgYnVpbGRGb3JtQWRkRWRpdCgpXHJcblxyXG5cclxuICAgIHZhciBidXR0b25FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICBidXR0b25FbGVtZW50LnR5cGUgPSBcInN1Ym1pdFwiXHJcbiAgICBidXR0b25FbGVtZW50LmNsYXNzTmFtZT1cImJ0blwiXHJcbiAgICBidXR0b25FbGVtZW50LmlubmVySFRNTD0gXCLQlNC+0LHQsNCy0LjRgtGMXCJcclxuICAgIGJ1dHRvbkVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbmFtZSA9ICQoJyNuYW1lJykudmFsKClcclxuICAgICAgICB2YXIgZ3JvdXAgPSAkKCcjZ3JvdXAnKS52YWwoKVxyXG4gICAgICAgIHZhciBzY3JpcHQgPSAkKCcjc2NyaXB0JykudmFsKClcclxuICAgICAgICB2YXIgd2F0Y2ggPSAkKCcjd2F0Y2gnKS52YWwoKVxyXG4gICAgICAgIHZhciBsb2cgPSAkKCcjbG9nJykudmFsKClcclxuICAgICAgICB2YXIgaG9zdCA9ICQoJyNob3N0JykudmFsKClcclxuICAgICAgICB2YXIgcG9ydCA9ICQoJyNwb3J0JykudmFsKClcclxuXHJcbiAgICAgICAgdmFyIGtlZXAgPSAkKCcjY2hlY2tib3hLZWVwJykuaXMoJzpjaGVja2VkJylcclxuICAgICAgICB2YXIgYXR0ZW1wdCA9IHBhcnNlSW50KCQoJyNrZWVwY291bnQnKS52YWwoKSlcclxuICAgICAgICB2YXIgYXBwID0gZ2V0QXBwVGVtcGxhdGUobmFtZSxncm91cCxzY3JpcHQsd2F0Y2gsbG9nLGhvc3QscG9ydCxrZWVwLGF0dGVtcHQpXHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiAnL2FwcHMnLFxyXG4gICAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxyXG4gICAgICAgICAgICBkYXRhOiB7YXBwOiBhcHAsXHJcbiAgICAgICAgICAgICAgICAgICAgdWlkOnVpZH0sXHJcbiAgICAgICAgICAgIGpzb246IHRydWUsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgZ2V0TGlzdCgpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcbiAgLy8gIGZvcm1FbGVtZW50LmFwcGVuZENoaWxkKGJ1dHRvbkVsZW1lbnQpXHJcblxyXG5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVudFwiKS5hcHBlbmRDaGlsZChidXR0b25FbGVtZW50KTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0Um9sZSgpe1xyXG4gICAgdmFyIHJlc3VsdD1mYWxzZVxyXG4gICBhd2FpdCAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogJy9yb2xlJyxcclxuICAgICAgICBkYXRhOiB7dWlkOnVpZH0sXHJcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIGlmIChKU09OLnBhcnNlKHJlc3BvbnNlKVsnZGF0YSddID09IFwiYWRtaW5cIil7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlXHJcbiAgICAgICAgICAgIH1lbHNle3Jlc3VsdD1mYWxzZX1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbiAoZXJyb3Ipe1xyXG4gICAgICAgICAgICBpZihlcnJvciE9bnVsbClcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIHJldHVybiByZXN1bHRcclxufVxyXG5cclxuZnVuY3Rpb24gU2hvd1NldHRpbmdzKCAgKXtcclxuICAgICQuYWpheCh7XHJcbiAgICAgICAgdXJsOiAnL2NvbmZpZy9nZXRzZXR0aW5ncycsXHJcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgZGF0YToge3VpZDp1aWR9LFxyXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICB2YXIgc2V0dGluZ3MgPSBKU09OLnBhcnNlKHJlc3BvbnNlKVsnZGF0YSddWzBdXHJcbiAgICAgICAgICAgICQoJyNjb250ZW50JykuZW1wdHkoKVxyXG4gICAgICAgICAgICAkKCcjSGVhZGVyJykuaHRtbChcItCd0LDRgdGC0YDQvtC50LrQuFwiKVxyXG4gICAgICAgICAgICBpZiAodGltZXJJZCE9bnVsbCl7XHJcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHRpbWVySWQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGZvcm1FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpO1xyXG4gICAgICAgICAgICBnZXRSb2xlKCkudGhlbih2YWx1ZT0+e1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGFiZWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbEVsZW1lbnQuaW5uZXJIVE1MID0gJ9CX0LDQs9GA0YPQt9C60LAg0YHQv9C40YHQutCwINC/0YDQuNC70L7QttC10L3QuNC5INC40LcganNvbjonXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHBFbGVtLmFwcGVuZENoaWxkKGxhYmVsRWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICBmb3JtRWxlbWVudC5hcHBlbmRDaGlsZChwRWxlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlucHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRFbGVtZW50LmNsYXNzTmFtZSA9IFwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0blwiXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRFbGVtZW50LnR5cGUgPSBcImZpbGVcIlxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0RWxlbWVudC5uYW1lID0gXCJhcHBzRmlsZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRFbGVtZW50LmFjY2VwdCA9IFwiLmpzb25cIlxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaWxlID0gdGhpcy5maWxlc1swXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkZXIub25sb2FkZW5kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganNvbmZpbGVkYXRhID0gcmVhZGVyLnJlc3VsdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzVGV4dChmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwRWxlbTIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcEVsZW0yLmFwcGVuZENoaWxkKGlucHV0RWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICBmb3JtRWxlbWVudC5hcHBlbmRDaGlsZChwRWxlbTIpO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJ1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50LnR5cGUgPSBcImJ1dHRvblwiXHJcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudC5jbGFzc05hbWUgPSBcImJ0blwiXHJcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudC5pbm5lckhUTUwgPSBcItCX0LDQs9GA0YPQt9C40YLRjFwiXHJcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIGNvbnNvbGUubG9nKFwiZmlsZU5hbWVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICQoXCJpbnB1dFtuYW1lPSdhcHBzRmlsZSddXCIpLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHZhciBmaWxlTmFtZSA9ICQodGhpcykudmFsKCkvLygpLnNwbGl0KCcvJykucG9wKCkuc3BsaXQoJ1xcXFwnKS5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25maWxlZGF0YSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMb2FkU2V0dGluZ3MoanNvbmZpbGVkYXRhKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBFbGVtMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgICAgICAgICAgICAgICAgICBwRWxlbTMuYXBwZW5kQ2hpbGQoYnV0dG9uRWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICBmb3JtRWxlbWVudC5hcHBlbmRDaGlsZChwRWxlbTMpXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXRoaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgcGF0aGlucHV0LnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJ0ZXh0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHBhdGhpbnB1dC5zZXRBdHRyaWJ1dGUoXCJwbGFjZWhvbGRlclwiLCBcItCS0LLQtdC00LjRgtC1INC/0YPRgtGMINC00LvRjyDRgdC+0YXRgNCw0L3QtdC90LjRj1wiKTtcclxuICAgICAgICAgICAgICAgICAgICBwYXRoaW5wdXQuaWQgPSBcInBhdGhJbnB1dFwiXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBFbGVtNCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgICAgICAgICAgICAgICAgICBwRWxlbTQuYXBwZW5kQ2hpbGQocGF0aGlucHV0KVxyXG4gICAgICAgICAgICAgICAgICAgIGZvcm1FbGVtZW50LmFwcGVuZENoaWxkKHBFbGVtNClcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJ1dHRvbkVsZW1lbnQyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudDIudHlwZSA9IFwiYnV0dG9uXCJcclxuICAgICAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50Mi5jbGFzc05hbWUgPSBcImJ0blwiXHJcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudDIuaW5uZXJIVE1MID0gXCLQodC+0YXRgNCw0L3QuNGC0YxcIlxyXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbkVsZW1lbnQyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiAnL2NvbmZpZy9zYXZlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtmaWxlOiQoJyNwYXRoSW5wdXQnKS52YWwoKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldExpc3QoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBFbGVtNSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgICAgICAgICAgICAgICAgICBwRWxlbTUuYXBwZW5kQ2hpbGQoYnV0dG9uRWxlbWVudDIpXHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybUVsZW1lbnQuYXBwZW5kQ2hpbGQocEVsZW01KVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoZm9ybUVsZW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgdmFyIGRpdkVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgICAgICB2YXIgZGl2RWxlbTIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXHJcblxyXG4gICAgICAgICAgICB2YXIgZW1haWxpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcclxuICAgICAgICAgICAgZW1haWxpbnB1dC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dFwiKTtcclxuICAgICAgICAgICAgZW1haWxpbnB1dC5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBzZXR0aW5ncy50b2VtYWlsKTtcclxuICAgICAgICAgICAgZW1haWxpbnB1dC5zZXRBdHRyaWJ1dGUoXCJwbGFjZWhvbGRlclwiLCBcIkVtYWlsIHRvIG1lc3NhZ2VzXCIpO1xyXG4gICAgICAgICAgICBlbWFpbGlucHV0LmlkID0gXCJlbWFpbElucHV0XCJcclxuICAgICAgICAgICAgZGl2RWxlbS5hcHBlbmRDaGlsZChlbWFpbGlucHV0KVxyXG4gICAgICAgICAgICBkaXZFbGVtLmNsYXNzTmFtZSA9IFwiaW5wdXQtZmllbGQgY29sIHM2XCJcclxuXHJcbiAgICAgICAgICAgIHZhciBidXR0b25FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgICAgIGJ1dHRvbkVsZW1lbnQudHlwZSA9IFwiYnV0dG9uXCJcclxuICAgICAgICAgICAgYnV0dG9uRWxlbWVudC5jbGFzc05hbWUgPSBcImJ0blwiXHJcbiAgICAgICAgICAgIGJ1dHRvbkVsZW1lbnQuaW5uZXJIVE1MID0gXCLQodC+0YXRgNCw0L3QuNGC0YxcIlxyXG4gICAgICAgICAgICBidXR0b25FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvY29uZmlnL3NldGVtYWlsJyxcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7ZW1haWw6JCgnI2VtYWlsSW5wdXQnKS52YWwoKSx1aWQ6dWlkfSxcclxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgU2hvd1NldHRpbmdzKClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgfSlcclxuXHJcblxyXG4gICAgICAgICAgICBkaXZFbGVtLmFwcGVuZENoaWxkKGJ1dHRvbkVsZW1lbnQpXHJcbiAgICAgICAgICAgIGRpdkVsZW0yLmNsYXNzTmFtZSA9IFwicm93XCJcclxuICAgICAgICAgICAgZGl2RWxlbTIuYXBwZW5kQ2hpbGQoZGl2RWxlbSlcclxuICAgICAgICAgICAgZm9ybUVsZW1lbnQuY2xhc3NOYW1lID0gXCJjb2wgczEyXCJcclxuICAgICAgICAgICAgZm9ybUVsZW1lbnQuYXBwZW5kQ2hpbGQoZGl2RWxlbTIpXHJcblxyXG4gICAgICAgICAgICB2YXIgY2hlY2tib3hFeGl0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgIHZhciBjaGVja2JveENsb3NlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgIHZhciBjaGVja2JveENyYXNoRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgIGNoZWNrYm94RXhpdEVsZW1lbnQuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcImNoZWNrYm94XCIpO1xyXG4gICAgICAgICAgICBjaGVja2JveENsb3NlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiY2hlY2tib3hcIik7XHJcbiAgICAgICAgICAgIGNoZWNrYm94Q3Jhc2hFbGVtZW50LnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJjaGVja2JveFwiKTtcclxuICAgICAgICAgICAgY2hlY2tib3hDbG9zZUVsZW1lbnQubmFtZSA9IFwiY2hlY2tib3hDbG9zZVwiXHJcbiAgICAgICAgICAgIGNoZWNrYm94RXhpdEVsZW1lbnQubmFtZSA9IFwiY2hlY2tib3hFeGl0XCJcclxuICAgICAgICAgICAgY2hlY2tib3hDcmFzaEVsZW1lbnQubmFtZSA9IFwiY2hlY2tib3hDcmFzaFwiXHJcbiAgICAgICAgICAgIGNoZWNrYm94Q2xvc2VFbGVtZW50LmNoZWNrZWQgPSBzZXR0aW5ncy5zZW50Y2xvc2VcclxuICAgICAgICAgICAgY2hlY2tib3hDcmFzaEVsZW1lbnQuY2hlY2tlZCA9IHNldHRpbmdzLnNlbnRjcmFzaFxyXG4gICAgICAgICAgICBjaGVja2JveEV4aXRFbGVtZW50LmNoZWNrZWQgPSBzZXR0aW5ncy5zZW50ZXhpdFxyXG5cclxuICAgICAgICAgICAgY2hlY2tib3hDbG9zZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCl7XHJcblxyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvY29uZmlnL2Nsb3Nlc2VuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge2ZsYWc6IHRoaXMuY2hlY2tlZCwgdWlkOnVpZH0sXHJcbiAgICAgICAgICAgICAgICAgICAganNvbjogdHJ1ZSxcclxuXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBjaGVja2JveEV4aXRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpe1xyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvY29uZmlnL2V4aXRzZW5kJyxcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7ZmxhZzogdGhpcy5jaGVja2VkLCB1aWQ6dWlkfSxcclxuICAgICAgICAgICAgICAgICAgICBqc29uOiB0cnVlLFxyXG5cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIGNoZWNrYm94Q3Jhc2hFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpe1xyXG5cclxuICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL2NvbmZpZy9jcmFzaHNlbmQnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtmbGFnOiB0aGlzLmNoZWNrZWQsIHVpZDp1aWR9LFxyXG4gICAgICAgICAgICAgICAgICAgIGpzb246IHRydWUsXHJcblxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAvLyBmb3JtRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcclxuICAgICAgICAgICAgdmFyIHBFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgICAgICB2YXIgbGFiZWxFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcclxuICAgICAgICAgICAgdmFyIHNwYW5FbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgICAgICBzcGFuRWxlbS5pbm5lckhUTUwgPSBcItCf0L7RgdGL0LvQsNGC0Ywg0YHQvtC+0LHRidC10L3QuNC1INC/0YDQuCDQt9Cw0LrRgNGL0YLQuNC4INC/0YDQuNC70L7QttC10L3QuNGPXCJcclxuICAgICAgICAgICAgbGFiZWxFbGVtLmFwcGVuZENoaWxkKGNoZWNrYm94Q2xvc2VFbGVtZW50KTtcclxuICAgICAgICAgICAgbGFiZWxFbGVtLmFwcGVuZENoaWxkKHNwYW5FbGVtKVxyXG4gICAgICAgICAgICBwRWxlbS5hcHBlbmRDaGlsZChsYWJlbEVsZW0pXHJcbiAgICAgICAgICAgIGZvcm1FbGVtZW50LmFwcGVuZENoaWxkKHBFbGVtKVxyXG4gICAgICAgICAgICB2YXIgcEVsZW0yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgICAgICB2YXIgbGFiZWxFbGVtMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XHJcbiAgICAgICAgICAgIHZhciBzcGFuRWxlbTIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgICAgIHNwYW5FbGVtMi5pbm5lckhUTUwgPSBcItCf0L7RgdGL0LvQsNGC0Ywg0YHQvtC+0LHRidC10L3QuNC1INC/0YDQuCDQstGL0YXQvtC00LUg0LjQtyDQv9GA0LjQu9C+0LbQtdC90LjRj1wiXHJcbiAgICAgICAgICAgIGxhYmVsRWxlbTIuYXBwZW5kQ2hpbGQoY2hlY2tib3hFeGl0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIGxhYmVsRWxlbTIuYXBwZW5kQ2hpbGQoc3BhbkVsZW0yKVxyXG4gICAgICAgICAgICBwRWxlbTIuYXBwZW5kQ2hpbGQobGFiZWxFbGVtMilcclxuICAgICAgICAgICAgZm9ybUVsZW1lbnQuYXBwZW5kQ2hpbGQocEVsZW0yKVxyXG4gICAgICAgICAgICB2YXIgcEVsZW0zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgICAgICB2YXIgbGFiZWxFbGVtMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XHJcbiAgICAgICAgICAgIHZhciBzcGFuRWxlbTMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgICAgIHNwYW5FbGVtMy5pbm5lckhUTUwgPSBcItCf0L7RgdGL0LvQsNGC0Ywg0YHQvtC+0LHRidC10L3QuNC1INC/0YDQuCDQsNCy0LDRgNC40LnQvdC+0Lwg0LfQsNCy0LXRgNGI0LXQvdC40LhcIlxyXG4gICAgICAgICAgICBsYWJlbEVsZW0zLmFwcGVuZENoaWxkKGNoZWNrYm94Q3Jhc2hFbGVtZW50KTtcclxuICAgICAgICAgICAgbGFiZWxFbGVtMy5hcHBlbmRDaGlsZChzcGFuRWxlbTMpXHJcbiAgICAgICAgICAgIHBFbGVtMy5hcHBlbmRDaGlsZChsYWJlbEVsZW0zKVxyXG4gICAgICAgICAgICBmb3JtRWxlbWVudC5hcHBlbmRDaGlsZChwRWxlbTMpXHJcblxyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoZm9ybUVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRHcm91cHMoZGF0YSl7XHJcbiAgICB2YXIgaDRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDQnKTtcclxuICAgIGg0RWxlbWVudC5pbm5lckhUTUwgPSBcItCT0YDRg9C/0L/RizpcIlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsaXN0TWFuYWdlXCIpLmFwcGVuZENoaWxkKGg0RWxlbWVudClcclxuICAgIGRhdGEuZm9yRWFjaChlbGVtPT57XHJcbiAgICAgICAgdmFyIGxpRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcbiAgICAgICAgbGlFbGVtZW50LmNsYXNzTmFtZSA9IFwiZ3JvdXBcIlxyXG5cclxuICAgICAgICB2YXIgbGFiZWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcclxuICAgICAgICBsYWJlbEVsZW1lbnQuaW5uZXJIVE1MID0gZWxlbVxyXG4gICAgICAgIGxhYmVsRWxlbWVudC5zdHlsZSA9IFwiZm9udC1zaXplOiBtZWRpdW1cIlxyXG4gICAgICAgIGxhYmVsRWxlbWVudC5pbm5lckhUTUwgPSBlbGVtXHJcbiAgICAgICAgdmFyIGJ1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgICBidXR0b25FbGVtZW50LnR5cGUgPSBcInN1Ym1pdFwiXHJcbiAgICAgICAgYnV0dG9uRWxlbWVudC5jbGFzc05hbWU9XCJidG5cIlxyXG4gICAgICAgIGJ1dHRvbkVsZW1lbnQuaW5uZXJIVE1MPSfQl9Cw0L/Rg9GB0YLQuNGC0YwnO1xyXG4gICAgICAgICAgICBidXR0b25FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL2FwcHMvc3RhcnQnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtvcHRpb25zOiBbe25hbWU6XCJncm91cFwiLCB2YWx1ZTplbGVtfSwge25hbWU6XCJ1aWRcIix2YWx1ZTp1aWR9XX0sXHJcbiAgICAgICAgICAgICAgICAgICAganNvbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRTdG9wKClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIHZhciBidXR0b25FbGVtZW50MiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIGJ1dHRvbkVsZW1lbnQyLnR5cGUgPSBcInN1Ym1pdFwiXHJcbiAgICAgICAgYnV0dG9uRWxlbWVudDIuY2xhc3NOYW1lPVwiYnRuXCJcclxuICAgICAgICBidXR0b25FbGVtZW50Mi5pbm5lckhUTUw9J9Ce0YHRgtCw0L3QvtCy0LjRgtGMJztcclxuICAgICAgICAgICAgYnV0dG9uRWxlbWVudDIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvYXBwcy9zdG9wJyxcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7b3B0aW9uczogW3tuYW1lOlwiZ3JvdXBcIiwgdmFsdWU6ZWxlbX0sIHtuYW1lOlwidWlkXCIsdmFsdWU6dWlkfV19LFxyXG4gICAgICAgICAgICAgICAgICAgIGpzb246IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0U3RvcCgpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICBsYWJlbEVsZW1lbnQuYXBwZW5kQ2hpbGQoYnV0dG9uRWxlbWVudClcclxuICAgICAgICBsYWJlbEVsZW1lbnQuYXBwZW5kQ2hpbGQoYnV0dG9uRWxlbWVudDIpXHJcbiAgICAgICAgbGlFbGVtZW50LmFwcGVuZENoaWxkKGxhYmVsRWxlbWVudClcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxpc3RNYW5hZ2VcIikuYXBwZW5kQ2hpbGQobGlFbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgIClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RWRpdCgpe1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6ICcvYXBwcy9saXN0JyxcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBkYXRhOnt1aWQ6dWlkfSxcclxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgJCgnI2NvbnRlbnQnKS5lbXB0eSgpXHJcbiAgICAgICAgICAgIHZhciBpbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xyXG4gICAgICAgICAgICBpbnB1dEVsZW1lbnQuaWQgPSAnbGlzdE1hbmFnZSdcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW50XCIpLmFwcGVuZENoaWxkKGlucHV0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIHZhciBoNEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoNCcpO1xyXG4gICAgICAgICAgICBoNEVsZW1lbnQuaW5uZXJIVE1MID0gXCLQn9GA0LjQu9C+0LbQtdC90LjRjzpcIlxyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxpc3RNYW5hZ2VcIikuYXBwZW5kQ2hpbGQoaDRFbGVtZW50KTtcclxuICAgICAgICAgICAgJCgnI0hlYWRlcicpLmh0bWwoXCLQoNC10LTQsNC60YLQuNGA0L7QstCw0L3QuNC1INC/0YDQuNC70L7QttC10L3QuNC5XCIpXHJcbiAgICAgICAgICAgIGlmICh0aW1lcklkIT1udWxsKXtcclxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXJJZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBKU09OLnBhcnNlKHJlc3BvbnNlKVsnZGF0YSddLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxpRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlFbGVtZW50LmNsYXNzTmFtZSA9IFwibW9uaXRcIlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsRWxlbWVudC5zdHlsZSA9IFwiZm9udC1zaXplOiBtZWRpdW1cIlxyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgYnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbkVsZW1lbnQudHlwZSA9IFwic3VibWl0XCJcclxuICAgICAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50LmNsYXNzTmFtZT1cImJ0blwiXHJcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudC5pbm5lckhUTUw9IGVsZW1lbnQubmFtZVxyXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbkVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBFZGl0KGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbEVsZW1lbnQuYXBwZW5kQ2hpbGQoYnV0dG9uRWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICBsaUVsZW1lbnQuYXBwZW5kQ2hpbGQobGFiZWxFbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGlzdE1hbmFnZVwiKS5hcHBlbmRDaGlsZChsaUVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIClcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG59XHJcbmZ1bmN0aW9uIGFwcEVkaXQoYXBwKXtcclxuICAgICQoJyNjb250ZW50JykuZW1wdHkoKVxyXG4gICAgJCgnI0hlYWRlcicpLmh0bWwoXCLQoNC10LTQsNC60YLQuNGA0L7QstCw0L3QuNC1INC/0YDQuNC70L7QttC10L3QuNGPIFxcXCJcIithcHAubmFtZStcIlxcXCJcIilcclxuICAgIGJ1aWxkRm9ybUFkZEVkaXQoKVxyXG4gICAgY29uc3QgSURzID0gWyduYW1lJywnZ3JvdXAnLCdzY3JpcHQnLCdob3N0JywncG9ydCcsJ3dhdGNoJywnbG9nJ11cclxuICAgIGNvbnN0IHZhbHVlID0gW2FwcC5uYW1lLGFwcC5ncm91cCxhcHAuc2NyaXB0LGFwcC5ob3N0LGFwcC5wb3J0LGFwcC53YXRjaC5wYXRoLGFwcC5sb2ddXHJcbiAgICB2YXIgaSA9IDBcclxuICAgIElEcy5mb3JFYWNoKGlkPT57XHJcbiAgICAgICAgJCgnIycraWQpLnZhbCh2YWx1ZVtpXSk7XHJcbiAgICAgICAgaSsrXHJcbiAgICAgICAgfVxyXG4gICAgKVxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoZWNrYm94S2VlcCcpLmNoZWNrZWQgPSBhcHAua2VlcFxyXG4gICAgLy8kKCcjY2hlY2tib3hLZWVwJykuY2hlY2tlZCA9IGFwcC5rZWVwXHJcbiAgICAkKCcja2VlcGNvdW50JykudmFsKGFwcC5hdHRlbXB0KVxyXG4gICAgdmFyIGJ1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgIGJ1dHRvbkVsZW1lbnQudHlwZSA9IFwic3VibWl0XCJcclxuICAgIGJ1dHRvbkVsZW1lbnQuY2xhc3NOYW1lPVwiYnRuXCJcclxuICAgIGJ1dHRvbkVsZW1lbnQuaW5uZXJIVE1MPSBcItCU0L7QsdCw0LLQuNGC0YxcIlxyXG4gICAgYnV0dG9uRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBuYW1lID0gJCgnI25hbWUnKS52YWwoKVxyXG4gICAgICAgIHZhciBncm91cCA9ICQoJyNncm91cCcpLnZhbCgpXHJcbiAgICAgICAgdmFyIHNjcmlwdCA9ICQoJyNzY3JpcHQnKS52YWwoKVxyXG4gICAgICAgIHZhciB3YXRjaCA9ICQoJyN3YXRjaCcpLnZhbCgpXHJcbiAgICAgICAgdmFyIGxvZyA9ICQoJyNsb2cnKS52YWwoKVxyXG4gICAgICAgIHZhciBob3N0ID0gJCgnI2hvc3QnKS52YWwoKVxyXG4gICAgICAgIHZhciBwb3J0ID0gJCgnI3BvcnQnKS52YWwoKVxyXG5cclxuICAgICAgICB2YXIga2VlcCA9ICQoJyNjaGVja2JveEtlZXAnKS5pcygnOmNoZWNrZWQnKVxyXG4gICAgICAgIHZhciBhdHRlbXB0ID0gcGFyc2VJbnQoJCgnI2tlZXBjb3VudCcpLnZhbCgpKVxyXG4gICAgICAgIHZhciBhcHBOb3cgPSBnZXRBcHBUZW1wbGF0ZShuYW1lLGdyb3VwLHNjcmlwdCx3YXRjaCxsb2csaG9zdCxwb3J0LGtlZXAsYXR0ZW1wdClcclxuICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6ICcvYXBwJyxcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIGRhdGE6IHtvcHRpb25zOiBbe25hbWU6J25hbWUnLHZhbHVlOm5hbWV9LHtuYW1lOidncm91cCcsdmFsdWU6Z3JvdXB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtuYW1lOidzY3JpcHQnLHZhbHVlOnNjcmlwdH0se25hbWU6J3dhdGNoJyx2YWx1ZTp3YXRjaH0se25hbWU6J2xvZycsdmFsdWU6bG9nfSxcclxuICAgICAgICAgICAgICAgICAgICB7bmFtZTonaG9zdCcsdmFsdWU6aG9zdH0se25hbWU6J3BvcnQnLHZhbHVlOnBvcnR9LHtuYW1lOidrZWVwJyx2YWx1ZTprZWVwfSx7bmFtZTonYXR0ZW1wdCcsdmFsdWU6YXR0ZW1wdH1dLFxyXG4gICAgICAgICAgICAgICAgc2VhcmNoOiBhcHAubmFtZSxcclxuICAgICAgICAgICAgICAgIHVpZDp1aWR9LFxyXG4gICAgICAgICAgICBqc29uOiB0cnVlLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGdldExpc3QoKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pXHJcbiAgICB9KVxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW50XCIpLmFwcGVuZENoaWxkKGJ1dHRvbkVsZW1lbnQpO1xyXG5cclxuICAgLy8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lXCIpLnZhbChhcHAubmFtZSlcclxufVxyXG4vKjxmb3JtPlxyXG4gICAgPHA+PGlucHV0IHBsYWNlaG9sZGVyPVwi0J3QsNC30LLQsNC90LjQtSDQt9Cw0LTQsNC90LjRj1wiIG5hbWU9XCJuYW1ldGFza1wiPjwvcD5cclxuICAgIDxwPjx0ZXh0YXJlYSBwbGFjZWhvbGRlcj1cItCe0L/QuNGB0LDQvdC40LUg0LfQsNC00LDQvdC40Y9cIj48L3RleHRhcmVhPjwvcD5cclxuICAgIDxwPiDQodGC0LDRgtGD0YEg0LfQsNC00LDRh9C4OlxyXG4gICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBuYW1lPVwic3RhdHVzXCIgaWQ9XCIxXCIgY2hlY2tlZD1cImNoZWNrZWRcIj4gPGxhYmVsIGh0bWxGb3I9XCIxXCI+0JIg0L/RgNC+0YbQtdGB0YHQtTwvbGFiZWw+XHJcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBpZD1cIjJcIiBuYW1lPVwic3RhdHVzXCI+PGxhYmVsIGh0bWxGb3I9XCIyXCI+0JLRi9C/0L7Qu9C90LXQvdC+PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBpZD1cIjNcIiBuYW1lPVwic3RhdHVzXCI+PGxhYmVsIGh0bWxGb3I9XCIzXCI+0J/RgNC+0LLQsNC70LXQvdC+PC9sYWJlbD5cclxuICAgIDwvcD5cclxuICAgIDxwPiDQntC20LjQtNCw0LXQvNCw0Y8g0LTQsNGC0LAg0LLRi9C/0L7Qu9C90LXQvdC40Y86IDxpbnB1dCB0eXBlPVwiZGF0ZVwiIHBsYWNlaG9sZGVyPVwi0J3QsNC30LLQsNC90LjQtSDQt9Cw0LTQsNGH0LhcIiBpZD1cImRhdGVcIiBuYW1lPVwiZGF0ZVwiLz5cclxuICAgICAgICA8cD48aW5wdXQgdHlwZT1cImZpbGVcIiBuYW1lPVwiZlwiIG11bHRpcGxlPlxyXG4gICAgICAgICAgICA8cD48aW5wdXQgdHlwZT1cInN1Ym1pdFwiIHZhbHVlPVwi0JTQvtCx0LDQstC40YLRjCDQvdC+0LLRg9GOINC30LDQtNCw0YfRg1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICBmb3JtQWN0aW9uPVwic2VydmVyLmpzXCIgZm9ybU1ldGhvZD1cInBvc3RcIj48L3A+XHJcbjwvZm9ybT4qL1xyXG5cclxuXHJcbmdsb2JhbC5zZXRVc2VySWQgPSBzZXRVc2VySWRcclxuZ2xvYmFsLmdldEVkaXQgPSBnZXRFZGl0XHJcbmdsb2JhbC5nZXRBZGQgPSBnZXRBZGRcclxuZ2xvYmFsLlNob3dTZXR0aW5ncz1TaG93U2V0dGluZ3NcclxuZ2xvYmFsLmdldExpc3QgPSBnZXRMaXN0XHJcbmdsb2JhbC5nZXRNb25pdCA9IGdldE1vbml0XHJcbmdsb2JhbC5zdGFydFN0b3AgPSBzdGFydFN0b3BcclxuZ2xvYmFsLlN0YXJ0QXBwID0gU3RhcnRBcHBcclxuZ2xvYmFsLlN0b3BBcHAgPSBTdG9wQXBwXHJcbi8qXHJcbiBiYXJDaGFydC5kYXRhLmRhdGFzZXRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ3t7bmFtZX19KFBJRDp7e3BpZH19KScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFt7e21lbX19XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3JzW2ldLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogY29sb3JzW2ldXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICBiYXJDaGFydDIuZGF0YS5kYXRhc2V0cy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICd7e25hbWV9fShQSUQ6e3twaWR9fSknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBbe3tjcHV9fV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGNvbG9yc1tpXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGNvbG9yc1tpXVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgaSA+IGNvbG9ycy5sZW5ndGggLSAxID8gaSA9IDAgOiBpKytcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBiYXJDaGFydC51cGRhdGUoKVxyXG4gICAgICAgICAgICAgICAgYmFyQ2hhcnQyLnVwZGF0ZSgpXHJcblxyXG4gICAgICAgICAgICAgICAgZmV0Y2hEYXRhKCBiYXJDaGFydCwgYmFyQ2hhcnQyIClcclxuXHJcbiovXHJcbiJdfQ==
