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

function getImageList(){
    $.ajax({
        url: '/apps/list',
        method: 'POST',
        data:{uid:uid, imagelist:true},
        success: function (response) {
            $('#content').empty()
            isMonit=false
            if (timerId!=null){
                clearInterval(timerId)
            }
            $('#Header').html("Список снимков")
            var tableElement = document.createElement('table');
            tableElement.id = 'listTable'
            tableElement.className = 'centered'
            document.getElementById("content").appendChild(tableElement);

            var toTable='<thead><tr><th>Название снимка</th><th>Версия</th><th>Размер</th><th>Создан</th> ' +
                '</tr></thead><tbody>'
            JSON.parse(response)['data'].forEach(element =>{
                    toTable+= '<tr><td>' +element.name+ '</td><td>'+element.version+'</td><td>'+
                        listFormat("memory",element.size)  +'</td> <td>'+ (new Date(+element.created * 1000)).toString() + '</td></tr>'
                }
            )
            toTable+='</tbody>'
            $('#listTable').append(toTable)
        }
    })
}

function getList () {
    $.ajax({
        url: '/apps/list',
        method: 'POST',
        data:{uid:uid, imagelist:false},
        success: function (response) {
            $('#content').empty()
            isMonit=false
            if (timerId!=null){
                clearInterval(timerId)
            }
            $('#Header').html("Список контейнеров")

            var inputElement = document.createElement('table');
            inputElement.id = 'listTable'
            inputElement.className = 'centered'
            document.getElementById("content").appendChild(inputElement);

            var toTable='<thead><tr><th>Имя контейнера</th><th>Имя снимка</th><th>Статус</th><th>Публичный порт</th><th>Приватный порт</th> ' +
                '<th>Создан</th></tr></thead><tbody>'
            JSON.parse(response)['data'].forEach(element =>{

                //'+ (element.status == 'up' ? "style=\"color:#77DD77\"" : "style=\"color:red\"")+ '
                    toTable+= '<tr><td>'+ element.name +'</td><td>' +element.image+ '</td><td>'+element.status+
                        '</td><td>'+element?.ports[0]?.PublicPort+'</td><td>'+element?.ports[0]?.PrivatePort
                        +'</td><td>'+ (new Date(+element.created * 1000)).toString() + '</td></tr>'
                }
            )
            toTable+='</tbody>'
            $('#listTable').append(toTable)

        }
    });
}

function fetchData(containersId ) {
    $.ajax({
        url: '/apps/monit',
        method:   'POST',
        data: {containersId:containersId},
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
        url: '/apps/list',
        method: 'POST',
        data:{uid:uid, imagelist:false},
        success: function (response) {
           let containersId = JSON.parse(response)['data'].map(elem => elem.Id)

            $.ajax({
                url: '/apps/monit',
                data: {containersId:containersId},
                method: 'POST',
                success: function (response) {
                    $('#content').empty()
                    $('#Header').html("Мониторинг приложений")
                    var rowElement = document.createElement('tr');

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
                    timerId = setInterval(fetchData, 2000, containersId)
                }
            });

        }
    })

}

function startStop(){
    $.ajax({
        url: '/apps/list',
        method: 'POST',
        data:{uid:uid,imagelist:false},
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

function getAdd(isImage){
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

function getEdit(isImage){
    $.ajax({
        url: '/apps/list',
        method: 'POST',
        data:{uid:uid,imagelist:isImage},
        success: function (response) {
            $('#content').empty()
            var inputElement = document.createElement('ul');
            inputElement.id = 'listManage'
            document.getElementById("content").appendChild(inputElement);
            var h4Element = document.createElement('h4');
            h4Element.innerHTML = (isImage)? "Снимки:":'Контейнеры'
            document.getElementById("listManage").appendChild(h4Element);
            $('#Header').html("Редактирование "+ ((isImage)? "снимков:":'контейнеров'))
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


global.setUserId = setUserId
global.getEdit = getEdit
global.getAdd = getAdd
global.ShowSettings=ShowSettings
global.getList = getList
global.getImageList = getImageList
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsInN0YXRpYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDamhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gJ3BhdGgnIG1vZHVsZSBleHRyYWN0ZWQgZnJvbSBOb2RlLmpzIHY4LjExLjEgKG9ubHkgdGhlIHBvc2l4IHBhcnQpXG4vLyB0cmFuc3BsaXRlZCB3aXRoIEJhYmVsXG5cbi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGFzc2VydFBhdGgocGF0aCkge1xuICBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUGF0aCBtdXN0IGJlIGEgc3RyaW5nLiBSZWNlaXZlZCAnICsgSlNPTi5zdHJpbmdpZnkocGF0aCkpO1xuICB9XG59XG5cbi8vIFJlc29sdmVzIC4gYW5kIC4uIGVsZW1lbnRzIGluIGEgcGF0aCB3aXRoIGRpcmVjdG9yeSBuYW1lc1xuZnVuY3Rpb24gbm9ybWFsaXplU3RyaW5nUG9zaXgocGF0aCwgYWxsb3dBYm92ZVJvb3QpIHtcbiAgdmFyIHJlcyA9ICcnO1xuICB2YXIgbGFzdFNlZ21lbnRMZW5ndGggPSAwO1xuICB2YXIgbGFzdFNsYXNoID0gLTE7XG4gIHZhciBkb3RzID0gMDtcbiAgdmFyIGNvZGU7XG4gIGZvciAodmFyIGkgPSAwOyBpIDw9IHBhdGgubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoaSA8IHBhdGgubGVuZ3RoKVxuICAgICAgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcbiAgICBlbHNlIGlmIChjb2RlID09PSA0NyAvKi8qLylcbiAgICAgIGJyZWFrO1xuICAgIGVsc2VcbiAgICAgIGNvZGUgPSA0NyAvKi8qLztcbiAgICBpZiAoY29kZSA9PT0gNDcgLyovKi8pIHtcbiAgICAgIGlmIChsYXN0U2xhc2ggPT09IGkgLSAxIHx8IGRvdHMgPT09IDEpIHtcbiAgICAgICAgLy8gTk9PUFxuICAgICAgfSBlbHNlIGlmIChsYXN0U2xhc2ggIT09IGkgLSAxICYmIGRvdHMgPT09IDIpIHtcbiAgICAgICAgaWYgKHJlcy5sZW5ndGggPCAyIHx8IGxhc3RTZWdtZW50TGVuZ3RoICE9PSAyIHx8IHJlcy5jaGFyQ29kZUF0KHJlcy5sZW5ndGggLSAxKSAhPT0gNDYgLyouKi8gfHwgcmVzLmNoYXJDb2RlQXQocmVzLmxlbmd0aCAtIDIpICE9PSA0NiAvKi4qLykge1xuICAgICAgICAgIGlmIChyZXMubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgdmFyIGxhc3RTbGFzaEluZGV4ID0gcmVzLmxhc3RJbmRleE9mKCcvJyk7XG4gICAgICAgICAgICBpZiAobGFzdFNsYXNoSW5kZXggIT09IHJlcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgIGlmIChsYXN0U2xhc2hJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXMgPSAnJztcbiAgICAgICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IDA7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzID0gcmVzLnNsaWNlKDAsIGxhc3RTbGFzaEluZGV4KTtcbiAgICAgICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IHJlcy5sZW5ndGggLSAxIC0gcmVzLmxhc3RJbmRleE9mKCcvJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbGFzdFNsYXNoID0gaTtcbiAgICAgICAgICAgICAgZG90cyA9IDA7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAocmVzLmxlbmd0aCA9PT0gMiB8fCByZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXMgPSAnJztcbiAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcbiAgICAgICAgICAgIGxhc3RTbGFzaCA9IGk7XG4gICAgICAgICAgICBkb3RzID0gMDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoYWxsb3dBYm92ZVJvb3QpIHtcbiAgICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICByZXMgKz0gJy8uLic7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVzID0gJy4uJztcbiAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IDI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChyZXMubGVuZ3RoID4gMClcbiAgICAgICAgICByZXMgKz0gJy8nICsgcGF0aC5zbGljZShsYXN0U2xhc2ggKyAxLCBpKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJlcyA9IHBhdGguc2xpY2UobGFzdFNsYXNoICsgMSwgaSk7XG4gICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gaSAtIGxhc3RTbGFzaCAtIDE7XG4gICAgICB9XG4gICAgICBsYXN0U2xhc2ggPSBpO1xuICAgICAgZG90cyA9IDA7XG4gICAgfSBlbHNlIGlmIChjb2RlID09PSA0NiAvKi4qLyAmJiBkb3RzICE9PSAtMSkge1xuICAgICAgKytkb3RzO1xuICAgIH0gZWxzZSB7XG4gICAgICBkb3RzID0gLTE7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIF9mb3JtYXQoc2VwLCBwYXRoT2JqZWN0KSB7XG4gIHZhciBkaXIgPSBwYXRoT2JqZWN0LmRpciB8fCBwYXRoT2JqZWN0LnJvb3Q7XG4gIHZhciBiYXNlID0gcGF0aE9iamVjdC5iYXNlIHx8IChwYXRoT2JqZWN0Lm5hbWUgfHwgJycpICsgKHBhdGhPYmplY3QuZXh0IHx8ICcnKTtcbiAgaWYgKCFkaXIpIHtcbiAgICByZXR1cm4gYmFzZTtcbiAgfVxuICBpZiAoZGlyID09PSBwYXRoT2JqZWN0LnJvb3QpIHtcbiAgICByZXR1cm4gZGlyICsgYmFzZTtcbiAgfVxuICByZXR1cm4gZGlyICsgc2VwICsgYmFzZTtcbn1cblxudmFyIHBvc2l4ID0ge1xuICAvLyBwYXRoLnJlc29sdmUoW2Zyb20gLi4uXSwgdG8pXG4gIHJlc29sdmU6IGZ1bmN0aW9uIHJlc29sdmUoKSB7XG4gICAgdmFyIHJlc29sdmVkUGF0aCA9ICcnO1xuICAgIHZhciByZXNvbHZlZEFic29sdXRlID0gZmFsc2U7XG4gICAgdmFyIGN3ZDtcblxuICAgIGZvciAodmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSA+PSAtMSAmJiAhcmVzb2x2ZWRBYnNvbHV0ZTsgaS0tKSB7XG4gICAgICB2YXIgcGF0aDtcbiAgICAgIGlmIChpID49IDApXG4gICAgICAgIHBhdGggPSBhcmd1bWVudHNbaV07XG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKGN3ZCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgIGN3ZCA9IHByb2Nlc3MuY3dkKCk7XG4gICAgICAgIHBhdGggPSBjd2Q7XG4gICAgICB9XG5cbiAgICAgIGFzc2VydFBhdGgocGF0aCk7XG5cbiAgICAgIC8vIFNraXAgZW1wdHkgZW50cmllc1xuICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICByZXNvbHZlZFBhdGggPSBwYXRoICsgJy8nICsgcmVzb2x2ZWRQYXRoO1xuICAgICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckNvZGVBdCgwKSA9PT0gNDcgLyovKi87XG4gICAgfVxuXG4gICAgLy8gQXQgdGhpcyBwb2ludCB0aGUgcGF0aCBzaG91bGQgYmUgcmVzb2x2ZWQgdG8gYSBmdWxsIGFic29sdXRlIHBhdGgsIGJ1dFxuICAgIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRocyB0byBiZSBzYWZlIChtaWdodCBoYXBwZW4gd2hlbiBwcm9jZXNzLmN3ZCgpIGZhaWxzKVxuXG4gICAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gICAgcmVzb2x2ZWRQYXRoID0gbm9ybWFsaXplU3RyaW5nUG9zaXgocmVzb2x2ZWRQYXRoLCAhcmVzb2x2ZWRBYnNvbHV0ZSk7XG5cbiAgICBpZiAocmVzb2x2ZWRBYnNvbHV0ZSkge1xuICAgICAgaWYgKHJlc29sdmVkUGF0aC5sZW5ndGggPiAwKVxuICAgICAgICByZXR1cm4gJy8nICsgcmVzb2x2ZWRQYXRoO1xuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gJy8nO1xuICAgIH0gZWxzZSBpZiAocmVzb2x2ZWRQYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiByZXNvbHZlZFBhdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnLic7XG4gICAgfVxuICB9LFxuXG4gIG5vcm1hbGl6ZTogZnVuY3Rpb24gbm9ybWFsaXplKHBhdGgpIHtcbiAgICBhc3NlcnRQYXRoKHBhdGgpO1xuXG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSByZXR1cm4gJy4nO1xuXG4gICAgdmFyIGlzQWJzb2x1dGUgPSBwYXRoLmNoYXJDb2RlQXQoMCkgPT09IDQ3IC8qLyovO1xuICAgIHZhciB0cmFpbGluZ1NlcGFyYXRvciA9IHBhdGguY2hhckNvZGVBdChwYXRoLmxlbmd0aCAtIDEpID09PSA0NyAvKi8qLztcblxuICAgIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICAgIHBhdGggPSBub3JtYWxpemVTdHJpbmdQb3NpeChwYXRoLCAhaXNBYnNvbHV0ZSk7XG5cbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDAgJiYgIWlzQWJzb2x1dGUpIHBhdGggPSAnLic7XG4gICAgaWYgKHBhdGgubGVuZ3RoID4gMCAmJiB0cmFpbGluZ1NlcGFyYXRvcikgcGF0aCArPSAnLyc7XG5cbiAgICBpZiAoaXNBYnNvbHV0ZSkgcmV0dXJuICcvJyArIHBhdGg7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH0sXG5cbiAgaXNBYnNvbHV0ZTogZnVuY3Rpb24gaXNBYnNvbHV0ZShwYXRoKSB7XG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcbiAgICByZXR1cm4gcGF0aC5sZW5ndGggPiAwICYmIHBhdGguY2hhckNvZGVBdCgwKSA9PT0gNDcgLyovKi87XG4gIH0sXG5cbiAgam9pbjogZnVuY3Rpb24gam9pbigpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHJldHVybiAnLic7XG4gICAgdmFyIGpvaW5lZDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGFyZyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGFzc2VydFBhdGgoYXJnKTtcbiAgICAgIGlmIChhcmcubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoam9pbmVkID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgam9pbmVkID0gYXJnO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgam9pbmVkICs9ICcvJyArIGFyZztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGpvaW5lZCA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuICcuJztcbiAgICByZXR1cm4gcG9zaXgubm9ybWFsaXplKGpvaW5lZCk7XG4gIH0sXG5cbiAgcmVsYXRpdmU6IGZ1bmN0aW9uIHJlbGF0aXZlKGZyb20sIHRvKSB7XG4gICAgYXNzZXJ0UGF0aChmcm9tKTtcbiAgICBhc3NlcnRQYXRoKHRvKTtcblxuICAgIGlmIChmcm9tID09PSB0bykgcmV0dXJuICcnO1xuXG4gICAgZnJvbSA9IHBvc2l4LnJlc29sdmUoZnJvbSk7XG4gICAgdG8gPSBwb3NpeC5yZXNvbHZlKHRvKTtcblxuICAgIGlmIChmcm9tID09PSB0bykgcmV0dXJuICcnO1xuXG4gICAgLy8gVHJpbSBhbnkgbGVhZGluZyBiYWNrc2xhc2hlc1xuICAgIHZhciBmcm9tU3RhcnQgPSAxO1xuICAgIGZvciAoOyBmcm9tU3RhcnQgPCBmcm9tLmxlbmd0aDsgKytmcm9tU3RhcnQpIHtcbiAgICAgIGlmIChmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0KSAhPT0gNDcgLyovKi8pXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICB2YXIgZnJvbUVuZCA9IGZyb20ubGVuZ3RoO1xuICAgIHZhciBmcm9tTGVuID0gZnJvbUVuZCAtIGZyb21TdGFydDtcblxuICAgIC8vIFRyaW0gYW55IGxlYWRpbmcgYmFja3NsYXNoZXNcbiAgICB2YXIgdG9TdGFydCA9IDE7XG4gICAgZm9yICg7IHRvU3RhcnQgPCB0by5sZW5ndGg7ICsrdG9TdGFydCkge1xuICAgICAgaWYgKHRvLmNoYXJDb2RlQXQodG9TdGFydCkgIT09IDQ3IC8qLyovKVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgdmFyIHRvRW5kID0gdG8ubGVuZ3RoO1xuICAgIHZhciB0b0xlbiA9IHRvRW5kIC0gdG9TdGFydDtcblxuICAgIC8vIENvbXBhcmUgcGF0aHMgdG8gZmluZCB0aGUgbG9uZ2VzdCBjb21tb24gcGF0aCBmcm9tIHJvb3RcbiAgICB2YXIgbGVuZ3RoID0gZnJvbUxlbiA8IHRvTGVuID8gZnJvbUxlbiA6IHRvTGVuO1xuICAgIHZhciBsYXN0Q29tbW9uU2VwID0gLTE7XG4gICAgdmFyIGkgPSAwO1xuICAgIGZvciAoOyBpIDw9IGxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAoaSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgIGlmICh0b0xlbiA+IGxlbmd0aCkge1xuICAgICAgICAgIGlmICh0by5jaGFyQ29kZUF0KHRvU3RhcnQgKyBpKSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGBmcm9tYCBpcyB0aGUgZXhhY3QgYmFzZSBwYXRoIGZvciBgdG9gLlxuICAgICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy9mb28vYmFyJzsgdG89Jy9mb28vYmFyL2JheidcbiAgICAgICAgICAgIHJldHVybiB0by5zbGljZSh0b1N0YXJ0ICsgaSArIDEpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYGZyb21gIGlzIHRoZSByb290XG4gICAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nLyc7IHRvPScvZm9vJ1xuICAgICAgICAgICAgcmV0dXJuIHRvLnNsaWNlKHRvU3RhcnQgKyBpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZnJvbUxlbiA+IGxlbmd0aCkge1xuICAgICAgICAgIGlmIChmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0ICsgaSkgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgICAvLyBXZSBnZXQgaGVyZSBpZiBgdG9gIGlzIHRoZSBleGFjdCBiYXNlIHBhdGggZm9yIGBmcm9tYC5cbiAgICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vL2Jhci9iYXonOyB0bz0nL2Zvby9iYXInXG4gICAgICAgICAgICBsYXN0Q29tbW9uU2VwID0gaTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGB0b2AgaXMgdGhlIHJvb3QuXG4gICAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nL2Zvbyc7IHRvPScvJ1xuICAgICAgICAgICAgbGFzdENvbW1vblNlcCA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgdmFyIGZyb21Db2RlID0gZnJvbS5jaGFyQ29kZUF0KGZyb21TdGFydCArIGkpO1xuICAgICAgdmFyIHRvQ29kZSA9IHRvLmNoYXJDb2RlQXQodG9TdGFydCArIGkpO1xuICAgICAgaWYgKGZyb21Db2RlICE9PSB0b0NvZGUpXG4gICAgICAgIGJyZWFrO1xuICAgICAgZWxzZSBpZiAoZnJvbUNvZGUgPT09IDQ3IC8qLyovKVxuICAgICAgICBsYXN0Q29tbW9uU2VwID0gaTtcbiAgICB9XG5cbiAgICB2YXIgb3V0ID0gJyc7XG4gICAgLy8gR2VuZXJhdGUgdGhlIHJlbGF0aXZlIHBhdGggYmFzZWQgb24gdGhlIHBhdGggZGlmZmVyZW5jZSBiZXR3ZWVuIGB0b2BcbiAgICAvLyBhbmQgYGZyb21gXG4gICAgZm9yIChpID0gZnJvbVN0YXJ0ICsgbGFzdENvbW1vblNlcCArIDE7IGkgPD0gZnJvbUVuZDsgKytpKSB7XG4gICAgICBpZiAoaSA9PT0gZnJvbUVuZCB8fCBmcm9tLmNoYXJDb2RlQXQoaSkgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgIGlmIChvdXQubGVuZ3RoID09PSAwKVxuICAgICAgICAgIG91dCArPSAnLi4nO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgb3V0ICs9ICcvLi4nO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIExhc3RseSwgYXBwZW5kIHRoZSByZXN0IG9mIHRoZSBkZXN0aW5hdGlvbiAoYHRvYCkgcGF0aCB0aGF0IGNvbWVzIGFmdGVyXG4gICAgLy8gdGhlIGNvbW1vbiBwYXRoIHBhcnRzXG4gICAgaWYgKG91dC5sZW5ndGggPiAwKVxuICAgICAgcmV0dXJuIG91dCArIHRvLnNsaWNlKHRvU3RhcnQgKyBsYXN0Q29tbW9uU2VwKTtcbiAgICBlbHNlIHtcbiAgICAgIHRvU3RhcnQgKz0gbGFzdENvbW1vblNlcDtcbiAgICAgIGlmICh0by5jaGFyQ29kZUF0KHRvU3RhcnQpID09PSA0NyAvKi8qLylcbiAgICAgICAgKyt0b1N0YXJ0O1xuICAgICAgcmV0dXJuIHRvLnNsaWNlKHRvU3RhcnQpO1xuICAgIH1cbiAgfSxcblxuICBfbWFrZUxvbmc6IGZ1bmN0aW9uIF9tYWtlTG9uZyhwYXRoKSB7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH0sXG5cbiAgZGlybmFtZTogZnVuY3Rpb24gZGlybmFtZShwYXRoKSB7XG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHJldHVybiAnLic7XG4gICAgdmFyIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoMCk7XG4gICAgdmFyIGhhc1Jvb3QgPSBjb2RlID09PSA0NyAvKi8qLztcbiAgICB2YXIgZW5kID0gLTE7XG4gICAgdmFyIG1hdGNoZWRTbGFzaCA9IHRydWU7XG4gICAgZm9yICh2YXIgaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSAxOyAtLWkpIHtcbiAgICAgIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XG4gICAgICBpZiAoY29kZSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xuICAgICAgICAgICAgZW5kID0gaTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3JcbiAgICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVuZCA9PT0gLTEpIHJldHVybiBoYXNSb290ID8gJy8nIDogJy4nO1xuICAgIGlmIChoYXNSb290ICYmIGVuZCA9PT0gMSkgcmV0dXJuICcvLyc7XG4gICAgcmV0dXJuIHBhdGguc2xpY2UoMCwgZW5kKTtcbiAgfSxcblxuICBiYXNlbmFtZTogZnVuY3Rpb24gYmFzZW5hbWUocGF0aCwgZXh0KSB7XG4gICAgaWYgKGV4dCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBleHQgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImV4dFwiIGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICBhc3NlcnRQYXRoKHBhdGgpO1xuXG4gICAgdmFyIHN0YXJ0ID0gMDtcbiAgICB2YXIgZW5kID0gLTE7XG4gICAgdmFyIG1hdGNoZWRTbGFzaCA9IHRydWU7XG4gICAgdmFyIGk7XG5cbiAgICBpZiAoZXh0ICE9PSB1bmRlZmluZWQgJiYgZXh0Lmxlbmd0aCA+IDAgJiYgZXh0Lmxlbmd0aCA8PSBwYXRoLmxlbmd0aCkge1xuICAgICAgaWYgKGV4dC5sZW5ndGggPT09IHBhdGgubGVuZ3RoICYmIGV4dCA9PT0gcGF0aCkgcmV0dXJuICcnO1xuICAgICAgdmFyIGV4dElkeCA9IGV4dC5sZW5ndGggLSAxO1xuICAgICAgdmFyIGZpcnN0Tm9uU2xhc2hFbmQgPSAtMTtcbiAgICAgIGZvciAoaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xuICAgICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcbiAgICAgICAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xuICAgICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZmlyc3ROb25TbGFzaEVuZCA9PT0gLTEpIHtcbiAgICAgICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCByZW1lbWJlciB0aGlzIGluZGV4IGluIGNhc2VcbiAgICAgICAgICAgIC8vIHdlIG5lZWQgaXQgaWYgdGhlIGV4dGVuc2lvbiBlbmRzIHVwIG5vdCBtYXRjaGluZ1xuICAgICAgICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XG4gICAgICAgICAgICBmaXJzdE5vblNsYXNoRW5kID0gaSArIDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChleHRJZHggPj0gMCkge1xuICAgICAgICAgICAgLy8gVHJ5IHRvIG1hdGNoIHRoZSBleHBsaWNpdCBleHRlbnNpb25cbiAgICAgICAgICAgIGlmIChjb2RlID09PSBleHQuY2hhckNvZGVBdChleHRJZHgpKSB7XG4gICAgICAgICAgICAgIGlmICgtLWV4dElkeCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSBtYXRjaGVkIHRoZSBleHRlbnNpb24sIHNvIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91ciBwYXRoXG4gICAgICAgICAgICAgICAgLy8gY29tcG9uZW50XG4gICAgICAgICAgICAgICAgZW5kID0gaTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gRXh0ZW5zaW9uIGRvZXMgbm90IG1hdGNoLCBzbyBvdXIgcmVzdWx0IGlzIHRoZSBlbnRpcmUgcGF0aFxuICAgICAgICAgICAgICAvLyBjb21wb25lbnRcbiAgICAgICAgICAgICAgZXh0SWR4ID0gLTE7XG4gICAgICAgICAgICAgIGVuZCA9IGZpcnN0Tm9uU2xhc2hFbmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGFydCA9PT0gZW5kKSBlbmQgPSBmaXJzdE5vblNsYXNoRW5kO2Vsc2UgaWYgKGVuZCA9PT0gLTEpIGVuZCA9IHBhdGgubGVuZ3RoO1xuICAgICAgcmV0dXJuIHBhdGguc2xpY2Uoc3RhcnQsIGVuZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgaWYgKHBhdGguY2hhckNvZGVBdChpKSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXG4gICAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcbiAgICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XG4gICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoZW5kID09PSAtMSkge1xuICAgICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCBtYXJrIHRoaXMgYXMgdGhlIGVuZCBvZiBvdXJcbiAgICAgICAgICAvLyBwYXRoIGNvbXBvbmVudFxuICAgICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xuICAgICAgICAgIGVuZCA9IGkgKyAxO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChlbmQgPT09IC0xKSByZXR1cm4gJyc7XG4gICAgICByZXR1cm4gcGF0aC5zbGljZShzdGFydCwgZW5kKTtcbiAgICB9XG4gIH0sXG5cbiAgZXh0bmFtZTogZnVuY3Rpb24gZXh0bmFtZShwYXRoKSB7XG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcbiAgICB2YXIgc3RhcnREb3QgPSAtMTtcbiAgICB2YXIgc3RhcnRQYXJ0ID0gMDtcbiAgICB2YXIgZW5kID0gLTE7XG4gICAgdmFyIG1hdGNoZWRTbGFzaCA9IHRydWU7XG4gICAgLy8gVHJhY2sgdGhlIHN0YXRlIG9mIGNoYXJhY3RlcnMgKGlmIGFueSkgd2Ugc2VlIGJlZm9yZSBvdXIgZmlyc3QgZG90IGFuZFxuICAgIC8vIGFmdGVyIGFueSBwYXRoIHNlcGFyYXRvciB3ZSBmaW5kXG4gICAgdmFyIHByZURvdFN0YXRlID0gMDtcbiAgICBmb3IgKHZhciBpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgdmFyIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XG4gICAgICBpZiAoY29kZSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgcGF0aCBzZXBhcmF0b3IgdGhhdCB3YXMgbm90IHBhcnQgb2YgYSBzZXQgb2YgcGF0aFxuICAgICAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xuICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XG4gICAgICAgICAgICBzdGFydFBhcnQgPSBpICsgMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgaWYgKGVuZCA9PT0gLTEpIHtcbiAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3IsIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91clxuICAgICAgICAvLyBleHRlbnNpb25cbiAgICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XG4gICAgICAgIGVuZCA9IGkgKyAxO1xuICAgICAgfVxuICAgICAgaWYgKGNvZGUgPT09IDQ2IC8qLiovKSB7XG4gICAgICAgICAgLy8gSWYgdGhpcyBpcyBvdXIgZmlyc3QgZG90LCBtYXJrIGl0IGFzIHRoZSBzdGFydCBvZiBvdXIgZXh0ZW5zaW9uXG4gICAgICAgICAgaWYgKHN0YXJ0RG90ID09PSAtMSlcbiAgICAgICAgICAgIHN0YXJ0RG90ID0gaTtcbiAgICAgICAgICBlbHNlIGlmIChwcmVEb3RTdGF0ZSAhPT0gMSlcbiAgICAgICAgICAgIHByZURvdFN0YXRlID0gMTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhcnREb3QgIT09IC0xKSB7XG4gICAgICAgIC8vIFdlIHNhdyBhIG5vbi1kb3QgYW5kIG5vbi1wYXRoIHNlcGFyYXRvciBiZWZvcmUgb3VyIGRvdCwgc28gd2Ugc2hvdWxkXG4gICAgICAgIC8vIGhhdmUgYSBnb29kIGNoYW5jZSBhdCBoYXZpbmcgYSBub24tZW1wdHkgZXh0ZW5zaW9uXG4gICAgICAgIHByZURvdFN0YXRlID0gLTE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0RG90ID09PSAtMSB8fCBlbmQgPT09IC0xIHx8XG4gICAgICAgIC8vIFdlIHNhdyBhIG5vbi1kb3QgY2hhcmFjdGVyIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgZG90XG4gICAgICAgIHByZURvdFN0YXRlID09PSAwIHx8XG4gICAgICAgIC8vIFRoZSAocmlnaHQtbW9zdCkgdHJpbW1lZCBwYXRoIGNvbXBvbmVudCBpcyBleGFjdGx5ICcuLidcbiAgICAgICAgcHJlRG90U3RhdGUgPT09IDEgJiYgc3RhcnREb3QgPT09IGVuZCAtIDEgJiYgc3RhcnREb3QgPT09IHN0YXJ0UGFydCArIDEpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIHBhdGguc2xpY2Uoc3RhcnREb3QsIGVuZCk7XG4gIH0sXG5cbiAgZm9ybWF0OiBmdW5jdGlvbiBmb3JtYXQocGF0aE9iamVjdCkge1xuICAgIGlmIChwYXRoT2JqZWN0ID09PSBudWxsIHx8IHR5cGVvZiBwYXRoT2JqZWN0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIFwicGF0aE9iamVjdFwiIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBPYmplY3QuIFJlY2VpdmVkIHR5cGUgJyArIHR5cGVvZiBwYXRoT2JqZWN0KTtcbiAgICB9XG4gICAgcmV0dXJuIF9mb3JtYXQoJy8nLCBwYXRoT2JqZWN0KTtcbiAgfSxcblxuICBwYXJzZTogZnVuY3Rpb24gcGFyc2UocGF0aCkge1xuICAgIGFzc2VydFBhdGgocGF0aCk7XG5cbiAgICB2YXIgcmV0ID0geyByb290OiAnJywgZGlyOiAnJywgYmFzZTogJycsIGV4dDogJycsIG5hbWU6ICcnIH07XG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSByZXR1cm4gcmV0O1xuICAgIHZhciBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KDApO1xuICAgIHZhciBpc0Fic29sdXRlID0gY29kZSA9PT0gNDcgLyovKi87XG4gICAgdmFyIHN0YXJ0O1xuICAgIGlmIChpc0Fic29sdXRlKSB7XG4gICAgICByZXQucm9vdCA9ICcvJztcbiAgICAgIHN0YXJ0ID0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICB2YXIgc3RhcnREb3QgPSAtMTtcbiAgICB2YXIgc3RhcnRQYXJ0ID0gMDtcbiAgICB2YXIgZW5kID0gLTE7XG4gICAgdmFyIG1hdGNoZWRTbGFzaCA9IHRydWU7XG4gICAgdmFyIGkgPSBwYXRoLmxlbmd0aCAtIDE7XG5cbiAgICAvLyBUcmFjayB0aGUgc3RhdGUgb2YgY2hhcmFjdGVycyAoaWYgYW55KSB3ZSBzZWUgYmVmb3JlIG91ciBmaXJzdCBkb3QgYW5kXG4gICAgLy8gYWZ0ZXIgYW55IHBhdGggc2VwYXJhdG9yIHdlIGZpbmRcbiAgICB2YXIgcHJlRG90U3RhdGUgPSAwO1xuXG4gICAgLy8gR2V0IG5vbi1kaXIgaW5mb1xuICAgIGZvciAoOyBpID49IHN0YXJ0OyAtLWkpIHtcbiAgICAgIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XG4gICAgICBpZiAoY29kZSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgcGF0aCBzZXBhcmF0b3IgdGhhdCB3YXMgbm90IHBhcnQgb2YgYSBzZXQgb2YgcGF0aFxuICAgICAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xuICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XG4gICAgICAgICAgICBzdGFydFBhcnQgPSBpICsgMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgaWYgKGVuZCA9PT0gLTEpIHtcbiAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3IsIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91clxuICAgICAgICAvLyBleHRlbnNpb25cbiAgICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XG4gICAgICAgIGVuZCA9IGkgKyAxO1xuICAgICAgfVxuICAgICAgaWYgKGNvZGUgPT09IDQ2IC8qLiovKSB7XG4gICAgICAgICAgLy8gSWYgdGhpcyBpcyBvdXIgZmlyc3QgZG90LCBtYXJrIGl0IGFzIHRoZSBzdGFydCBvZiBvdXIgZXh0ZW5zaW9uXG4gICAgICAgICAgaWYgKHN0YXJ0RG90ID09PSAtMSkgc3RhcnREb3QgPSBpO2Vsc2UgaWYgKHByZURvdFN0YXRlICE9PSAxKSBwcmVEb3RTdGF0ZSA9IDE7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhcnREb3QgIT09IC0xKSB7XG4gICAgICAgIC8vIFdlIHNhdyBhIG5vbi1kb3QgYW5kIG5vbi1wYXRoIHNlcGFyYXRvciBiZWZvcmUgb3VyIGRvdCwgc28gd2Ugc2hvdWxkXG4gICAgICAgIC8vIGhhdmUgYSBnb29kIGNoYW5jZSBhdCBoYXZpbmcgYSBub24tZW1wdHkgZXh0ZW5zaW9uXG4gICAgICAgIHByZURvdFN0YXRlID0gLTE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0RG90ID09PSAtMSB8fCBlbmQgPT09IC0xIHx8XG4gICAgLy8gV2Ugc2F3IGEgbm9uLWRvdCBjaGFyYWN0ZXIgaW1tZWRpYXRlbHkgYmVmb3JlIHRoZSBkb3RcbiAgICBwcmVEb3RTdGF0ZSA9PT0gMCB8fFxuICAgIC8vIFRoZSAocmlnaHQtbW9zdCkgdHJpbW1lZCBwYXRoIGNvbXBvbmVudCBpcyBleGFjdGx5ICcuLidcbiAgICBwcmVEb3RTdGF0ZSA9PT0gMSAmJiBzdGFydERvdCA9PT0gZW5kIC0gMSAmJiBzdGFydERvdCA9PT0gc3RhcnRQYXJ0ICsgMSkge1xuICAgICAgaWYgKGVuZCAhPT0gLTEpIHtcbiAgICAgICAgaWYgKHN0YXJ0UGFydCA9PT0gMCAmJiBpc0Fic29sdXRlKSByZXQuYmFzZSA9IHJldC5uYW1lID0gcGF0aC5zbGljZSgxLCBlbmQpO2Vsc2UgcmV0LmJhc2UgPSByZXQubmFtZSA9IHBhdGguc2xpY2Uoc3RhcnRQYXJ0LCBlbmQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoc3RhcnRQYXJ0ID09PSAwICYmIGlzQWJzb2x1dGUpIHtcbiAgICAgICAgcmV0Lm5hbWUgPSBwYXRoLnNsaWNlKDEsIHN0YXJ0RG90KTtcbiAgICAgICAgcmV0LmJhc2UgPSBwYXRoLnNsaWNlKDEsIGVuZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXQubmFtZSA9IHBhdGguc2xpY2Uoc3RhcnRQYXJ0LCBzdGFydERvdCk7XG4gICAgICAgIHJldC5iYXNlID0gcGF0aC5zbGljZShzdGFydFBhcnQsIGVuZCk7XG4gICAgICB9XG4gICAgICByZXQuZXh0ID0gcGF0aC5zbGljZShzdGFydERvdCwgZW5kKTtcbiAgICB9XG5cbiAgICBpZiAoc3RhcnRQYXJ0ID4gMCkgcmV0LmRpciA9IHBhdGguc2xpY2UoMCwgc3RhcnRQYXJ0IC0gMSk7ZWxzZSBpZiAoaXNBYnNvbHV0ZSkgcmV0LmRpciA9ICcvJztcblxuICAgIHJldHVybiByZXQ7XG4gIH0sXG5cbiAgc2VwOiAnLycsXG4gIGRlbGltaXRlcjogJzonLFxuICB3aW4zMjogbnVsbCxcbiAgcG9zaXg6IG51bGxcbn07XG5cbnBvc2l4LnBvc2l4ID0gcG9zaXg7XG5cbm1vZHVsZS5leHBvcnRzID0gcG9zaXg7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwidmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJylcclxudmFyIGlzTW9uaXQ9ZmFsc2VcclxudmFyIGJhckNoYXJ0O1xyXG52YXIgYmFyQ2hhcnQyO1xyXG52YXIgdWlkXHJcblxyXG5mdW5jdGlvbiBzZXRVc2VySWQodXNlcmlkKXtcclxuICAgIHVpZCA9IHVzZXJpZFxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRIdW1hblBlcmlvZCAoIHRpbWUgKSB7XHJcblxyXG4gICAgdmFyIHNlY29uZCA9IDEwMDBcclxuICAgIHZhciBtaW51dGUgPSA2MDAwMFxyXG4gICAgdmFyIGhvdXIgPSAzNjAwMDAwXHJcbiAgICB2YXIgZGF5ID0gODY0MDAwMDBcclxuXHJcbiAgICB2YXIgcmVzdWx0VGltZSA9IHRpbWVcclxuICAgIHZhciBkLCBoLCBtLCBzXHJcbiAgICB2YXIgcmVzdWx0ID0gJydcclxuXHJcbiAgICBkID0gTWF0aC5mbG9vcihyZXN1bHRUaW1lIC8gZGF5KVxyXG4gICAgaWYgKGQgPiAwKSB7XHJcbiAgICAgICAgcmVzdWx0VGltZSA9IHJlc3VsdFRpbWUgJSBkYXlcclxuICAgIH1cclxuICAgIGggPSBNYXRoLmZsb29yKHJlc3VsdFRpbWUgLyBob3VyKVxyXG4gICAgaWYgKGggPiAwKSB7XHJcbiAgICAgICAgcmVzdWx0VGltZSA9IHJlc3VsdFRpbWUgJSBob3VyXHJcbiAgICB9XHJcbiAgICBtID0gTWF0aC5mbG9vcihyZXN1bHRUaW1lIC8gbWludXRlKVxyXG4gICAgaWYgKG0gPiAwKSB7XHJcbiAgICAgICAgcmVzdWx0VGltZSA9IHJlc3VsdFRpbWUgJSBtaW51dGVcclxuICAgIH1cclxuICAgIHMgPSBNYXRoLmZsb29yKHJlc3VsdFRpbWUgLyBzZWNvbmQpXHJcblxyXG4gICAgaWYgKGQgPiAwKSB7XHJcbiAgICAgICAgcmVzdWx0ICs9IGQgKyAnZCAnXHJcbiAgICB9XHJcbiAgICBpZiAoaCA+IDApIHtcclxuICAgICAgICByZXN1bHQgKz0gaCArICdoICdcclxuICAgIH1cclxuICAgIGlmIChtID4gMCkge1xyXG4gICAgICAgIHJlc3VsdCArPSBtICsgJ20gJ1xyXG4gICAgfVxyXG5cclxuICAgIHJlc3VsdCArPSBzICsgJ3MnXHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRIdW1hbkJ5dGVzIChieXRlcywgcHJlY2lzaW9uKSB7XHJcbiAgICAvL2NvbnNvbGUubG9nKCdieXRlcycsIGJ5dGVzKVxyXG5cclxuICAgIHZhciBraWxvYnl0ZSA9IDEwMjRcclxuICAgIHZhciBtZWdhYnl0ZSA9IGtpbG9ieXRlICogMTAyNFxyXG4gICAgdmFyIGdpZ2FieXRlID0gbWVnYWJ5dGUgKiAxMDI0XHJcbiAgICB2YXIgdGVyYWJ5dGUgPSBnaWdhYnl0ZSAqIDEwMjRcclxuXHJcbiAgICBpZiAoKGJ5dGVzID49IDApICYmXHJcbiAgICAgICAgKGJ5dGVzIDwga2lsb2J5dGUpKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBieXRlcyArICcgQidcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKChieXRlcyA+PSBraWxvYnl0ZSkgJiZcclxuICAgICAgICAoYnl0ZXMgPCBtZWdhYnl0ZSkpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIChieXRlcyAvIGtpbG9ieXRlKS50b0ZpeGVkKHByZWNpc2lvbikgKyAnIEtCJ1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoKGJ5dGVzID49IG1lZ2FieXRlKSAmJlxyXG4gICAgICAgIChieXRlcyA8IGdpZ2FieXRlKSkge1xyXG5cclxuICAgICAgICByZXR1cm4gKGJ5dGVzIC8gbWVnYWJ5dGUpLnRvRml4ZWQocHJlY2lzaW9uKSArICcgTUInXHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICgoYnl0ZXMgPj0gZ2lnYWJ5dGUpICYmXHJcbiAgICAgICAgKGJ5dGVzIDwgdGVyYWJ5dGUpKSB7XHJcblxyXG4gICAgICAgIHJldHVybiAoYnl0ZXMgLyBnaWdhYnl0ZSkudG9GaXhlZChwcmVjaXNpb24pICsgJyBHQidcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGJ5dGVzID49IHRlcmFieXRlKSB7XHJcbiAgICAgICAgcmV0dXJuIChieXRlcyAvIHRlcmFieXRlKS50b0ZpeGVkKHByZWNpc2lvbikgKyAnIFRCJ1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIGJ5dGVzICsgJyBCJ1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBsaXN0Rm9ybWF0ICggdHlwZSwgdmFsdWUgKSB7XHJcblxyXG4gICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgY2FzZSAnc2NyaXB0JzpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID8gcGF0aC5iYXNlbmFtZSh2YWx1ZSkgOiAnTi9DJ1xyXG4gICAgICAgIGNhc2UgJ21lbW9yeSc6XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSA/IGdldEh1bWFuQnl0ZXModmFsdWUpIDogJ04vQydcclxuICAgICAgICBjYXNlICd1cHRpbWUnOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgPiAwID8gZ2V0SHVtYW5QZXJpb2QodmFsdWUpIDogJ04vQydcclxuICAgICAgICBjYXNlICdwaWQnOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgfHwgJ04vQydcclxuICAgICAgICBjYXNlICdob3N0JzpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID8gdmFsdWUucmVwbGFjZSgnaHR0cDovLycsJycpOiAnTi9DJ1xyXG4gICAgICAgIGNhc2UgJ3N0YXR1cyc6XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSA9PSAndXAnID8gXCJ1cFwiIDogXCJkb3duXCJcclxuICAgICAgICBjYXNlICdlbmFibGVkJzpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID8gXCJ5ZXNcIiA6IFwibm9cIlxyXG4gICAgICAgIGNhc2UgJ3BvcnQnOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgfHwgJ04vQydcclxuICAgICAgICBjYXNlICdydW4nOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgIT0gJzonID8gdmFsdWUgOiAnTi9DJ1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVxyXG4gICAgfVxyXG4gICAgcmV0dXJuICcnXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEltYWdlTGlzdCgpe1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6ICcvYXBwcy9saXN0JyxcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBkYXRhOnt1aWQ6dWlkLCBpbWFnZWxpc3Q6dHJ1ZX0sXHJcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICQoJyNjb250ZW50JykuZW1wdHkoKVxyXG4gICAgICAgICAgICBpc01vbml0PWZhbHNlXHJcbiAgICAgICAgICAgIGlmICh0aW1lcklkIT1udWxsKXtcclxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXJJZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkKCcjSGVhZGVyJykuaHRtbChcItCh0L/QuNGB0L7QuiDRgdC90LjQvNC60L7QslwiKVxyXG4gICAgICAgICAgICB2YXIgdGFibGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuICAgICAgICAgICAgdGFibGVFbGVtZW50LmlkID0gJ2xpc3RUYWJsZSdcclxuICAgICAgICAgICAgdGFibGVFbGVtZW50LmNsYXNzTmFtZSA9ICdjZW50ZXJlZCdcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW50XCIpLmFwcGVuZENoaWxkKHRhYmxlRWxlbWVudCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgdG9UYWJsZT0nPHRoZWFkPjx0cj48dGg+0J3QsNC30LLQsNC90LjQtSDRgdC90LjQvNC60LA8L3RoPjx0aD7QktC10YDRgdC40Y88L3RoPjx0aD7QoNCw0LfQvNC10YA8L3RoPjx0aD7QodC+0LfQtNCw0L08L3RoPiAnICtcclxuICAgICAgICAgICAgICAgICc8L3RyPjwvdGhlYWQ+PHRib2R5PidcclxuICAgICAgICAgICAgSlNPTi5wYXJzZShyZXNwb25zZSlbJ2RhdGEnXS5mb3JFYWNoKGVsZW1lbnQgPT57XHJcbiAgICAgICAgICAgICAgICAgICAgdG9UYWJsZSs9ICc8dHI+PHRkPicgK2VsZW1lbnQubmFtZSsgJzwvdGQ+PHRkPicrZWxlbWVudC52ZXJzaW9uKyc8L3RkPjx0ZD4nK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0Rm9ybWF0KFwibWVtb3J5XCIsZWxlbWVudC5zaXplKSAgKyc8L3RkPiA8dGQ+JysgKG5ldyBEYXRlKCtlbGVtZW50LmNyZWF0ZWQgKiAxMDAwKSkudG9TdHJpbmcoKSArICc8L3RkPjwvdHI+J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIHRvVGFibGUrPSc8L3Rib2R5PidcclxuICAgICAgICAgICAgJCgnI2xpc3RUYWJsZScpLmFwcGVuZCh0b1RhYmxlKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldExpc3QgKCkge1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6ICcvYXBwcy9saXN0JyxcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBkYXRhOnt1aWQ6dWlkLCBpbWFnZWxpc3Q6ZmFsc2V9LFxyXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAkKCcjY29udGVudCcpLmVtcHR5KClcclxuICAgICAgICAgICAgaXNNb25pdD1mYWxzZVxyXG4gICAgICAgICAgICBpZiAodGltZXJJZCE9bnVsbCl7XHJcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHRpbWVySWQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJCgnI0hlYWRlcicpLmh0bWwoXCLQodC/0LjRgdC+0Log0LrQvtC90YLQtdC50L3QtdGA0L7QslwiKVxyXG5cclxuICAgICAgICAgICAgdmFyIGlucHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcbiAgICAgICAgICAgIGlucHV0RWxlbWVudC5pZCA9ICdsaXN0VGFibGUnXHJcbiAgICAgICAgICAgIGlucHV0RWxlbWVudC5jbGFzc05hbWUgPSAnY2VudGVyZWQnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVudFwiKS5hcHBlbmRDaGlsZChpbnB1dEVsZW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRvVGFibGU9Jzx0aGVhZD48dHI+PHRoPtCY0LzRjyDQutC+0L3RgtC10LnQvdC10YDQsDwvdGg+PHRoPtCY0LzRjyDRgdC90LjQvNC60LA8L3RoPjx0aD7QodGC0LDRgtGD0YE8L3RoPjx0aD7Qn9GD0LHQu9C40YfQvdGL0Lkg0L/QvtGA0YI8L3RoPjx0aD7Qn9GA0LjQstCw0YLQvdGL0Lkg0L/QvtGA0YI8L3RoPiAnICtcclxuICAgICAgICAgICAgICAgICc8dGg+0KHQvtC30LTQsNC9PC90aD48L3RyPjwvdGhlYWQ+PHRib2R5PidcclxuICAgICAgICAgICAgSlNPTi5wYXJzZShyZXNwb25zZSlbJ2RhdGEnXS5mb3JFYWNoKGVsZW1lbnQgPT57XHJcblxyXG4gICAgICAgICAgICAgICAgLy8nKyAoZWxlbWVudC5zdGF0dXMgPT0gJ3VwJyA/IFwic3R5bGU9XFxcImNvbG9yOiM3N0RENzdcXFwiXCIgOiBcInN0eWxlPVxcXCJjb2xvcjpyZWRcXFwiXCIpKyAnXHJcbiAgICAgICAgICAgICAgICAgICAgdG9UYWJsZSs9ICc8dHI+PHRkPicrIGVsZW1lbnQubmFtZSArJzwvdGQ+PHRkPicgK2VsZW1lbnQuaW1hZ2UrICc8L3RkPjx0ZD4nK2VsZW1lbnQuc3RhdHVzK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC90ZD48dGQ+JytlbGVtZW50Py5wb3J0c1swXT8uUHVibGljUG9ydCsnPC90ZD48dGQ+JytlbGVtZW50Py5wb3J0c1swXT8uUHJpdmF0ZVBvcnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyc8L3RkPjx0ZD4nKyAobmV3IERhdGUoK2VsZW1lbnQuY3JlYXRlZCAqIDEwMDApKS50b1N0cmluZygpICsgJzwvdGQ+PC90cj4nXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgdG9UYWJsZSs9JzwvdGJvZHk+J1xyXG4gICAgICAgICAgICAkKCcjbGlzdFRhYmxlJykuYXBwZW5kKHRvVGFibGUpXHJcblxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmZXRjaERhdGEoY29udGFpbmVyc0lkICkge1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6ICcvYXBwcy9tb25pdCcsXHJcbiAgICAgICAgbWV0aG9kOiAgICdQT1NUJyxcclxuICAgICAgICBkYXRhOiB7Y29udGFpbmVyc0lkOmNvbnRhaW5lcnNJZH0sXHJcbiAgICAgICAgLy8gIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICAgICAgc3VjY2VzczogIGZ1bmN0aW9uKHJhd0RhdGEpIHtcclxuICAgICAgICAgICAgaWYoaXNNb25pdCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKHJhd0RhdGEpWydkYXRhJ11cclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBiYXJDaGFydC5kYXRhLmRhdGFzZXRzW2ldLmRhdGEucHVzaChcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogZ2V0SHVtYW5QZXJpb2QoYmFyQ2hhcnQuZGF0YS5sYWJlbHMubGVuZ3RoICogMjAwMCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBkYXRhW2ldWydjcHUnXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgIGJhckNoYXJ0Mi5kYXRhLmRhdGFzZXRzW2ldLmRhdGEucHVzaChcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogZ2V0SHVtYW5QZXJpb2QoYmFyQ2hhcnQyLmRhdGEubGFiZWxzLmxlbmd0aCAqIDIwMDApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogZGF0YVtpXVsnbWVtJ11cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJhckNoYXJ0LmRhdGEubGFiZWxzLnB1c2goZ2V0SHVtYW5QZXJpb2QoYmFyQ2hhcnQuZGF0YS5sYWJlbHMubGVuZ3RoICogMjAwMCkpXHJcbiAgICAgICAgICAgICAgICBiYXJDaGFydDIuZGF0YS5sYWJlbHMucHVzaChnZXRIdW1hblBlcmlvZChiYXJDaGFydDIuZGF0YS5sYWJlbHMubGVuZ3RoICogMjAwMCkpXHJcbiAgICAgICAgICAgICAgICBiYXJDaGFydC51cGRhdGUoKVxyXG4gICAgICAgICAgICAgICAgYmFyQ2hhcnQyLnVwZGF0ZSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbiAoZXJyb3Ipe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcilcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG52YXIgdGltZXJJZDtcclxuXHJcbmZ1bmN0aW9uIGdldE1vbml0KCl7XHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogJy9hcHBzL2xpc3QnLFxyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIGRhdGE6e3VpZDp1aWQsIGltYWdlbGlzdDpmYWxzZX0sXHJcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgbGV0IGNvbnRhaW5lcnNJZCA9IEpTT04ucGFyc2UocmVzcG9uc2UpWydkYXRhJ10ubWFwKGVsZW0gPT4gZWxlbS5JZClcclxuXHJcbiAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmw6ICcvYXBwcy9tb25pdCcsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB7Y29udGFpbmVyc0lkOmNvbnRhaW5lcnNJZH0sXHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNjb250ZW50JykuZW1wdHkoKVxyXG4gICAgICAgICAgICAgICAgICAgICQoJyNIZWFkZXInKS5odG1sKFwi0JzQvtC90LjRgtC+0YDQuNC90LMg0L/RgNC40LvQvtC20LXQvdC40LlcIilcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcm93RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dEVsZW1lbnQuaWQgPSAnQ2FudmFzQ1BVJ1xyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0RWxlbWVudC53aWR0aCA9IDYwMFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0RWxlbWVudC5oZWlnaHQgPSA0MDBcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoaW5wdXRFbGVtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dEVsZW1lbnQuaWQgPSAnQ2FudmFzTWVtb3J5J1xyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0RWxlbWVudC53aWR0aCA9IDYwMFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0RWxlbWVudC5oZWlnaHQgPSA0MDBcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoaW5wdXRFbGVtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICBpc01vbml0PXRydWVcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZXJJZCE9bnVsbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXJJZClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoYmFyQ2hhcnQhPW51bGwgJiBiYXJDaGFydDIhPW51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFyQ2hhcnQuY2xlYXIoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYXJDaGFydDIuY2xlYXIoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYXJDaGFydC5kZXN0cm95KClcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFyQ2hhcnQyLmRlc3Ryb3koKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBDYW52YXNDUFUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIkNhbnZhc0NQVVwiKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgQ2FudmFzTWVtb3J5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJDYW52YXNNZW1vcnlcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGJhckNoYXJ0ID0gbmV3IENoYXJ0KENhbnZhc0NQVSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOlwiTWVtb3J5XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsczogW1wiMHNcIl0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhc2V0czogW11cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2l2ZTogZmFsc2UsXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeEF4ZXM6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlTGFiZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFN0cmluZzogJ9CS0YDQtdC80Y8nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5QXhlczogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVMYWJlbDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU3RyaW5nOiAn0JjRgdC/0L7Qu9GM0LfQvtCy0LDQvdC40LUgQ1BVLCAlJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBiYXJDaGFydDIgPSBuZXcgQ2hhcnQoQ2FudmFzTWVtb3J5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6XCJNZW1vcnlcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiBbXCIwc1wiXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zaXZlOiBmYWxzZSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY2FsZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4QXhlczogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVMYWJlbDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU3RyaW5nOiAn0JLRgNC10LzRjydcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY2FsZUxhYmVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHJpbmc6ICfQn9Cw0LzRj9GC0YwsINCx0LDQudGC0YsnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbG9ycyA9ICBbJ3JnYmEoMjU1LDk5LDEzMiwwLjYpJywgJ3JnYmEoMjU1LDk5LDEzMiwwLjYpJywgJ3JnYmEoNTQsIDE2MiwgMjM1LCAwLjYpJywgJ3JnYmEoMjU1LCAyMDYsIDg2LCAwLjYpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3JnYmEoNzUsIDE5MiwgMTkyLCAwLjYpJywgJ3JnYmEoMTUzLCAxMDIsIDI1NSwgMC42KScsICdyZ2JhKDI1NSwgMTU5LCA2NCwgMC42KScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdyZ2JhKDI1NSwgOTksIDEzMiwgMC42KScsICdyZ2JhKDU0LCAxNjIsIDIzNSwgMC42KScsICdyZ2JhKDI1NSwgMjA2LCA4NiwgMC42KScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdyZ2JhKDc1LCAxOTIsIDE5MiwgMC42KScsICdyZ2JhKDE1MywgMTAyLCAyNTUsIDAuNiknXHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UocmVzcG9uc2UpWydkYXRhJ10uZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFyQ2hhcnQuZGF0YS5kYXRhc2V0cy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBlbGVtZW50Lm5hbWUrJyhQSUQ6JytlbGVtZW50LnBpZCsnKScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBbZWxlbWVudC5jcHVdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGNvbG9yc1tpXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBjb2xvcnNbaV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFyQ2hhcnQyLmRhdGEuZGF0YXNldHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogIGVsZW1lbnQubmFtZSsnKFBJRDonK2VsZW1lbnQucGlkKycpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFtlbGVtZW50Lm1lbV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3JzW2ldLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGNvbG9yc1tpXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpID4gY29sb3JzLmxlbmd0aCAtIDEgPyBpID0gMCA6IGkrK1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgYmFyQ2hhcnQudXBkYXRlKClcclxuICAgICAgICAgICAgICAgICAgICBiYXJDaGFydDIudXBkYXRlKClcclxuICAgICAgICAgICAgICAgICAgICB0aW1lcklkID0gc2V0SW50ZXJ2YWwoZmV0Y2hEYXRhLCAyMDAwLCBjb250YWluZXJzSWQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gc3RhcnRTdG9wKCl7XHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogJy9hcHBzL2xpc3QnLFxyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIGRhdGE6e3VpZDp1aWQsaW1hZ2VsaXN0OmZhbHNlfSxcclxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgJCgnI2NvbnRlbnQnKS5lbXB0eSgpXHJcbiAgICAgICAgICAgIHZhciBpbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xyXG4gICAgICAgICAgICBpbnB1dEVsZW1lbnQuaWQgPSAnbGlzdE1hbmFnZSdcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW50XCIpLmFwcGVuZENoaWxkKGlucHV0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIHZhciBoNEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoNCcpO1xyXG4gICAgICAgICAgICBoNEVsZW1lbnQuaW5uZXJIVE1MID0gXCLQn9GA0LjQu9C+0LbQtdC90LjRjzpcIlxyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxpc3RNYW5hZ2VcIikuYXBwZW5kQ2hpbGQoaDRFbGVtZW50KTtcclxuICAgICAgICAgICAgJCgnI0hlYWRlcicpLmh0bWwoXCLQl9Cw0L/Rg9GB0Lov0J7RgdGC0LDQvdC+0LLQutCwINC/0YDQuNC70L7QttC10L3QuNC5XCIpXHJcbiAgICAgICAgICAgIGlmICh0aW1lcklkIT1udWxsKXtcclxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXJJZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBKU09OLnBhcnNlKHJlc3BvbnNlKVsnZGF0YSddLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGlFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcclxuICAgICAgICAgICAgICAgIGxpRWxlbWVudC5jbGFzc05hbWUgPSBcIm1vbml0XCJcclxuICAgICAgICAgICAgICAgIHZhciBsYWJlbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xyXG4gICAgICAgICAgICAgICAgbGFiZWxFbGVtZW50LnN0eWxlID0gXCJmb250LXNpemU6IG1lZGl1bVwiXHJcbiAgICAgICAgICAgICAgICBsYWJlbEVsZW1lbnQuaW5uZXJIVE1MID0gZWxlbWVudC5uYW1lKycoUElEOicrZWxlbWVudC5waWQrJyknXHJcbiAgICAgICAgICAgICAgICB2YXIgYnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudC50eXBlID0gXCJzdWJtaXRcIlxyXG4gICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudC5jbGFzc05hbWU9XCJidG5cIlxyXG4gICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudC5pbm5lckhUTUw9KGVsZW1lbnQuc3RhdHVzID09ICd1cCcpPyfQntGB0YLQsNC90L7QstC40YLRjCc6J9CX0LDQv9GD0YHRgtC40YLRjCc7XHJcbiAgICAgICAgICAgICAgICAoZWxlbWVudC5zdGF0dXMgPT0gJ3VwJyk/XHJcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFN0b3BBcHAoZWxlbWVudC5uYW1lKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgOlxyXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbkVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBTdGFydEFwcChlbGVtZW50Lm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBsYWJlbEVsZW1lbnQuYXBwZW5kQ2hpbGQoYnV0dG9uRWxlbWVudClcclxuICAgICAgICAgICAgICAgIGxpRWxlbWVudC5hcHBlbmRDaGlsZChsYWJlbEVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxpc3RNYW5hZ2VcIikuYXBwZW5kQ2hpbGQobGlFbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgICQuYWpheCh7XHJcbiAgICAgICAgdXJsOiAnL2FwcHMvZ3JvdXBzJyxcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBkYXRhOnt1aWQ6dWlkfSxcclxuICAgICAgICBKU09OOiB0cnVlLFxyXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2UocmVzcG9uc2UpWydkYXRhJ11cclxuICAgICAgICAgICAgZ2V0R3JvdXBzKGRhdGEpXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIFN0YXJ0QXBwKCBuYW1lICl7XHJcbiAgIC8vICQoJyNidXR0b25MYXVuY2gnKS5yZW1vdmUoKVxyXG4gICAvLyAkKCBcIiNsaXN0TWFuYWdlIDpjaGVja2VkXCIgKS5lYWNoKGZ1bmN0aW9uICgpe1xyXG4gICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogJy9hcHAvc3RhcnQnLFxyXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgZGF0YToge2FwcDp7bmFtZTogbmFtZX19LFxyXG4gICAgICAgICAgICBqc29uOiB0cnVlLFxyXG5cclxuICAgICAgICB9KVxyXG4gICAgc3RhcnRTdG9wKClcclxuICAgICAgLy8gIGNvbnNvbGUubG9nKHRoaXMudmFsdWUpXHJcbiAgIC8vIH0pXHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBTdG9wQXBwKCBuYW1lICl7XHJcbiAgICAvLyAkKCcjYnV0dG9uTGF1bmNoJykucmVtb3ZlKClcclxuICAgIC8vICQoIFwiI2xpc3RNYW5hZ2UgOmNoZWNrZWRcIiApLmVhY2goZnVuY3Rpb24gKCl7XHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogJy9hcHAvc3RvcCcsXHJcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgZGF0YToge2FwcDp7bmFtZTogbmFtZX19LFxyXG4gICAgICAgIGpzb246IHRydWUsXHJcblxyXG4gICAgfSlcclxuICAgIC8vICBjb25zb2xlLmxvZyh0aGlzLnZhbHVlKVxyXG4gICAgLy8gfSlcclxuICAgIHN0YXJ0U3RvcCgpXHJcbn1cclxuXHJcbnZhciBqc29uZmlsZWRhdGEgPSBcIlwiXHJcblxyXG5mdW5jdGlvbiBMb2FkU2V0dGluZ3MoIGRhdGEgKXtcclxuXHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogJy9jb25maWcvbG9hZCcsXHJcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcblxyXG4gICAgICAgIGRhdGE6IHtqc29uRmlsZToge2RhdGE6ZGF0YX0sIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdjb25maWcnLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6ICcnXHJcbiAgICAgICAgICAgIH19LFxyXG4gICAgICAgIGpzb246IHRydWUsXHJcblxyXG4gICAgfSlcclxuXHJcbiAgICBzdGFydFN0b3AoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gZ2V0QXBwVGVtcGxhdGUgKG5hbWUsZ3JvdXAsIHNjcmlwdCwgd2F0Y2gsIGxvZywgaG9zdCwgcG9ydCwga2VlcCwgYXR0ZW1wdCApIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaWQ6ICcnLFxyXG4gICAgICAgIG5hbWU6IG5hbWUgfHwgJycsXHJcbiAgICAgICAgZ3JvdXA6IGdyb3VwIHx8ICdtYWluJyxcclxuICAgICAgICB1aWQ6ICcnLFxyXG4gICAgICAgIGdpZDogJycsXHJcbiAgICAgICAgc2NyaXB0OiBzY3JpcHQgfHwgJycsXHJcbiAgICAgICAgZW52OiAnJyxcclxuICAgICAgICBwYXJhbXM6ICAnJyxcclxuICAgICAgICBjcmVhdGVkOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcclxuICAgICAgICBzdGFydGVkOiAnJyxcclxuICAgICAgICB3YXRjaDoge1xyXG4gICAgICAgICAgICBlbmFibGVkOiB3YXRjaCA/IHRydWUgOiBmYWxzZSxcclxuICAgICAgICAgICAgcGF0aDogd2F0Y2h8fCAnJyxcclxuICAgICAgICAgICAgZXhjbHVkZXM6IFtdLy9jb21tYW5kZXIuZXhjbHVkZSA/IGNvbW1hbmRlci5leGNsdWRlLnNwbGl0KCcsJykgOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGltZXI6IG51bGwsXHJcbiAgICAgICAgc3RvcHBlZDogZmFsc2UsXHJcbiAgICAgICAgYXR0ZW1wdGVkOiBmYWxzZSxcclxuICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgIHN0ZG91dDogbnVsbCxcclxuICAgICAgICBmaWxlczoge1xyXG4gICAgICAgICAgICBwaWQ6ICcnLC8vIGNvbW1hbmRlci5waWQgfHwgJycsXHJcbiAgICAgICAgICAgIGxvZzogbG9nIHx8ICcnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBob3N0OiBob3N0IHx8ICcnLFxyXG4gICAgICAgIHBvcnQ6IHBvcnQgfHwgJycsXHJcbiAgICAgICAgcGlkOiAnJyxcclxuICAgICAgICBrZWVwOiBrZWVwLFxyXG4gICAgICAgIGN1ckF0dGVtcHQ6IDAsXHJcbiAgICAgICAgYXR0ZW1wdDogYXR0ZW1wdCB8fCAzLFxyXG4gICAgICAgIHN0YXR1czogJ2Rvd24nLFxyXG4gICAgICAgIHN0YXRzOiB7XHJcbiAgICAgICAgICAgIHVwdGltZTogMCxcclxuICAgICAgICAgICAgc3RhcnRlZDogMCxcclxuICAgICAgICAgICAgY3Jhc2hlZDogMCxcclxuICAgICAgICAgICAgc3RvcHBlZDogMCxcclxuICAgICAgICAgICAgcmVzdGFydGVkOiAwLFxyXG4gICAgICAgICAgICBtZW1vcnk6IDAsXHJcbiAgICAgICAgICAgIGNwdTogMFxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYnVpbGRGb3JtQWRkRWRpdCgpe1xyXG4gICAgdmFyIGZvcm1FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpO1xyXG4gICAgZm9ybUVsZW1lbnQuY2xhc3NOYW1lID0gXCJjb2wgczEyXCJcclxuXHJcbiAgICBjb25zdCBuYW1lZmllbGQgPSBbJ0FwcCBuYW1lJywgJ0dyb3VwIG5hbWUnLCAnU2NyaXB0IHBhdGgnLCdIb3N0IG5hbWUnLCAnUG9ydCcsICdXYXRjaCBwYXRoJywgJ0xvZyBwYXRoJ107XHJcbiAgICBjb25zdCBJRHMgPSBbJ25hbWUnLCdncm91cCcsJ3NjcmlwdCcsJ2hvc3QnLCdwb3J0Jywnd2F0Y2gnLCdsb2cnXVxyXG4gICAgdmFyIGkgPSAwXHJcbiAgICBuYW1lZmllbGQuZm9yRWFjaChlbGVtZW50ID0+e1xyXG4gICAgICAgIHZhciBkaXZFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgICB2YXIgaW5wdXRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICB2YXIgbGFiZWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcclxuICAgICAgICBkaXZFbGVtZW50LmNsYXNzTmFtZSA9IFwicm93XCJcclxuICAgICAgICBpbnB1dEVsZW1lbnQucGxhY2Vob2xkZXIgPSBlbGVtZW50XHJcbiAgICAgICAgaW5wdXRFbGVtZW50LmlkID0gSURzW2ldXHJcbiAgICAgICAgbGFiZWxFbGVtZW50LmlubmVySFRNTCA9IGVsZW1lbnRcclxuICAgICAgICBkaXZFbGVtZW50LmFwcGVuZENoaWxkKGxhYmVsRWxlbWVudClcclxuICAgICAgICBkaXZFbGVtZW50LmFwcGVuZENoaWxkKGlucHV0RWxlbWVudClcclxuICAgICAgICBmb3JtRWxlbWVudC5hcHBlbmRDaGlsZChkaXZFbGVtZW50KVxyXG4gICAgICAgIGkrK1xyXG4gICAgfSk7XHJcbiAgICB2YXIgY2hlY2tib3hLZWVwRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICBjaGVja2JveEtlZXBFbGVtZW50LnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJjaGVja2JveFwiKTtcclxuICAgIGNoZWNrYm94S2VlcEVsZW1lbnQuaWQgPSBcImNoZWNrYm94S2VlcFwiXHJcblxyXG4gICAgdmFyIHBFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgdmFyIGxhYmVsRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XHJcbiAgICB2YXIgc3BhbkVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICBzcGFuRWxlbS5pbm5lckhUTUwgPSBcIktlZXAgYWxpdmUgYXBwXCJcclxuICAgIGxhYmVsRWxlbS5hcHBlbmRDaGlsZChjaGVja2JveEtlZXBFbGVtZW50KTtcclxuICAgIGxhYmVsRWxlbS5hcHBlbmRDaGlsZChzcGFuRWxlbSlcclxuICAgIHBFbGVtLmFwcGVuZENoaWxkKGxhYmVsRWxlbSlcclxuICAgIGZvcm1FbGVtZW50LmFwcGVuZENoaWxkKHBFbGVtKVxyXG5cclxuICAgIHZhciBkaXZFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgIHZhciBpbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgdmFyIGxhYmVsRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XHJcbiAgICBkaXZFbGVtZW50LmNsYXNzTmFtZSA9IFwicm93XCJcclxuICAgIGlucHV0RWxlbWVudC5wbGFjZWhvbGRlciA9IFwiQXR0ZW1wdHNcIlxyXG4gICAgaW5wdXRFbGVtZW50LmlkID0gXCJrZWVwY291bnRcIlxyXG4gICAgbGFiZWxFbGVtZW50LmlubmVySFRNTCA9IFwiQXR0ZW1wdHNcIlxyXG4gICAgZGl2RWxlbWVudC5hcHBlbmRDaGlsZChsYWJlbEVsZW1lbnQpXHJcbiAgICBkaXZFbGVtZW50LmFwcGVuZENoaWxkKGlucHV0RWxlbWVudClcclxuICAgIGZvcm1FbGVtZW50LmFwcGVuZENoaWxkKGRpdkVsZW1lbnQpXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoZm9ybUVsZW1lbnQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRBZGQoaXNJbWFnZSl7XHJcbiAgICAkKCcjY29udGVudCcpLmVtcHR5KClcclxuICAgICQoJyNIZWFkZXInKS5odG1sKFwi0JTQvtCx0LDQstC70LXQvdC40LUg0L/RgNC40LvQvtC20LXQvdC40Y9cIilcclxuICAgIGlmICh0aW1lcklkIT1udWxsKXtcclxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVySWQpXHJcbiAgICB9XHJcbiAgICBidWlsZEZvcm1BZGRFZGl0KClcclxuXHJcblxyXG4gICAgdmFyIGJ1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgIGJ1dHRvbkVsZW1lbnQudHlwZSA9IFwic3VibWl0XCJcclxuICAgIGJ1dHRvbkVsZW1lbnQuY2xhc3NOYW1lPVwiYnRuXCJcclxuICAgIGJ1dHRvbkVsZW1lbnQuaW5uZXJIVE1MPSBcItCU0L7QsdCw0LLQuNGC0YxcIlxyXG4gICAgYnV0dG9uRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBuYW1lID0gJCgnI25hbWUnKS52YWwoKVxyXG4gICAgICAgIHZhciBncm91cCA9ICQoJyNncm91cCcpLnZhbCgpXHJcbiAgICAgICAgdmFyIHNjcmlwdCA9ICQoJyNzY3JpcHQnKS52YWwoKVxyXG4gICAgICAgIHZhciB3YXRjaCA9ICQoJyN3YXRjaCcpLnZhbCgpXHJcbiAgICAgICAgdmFyIGxvZyA9ICQoJyNsb2cnKS52YWwoKVxyXG4gICAgICAgIHZhciBob3N0ID0gJCgnI2hvc3QnKS52YWwoKVxyXG4gICAgICAgIHZhciBwb3J0ID0gJCgnI3BvcnQnKS52YWwoKVxyXG5cclxuICAgICAgICB2YXIga2VlcCA9ICQoJyNjaGVja2JveEtlZXAnKS5pcygnOmNoZWNrZWQnKVxyXG4gICAgICAgIHZhciBhdHRlbXB0ID0gcGFyc2VJbnQoJCgnI2tlZXBjb3VudCcpLnZhbCgpKVxyXG4gICAgICAgIHZhciBhcHAgPSBnZXRBcHBUZW1wbGF0ZShuYW1lLGdyb3VwLHNjcmlwdCx3YXRjaCxsb2csaG9zdCxwb3J0LGtlZXAsYXR0ZW1wdClcclxuICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6ICcvYXBwcycsXHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXHJcbiAgICAgICAgICAgIGRhdGE6IHthcHA6IGFwcCxcclxuICAgICAgICAgICAgICAgICAgICB1aWQ6dWlkfSxcclxuICAgICAgICAgICAganNvbjogdHJ1ZSxcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBnZXRMaXN0KClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KVxyXG4gICAgfSlcclxuICAvLyAgZm9ybUVsZW1lbnQuYXBwZW5kQ2hpbGQoYnV0dG9uRWxlbWVudClcclxuXHJcblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW50XCIpLmFwcGVuZENoaWxkKGJ1dHRvbkVsZW1lbnQpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBnZXRSb2xlKCl7XHJcbiAgICB2YXIgcmVzdWx0PWZhbHNlXHJcbiAgIGF3YWl0ICQuYWpheCh7XHJcbiAgICAgICAgdXJsOiAnL3JvbGUnLFxyXG4gICAgICAgIGRhdGE6IHt1aWQ6dWlkfSxcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgaWYgKEpTT04ucGFyc2UocmVzcG9uc2UpWydkYXRhJ10gPT0gXCJhZG1pblwiKXtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWVcclxuICAgICAgICAgICAgfWVsc2V7cmVzdWx0PWZhbHNlfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChlcnJvcil7XHJcbiAgICAgICAgICAgIGlmKGVycm9yIT1udWxsKVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG5mdW5jdGlvbiBTaG93U2V0dGluZ3MoICApe1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6ICcvY29uZmlnL2dldHNldHRpbmdzJyxcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBkYXRhOiB7dWlkOnVpZH0sXHJcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHZhciBzZXR0aW5ncyA9IEpTT04ucGFyc2UocmVzcG9uc2UpWydkYXRhJ11bMF1cclxuICAgICAgICAgICAgJCgnI2NvbnRlbnQnKS5lbXB0eSgpXHJcbiAgICAgICAgICAgICQoJyNIZWFkZXInKS5odG1sKFwi0J3QsNGB0YLRgNC+0LnQutC4XCIpXHJcbiAgICAgICAgICAgIGlmICh0aW1lcklkIT1udWxsKXtcclxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXJJZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgZm9ybUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb3JtJyk7XHJcbiAgICAgICAgICAgIGdldFJvbGUoKS50aGVuKHZhbHVlPT57XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsRWxlbWVudC5pbm5lckhUTUwgPSAn0JfQsNCz0YDRg9C30LrQsCDRgdC/0LjRgdC60LAg0L/RgNC40LvQvtC20LXQvdC40Lkg0LjQtyBqc29uOidcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcEVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcEVsZW0uYXBwZW5kQ2hpbGQobGFiZWxFbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgICAgIGZvcm1FbGVtZW50LmFwcGVuZENoaWxkKHBFbGVtKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaW5wdXRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dEVsZW1lbnQuY2xhc3NOYW1lID0gXCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuXCJcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dEVsZW1lbnQudHlwZSA9IFwiZmlsZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRFbGVtZW50Lm5hbWUgPSBcImFwcHNGaWxlXCJcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dEVsZW1lbnQuYWNjZXB0ID0gXCIuanNvblwiXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZpbGUgPSB0aGlzLmZpbGVzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRlci5vbmxvYWRlbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uZmlsZWRhdGEgPSByZWFkZXIucmVzdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBFbGVtMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgICAgICAgICAgICAgICAgICBwRWxlbTIuYXBwZW5kQ2hpbGQoaW5wdXRFbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgICAgIGZvcm1FbGVtZW50LmFwcGVuZENoaWxkKHBFbGVtMik7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgYnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbkVsZW1lbnQudHlwZSA9IFwiYnV0dG9uXCJcclxuICAgICAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50LmNsYXNzTmFtZSA9IFwiYnRuXCJcclxuICAgICAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50LmlubmVySFRNTCA9IFwi0JfQsNCz0YDRg9C30LjRgtGMXCJcclxuICAgICAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgY29uc29sZS5sb2coXCJmaWxlTmFtZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJChcImlucHV0W25hbWU9J2FwcHNGaWxlJ11cIikuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdmFyIGZpbGVOYW1lID0gJCh0aGlzKS52YWwoKS8vKCkuc3BsaXQoJy8nKS5wb3AoKS5zcGxpdCgnXFxcXCcpLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNvbmZpbGVkYXRhICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIExvYWRTZXR0aW5ncyhqc29uZmlsZWRhdGEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcEVsZW0zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHBFbGVtMy5hcHBlbmRDaGlsZChidXR0b25FbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgICAgIGZvcm1FbGVtZW50LmFwcGVuZENoaWxkKHBFbGVtMylcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhdGhpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBwYXRoaW5wdXQuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcInRleHRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgcGF0aGlucHV0LnNldEF0dHJpYnV0ZShcInBsYWNlaG9sZGVyXCIsIFwi0JLQstC10LTQuNGC0LUg0L/Rg9GC0Ywg0LTQu9GPINGB0L7RhdGA0LDQvdC10L3QuNGPXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHBhdGhpbnB1dC5pZCA9IFwicGF0aElucHV0XCJcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcEVsZW00ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHBFbGVtNC5hcHBlbmRDaGlsZChwYXRoaW5wdXQpXHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybUVsZW1lbnQuYXBwZW5kQ2hpbGQocEVsZW00KVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgYnV0dG9uRWxlbWVudDIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50Mi50eXBlID0gXCJidXR0b25cIlxyXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbkVsZW1lbnQyLmNsYXNzTmFtZSA9IFwiYnRuXCJcclxuICAgICAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50Mi5pbm5lckhUTUwgPSBcItCh0L7RhdGA0LDQvdC40YLRjFwiXHJcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudDIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6ICcvY29uZmlnL3NhdmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge2ZpbGU6JCgnI3BhdGhJbnB1dCcpLnZhbCgpfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0TGlzdCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcEVsZW01ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHBFbGVtNS5hcHBlbmRDaGlsZChidXR0b25FbGVtZW50MilcclxuICAgICAgICAgICAgICAgICAgICBmb3JtRWxlbWVudC5hcHBlbmRDaGlsZChwRWxlbTUpXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVudFwiKS5hcHBlbmRDaGlsZChmb3JtRWxlbWVudCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB2YXIgZGl2RWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgICAgIHZhciBkaXZFbGVtMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcclxuXHJcbiAgICAgICAgICAgIHZhciBlbWFpbGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xyXG4gICAgICAgICAgICBlbWFpbGlucHV0LnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJ0ZXh0XCIpO1xyXG4gICAgICAgICAgICBlbWFpbGlucHV0LnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIHNldHRpbmdzLnRvZW1haWwpO1xyXG4gICAgICAgICAgICBlbWFpbGlucHV0LnNldEF0dHJpYnV0ZShcInBsYWNlaG9sZGVyXCIsIFwiRW1haWwgdG8gbWVzc2FnZXNcIik7XHJcbiAgICAgICAgICAgIGVtYWlsaW5wdXQuaWQgPSBcImVtYWlsSW5wdXRcIlxyXG4gICAgICAgICAgICBkaXZFbGVtLmFwcGVuZENoaWxkKGVtYWlsaW5wdXQpXHJcbiAgICAgICAgICAgIGRpdkVsZW0uY2xhc3NOYW1lID0gXCJpbnB1dC1maWVsZCBjb2wgczZcIlxyXG5cclxuICAgICAgICAgICAgdmFyIGJ1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgICAgICAgYnV0dG9uRWxlbWVudC50eXBlID0gXCJidXR0b25cIlxyXG4gICAgICAgICAgICBidXR0b25FbGVtZW50LmNsYXNzTmFtZSA9IFwiYnRuXCJcclxuICAgICAgICAgICAgYnV0dG9uRWxlbWVudC5pbm5lckhUTUwgPSBcItCh0L7RhdGA0LDQvdC40YLRjFwiXHJcbiAgICAgICAgICAgIGJ1dHRvbkVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9jb25maWcvc2V0ZW1haWwnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtlbWFpbDokKCcjZW1haWxJbnB1dCcpLnZhbCgpLHVpZDp1aWR9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBTaG93U2V0dGluZ3MoKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICB9KVxyXG5cclxuXHJcbiAgICAgICAgICAgIGRpdkVsZW0uYXBwZW5kQ2hpbGQoYnV0dG9uRWxlbWVudClcclxuICAgICAgICAgICAgZGl2RWxlbTIuY2xhc3NOYW1lID0gXCJyb3dcIlxyXG4gICAgICAgICAgICBkaXZFbGVtMi5hcHBlbmRDaGlsZChkaXZFbGVtKVxyXG4gICAgICAgICAgICBmb3JtRWxlbWVudC5jbGFzc05hbWUgPSBcImNvbCBzMTJcIlxyXG4gICAgICAgICAgICBmb3JtRWxlbWVudC5hcHBlbmRDaGlsZChkaXZFbGVtMilcclxuXHJcbiAgICAgICAgICAgIHZhciBjaGVja2JveEV4aXRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgdmFyIGNoZWNrYm94Q2xvc2VFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgdmFyIGNoZWNrYm94Q3Jhc2hFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgY2hlY2tib3hFeGl0RWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiY2hlY2tib3hcIik7XHJcbiAgICAgICAgICAgIGNoZWNrYm94Q2xvc2VFbGVtZW50LnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJjaGVja2JveFwiKTtcclxuICAgICAgICAgICAgY2hlY2tib3hDcmFzaEVsZW1lbnQuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcImNoZWNrYm94XCIpO1xyXG4gICAgICAgICAgICBjaGVja2JveENsb3NlRWxlbWVudC5uYW1lID0gXCJjaGVja2JveENsb3NlXCJcclxuICAgICAgICAgICAgY2hlY2tib3hFeGl0RWxlbWVudC5uYW1lID0gXCJjaGVja2JveEV4aXRcIlxyXG4gICAgICAgICAgICBjaGVja2JveENyYXNoRWxlbWVudC5uYW1lID0gXCJjaGVja2JveENyYXNoXCJcclxuICAgICAgICAgICAgY2hlY2tib3hDbG9zZUVsZW1lbnQuY2hlY2tlZCA9IHNldHRpbmdzLnNlbnRjbG9zZVxyXG4gICAgICAgICAgICBjaGVja2JveENyYXNoRWxlbWVudC5jaGVja2VkID0gc2V0dGluZ3Muc2VudGNyYXNoXHJcbiAgICAgICAgICAgIGNoZWNrYm94RXhpdEVsZW1lbnQuY2hlY2tlZCA9IHNldHRpbmdzLnNlbnRleGl0XHJcblxyXG4gICAgICAgICAgICBjaGVja2JveENsb3NlRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKXtcclxuXHJcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9jb25maWcvY2xvc2VzZW5kJyxcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7ZmxhZzogdGhpcy5jaGVja2VkLCB1aWQ6dWlkfSxcclxuICAgICAgICAgICAgICAgICAgICBqc29uOiB0cnVlLFxyXG5cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIGNoZWNrYm94RXhpdEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCl7XHJcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9jb25maWcvZXhpdHNlbmQnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtmbGFnOiB0aGlzLmNoZWNrZWQsIHVpZDp1aWR9LFxyXG4gICAgICAgICAgICAgICAgICAgIGpzb246IHRydWUsXHJcblxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgY2hlY2tib3hDcmFzaEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCl7XHJcblxyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvY29uZmlnL2NyYXNoc2VuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge2ZsYWc6IHRoaXMuY2hlY2tlZCwgdWlkOnVpZH0sXHJcbiAgICAgICAgICAgICAgICAgICAganNvbjogdHJ1ZSxcclxuXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgIC8vIGZvcm1FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpO1xyXG4gICAgICAgICAgICB2YXIgcEVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgICAgIHZhciBsYWJlbEVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xyXG4gICAgICAgICAgICB2YXIgc3BhbkVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgICAgIHNwYW5FbGVtLmlubmVySFRNTCA9IFwi0J/QvtGB0YvQu9Cw0YLRjCDRgdC+0L7QsdGJ0LXQvdC40LUg0L/RgNC4INC30LDQutGA0YvRgtC40Lgg0L/RgNC40LvQvtC20LXQvdC40Y9cIlxyXG4gICAgICAgICAgICBsYWJlbEVsZW0uYXBwZW5kQ2hpbGQoY2hlY2tib3hDbG9zZUVsZW1lbnQpO1xyXG4gICAgICAgICAgICBsYWJlbEVsZW0uYXBwZW5kQ2hpbGQoc3BhbkVsZW0pXHJcbiAgICAgICAgICAgIHBFbGVtLmFwcGVuZENoaWxkKGxhYmVsRWxlbSlcclxuICAgICAgICAgICAgZm9ybUVsZW1lbnQuYXBwZW5kQ2hpbGQocEVsZW0pXHJcbiAgICAgICAgICAgIHZhciBwRWxlbTIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgICAgIHZhciBsYWJlbEVsZW0yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcclxuICAgICAgICAgICAgdmFyIHNwYW5FbGVtMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICAgICAgc3BhbkVsZW0yLmlubmVySFRNTCA9IFwi0J/QvtGB0YvQu9Cw0YLRjCDRgdC+0L7QsdGJ0LXQvdC40LUg0L/RgNC4INCy0YvRhdC+0LTQtSDQuNC3INC/0YDQuNC70L7QttC10L3QuNGPXCJcclxuICAgICAgICAgICAgbGFiZWxFbGVtMi5hcHBlbmRDaGlsZChjaGVja2JveEV4aXRFbGVtZW50KTtcclxuICAgICAgICAgICAgbGFiZWxFbGVtMi5hcHBlbmRDaGlsZChzcGFuRWxlbTIpXHJcbiAgICAgICAgICAgIHBFbGVtMi5hcHBlbmRDaGlsZChsYWJlbEVsZW0yKVxyXG4gICAgICAgICAgICBmb3JtRWxlbWVudC5hcHBlbmRDaGlsZChwRWxlbTIpXHJcbiAgICAgICAgICAgIHZhciBwRWxlbTMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgICAgIHZhciBsYWJlbEVsZW0zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcclxuICAgICAgICAgICAgdmFyIHNwYW5FbGVtMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICAgICAgc3BhbkVsZW0zLmlubmVySFRNTCA9IFwi0J/QvtGB0YvQu9Cw0YLRjCDRgdC+0L7QsdGJ0LXQvdC40LUg0L/RgNC4INCw0LLQsNGA0LjQudC90L7QvCDQt9Cw0LLQtdGA0YjQtdC90LjQuFwiXHJcbiAgICAgICAgICAgIGxhYmVsRWxlbTMuYXBwZW5kQ2hpbGQoY2hlY2tib3hDcmFzaEVsZW1lbnQpO1xyXG4gICAgICAgICAgICBsYWJlbEVsZW0zLmFwcGVuZENoaWxkKHNwYW5FbGVtMylcclxuICAgICAgICAgICAgcEVsZW0zLmFwcGVuZENoaWxkKGxhYmVsRWxlbTMpXHJcbiAgICAgICAgICAgIGZvcm1FbGVtZW50LmFwcGVuZENoaWxkKHBFbGVtMylcclxuXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVudFwiKS5hcHBlbmRDaGlsZChmb3JtRWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEdyb3VwcyhkYXRhKXtcclxuICAgIHZhciBoNEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoNCcpO1xyXG4gICAgaDRFbGVtZW50LmlubmVySFRNTCA9IFwi0JPRgNGD0L/Qv9GLOlwiXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxpc3RNYW5hZ2VcIikuYXBwZW5kQ2hpbGQoaDRFbGVtZW50KVxyXG4gICAgZGF0YS5mb3JFYWNoKGVsZW09PntcclxuICAgICAgICB2YXIgbGlFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcclxuICAgICAgICBsaUVsZW1lbnQuY2xhc3NOYW1lID0gXCJncm91cFwiXHJcblxyXG4gICAgICAgIHZhciBsYWJlbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xyXG4gICAgICAgIGxhYmVsRWxlbWVudC5pbm5lckhUTUwgPSBlbGVtXHJcbiAgICAgICAgbGFiZWxFbGVtZW50LnN0eWxlID0gXCJmb250LXNpemU6IG1lZGl1bVwiXHJcbiAgICAgICAgbGFiZWxFbGVtZW50LmlubmVySFRNTCA9IGVsZW1cclxuICAgICAgICB2YXIgYnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIGJ1dHRvbkVsZW1lbnQudHlwZSA9IFwic3VibWl0XCJcclxuICAgICAgICBidXR0b25FbGVtZW50LmNsYXNzTmFtZT1cImJ0blwiXHJcbiAgICAgICAgYnV0dG9uRWxlbWVudC5pbm5lckhUTUw9J9CX0LDQv9GD0YHRgtC40YLRjCc7XHJcbiAgICAgICAgICAgIGJ1dHRvbkVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvYXBwcy9zdGFydCcsXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge29wdGlvbnM6IFt7bmFtZTpcImdyb3VwXCIsIHZhbHVlOmVsZW19LCB7bmFtZTpcInVpZFwiLHZhbHVlOnVpZH1dfSxcclxuICAgICAgICAgICAgICAgICAgICBqc29uOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFN0b3AoKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgdmFyIGJ1dHRvbkVsZW1lbnQyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgYnV0dG9uRWxlbWVudDIudHlwZSA9IFwic3VibWl0XCJcclxuICAgICAgICBidXR0b25FbGVtZW50Mi5jbGFzc05hbWU9XCJidG5cIlxyXG4gICAgICAgIGJ1dHRvbkVsZW1lbnQyLmlubmVySFRNTD0n0J7RgdGC0LDQvdC+0LLQuNGC0YwnO1xyXG4gICAgICAgICAgICBidXR0b25FbGVtZW50Mi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9hcHBzL3N0b3AnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtvcHRpb25zOiBbe25hbWU6XCJncm91cFwiLCB2YWx1ZTplbGVtfSwge25hbWU6XCJ1aWRcIix2YWx1ZTp1aWR9XX0sXHJcbiAgICAgICAgICAgICAgICAgICAganNvbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRTdG9wKClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIGxhYmVsRWxlbWVudC5hcHBlbmRDaGlsZChidXR0b25FbGVtZW50KVxyXG4gICAgICAgIGxhYmVsRWxlbWVudC5hcHBlbmRDaGlsZChidXR0b25FbGVtZW50MilcclxuICAgICAgICBsaUVsZW1lbnQuYXBwZW5kQ2hpbGQobGFiZWxFbGVtZW50KVxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGlzdE1hbmFnZVwiKS5hcHBlbmRDaGlsZChsaUVsZW1lbnQpXHJcbiAgICAgICAgfVxyXG4gICAgKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRFZGl0KGlzSW1hZ2Upe1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6ICcvYXBwcy9saXN0JyxcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBkYXRhOnt1aWQ6dWlkLGltYWdlbGlzdDppc0ltYWdlfSxcclxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgJCgnI2NvbnRlbnQnKS5lbXB0eSgpXHJcbiAgICAgICAgICAgIHZhciBpbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xyXG4gICAgICAgICAgICBpbnB1dEVsZW1lbnQuaWQgPSAnbGlzdE1hbmFnZSdcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW50XCIpLmFwcGVuZENoaWxkKGlucHV0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIHZhciBoNEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoNCcpO1xyXG4gICAgICAgICAgICBoNEVsZW1lbnQuaW5uZXJIVE1MID0gKGlzSW1hZ2UpPyBcItCh0L3QuNC80LrQuDpcIjon0JrQvtC90YLQtdC50L3QtdGA0YsnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGlzdE1hbmFnZVwiKS5hcHBlbmRDaGlsZChoNEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAkKCcjSGVhZGVyJykuaHRtbChcItCg0LXQtNCw0LrRgtC40YDQvtCy0LDQvdC40LUgXCIrICgoaXNJbWFnZSk/IFwi0YHQvdC40LzQutC+0LI6XCI6J9C60L7QvdGC0LXQudC90LXRgNC+0LInKSlcclxuICAgICAgICAgICAgaWYgKHRpbWVySWQhPW51bGwpe1xyXG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcklkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIEpTT04ucGFyc2UocmVzcG9uc2UpWydkYXRhJ10uZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGlFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcclxuICAgICAgICAgICAgICAgICAgICBsaUVsZW1lbnQuY2xhc3NOYW1lID0gXCJtb25pdFwiXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhYmVsRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxFbGVtZW50LnN0eWxlID0gXCJmb250LXNpemU6IG1lZGl1bVwiXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBidXR0b25FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudC50eXBlID0gXCJzdWJtaXRcIlxyXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbkVsZW1lbnQuY2xhc3NOYW1lPVwiYnRuXCJcclxuICAgICAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50LmlubmVySFRNTD0gZWxlbWVudC5uYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcEVkaXQoZWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsRWxlbWVudC5hcHBlbmRDaGlsZChidXR0b25FbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgICAgIGxpRWxlbWVudC5hcHBlbmRDaGlsZChsYWJlbEVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsaXN0TWFuYWdlXCIpLmFwcGVuZENoaWxkKGxpRWxlbWVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbn1cclxuZnVuY3Rpb24gYXBwRWRpdChhcHApe1xyXG4gICAgJCgnI2NvbnRlbnQnKS5lbXB0eSgpXHJcbiAgICAkKCcjSGVhZGVyJykuaHRtbChcItCg0LXQtNCw0LrRgtC40YDQvtCy0LDQvdC40LUg0L/RgNC40LvQvtC20LXQvdC40Y8gXFxcIlwiK2FwcC5uYW1lK1wiXFxcIlwiKVxyXG4gICAgYnVpbGRGb3JtQWRkRWRpdCgpXHJcbiAgICBjb25zdCBJRHMgPSBbJ25hbWUnLCdncm91cCcsJ3NjcmlwdCcsJ2hvc3QnLCdwb3J0Jywnd2F0Y2gnLCdsb2cnXVxyXG4gICAgY29uc3QgdmFsdWUgPSBbYXBwLm5hbWUsYXBwLmdyb3VwLGFwcC5zY3JpcHQsYXBwLmhvc3QsYXBwLnBvcnQsYXBwLndhdGNoLnBhdGgsYXBwLmxvZ11cclxuICAgIHZhciBpID0gMFxyXG4gICAgSURzLmZvckVhY2goaWQ9PntcclxuICAgICAgICAkKCcjJytpZCkudmFsKHZhbHVlW2ldKTtcclxuICAgICAgICBpKytcclxuICAgICAgICB9XHJcbiAgICApXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hlY2tib3hLZWVwJykuY2hlY2tlZCA9IGFwcC5rZWVwXHJcbiAgICAvLyQoJyNjaGVja2JveEtlZXAnKS5jaGVja2VkID0gYXBwLmtlZXBcclxuICAgICQoJyNrZWVwY291bnQnKS52YWwoYXBwLmF0dGVtcHQpXHJcbiAgICB2YXIgYnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgYnV0dG9uRWxlbWVudC50eXBlID0gXCJzdWJtaXRcIlxyXG4gICAgYnV0dG9uRWxlbWVudC5jbGFzc05hbWU9XCJidG5cIlxyXG4gICAgYnV0dG9uRWxlbWVudC5pbm5lckhUTUw9IFwi0JTQvtCx0LDQstC40YLRjFwiXHJcbiAgICBidXR0b25FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG5hbWUgPSAkKCcjbmFtZScpLnZhbCgpXHJcbiAgICAgICAgdmFyIGdyb3VwID0gJCgnI2dyb3VwJykudmFsKClcclxuICAgICAgICB2YXIgc2NyaXB0ID0gJCgnI3NjcmlwdCcpLnZhbCgpXHJcbiAgICAgICAgdmFyIHdhdGNoID0gJCgnI3dhdGNoJykudmFsKClcclxuICAgICAgICB2YXIgbG9nID0gJCgnI2xvZycpLnZhbCgpXHJcbiAgICAgICAgdmFyIGhvc3QgPSAkKCcjaG9zdCcpLnZhbCgpXHJcbiAgICAgICAgdmFyIHBvcnQgPSAkKCcjcG9ydCcpLnZhbCgpXHJcblxyXG4gICAgICAgIHZhciBrZWVwID0gJCgnI2NoZWNrYm94S2VlcCcpLmlzKCc6Y2hlY2tlZCcpXHJcbiAgICAgICAgdmFyIGF0dGVtcHQgPSBwYXJzZUludCgkKCcja2VlcGNvdW50JykudmFsKCkpXHJcbiAgICAgICAgdmFyIGFwcE5vdyA9IGdldEFwcFRlbXBsYXRlKG5hbWUsZ3JvdXAsc2NyaXB0LHdhdGNoLGxvZyxob3N0LHBvcnQsa2VlcCxhdHRlbXB0KVxyXG4gICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogJy9hcHAnLFxyXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgZGF0YToge29wdGlvbnM6IFt7bmFtZTonbmFtZScsdmFsdWU6bmFtZX0se25hbWU6J2dyb3VwJyx2YWx1ZTpncm91cH0sXHJcbiAgICAgICAgICAgICAgICAgICAge25hbWU6J3NjcmlwdCcsdmFsdWU6c2NyaXB0fSx7bmFtZTond2F0Y2gnLHZhbHVlOndhdGNofSx7bmFtZTonbG9nJyx2YWx1ZTpsb2d9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtuYW1lOidob3N0Jyx2YWx1ZTpob3N0fSx7bmFtZToncG9ydCcsdmFsdWU6cG9ydH0se25hbWU6J2tlZXAnLHZhbHVlOmtlZXB9LHtuYW1lOidhdHRlbXB0Jyx2YWx1ZTphdHRlbXB0fV0sXHJcbiAgICAgICAgICAgICAgICBzZWFyY2g6IGFwcC5uYW1lLFxyXG4gICAgICAgICAgICAgICAgdWlkOnVpZH0sXHJcbiAgICAgICAgICAgIGpzb246IHRydWUsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgZ2V0TGlzdCgpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoYnV0dG9uRWxlbWVudCk7XHJcblxyXG4gICAvLyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVcIikudmFsKGFwcC5uYW1lKVxyXG59XHJcblxyXG5cclxuZ2xvYmFsLnNldFVzZXJJZCA9IHNldFVzZXJJZFxyXG5nbG9iYWwuZ2V0RWRpdCA9IGdldEVkaXRcclxuZ2xvYmFsLmdldEFkZCA9IGdldEFkZFxyXG5nbG9iYWwuU2hvd1NldHRpbmdzPVNob3dTZXR0aW5nc1xyXG5nbG9iYWwuZ2V0TGlzdCA9IGdldExpc3RcclxuZ2xvYmFsLmdldEltYWdlTGlzdCA9IGdldEltYWdlTGlzdFxyXG5nbG9iYWwuZ2V0TW9uaXQgPSBnZXRNb25pdFxyXG5nbG9iYWwuc3RhcnRTdG9wID0gc3RhcnRTdG9wXHJcbmdsb2JhbC5TdGFydEFwcCA9IFN0YXJ0QXBwXHJcbmdsb2JhbC5TdG9wQXBwID0gU3RvcEFwcFxyXG4vKlxyXG4gYmFyQ2hhcnQuZGF0YS5kYXRhc2V0cy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICd7e25hbWV9fShQSUQ6e3twaWR9fSknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBbe3ttZW19fV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGNvbG9yc1tpXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGNvbG9yc1tpXVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgYmFyQ2hhcnQyLmRhdGEuZGF0YXNldHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAne3tuYW1lfX0oUElEOnt7cGlkfX0pJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogW3t7Y3B1fX1dLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBjb2xvcnNbaV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBjb2xvcnNbaV1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIGkgPiBjb2xvcnMubGVuZ3RoIC0gMSA/IGkgPSAwIDogaSsrXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgYmFyQ2hhcnQudXBkYXRlKClcclxuICAgICAgICAgICAgICAgIGJhckNoYXJ0Mi51cGRhdGUoKVxyXG5cclxuICAgICAgICAgICAgICAgIGZldGNoRGF0YSggYmFyQ2hhcnQsIGJhckNoYXJ0MiApXHJcblxyXG4qL1xyXG4iXX0=
