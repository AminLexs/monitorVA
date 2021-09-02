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
        case 'date':
            return (new Date(+value * 1000)).toString()
        case 'run':
            return value != ':' ? value : 'N/C'
        default:
            return value
    }
    return ''
}

function createTable(headings, contentElements, howToParse) {
    let tableElement = document.createElement('table');
    tableElement.id = 'listTable'
    tableElement.className = 'centered'
    let tHead = document.createElement("thead")
    let trHead = document.createElement("tr")
    headings.forEach(elem => {
        let thHead = document.createElement("th")
        thHead.innerHTML = elem
        trHead.append(thHead)
    })
    tHead.append(trHead)
    tableElement.append(tHead)

    let tBody = document.createElement("tbody")
    contentElements.forEach(contElem => {
        let tr = document.createElement("tr")
        let index = 0
        howToParse[0].forEach(elem=>{
            let td = document.createElement("td")
            td.innerHTML = listFormat(howToParse[1][index],contElem[elem])
            index++
            tr.append(td)
        })
        tBody.append(tr)
    })
    tableElement.append(tBody)
    document.getElementById("content").appendChild(tableElement);
}

function createCanvas(id,width,height){
    var inputElement = document.createElement('canvas');
    inputElement.id = id
    inputElement.width = (width!==undefined)? width:600
    inputElement.height = (height!==undefined)? height:400
    document.getElementById("content").appendChild(inputElement);
}

function createLineChart(canvas,label,vertLabel){
    return new Chart(canvas, {
        type: 'line',
        label:label,
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
                        labelString: vertLabel
                    }
                }]
            }
        }
    });
}
module.exports.createLineChart = createLineChart
module.exports.createTable = createTable
module.exports.createCanvas = createCanvas
module.exports.getHumanPeriod = getHumanPeriod
},{}],4:[function(require,module,exports){
(function (global){(function (){
var path = require('path')
let utils = require('./Utils')
var isMonit=false
var lineChartCPU;
var lineChartMemory;
var uid

function setUserId(userid){
    uid = userid
}

function ClearScreen(monitoring,header){
    $('#content').empty()
    if (timerId!=null){
        clearInterval(timerId)
    }
    isMonit = monitoring
    if(header!==undefined && typeof(header)==="string"){
        $('#Header').html(header)
    }
}

function getList (isImageList) {
    $.ajax({
        url: '/apps/list',
        method: 'POST',
        data:{uid:uid, imagelist:isImageList},
        success: function (response) {
            let contentElements = JSON.parse(response)['data']
            if (isImageList) {
                ClearScreen(false, "Список снимков")
                let headings = ['Название снимка', 'Версия', 'Размер', 'Создан']
                let howToParse = [['name', 'version', 'size', 'created'], ['', '', 'memory', 'date']]
                utils.createTable(headings, contentElements, howToParse)
            } else {
                ClearScreen(false, "Список контейнеров")
                let headings = ['Имя контейнера', 'Имя снимка', 'Статус', 'Публичный порт','Приватный порт','Создан']
                let howToParse = [['name', 'image', 'status', 'publicPort','privatePort','created'],
                    ['', '','','','','date']]
                utils.createTable(headings, contentElements, howToParse)
            }
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

                    lineChartCPU.data.datasets[i].data.push(
                        {
                            x: utils.getHumanPeriod(lineChartCPU.data.labels.length * 2000),
                            y: data[i]['cpu']
                        }
                    )
                    lineChartMemory.data.datasets[i].data.push(
                        {
                            x: utils.getHumanPeriod(lineChartMemory.data.labels.length * 2000),
                            y: data[i]['mem']
                        }
                    )
                }
                lineChartCPU.data.labels.push(utils.getHumanPeriod(lineChartCPU.data.labels.length * 2000))
                lineChartMemory.data.labels.push(utils.getHumanPeriod(lineChartMemory.data.labels.length * 2000))
                lineChartCPU.update()
                lineChartMemory.update()
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
                    ClearScreen(true,"Мониторинг приложений")
                    utils.createCanvas('CanvasCPU')
                    utils.createCanvas('CanvasMemory')

                    if(lineChartCPU!=null & lineChartMemory!=null) {
                        lineChartCPU.clear()
                        lineChartMemory.clear()
                        lineChartCPU.destroy()
                        lineChartMemory.destroy()
                    }


                    var CanvasCPU = document.getElementById("CanvasCPU");
                    var CanvasMemory = document.getElementById("CanvasMemory");


                    lineChartCPU = utils.createLineChart(CanvasCPU,'CPU','Использование CPU, %')

                    lineChartMemory = utils.createLineChart(CanvasMemory,'Memory','Память, байты')
                    let colors =  ['rgba(255,99,132,0.6)', 'rgba(255,99,132,0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
                        'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'
                    ]
                    var i = 0
                    JSON.parse(response)['data'].forEach(element => {
                        lineChartCPU.data.datasets.push({
                            label: element.name+'(PID:'+element.pid+')',
                            data: [element.cpu],
                            fill: false,
                            backgroundColor: colors[i],
                            borderColor: colors[i]
                        })
                        lineChartMemory.data.datasets.push({
                            label:  element.name+'(PID:'+element.pid+')',
                            data: [element.mem],
                            fill: false,
                            backgroundColor: colors[i],
                            borderColor: colors[i]
                        })
                        i > colors.length - 1 ? i = 0 : i++
                    })
                    lineChartCPU.update()
                    lineChartMemory.update()
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
            ClearScreen(false,"Запуск/Остановка приложений")

            var inputElement = document.createElement('ul');
            inputElement.id = 'listManage'
            document.getElementById("content").appendChild(inputElement);
            var h4Element = document.createElement('h4');
            h4Element.innerHTML = "Приложения:"
            document.getElementById("listManage").appendChild(h4Element);

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
            ClearScreen(false,"Настройки")

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
            ClearScreen(false,"Редактирование "+ ((isImage)? "снимков:":'контейнеров'))

            var inputElement = document.createElement('ul');
            inputElement.id = 'listManage'
            document.getElementById("content").appendChild(inputElement);
            var h4Element = document.createElement('h4');
            h4Element.innerHTML = (isImage)? "Снимки:":'Контейнеры'
            document.getElementById("listManage").appendChild(h4Element);

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

},{"./Utils":3,"path":1}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsInN0YXRpYy9VdGlscy5qcyIsInN0YXRpYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDamhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vICdwYXRoJyBtb2R1bGUgZXh0cmFjdGVkIGZyb20gTm9kZS5qcyB2OC4xMS4xIChvbmx5IHRoZSBwb3NpeCBwYXJ0KVxuLy8gdHJhbnNwbGl0ZWQgd2l0aCBCYWJlbFxuXG4vLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBhc3NlcnRQYXRoKHBhdGgpIHtcbiAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1BhdGggbXVzdCBiZSBhIHN0cmluZy4gUmVjZWl2ZWQgJyArIEpTT04uc3RyaW5naWZ5KHBhdGgpKTtcbiAgfVxufVxuXG4vLyBSZXNvbHZlcyAuIGFuZCAuLiBlbGVtZW50cyBpbiBhIHBhdGggd2l0aCBkaXJlY3RvcnkgbmFtZXNcbmZ1bmN0aW9uIG5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHBhdGgsIGFsbG93QWJvdmVSb290KSB7XG4gIHZhciByZXMgPSAnJztcbiAgdmFyIGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcbiAgdmFyIGxhc3RTbGFzaCA9IC0xO1xuICB2YXIgZG90cyA9IDA7XG4gIHZhciBjb2RlO1xuICBmb3IgKHZhciBpID0gMDsgaSA8PSBwYXRoLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKGkgPCBwYXRoLmxlbmd0aClcbiAgICAgIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XG4gICAgZWxzZSBpZiAoY29kZSA9PT0gNDcgLyovKi8pXG4gICAgICBicmVhaztcbiAgICBlbHNlXG4gICAgICBjb2RlID0gNDcgLyovKi87XG4gICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XG4gICAgICBpZiAobGFzdFNsYXNoID09PSBpIC0gMSB8fCBkb3RzID09PSAxKSB7XG4gICAgICAgIC8vIE5PT1BcbiAgICAgIH0gZWxzZSBpZiAobGFzdFNsYXNoICE9PSBpIC0gMSAmJiBkb3RzID09PSAyKSB7XG4gICAgICAgIGlmIChyZXMubGVuZ3RoIDwgMiB8fCBsYXN0U2VnbWVudExlbmd0aCAhPT0gMiB8fCByZXMuY2hhckNvZGVBdChyZXMubGVuZ3RoIC0gMSkgIT09IDQ2IC8qLiovIHx8IHJlcy5jaGFyQ29kZUF0KHJlcy5sZW5ndGggLSAyKSAhPT0gNDYgLyouKi8pIHtcbiAgICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIHZhciBsYXN0U2xhc2hJbmRleCA9IHJlcy5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICAgICAgaWYgKGxhc3RTbGFzaEluZGV4ICE9PSByZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICBpZiAobGFzdFNsYXNoSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmVzID0gJyc7XG4gICAgICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSAwO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlcyA9IHJlcy5zbGljZSgwLCBsYXN0U2xhc2hJbmRleCk7XG4gICAgICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSByZXMubGVuZ3RoIC0gMSAtIHJlcy5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGxhc3RTbGFzaCA9IGk7XG4gICAgICAgICAgICAgIGRvdHMgPSAwO1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHJlcy5sZW5ndGggPT09IDIgfHwgcmVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmVzID0gJyc7XG4gICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IDA7XG4gICAgICAgICAgICBsYXN0U2xhc2ggPSBpO1xuICAgICAgICAgICAgZG90cyA9IDA7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFsbG93QWJvdmVSb290KSB7XG4gICAgICAgICAgaWYgKHJlcy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgcmVzICs9ICcvLi4nO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlcyA9ICcuLic7XG4gICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSAyO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDApXG4gICAgICAgICAgcmVzICs9ICcvJyArIHBhdGguc2xpY2UobGFzdFNsYXNoICsgMSwgaSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXMgPSBwYXRoLnNsaWNlKGxhc3RTbGFzaCArIDEsIGkpO1xuICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IGkgLSBsYXN0U2xhc2ggLSAxO1xuICAgICAgfVxuICAgICAgbGFzdFNsYXNoID0gaTtcbiAgICAgIGRvdHMgPSAwO1xuICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gNDYgLyouKi8gJiYgZG90cyAhPT0gLTEpIHtcbiAgICAgICsrZG90cztcbiAgICB9IGVsc2Uge1xuICAgICAgZG90cyA9IC0xO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBfZm9ybWF0KHNlcCwgcGF0aE9iamVjdCkge1xuICB2YXIgZGlyID0gcGF0aE9iamVjdC5kaXIgfHwgcGF0aE9iamVjdC5yb290O1xuICB2YXIgYmFzZSA9IHBhdGhPYmplY3QuYmFzZSB8fCAocGF0aE9iamVjdC5uYW1lIHx8ICcnKSArIChwYXRoT2JqZWN0LmV4dCB8fCAnJyk7XG4gIGlmICghZGlyKSB7XG4gICAgcmV0dXJuIGJhc2U7XG4gIH1cbiAgaWYgKGRpciA9PT0gcGF0aE9iamVjdC5yb290KSB7XG4gICAgcmV0dXJuIGRpciArIGJhc2U7XG4gIH1cbiAgcmV0dXJuIGRpciArIHNlcCArIGJhc2U7XG59XG5cbnZhciBwb3NpeCA9IHtcbiAgLy8gcGF0aC5yZXNvbHZlKFtmcm9tIC4uLl0sIHRvKVxuICByZXNvbHZlOiBmdW5jdGlvbiByZXNvbHZlKCkge1xuICAgIHZhciByZXNvbHZlZFBhdGggPSAnJztcbiAgICB2YXIgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xuICAgIHZhciBjd2Q7XG5cbiAgICBmb3IgKHZhciBpID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xuICAgICAgdmFyIHBhdGg7XG4gICAgICBpZiAoaSA+PSAwKVxuICAgICAgICBwYXRoID0gYXJndW1lbnRzW2ldO1xuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChjd2QgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICBjd2QgPSBwcm9jZXNzLmN3ZCgpO1xuICAgICAgICBwYXRoID0gY3dkO1xuICAgICAgfVxuXG4gICAgICBhc3NlcnRQYXRoKHBhdGgpO1xuXG4gICAgICAvLyBTa2lwIGVtcHR5IGVudHJpZXNcbiAgICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgcmVzb2x2ZWRQYXRoID0gcGF0aCArICcvJyArIHJlc29sdmVkUGF0aDtcbiAgICAgIHJlc29sdmVkQWJzb2x1dGUgPSBwYXRoLmNoYXJDb2RlQXQoMCkgPT09IDQ3IC8qLyovO1xuICAgIH1cblxuICAgIC8vIEF0IHRoaXMgcG9pbnQgdGhlIHBhdGggc2hvdWxkIGJlIHJlc29sdmVkIHRvIGEgZnVsbCBhYnNvbHV0ZSBwYXRoLCBidXRcbiAgICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHMgdG8gYmUgc2FmZSAobWlnaHQgaGFwcGVuIHdoZW4gcHJvY2Vzcy5jd2QoKSBmYWlscylcblxuICAgIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICAgIHJlc29sdmVkUGF0aCA9IG5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHJlc29sdmVkUGF0aCwgIXJlc29sdmVkQWJzb2x1dGUpO1xuXG4gICAgaWYgKHJlc29sdmVkQWJzb2x1dGUpIHtcbiAgICAgIGlmIChyZXNvbHZlZFBhdGgubGVuZ3RoID4gMClcbiAgICAgICAgcmV0dXJuICcvJyArIHJlc29sdmVkUGF0aDtcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuICcvJztcbiAgICB9IGVsc2UgaWYgKHJlc29sdmVkUGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZWRQYXRoO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJy4nO1xuICAgIH1cbiAgfSxcblxuICBub3JtYWxpemU6IGZ1bmN0aW9uIG5vcm1hbGl6ZShwYXRoKSB7XG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcblxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcuJztcblxuICAgIHZhciBpc0Fic29sdXRlID0gcGF0aC5jaGFyQ29kZUF0KDApID09PSA0NyAvKi8qLztcbiAgICB2YXIgdHJhaWxpbmdTZXBhcmF0b3IgPSBwYXRoLmNoYXJDb2RlQXQocGF0aC5sZW5ndGggLSAxKSA9PT0gNDcgLyovKi87XG5cbiAgICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgICBwYXRoID0gbm9ybWFsaXplU3RyaW5nUG9zaXgocGF0aCwgIWlzQWJzb2x1dGUpO1xuXG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwICYmICFpc0Fic29sdXRlKSBwYXRoID0gJy4nO1xuICAgIGlmIChwYXRoLmxlbmd0aCA+IDAgJiYgdHJhaWxpbmdTZXBhcmF0b3IpIHBhdGggKz0gJy8nO1xuXG4gICAgaWYgKGlzQWJzb2x1dGUpIHJldHVybiAnLycgKyBwYXRoO1xuICAgIHJldHVybiBwYXRoO1xuICB9LFxuXG4gIGlzQWJzb2x1dGU6IGZ1bmN0aW9uIGlzQWJzb2x1dGUocGF0aCkge1xuICAgIGFzc2VydFBhdGgocGF0aCk7XG4gICAgcmV0dXJuIHBhdGgubGVuZ3RoID4gMCAmJiBwYXRoLmNoYXJDb2RlQXQoMCkgPT09IDQ3IC8qLyovO1xuICB9LFxuXG4gIGpvaW46IGZ1bmN0aW9uIGpvaW4oKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICByZXR1cm4gJy4nO1xuICAgIHZhciBqb2luZWQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBhcmcgPSBhcmd1bWVudHNbaV07XG4gICAgICBhc3NlcnRQYXRoKGFyZyk7XG4gICAgICBpZiAoYXJnLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKGpvaW5lZCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgIGpvaW5lZCA9IGFyZztcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGpvaW5lZCArPSAnLycgKyBhcmc7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChqb2luZWQgPT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiAnLic7XG4gICAgcmV0dXJuIHBvc2l4Lm5vcm1hbGl6ZShqb2luZWQpO1xuICB9LFxuXG4gIHJlbGF0aXZlOiBmdW5jdGlvbiByZWxhdGl2ZShmcm9tLCB0bykge1xuICAgIGFzc2VydFBhdGgoZnJvbSk7XG4gICAgYXNzZXJ0UGF0aCh0byk7XG5cbiAgICBpZiAoZnJvbSA9PT0gdG8pIHJldHVybiAnJztcblxuICAgIGZyb20gPSBwb3NpeC5yZXNvbHZlKGZyb20pO1xuICAgIHRvID0gcG9zaXgucmVzb2x2ZSh0byk7XG5cbiAgICBpZiAoZnJvbSA9PT0gdG8pIHJldHVybiAnJztcblxuICAgIC8vIFRyaW0gYW55IGxlYWRpbmcgYmFja3NsYXNoZXNcbiAgICB2YXIgZnJvbVN0YXJ0ID0gMTtcbiAgICBmb3IgKDsgZnJvbVN0YXJ0IDwgZnJvbS5sZW5ndGg7ICsrZnJvbVN0YXJ0KSB7XG4gICAgICBpZiAoZnJvbS5jaGFyQ29kZUF0KGZyb21TdGFydCkgIT09IDQ3IC8qLyovKVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgdmFyIGZyb21FbmQgPSBmcm9tLmxlbmd0aDtcbiAgICB2YXIgZnJvbUxlbiA9IGZyb21FbmQgLSBmcm9tU3RhcnQ7XG5cbiAgICAvLyBUcmltIGFueSBsZWFkaW5nIGJhY2tzbGFzaGVzXG4gICAgdmFyIHRvU3RhcnQgPSAxO1xuICAgIGZvciAoOyB0b1N0YXJ0IDwgdG8ubGVuZ3RoOyArK3RvU3RhcnQpIHtcbiAgICAgIGlmICh0by5jaGFyQ29kZUF0KHRvU3RhcnQpICE9PSA0NyAvKi8qLylcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHZhciB0b0VuZCA9IHRvLmxlbmd0aDtcbiAgICB2YXIgdG9MZW4gPSB0b0VuZCAtIHRvU3RhcnQ7XG5cbiAgICAvLyBDb21wYXJlIHBhdGhzIHRvIGZpbmQgdGhlIGxvbmdlc3QgY29tbW9uIHBhdGggZnJvbSByb290XG4gICAgdmFyIGxlbmd0aCA9IGZyb21MZW4gPCB0b0xlbiA/IGZyb21MZW4gOiB0b0xlbjtcbiAgICB2YXIgbGFzdENvbW1vblNlcCA9IC0xO1xuICAgIHZhciBpID0gMDtcbiAgICBmb3IgKDsgaSA8PSBsZW5ndGg7ICsraSkge1xuICAgICAgaWYgKGkgPT09IGxlbmd0aCkge1xuICAgICAgICBpZiAodG9MZW4gPiBsZW5ndGgpIHtcbiAgICAgICAgICBpZiAodG8uY2hhckNvZGVBdCh0b1N0YXJ0ICsgaSkgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgICAvLyBXZSBnZXQgaGVyZSBpZiBgZnJvbWAgaXMgdGhlIGV4YWN0IGJhc2UgcGF0aCBmb3IgYHRvYC5cbiAgICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vL2Jhcic7IHRvPScvZm9vL2Jhci9iYXonXG4gICAgICAgICAgICByZXR1cm4gdG8uc2xpY2UodG9TdGFydCArIGkgKyAxKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGBmcm9tYCBpcyB0aGUgcm9vdFxuICAgICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy8nOyB0bz0nL2ZvbydcbiAgICAgICAgICAgIHJldHVybiB0by5zbGljZSh0b1N0YXJ0ICsgaSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGZyb21MZW4gPiBsZW5ndGgpIHtcbiAgICAgICAgICBpZiAoZnJvbS5jaGFyQ29kZUF0KGZyb21TdGFydCArIGkpID09PSA0NyAvKi8qLykge1xuICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYHRvYCBpcyB0aGUgZXhhY3QgYmFzZSBwYXRoIGZvciBgZnJvbWAuXG4gICAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nL2Zvby9iYXIvYmF6JzsgdG89Jy9mb28vYmFyJ1xuICAgICAgICAgICAgbGFzdENvbW1vblNlcCA9IGk7XG4gICAgICAgICAgfSBlbHNlIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICAvLyBXZSBnZXQgaGVyZSBpZiBgdG9gIGlzIHRoZSByb290LlxuICAgICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy9mb28nOyB0bz0nLydcbiAgICAgICAgICAgIGxhc3RDb21tb25TZXAgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHZhciBmcm9tQ29kZSA9IGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQgKyBpKTtcbiAgICAgIHZhciB0b0NvZGUgPSB0by5jaGFyQ29kZUF0KHRvU3RhcnQgKyBpKTtcbiAgICAgIGlmIChmcm9tQ29kZSAhPT0gdG9Db2RlKVxuICAgICAgICBicmVhaztcbiAgICAgIGVsc2UgaWYgKGZyb21Db2RlID09PSA0NyAvKi8qLylcbiAgICAgICAgbGFzdENvbW1vblNlcCA9IGk7XG4gICAgfVxuXG4gICAgdmFyIG91dCA9ICcnO1xuICAgIC8vIEdlbmVyYXRlIHRoZSByZWxhdGl2ZSBwYXRoIGJhc2VkIG9uIHRoZSBwYXRoIGRpZmZlcmVuY2UgYmV0d2VlbiBgdG9gXG4gICAgLy8gYW5kIGBmcm9tYFxuICAgIGZvciAoaSA9IGZyb21TdGFydCArIGxhc3RDb21tb25TZXAgKyAxOyBpIDw9IGZyb21FbmQ7ICsraSkge1xuICAgICAgaWYgKGkgPT09IGZyb21FbmQgfHwgZnJvbS5jaGFyQ29kZUF0KGkpID09PSA0NyAvKi8qLykge1xuICAgICAgICBpZiAob3V0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgICBvdXQgKz0gJy4uJztcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG91dCArPSAnLy4uJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBMYXN0bHksIGFwcGVuZCB0aGUgcmVzdCBvZiB0aGUgZGVzdGluYXRpb24gKGB0b2ApIHBhdGggdGhhdCBjb21lcyBhZnRlclxuICAgIC8vIHRoZSBjb21tb24gcGF0aCBwYXJ0c1xuICAgIGlmIChvdXQubGVuZ3RoID4gMClcbiAgICAgIHJldHVybiBvdXQgKyB0by5zbGljZSh0b1N0YXJ0ICsgbGFzdENvbW1vblNlcCk7XG4gICAgZWxzZSB7XG4gICAgICB0b1N0YXJ0ICs9IGxhc3RDb21tb25TZXA7XG4gICAgICBpZiAodG8uY2hhckNvZGVBdCh0b1N0YXJ0KSA9PT0gNDcgLyovKi8pXG4gICAgICAgICsrdG9TdGFydDtcbiAgICAgIHJldHVybiB0by5zbGljZSh0b1N0YXJ0KTtcbiAgICB9XG4gIH0sXG5cbiAgX21ha2VMb25nOiBmdW5jdGlvbiBfbWFrZUxvbmcocGF0aCkge1xuICAgIHJldHVybiBwYXRoO1xuICB9LFxuXG4gIGRpcm5hbWU6IGZ1bmN0aW9uIGRpcm5hbWUocGF0aCkge1xuICAgIGFzc2VydFBhdGgocGF0aCk7XG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSByZXR1cm4gJy4nO1xuICAgIHZhciBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KDApO1xuICAgIHZhciBoYXNSb290ID0gY29kZSA9PT0gNDcgLyovKi87XG4gICAgdmFyIGVuZCA9IC0xO1xuICAgIHZhciBtYXRjaGVkU2xhc2ggPSB0cnVlO1xuICAgIGZvciAodmFyIGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMTsgLS1pKSB7XG4gICAgICBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgICAgIGVuZCA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yXG4gICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlbmQgPT09IC0xKSByZXR1cm4gaGFzUm9vdCA/ICcvJyA6ICcuJztcbiAgICBpZiAoaGFzUm9vdCAmJiBlbmQgPT09IDEpIHJldHVybiAnLy8nO1xuICAgIHJldHVybiBwYXRoLnNsaWNlKDAsIGVuZCk7XG4gIH0sXG5cbiAgYmFzZW5hbWU6IGZ1bmN0aW9uIGJhc2VuYW1lKHBhdGgsIGV4dCkge1xuICAgIGlmIChleHQgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgZXh0ICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJleHRcIiBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcblxuICAgIHZhciBzdGFydCA9IDA7XG4gICAgdmFyIGVuZCA9IC0xO1xuICAgIHZhciBtYXRjaGVkU2xhc2ggPSB0cnVlO1xuICAgIHZhciBpO1xuXG4gICAgaWYgKGV4dCAhPT0gdW5kZWZpbmVkICYmIGV4dC5sZW5ndGggPiAwICYmIGV4dC5sZW5ndGggPD0gcGF0aC5sZW5ndGgpIHtcbiAgICAgIGlmIChleHQubGVuZ3RoID09PSBwYXRoLmxlbmd0aCAmJiBleHQgPT09IHBhdGgpIHJldHVybiAnJztcbiAgICAgIHZhciBleHRJZHggPSBleHQubGVuZ3RoIC0gMTtcbiAgICAgIHZhciBmaXJzdE5vblNsYXNoRW5kID0gLTE7XG4gICAgICBmb3IgKGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgICAgICBpZiAoY29kZSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXG4gICAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcbiAgICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XG4gICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGZpcnN0Tm9uU2xhc2hFbmQgPT09IC0xKSB7XG4gICAgICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgcmVtZW1iZXIgdGhpcyBpbmRleCBpbiBjYXNlXG4gICAgICAgICAgICAvLyB3ZSBuZWVkIGl0IGlmIHRoZSBleHRlbnNpb24gZW5kcyB1cCBub3QgbWF0Y2hpbmdcbiAgICAgICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xuICAgICAgICAgICAgZmlyc3ROb25TbGFzaEVuZCA9IGkgKyAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZXh0SWR4ID49IDApIHtcbiAgICAgICAgICAgIC8vIFRyeSB0byBtYXRjaCB0aGUgZXhwbGljaXQgZXh0ZW5zaW9uXG4gICAgICAgICAgICBpZiAoY29kZSA9PT0gZXh0LmNoYXJDb2RlQXQoZXh0SWR4KSkge1xuICAgICAgICAgICAgICBpZiAoLS1leHRJZHggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UgbWF0Y2hlZCB0aGUgZXh0ZW5zaW9uLCBzbyBtYXJrIHRoaXMgYXMgdGhlIGVuZCBvZiBvdXIgcGF0aFxuICAgICAgICAgICAgICAgIC8vIGNvbXBvbmVudFxuICAgICAgICAgICAgICAgIGVuZCA9IGk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIEV4dGVuc2lvbiBkb2VzIG5vdCBtYXRjaCwgc28gb3VyIHJlc3VsdCBpcyB0aGUgZW50aXJlIHBhdGhcbiAgICAgICAgICAgICAgLy8gY29tcG9uZW50XG4gICAgICAgICAgICAgIGV4dElkeCA9IC0xO1xuICAgICAgICAgICAgICBlbmQgPSBmaXJzdE5vblNsYXNoRW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc3RhcnQgPT09IGVuZCkgZW5kID0gZmlyc3ROb25TbGFzaEVuZDtlbHNlIGlmIChlbmQgPT09IC0xKSBlbmQgPSBwYXRoLmxlbmd0aDtcbiAgICAgIHJldHVybiBwYXRoLnNsaWNlKHN0YXJ0LCBlbmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIGlmIChwYXRoLmNoYXJDb2RlQXQoaSkgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgcGF0aCBzZXBhcmF0b3IgdGhhdCB3YXMgbm90IHBhcnQgb2YgYSBzZXQgb2YgcGF0aFxuICAgICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XG4gICAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xuICAgICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKGVuZCA9PT0gLTEpIHtcbiAgICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyXG4gICAgICAgICAgLy8gcGF0aCBjb21wb25lbnRcbiAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICAgICAgICBlbmQgPSBpICsgMTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZW5kID09PSAtMSkgcmV0dXJuICcnO1xuICAgICAgcmV0dXJuIHBhdGguc2xpY2Uoc3RhcnQsIGVuZCk7XG4gICAgfVxuICB9LFxuXG4gIGV4dG5hbWU6IGZ1bmN0aW9uIGV4dG5hbWUocGF0aCkge1xuICAgIGFzc2VydFBhdGgocGF0aCk7XG4gICAgdmFyIHN0YXJ0RG90ID0gLTE7XG4gICAgdmFyIHN0YXJ0UGFydCA9IDA7XG4gICAgdmFyIGVuZCA9IC0xO1xuICAgIHZhciBtYXRjaGVkU2xhc2ggPSB0cnVlO1xuICAgIC8vIFRyYWNrIHRoZSBzdGF0ZSBvZiBjaGFyYWN0ZXJzIChpZiBhbnkpIHdlIHNlZSBiZWZvcmUgb3VyIGZpcnN0IGRvdCBhbmRcbiAgICAvLyBhZnRlciBhbnkgcGF0aCBzZXBhcmF0b3Igd2UgZmluZFxuICAgIHZhciBwcmVEb3RTdGF0ZSA9IDA7XG4gICAgZm9yICh2YXIgaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHZhciBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcbiAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcbiAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xuICAgICAgICAgICAgc3RhcnRQYXJ0ID0gaSArIDE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIGlmIChlbmQgPT09IC0xKSB7XG4gICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCBtYXJrIHRoaXMgYXMgdGhlIGVuZCBvZiBvdXJcbiAgICAgICAgLy8gZXh0ZW5zaW9uXG4gICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xuICAgICAgICBlbmQgPSBpICsgMTtcbiAgICAgIH1cbiAgICAgIGlmIChjb2RlID09PSA0NiAvKi4qLykge1xuICAgICAgICAgIC8vIElmIHRoaXMgaXMgb3VyIGZpcnN0IGRvdCwgbWFyayBpdCBhcyB0aGUgc3RhcnQgb2Ygb3VyIGV4dGVuc2lvblxuICAgICAgICAgIGlmIChzdGFydERvdCA9PT0gLTEpXG4gICAgICAgICAgICBzdGFydERvdCA9IGk7XG4gICAgICAgICAgZWxzZSBpZiAocHJlRG90U3RhdGUgIT09IDEpXG4gICAgICAgICAgICBwcmVEb3RTdGF0ZSA9IDE7XG4gICAgICB9IGVsc2UgaWYgKHN0YXJ0RG90ICE9PSAtMSkge1xuICAgICAgICAvLyBXZSBzYXcgYSBub24tZG90IGFuZCBub24tcGF0aCBzZXBhcmF0b3IgYmVmb3JlIG91ciBkb3QsIHNvIHdlIHNob3VsZFxuICAgICAgICAvLyBoYXZlIGEgZ29vZCBjaGFuY2UgYXQgaGF2aW5nIGEgbm9uLWVtcHR5IGV4dGVuc2lvblxuICAgICAgICBwcmVEb3RTdGF0ZSA9IC0xO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdGFydERvdCA9PT0gLTEgfHwgZW5kID09PSAtMSB8fFxuICAgICAgICAvLyBXZSBzYXcgYSBub24tZG90IGNoYXJhY3RlciBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIGRvdFxuICAgICAgICBwcmVEb3RTdGF0ZSA9PT0gMCB8fFxuICAgICAgICAvLyBUaGUgKHJpZ2h0LW1vc3QpIHRyaW1tZWQgcGF0aCBjb21wb25lbnQgaXMgZXhhY3RseSAnLi4nXG4gICAgICAgIHByZURvdFN0YXRlID09PSAxICYmIHN0YXJ0RG90ID09PSBlbmQgLSAxICYmIHN0YXJ0RG90ID09PSBzdGFydFBhcnQgKyAxKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiBwYXRoLnNsaWNlKHN0YXJ0RG90LCBlbmQpO1xuICB9LFxuXG4gIGZvcm1hdDogZnVuY3Rpb24gZm9ybWF0KHBhdGhPYmplY3QpIHtcbiAgICBpZiAocGF0aE9iamVjdCA9PT0gbnVsbCB8fCB0eXBlb2YgcGF0aE9iamVjdCAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBcInBhdGhPYmplY3RcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgT2JqZWN0LiBSZWNlaXZlZCB0eXBlICcgKyB0eXBlb2YgcGF0aE9iamVjdCk7XG4gICAgfVxuICAgIHJldHVybiBfZm9ybWF0KCcvJywgcGF0aE9iamVjdCk7XG4gIH0sXG5cbiAgcGFyc2U6IGZ1bmN0aW9uIHBhcnNlKHBhdGgpIHtcbiAgICBhc3NlcnRQYXRoKHBhdGgpO1xuXG4gICAgdmFyIHJldCA9IHsgcm9vdDogJycsIGRpcjogJycsIGJhc2U6ICcnLCBleHQ6ICcnLCBuYW1lOiAnJyB9O1xuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHJldDtcbiAgICB2YXIgY29kZSA9IHBhdGguY2hhckNvZGVBdCgwKTtcbiAgICB2YXIgaXNBYnNvbHV0ZSA9IGNvZGUgPT09IDQ3IC8qLyovO1xuICAgIHZhciBzdGFydDtcbiAgICBpZiAoaXNBYnNvbHV0ZSkge1xuICAgICAgcmV0LnJvb3QgPSAnLyc7XG4gICAgICBzdGFydCA9IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgdmFyIHN0YXJ0RG90ID0gLTE7XG4gICAgdmFyIHN0YXJ0UGFydCA9IDA7XG4gICAgdmFyIGVuZCA9IC0xO1xuICAgIHZhciBtYXRjaGVkU2xhc2ggPSB0cnVlO1xuICAgIHZhciBpID0gcGF0aC5sZW5ndGggLSAxO1xuXG4gICAgLy8gVHJhY2sgdGhlIHN0YXRlIG9mIGNoYXJhY3RlcnMgKGlmIGFueSkgd2Ugc2VlIGJlZm9yZSBvdXIgZmlyc3QgZG90IGFuZFxuICAgIC8vIGFmdGVyIGFueSBwYXRoIHNlcGFyYXRvciB3ZSBmaW5kXG4gICAgdmFyIHByZURvdFN0YXRlID0gMDtcblxuICAgIC8vIEdldCBub24tZGlyIGluZm9cbiAgICBmb3IgKDsgaSA+PSBzdGFydDsgLS1pKSB7XG4gICAgICBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcbiAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcbiAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xuICAgICAgICAgICAgc3RhcnRQYXJ0ID0gaSArIDE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIGlmIChlbmQgPT09IC0xKSB7XG4gICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCBtYXJrIHRoaXMgYXMgdGhlIGVuZCBvZiBvdXJcbiAgICAgICAgLy8gZXh0ZW5zaW9uXG4gICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xuICAgICAgICBlbmQgPSBpICsgMTtcbiAgICAgIH1cbiAgICAgIGlmIChjb2RlID09PSA0NiAvKi4qLykge1xuICAgICAgICAgIC8vIElmIHRoaXMgaXMgb3VyIGZpcnN0IGRvdCwgbWFyayBpdCBhcyB0aGUgc3RhcnQgb2Ygb3VyIGV4dGVuc2lvblxuICAgICAgICAgIGlmIChzdGFydERvdCA9PT0gLTEpIHN0YXJ0RG90ID0gaTtlbHNlIGlmIChwcmVEb3RTdGF0ZSAhPT0gMSkgcHJlRG90U3RhdGUgPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXJ0RG90ICE9PSAtMSkge1xuICAgICAgICAvLyBXZSBzYXcgYSBub24tZG90IGFuZCBub24tcGF0aCBzZXBhcmF0b3IgYmVmb3JlIG91ciBkb3QsIHNvIHdlIHNob3VsZFxuICAgICAgICAvLyBoYXZlIGEgZ29vZCBjaGFuY2UgYXQgaGF2aW5nIGEgbm9uLWVtcHR5IGV4dGVuc2lvblxuICAgICAgICBwcmVEb3RTdGF0ZSA9IC0xO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdGFydERvdCA9PT0gLTEgfHwgZW5kID09PSAtMSB8fFxuICAgIC8vIFdlIHNhdyBhIG5vbi1kb3QgY2hhcmFjdGVyIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgZG90XG4gICAgcHJlRG90U3RhdGUgPT09IDAgfHxcbiAgICAvLyBUaGUgKHJpZ2h0LW1vc3QpIHRyaW1tZWQgcGF0aCBjb21wb25lbnQgaXMgZXhhY3RseSAnLi4nXG4gICAgcHJlRG90U3RhdGUgPT09IDEgJiYgc3RhcnREb3QgPT09IGVuZCAtIDEgJiYgc3RhcnREb3QgPT09IHN0YXJ0UGFydCArIDEpIHtcbiAgICAgIGlmIChlbmQgIT09IC0xKSB7XG4gICAgICAgIGlmIChzdGFydFBhcnQgPT09IDAgJiYgaXNBYnNvbHV0ZSkgcmV0LmJhc2UgPSByZXQubmFtZSA9IHBhdGguc2xpY2UoMSwgZW5kKTtlbHNlIHJldC5iYXNlID0gcmV0Lm5hbWUgPSBwYXRoLnNsaWNlKHN0YXJ0UGFydCwgZW5kKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHN0YXJ0UGFydCA9PT0gMCAmJiBpc0Fic29sdXRlKSB7XG4gICAgICAgIHJldC5uYW1lID0gcGF0aC5zbGljZSgxLCBzdGFydERvdCk7XG4gICAgICAgIHJldC5iYXNlID0gcGF0aC5zbGljZSgxLCBlbmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0Lm5hbWUgPSBwYXRoLnNsaWNlKHN0YXJ0UGFydCwgc3RhcnREb3QpO1xuICAgICAgICByZXQuYmFzZSA9IHBhdGguc2xpY2Uoc3RhcnRQYXJ0LCBlbmQpO1xuICAgICAgfVxuICAgICAgcmV0LmV4dCA9IHBhdGguc2xpY2Uoc3RhcnREb3QsIGVuZCk7XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0UGFydCA+IDApIHJldC5kaXIgPSBwYXRoLnNsaWNlKDAsIHN0YXJ0UGFydCAtIDEpO2Vsc2UgaWYgKGlzQWJzb2x1dGUpIHJldC5kaXIgPSAnLyc7XG5cbiAgICByZXR1cm4gcmV0O1xuICB9LFxuXG4gIHNlcDogJy8nLFxuICBkZWxpbWl0ZXI6ICc6JyxcbiAgd2luMzI6IG51bGwsXG4gIHBvc2l4OiBudWxsXG59O1xuXG5wb3NpeC5wb3NpeCA9IHBvc2l4O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBvc2l4O1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsImZ1bmN0aW9uIGdldEh1bWFuUGVyaW9kICggdGltZSApIHtcclxuXHJcbiAgICB2YXIgc2Vjb25kID0gMTAwMFxyXG4gICAgdmFyIG1pbnV0ZSA9IDYwMDAwXHJcbiAgICB2YXIgaG91ciA9IDM2MDAwMDBcclxuICAgIHZhciBkYXkgPSA4NjQwMDAwMFxyXG5cclxuICAgIHZhciByZXN1bHRUaW1lID0gdGltZVxyXG4gICAgdmFyIGQsIGgsIG0sIHNcclxuICAgIHZhciByZXN1bHQgPSAnJ1xyXG5cclxuICAgIGQgPSBNYXRoLmZsb29yKHJlc3VsdFRpbWUgLyBkYXkpXHJcbiAgICBpZiAoZCA+IDApIHtcclxuICAgICAgICByZXN1bHRUaW1lID0gcmVzdWx0VGltZSAlIGRheVxyXG4gICAgfVxyXG4gICAgaCA9IE1hdGguZmxvb3IocmVzdWx0VGltZSAvIGhvdXIpXHJcbiAgICBpZiAoaCA+IDApIHtcclxuICAgICAgICByZXN1bHRUaW1lID0gcmVzdWx0VGltZSAlIGhvdXJcclxuICAgIH1cclxuICAgIG0gPSBNYXRoLmZsb29yKHJlc3VsdFRpbWUgLyBtaW51dGUpXHJcbiAgICBpZiAobSA+IDApIHtcclxuICAgICAgICByZXN1bHRUaW1lID0gcmVzdWx0VGltZSAlIG1pbnV0ZVxyXG4gICAgfVxyXG4gICAgcyA9IE1hdGguZmxvb3IocmVzdWx0VGltZSAvIHNlY29uZClcclxuXHJcbiAgICBpZiAoZCA+IDApIHtcclxuICAgICAgICByZXN1bHQgKz0gZCArICdkICdcclxuICAgIH1cclxuICAgIGlmIChoID4gMCkge1xyXG4gICAgICAgIHJlc3VsdCArPSBoICsgJ2ggJ1xyXG4gICAgfVxyXG4gICAgaWYgKG0gPiAwKSB7XHJcbiAgICAgICAgcmVzdWx0ICs9IG0gKyAnbSAnXHJcbiAgICB9XHJcblxyXG4gICAgcmVzdWx0ICs9IHMgKyAncydcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEh1bWFuQnl0ZXMgKGJ5dGVzLCBwcmVjaXNpb24pIHtcclxuICAgIC8vY29uc29sZS5sb2coJ2J5dGVzJywgYnl0ZXMpXHJcblxyXG4gICAgdmFyIGtpbG9ieXRlID0gMTAyNFxyXG4gICAgdmFyIG1lZ2FieXRlID0ga2lsb2J5dGUgKiAxMDI0XHJcbiAgICB2YXIgZ2lnYWJ5dGUgPSBtZWdhYnl0ZSAqIDEwMjRcclxuICAgIHZhciB0ZXJhYnl0ZSA9IGdpZ2FieXRlICogMTAyNFxyXG5cclxuICAgIGlmICgoYnl0ZXMgPj0gMCkgJiZcclxuICAgICAgICAoYnl0ZXMgPCBraWxvYnl0ZSkpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIGJ5dGVzICsgJyBCJ1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoKGJ5dGVzID49IGtpbG9ieXRlKSAmJlxyXG4gICAgICAgIChieXRlcyA8IG1lZ2FieXRlKSkge1xyXG5cclxuICAgICAgICByZXR1cm4gKGJ5dGVzIC8ga2lsb2J5dGUpLnRvRml4ZWQocHJlY2lzaW9uKSArICcgS0InXHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICgoYnl0ZXMgPj0gbWVnYWJ5dGUpICYmXHJcbiAgICAgICAgKGJ5dGVzIDwgZ2lnYWJ5dGUpKSB7XHJcblxyXG4gICAgICAgIHJldHVybiAoYnl0ZXMgLyBtZWdhYnl0ZSkudG9GaXhlZChwcmVjaXNpb24pICsgJyBNQidcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKChieXRlcyA+PSBnaWdhYnl0ZSkgJiZcclxuICAgICAgICAoYnl0ZXMgPCB0ZXJhYnl0ZSkpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIChieXRlcyAvIGdpZ2FieXRlKS50b0ZpeGVkKHByZWNpc2lvbikgKyAnIEdCJ1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoYnl0ZXMgPj0gdGVyYWJ5dGUpIHtcclxuICAgICAgICByZXR1cm4gKGJ5dGVzIC8gdGVyYWJ5dGUpLnRvRml4ZWQocHJlY2lzaW9uKSArICcgVEInXHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gYnl0ZXMgKyAnIEInXHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxpc3RGb3JtYXQgKCB0eXBlLCB2YWx1ZSApIHtcclxuXHJcbiAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICBjYXNlICdzY3JpcHQnOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgPyBwYXRoLmJhc2VuYW1lKHZhbHVlKSA6ICdOL0MnXHJcbiAgICAgICAgY2FzZSAnbWVtb3J5JzpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID8gZ2V0SHVtYW5CeXRlcyh2YWx1ZSkgOiAnTi9DJ1xyXG4gICAgICAgIGNhc2UgJ3VwdGltZSc6XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IDAgPyBnZXRIdW1hblBlcmlvZCh2YWx1ZSkgOiAnTi9DJ1xyXG4gICAgICAgIGNhc2UgJ3BpZCc6XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSB8fCAnTi9DJ1xyXG4gICAgICAgIGNhc2UgJ2hvc3QnOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgPyB2YWx1ZS5yZXBsYWNlKCdodHRwOi8vJywnJyk6ICdOL0MnXHJcbiAgICAgICAgY2FzZSAnc3RhdHVzJzpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09ICd1cCcgPyBcInVwXCIgOiBcImRvd25cIlxyXG4gICAgICAgIGNhc2UgJ2VuYWJsZWQnOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgPyBcInllc1wiIDogXCJub1wiXHJcbiAgICAgICAgY2FzZSAncG9ydCc6XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSB8fCAnTi9DJ1xyXG4gICAgICAgIGNhc2UgJ2RhdGUnOlxyXG4gICAgICAgICAgICByZXR1cm4gKG5ldyBEYXRlKCt2YWx1ZSAqIDEwMDApKS50b1N0cmluZygpXHJcbiAgICAgICAgY2FzZSAncnVuJzpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlICE9ICc6JyA/IHZhbHVlIDogJ04vQydcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVcclxuICAgIH1cclxuICAgIHJldHVybiAnJ1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVUYWJsZShoZWFkaW5ncywgY29udGVudEVsZW1lbnRzLCBob3dUb1BhcnNlKSB7XHJcbiAgICBsZXQgdGFibGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuICAgIHRhYmxlRWxlbWVudC5pZCA9ICdsaXN0VGFibGUnXHJcbiAgICB0YWJsZUVsZW1lbnQuY2xhc3NOYW1lID0gJ2NlbnRlcmVkJ1xyXG4gICAgbGV0IHRIZWFkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRoZWFkXCIpXHJcbiAgICBsZXQgdHJIZWFkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRyXCIpXHJcbiAgICBoZWFkaW5ncy5mb3JFYWNoKGVsZW0gPT4ge1xyXG4gICAgICAgIGxldCB0aEhlYWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGhcIilcclxuICAgICAgICB0aEhlYWQuaW5uZXJIVE1MID0gZWxlbVxyXG4gICAgICAgIHRySGVhZC5hcHBlbmQodGhIZWFkKVxyXG4gICAgfSlcclxuICAgIHRIZWFkLmFwcGVuZCh0ckhlYWQpXHJcbiAgICB0YWJsZUVsZW1lbnQuYXBwZW5kKHRIZWFkKVxyXG5cclxuICAgIGxldCB0Qm9keSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0Ym9keVwiKVxyXG4gICAgY29udGVudEVsZW1lbnRzLmZvckVhY2goY29udEVsZW0gPT4ge1xyXG4gICAgICAgIGxldCB0ciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0clwiKVxyXG4gICAgICAgIGxldCBpbmRleCA9IDBcclxuICAgICAgICBob3dUb1BhcnNlWzBdLmZvckVhY2goZWxlbT0+e1xyXG4gICAgICAgICAgICBsZXQgdGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGRcIilcclxuICAgICAgICAgICAgdGQuaW5uZXJIVE1MID0gbGlzdEZvcm1hdChob3dUb1BhcnNlWzFdW2luZGV4XSxjb250RWxlbVtlbGVtXSlcclxuICAgICAgICAgICAgaW5kZXgrK1xyXG4gICAgICAgICAgICB0ci5hcHBlbmQodGQpXHJcbiAgICAgICAgfSlcclxuICAgICAgICB0Qm9keS5hcHBlbmQodHIpXHJcbiAgICB9KVxyXG4gICAgdGFibGVFbGVtZW50LmFwcGVuZCh0Qm9keSlcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVudFwiKS5hcHBlbmRDaGlsZCh0YWJsZUVsZW1lbnQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVDYW52YXMoaWQsd2lkdGgsaGVpZ2h0KXtcclxuICAgIHZhciBpbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgIGlucHV0RWxlbWVudC5pZCA9IGlkXHJcbiAgICBpbnB1dEVsZW1lbnQud2lkdGggPSAod2lkdGghPT11bmRlZmluZWQpPyB3aWR0aDo2MDBcclxuICAgIGlucHV0RWxlbWVudC5oZWlnaHQgPSAoaGVpZ2h0IT09dW5kZWZpbmVkKT8gaGVpZ2h0OjQwMFxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW50XCIpLmFwcGVuZENoaWxkKGlucHV0RWxlbWVudCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUxpbmVDaGFydChjYW52YXMsbGFiZWwsdmVydExhYmVsKXtcclxuICAgIHJldHVybiBuZXcgQ2hhcnQoY2FudmFzLCB7XHJcbiAgICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICAgIGxhYmVsOmxhYmVsLFxyXG4gICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgbGFiZWxzOiBbXCIwc1wiXSxcclxuICAgICAgICAgICAgZGF0YXNldHM6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IGZhbHNlLFxyXG5cclxuICAgICAgICAgICAgc2NhbGVzOiB7XHJcbiAgICAgICAgICAgICAgICB4QXhlczogW3tcclxuICAgICAgICAgICAgICAgICAgICBzY2FsZUxhYmVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU3RyaW5nOiAn0JLRgNC10LzRjydcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgICAgIHlBeGVzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlTGFiZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHJpbmc6IHZlcnRMYWJlbFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG5tb2R1bGUuZXhwb3J0cy5jcmVhdGVMaW5lQ2hhcnQgPSBjcmVhdGVMaW5lQ2hhcnRcclxubW9kdWxlLmV4cG9ydHMuY3JlYXRlVGFibGUgPSBjcmVhdGVUYWJsZVxyXG5tb2R1bGUuZXhwb3J0cy5jcmVhdGVDYW52YXMgPSBjcmVhdGVDYW52YXNcclxubW9kdWxlLmV4cG9ydHMuZ2V0SHVtYW5QZXJpb2QgPSBnZXRIdW1hblBlcmlvZCIsInZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpXHJcbmxldCB1dGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKVxyXG52YXIgaXNNb25pdD1mYWxzZVxyXG52YXIgbGluZUNoYXJ0Q1BVO1xyXG52YXIgbGluZUNoYXJ0TWVtb3J5O1xyXG52YXIgdWlkXHJcblxyXG5mdW5jdGlvbiBzZXRVc2VySWQodXNlcmlkKXtcclxuICAgIHVpZCA9IHVzZXJpZFxyXG59XHJcblxyXG5mdW5jdGlvbiBDbGVhclNjcmVlbihtb25pdG9yaW5nLGhlYWRlcil7XHJcbiAgICAkKCcjY29udGVudCcpLmVtcHR5KClcclxuICAgIGlmICh0aW1lcklkIT1udWxsKXtcclxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVySWQpXHJcbiAgICB9XHJcbiAgICBpc01vbml0ID0gbW9uaXRvcmluZ1xyXG4gICAgaWYoaGVhZGVyIT09dW5kZWZpbmVkICYmIHR5cGVvZihoZWFkZXIpPT09XCJzdHJpbmdcIil7XHJcbiAgICAgICAgJCgnI0hlYWRlcicpLmh0bWwoaGVhZGVyKVxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRMaXN0IChpc0ltYWdlTGlzdCkge1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6ICcvYXBwcy9saXN0JyxcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBkYXRhOnt1aWQ6dWlkLCBpbWFnZWxpc3Q6aXNJbWFnZUxpc3R9LFxyXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICBsZXQgY29udGVudEVsZW1lbnRzID0gSlNPTi5wYXJzZShyZXNwb25zZSlbJ2RhdGEnXVxyXG4gICAgICAgICAgICBpZiAoaXNJbWFnZUxpc3QpIHtcclxuICAgICAgICAgICAgICAgIENsZWFyU2NyZWVuKGZhbHNlLCBcItCh0L/QuNGB0L7QuiDRgdC90LjQvNC60L7QslwiKVxyXG4gICAgICAgICAgICAgICAgbGV0IGhlYWRpbmdzID0gWyfQndCw0LfQstCw0L3QuNC1INGB0L3QuNC80LrQsCcsICfQktC10YDRgdC40Y8nLCAn0KDQsNC30LzQtdGAJywgJ9Ch0L7Qt9C00LDQvSddXHJcbiAgICAgICAgICAgICAgICBsZXQgaG93VG9QYXJzZSA9IFtbJ25hbWUnLCAndmVyc2lvbicsICdzaXplJywgJ2NyZWF0ZWQnXSwgWycnLCAnJywgJ21lbW9yeScsICdkYXRlJ11dXHJcbiAgICAgICAgICAgICAgICB1dGlscy5jcmVhdGVUYWJsZShoZWFkaW5ncywgY29udGVudEVsZW1lbnRzLCBob3dUb1BhcnNlKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgQ2xlYXJTY3JlZW4oZmFsc2UsIFwi0KHQv9C40YHQvtC6INC60L7QvdGC0LXQudC90LXRgNC+0LJcIilcclxuICAgICAgICAgICAgICAgIGxldCBoZWFkaW5ncyA9IFsn0JjQvNGPINC60L7QvdGC0LXQudC90LXRgNCwJywgJ9CY0LzRjyDRgdC90LjQvNC60LAnLCAn0KHRgtCw0YLRg9GBJywgJ9Cf0YPQsdC70LjRh9C90YvQuSDQv9C+0YDRgicsJ9Cf0YDQuNCy0LDRgtC90YvQuSDQv9C+0YDRgicsJ9Ch0L7Qt9C00LDQvSddXHJcbiAgICAgICAgICAgICAgICBsZXQgaG93VG9QYXJzZSA9IFtbJ25hbWUnLCAnaW1hZ2UnLCAnc3RhdHVzJywgJ3B1YmxpY1BvcnQnLCdwcml2YXRlUG9ydCcsJ2NyZWF0ZWQnXSxcclxuICAgICAgICAgICAgICAgICAgICBbJycsICcnLCcnLCcnLCcnLCdkYXRlJ11dXHJcbiAgICAgICAgICAgICAgICB1dGlscy5jcmVhdGVUYWJsZShoZWFkaW5ncywgY29udGVudEVsZW1lbnRzLCBob3dUb1BhcnNlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZldGNoRGF0YShjb250YWluZXJzSWQgKSB7XHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogJy9hcHBzL21vbml0JyxcclxuICAgICAgICBtZXRob2Q6ICAgJ1BPU1QnLFxyXG4gICAgICAgIGRhdGE6IHtjb250YWluZXJzSWQ6Y29udGFpbmVyc0lkfSxcclxuICAgICAgICAvLyAgZGF0YVR5cGU6ICdqc29uJyxcclxuICAgICAgICBzdWNjZXNzOiAgZnVuY3Rpb24ocmF3RGF0YSkge1xyXG4gICAgICAgICAgICBpZihpc01vbml0KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UocmF3RGF0YSlbJ2RhdGEnXVxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmVDaGFydENQVS5kYXRhLmRhdGFzZXRzW2ldLmRhdGEucHVzaChcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogdXRpbHMuZ2V0SHVtYW5QZXJpb2QobGluZUNoYXJ0Q1BVLmRhdGEubGFiZWxzLmxlbmd0aCAqIDIwMDApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogZGF0YVtpXVsnY3B1J11cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICBsaW5lQ2hhcnRNZW1vcnkuZGF0YS5kYXRhc2V0c1tpXS5kYXRhLnB1c2goXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IHV0aWxzLmdldEh1bWFuUGVyaW9kKGxpbmVDaGFydE1lbW9yeS5kYXRhLmxhYmVscy5sZW5ndGggKiAyMDAwKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGRhdGFbaV1bJ21lbSddXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsaW5lQ2hhcnRDUFUuZGF0YS5sYWJlbHMucHVzaCh1dGlscy5nZXRIdW1hblBlcmlvZChsaW5lQ2hhcnRDUFUuZGF0YS5sYWJlbHMubGVuZ3RoICogMjAwMCkpXHJcbiAgICAgICAgICAgICAgICBsaW5lQ2hhcnRNZW1vcnkuZGF0YS5sYWJlbHMucHVzaCh1dGlscy5nZXRIdW1hblBlcmlvZChsaW5lQ2hhcnRNZW1vcnkuZGF0YS5sYWJlbHMubGVuZ3RoICogMjAwMCkpXHJcbiAgICAgICAgICAgICAgICBsaW5lQ2hhcnRDUFUudXBkYXRlKClcclxuICAgICAgICAgICAgICAgIGxpbmVDaGFydE1lbW9yeS51cGRhdGUoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGVycm9yKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxudmFyIHRpbWVySWQ7XHJcblxyXG5mdW5jdGlvbiBnZXRNb25pdCgpe1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6ICcvYXBwcy9saXN0JyxcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBkYXRhOnt1aWQ6dWlkLCBpbWFnZWxpc3Q6ZmFsc2V9LFxyXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgIGxldCBjb250YWluZXJzSWQgPSBKU09OLnBhcnNlKHJlc3BvbnNlKVsnZGF0YSddLm1hcChlbGVtID0+IGVsZW0uSWQpXHJcblxyXG4gICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgdXJsOiAnL2FwcHMvbW9uaXQnLFxyXG4gICAgICAgICAgICAgICAgZGF0YToge2NvbnRhaW5lcnNJZDpjb250YWluZXJzSWR9LFxyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBDbGVhclNjcmVlbih0cnVlLFwi0JzQvtC90LjRgtC+0YDQuNC90LMg0L/RgNC40LvQvtC20LXQvdC40LlcIilcclxuICAgICAgICAgICAgICAgICAgICB1dGlscy5jcmVhdGVDYW52YXMoJ0NhbnZhc0NQVScpXHJcbiAgICAgICAgICAgICAgICAgICAgdXRpbHMuY3JlYXRlQ2FudmFzKCdDYW52YXNNZW1vcnknKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihsaW5lQ2hhcnRDUFUhPW51bGwgJiBsaW5lQ2hhcnRNZW1vcnkhPW51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZUNoYXJ0Q1BVLmNsZWFyKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZUNoYXJ0TWVtb3J5LmNsZWFyKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZUNoYXJ0Q1BVLmRlc3Ryb3koKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lQ2hhcnRNZW1vcnkuZGVzdHJveSgpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIENhbnZhc0NQVSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiQ2FudmFzQ1BVXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBDYW52YXNNZW1vcnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIkNhbnZhc01lbW9yeVwiKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmVDaGFydENQVSA9IHV0aWxzLmNyZWF0ZUxpbmVDaGFydChDYW52YXNDUFUsJ0NQVScsJ9CY0YHQv9C+0LvRjNC30L7QstCw0L3QuNC1IENQVSwgJScpXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmVDaGFydE1lbW9yeSA9IHV0aWxzLmNyZWF0ZUxpbmVDaGFydChDYW52YXNNZW1vcnksJ01lbW9yeScsJ9Cf0LDQvNGP0YLRjCwg0LHQsNC50YLRiycpXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbG9ycyA9ICBbJ3JnYmEoMjU1LDk5LDEzMiwwLjYpJywgJ3JnYmEoMjU1LDk5LDEzMiwwLjYpJywgJ3JnYmEoNTQsIDE2MiwgMjM1LCAwLjYpJywgJ3JnYmEoMjU1LCAyMDYsIDg2LCAwLjYpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3JnYmEoNzUsIDE5MiwgMTkyLCAwLjYpJywgJ3JnYmEoMTUzLCAxMDIsIDI1NSwgMC42KScsICdyZ2JhKDI1NSwgMTU5LCA2NCwgMC42KScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdyZ2JhKDI1NSwgOTksIDEzMiwgMC42KScsICdyZ2JhKDU0LCAxNjIsIDIzNSwgMC42KScsICdyZ2JhKDI1NSwgMjA2LCA4NiwgMC42KScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdyZ2JhKDc1LCAxOTIsIDE5MiwgMC42KScsICdyZ2JhKDE1MywgMTAyLCAyNTUsIDAuNiknXHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UocmVzcG9uc2UpWydkYXRhJ10uZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZUNoYXJ0Q1BVLmRhdGEuZGF0YXNldHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogZWxlbWVudC5uYW1lKycoUElEOicrZWxlbWVudC5waWQrJyknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogW2VsZW1lbnQuY3B1XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBjb2xvcnNbaV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogY29sb3JzW2ldXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVDaGFydE1lbW9yeS5kYXRhLmRhdGFzZXRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICBlbGVtZW50Lm5hbWUrJyhQSUQ6JytlbGVtZW50LnBpZCsnKScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBbZWxlbWVudC5tZW1dLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGNvbG9yc1tpXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBjb2xvcnNbaV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSA+IGNvbG9ycy5sZW5ndGggLSAxID8gaSA9IDAgOiBpKytcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmVDaGFydENQVS51cGRhdGUoKVxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmVDaGFydE1lbW9yeS51cGRhdGUoKVxyXG4gICAgICAgICAgICAgICAgICAgIHRpbWVySWQgPSBzZXRJbnRlcnZhbChmZXRjaERhdGEsIDIwMDAsIGNvbnRhaW5lcnNJZClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBzdGFydFN0b3AoKXtcclxuICAgICQuYWpheCh7XHJcbiAgICAgICAgdXJsOiAnL2FwcHMvbGlzdCcsXHJcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgZGF0YTp7dWlkOnVpZCxpbWFnZWxpc3Q6ZmFsc2V9LFxyXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICBDbGVhclNjcmVlbihmYWxzZSxcItCX0LDQv9GD0YHQui/QntGB0YLQsNC90L7QstC60LAg0L/RgNC40LvQvtC20LXQvdC40LlcIilcclxuXHJcbiAgICAgICAgICAgIHZhciBpbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xyXG4gICAgICAgICAgICBpbnB1dEVsZW1lbnQuaWQgPSAnbGlzdE1hbmFnZSdcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW50XCIpLmFwcGVuZENoaWxkKGlucHV0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIHZhciBoNEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoNCcpO1xyXG4gICAgICAgICAgICBoNEVsZW1lbnQuaW5uZXJIVE1MID0gXCLQn9GA0LjQu9C+0LbQtdC90LjRjzpcIlxyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxpc3RNYW5hZ2VcIikuYXBwZW5kQ2hpbGQoaDRFbGVtZW50KTtcclxuXHJcbiAgICAgICAgICAgIEpTT04ucGFyc2UocmVzcG9uc2UpWydkYXRhJ10uZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciBsaUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xyXG4gICAgICAgICAgICAgICAgbGlFbGVtZW50LmNsYXNzTmFtZSA9IFwibW9uaXRcIlxyXG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XHJcbiAgICAgICAgICAgICAgICBsYWJlbEVsZW1lbnQuc3R5bGUgPSBcImZvbnQtc2l6ZTogbWVkaXVtXCJcclxuICAgICAgICAgICAgICAgIGxhYmVsRWxlbWVudC5pbm5lckhUTUwgPSBlbGVtZW50Lm5hbWUrJyhQSUQ6JytlbGVtZW50LnBpZCsnKSdcclxuICAgICAgICAgICAgICAgIHZhciBidXR0b25FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50LnR5cGUgPSBcInN1Ym1pdFwiXHJcbiAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50LmNsYXNzTmFtZT1cImJ0blwiXHJcbiAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50LmlubmVySFRNTD0oZWxlbWVudC5zdGF0dXMgPT0gJ3VwJyk/J9Ce0YHRgtCw0L3QvtCy0LjRgtGMJzon0JfQsNC/0YPRgdGC0LjRgtGMJztcclxuICAgICAgICAgICAgICAgIChlbGVtZW50LnN0YXR1cyA9PSAndXAnKT9cclxuICAgICAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgU3RvcEFwcChlbGVtZW50Lm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICA6XHJcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFN0YXJ0QXBwKGVsZW1lbnQubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIGxhYmVsRWxlbWVudC5hcHBlbmRDaGlsZChidXR0b25FbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgbGlFbGVtZW50LmFwcGVuZENoaWxkKGxhYmVsRWxlbWVudClcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGlzdE1hbmFnZVwiKS5hcHBlbmRDaGlsZChsaUVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIClcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG4gICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6ICcvYXBwcy9ncm91cHMnLFxyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIGRhdGE6e3VpZDp1aWR9LFxyXG4gICAgICAgIEpTT046IHRydWUsXHJcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gSlNPTi5wYXJzZShyZXNwb25zZSlbJ2RhdGEnXVxyXG4gICAgICAgICAgICBnZXRHcm91cHMoZGF0YSlcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gU3RhcnRBcHAoIG5hbWUgKXtcclxuICAgLy8gJCgnI2J1dHRvbkxhdW5jaCcpLnJlbW92ZSgpXHJcbiAgIC8vICQoIFwiI2xpc3RNYW5hZ2UgOmNoZWNrZWRcIiApLmVhY2goZnVuY3Rpb24gKCl7XHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiAnL2FwcC9zdGFydCcsXHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICBkYXRhOiB7YXBwOntuYW1lOiBuYW1lfX0sXHJcbiAgICAgICAgICAgIGpzb246IHRydWUsXHJcblxyXG4gICAgICAgIH0pXHJcbiAgICBzdGFydFN0b3AoKVxyXG4gICAgICAvLyAgY29uc29sZS5sb2codGhpcy52YWx1ZSlcclxuICAgLy8gfSlcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIFN0b3BBcHAoIG5hbWUgKXtcclxuICAgIC8vICQoJyNidXR0b25MYXVuY2gnKS5yZW1vdmUoKVxyXG4gICAgLy8gJCggXCIjbGlzdE1hbmFnZSA6Y2hlY2tlZFwiICkuZWFjaChmdW5jdGlvbiAoKXtcclxuICAgICQuYWpheCh7XHJcbiAgICAgICAgdXJsOiAnL2FwcC9zdG9wJyxcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBkYXRhOiB7YXBwOntuYW1lOiBuYW1lfX0sXHJcbiAgICAgICAganNvbjogdHJ1ZSxcclxuXHJcbiAgICB9KVxyXG4gICAgLy8gIGNvbnNvbGUubG9nKHRoaXMudmFsdWUpXHJcbiAgICAvLyB9KVxyXG4gICAgc3RhcnRTdG9wKClcclxufVxyXG5cclxudmFyIGpzb25maWxlZGF0YSA9IFwiXCJcclxuXHJcbmZ1bmN0aW9uIExvYWRTZXR0aW5ncyggZGF0YSApe1xyXG5cclxuICAgICQuYWpheCh7XHJcbiAgICAgICAgdXJsOiAnL2NvbmZpZy9sb2FkJyxcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuXHJcbiAgICAgICAgZGF0YToge2pzb25GaWxlOiB7ZGF0YTpkYXRhfSwgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ2NvbmZpZycsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogJydcclxuICAgICAgICAgICAgfX0sXHJcbiAgICAgICAganNvbjogdHJ1ZSxcclxuXHJcbiAgICB9KVxyXG5cclxuICAgIHN0YXJ0U3RvcCgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBnZXRBcHBUZW1wbGF0ZSAobmFtZSxncm91cCwgc2NyaXB0LCB3YXRjaCwgbG9nLCBob3N0LCBwb3J0LCBrZWVwLCBhdHRlbXB0ICkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpZDogJycsXHJcbiAgICAgICAgbmFtZTogbmFtZSB8fCAnJyxcclxuICAgICAgICBncm91cDogZ3JvdXAgfHwgJ21haW4nLFxyXG4gICAgICAgIHVpZDogJycsXHJcbiAgICAgICAgZ2lkOiAnJyxcclxuICAgICAgICBzY3JpcHQ6IHNjcmlwdCB8fCAnJyxcclxuICAgICAgICBlbnY6ICcnLFxyXG4gICAgICAgIHBhcmFtczogICcnLFxyXG4gICAgICAgIGNyZWF0ZWQ6IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxyXG4gICAgICAgIHN0YXJ0ZWQ6ICcnLFxyXG4gICAgICAgIHdhdGNoOiB7XHJcbiAgICAgICAgICAgIGVuYWJsZWQ6IHdhdGNoID8gdHJ1ZSA6IGZhbHNlLFxyXG4gICAgICAgICAgICBwYXRoOiB3YXRjaHx8ICcnLFxyXG4gICAgICAgICAgICBleGNsdWRlczogW10vL2NvbW1hbmRlci5leGNsdWRlID8gY29tbWFuZGVyLmV4Y2x1ZGUuc3BsaXQoJywnKSA6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aW1lcjogbnVsbCxcclxuICAgICAgICBzdG9wcGVkOiBmYWxzZSxcclxuICAgICAgICBhdHRlbXB0ZWQ6IGZhbHNlLFxyXG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgc3Rkb3V0OiBudWxsLFxyXG4gICAgICAgIGZpbGVzOiB7XHJcbiAgICAgICAgICAgIHBpZDogJycsLy8gY29tbWFuZGVyLnBpZCB8fCAnJyxcclxuICAgICAgICAgICAgbG9nOiBsb2cgfHwgJydcclxuICAgICAgICB9LFxyXG4gICAgICAgIGhvc3Q6IGhvc3QgfHwgJycsXHJcbiAgICAgICAgcG9ydDogcG9ydCB8fCAnJyxcclxuICAgICAgICBwaWQ6ICcnLFxyXG4gICAgICAgIGtlZXA6IGtlZXAsXHJcbiAgICAgICAgY3VyQXR0ZW1wdDogMCxcclxuICAgICAgICBhdHRlbXB0OiBhdHRlbXB0IHx8IDMsXHJcbiAgICAgICAgc3RhdHVzOiAnZG93bicsXHJcbiAgICAgICAgc3RhdHM6IHtcclxuICAgICAgICAgICAgdXB0aW1lOiAwLFxyXG4gICAgICAgICAgICBzdGFydGVkOiAwLFxyXG4gICAgICAgICAgICBjcmFzaGVkOiAwLFxyXG4gICAgICAgICAgICBzdG9wcGVkOiAwLFxyXG4gICAgICAgICAgICByZXN0YXJ0ZWQ6IDAsXHJcbiAgICAgICAgICAgIG1lbW9yeTogMCxcclxuICAgICAgICAgICAgY3B1OiAwXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBidWlsZEZvcm1BZGRFZGl0KCl7XHJcbiAgICB2YXIgZm9ybUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb3JtJyk7XHJcbiAgICBmb3JtRWxlbWVudC5jbGFzc05hbWUgPSBcImNvbCBzMTJcIlxyXG5cclxuICAgIGNvbnN0IG5hbWVmaWVsZCA9IFsnQXBwIG5hbWUnLCAnR3JvdXAgbmFtZScsICdTY3JpcHQgcGF0aCcsJ0hvc3QgbmFtZScsICdQb3J0JywgJ1dhdGNoIHBhdGgnLCAnTG9nIHBhdGgnXTtcclxuICAgIGNvbnN0IElEcyA9IFsnbmFtZScsJ2dyb3VwJywnc2NyaXB0JywnaG9zdCcsJ3BvcnQnLCd3YXRjaCcsJ2xvZyddXHJcbiAgICB2YXIgaSA9IDBcclxuICAgIG5hbWVmaWVsZC5mb3JFYWNoKGVsZW1lbnQgPT57XHJcbiAgICAgICAgdmFyIGRpdkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgIHZhciBpbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICAgIHZhciBsYWJlbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xyXG4gICAgICAgIGRpdkVsZW1lbnQuY2xhc3NOYW1lID0gXCJyb3dcIlxyXG4gICAgICAgIGlucHV0RWxlbWVudC5wbGFjZWhvbGRlciA9IGVsZW1lbnRcclxuICAgICAgICBpbnB1dEVsZW1lbnQuaWQgPSBJRHNbaV1cclxuICAgICAgICBsYWJlbEVsZW1lbnQuaW5uZXJIVE1MID0gZWxlbWVudFxyXG4gICAgICAgIGRpdkVsZW1lbnQuYXBwZW5kQ2hpbGQobGFiZWxFbGVtZW50KVxyXG4gICAgICAgIGRpdkVsZW1lbnQuYXBwZW5kQ2hpbGQoaW5wdXRFbGVtZW50KVxyXG4gICAgICAgIGZvcm1FbGVtZW50LmFwcGVuZENoaWxkKGRpdkVsZW1lbnQpXHJcbiAgICAgICAgaSsrXHJcbiAgICB9KTtcclxuICAgIHZhciBjaGVja2JveEtlZXBFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgIGNoZWNrYm94S2VlcEVsZW1lbnQuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcImNoZWNrYm94XCIpO1xyXG4gICAgY2hlY2tib3hLZWVwRWxlbWVudC5pZCA9IFwiY2hlY2tib3hLZWVwXCJcclxuXHJcbiAgICB2YXIgcEVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICB2YXIgbGFiZWxFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcclxuICAgIHZhciBzcGFuRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgIHNwYW5FbGVtLmlubmVySFRNTCA9IFwiS2VlcCBhbGl2ZSBhcHBcIlxyXG4gICAgbGFiZWxFbGVtLmFwcGVuZENoaWxkKGNoZWNrYm94S2VlcEVsZW1lbnQpO1xyXG4gICAgbGFiZWxFbGVtLmFwcGVuZENoaWxkKHNwYW5FbGVtKVxyXG4gICAgcEVsZW0uYXBwZW5kQ2hpbGQobGFiZWxFbGVtKVxyXG4gICAgZm9ybUVsZW1lbnQuYXBwZW5kQ2hpbGQocEVsZW0pXHJcblxyXG4gICAgdmFyIGRpdkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgdmFyIGlucHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICB2YXIgbGFiZWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcclxuICAgIGRpdkVsZW1lbnQuY2xhc3NOYW1lID0gXCJyb3dcIlxyXG4gICAgaW5wdXRFbGVtZW50LnBsYWNlaG9sZGVyID0gXCJBdHRlbXB0c1wiXHJcbiAgICBpbnB1dEVsZW1lbnQuaWQgPSBcImtlZXBjb3VudFwiXHJcbiAgICBsYWJlbEVsZW1lbnQuaW5uZXJIVE1MID0gXCJBdHRlbXB0c1wiXHJcbiAgICBkaXZFbGVtZW50LmFwcGVuZENoaWxkKGxhYmVsRWxlbWVudClcclxuICAgIGRpdkVsZW1lbnQuYXBwZW5kQ2hpbGQoaW5wdXRFbGVtZW50KVxyXG4gICAgZm9ybUVsZW1lbnQuYXBwZW5kQ2hpbGQoZGl2RWxlbWVudClcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVudFwiKS5hcHBlbmRDaGlsZChmb3JtRWxlbWVudCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEFkZChpc0ltYWdlKXtcclxuICAgICQoJyNjb250ZW50JykuZW1wdHkoKVxyXG4gICAgJCgnI0hlYWRlcicpLmh0bWwoXCLQlNC+0LHQsNCy0LvQtdC90LjQtSDQv9GA0LjQu9C+0LbQtdC90LjRj1wiKVxyXG4gICAgaWYgKHRpbWVySWQhPW51bGwpe1xyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXJJZClcclxuICAgIH1cclxuICAgIGJ1aWxkRm9ybUFkZEVkaXQoKVxyXG5cclxuXHJcbiAgICB2YXIgYnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgYnV0dG9uRWxlbWVudC50eXBlID0gXCJzdWJtaXRcIlxyXG4gICAgYnV0dG9uRWxlbWVudC5jbGFzc05hbWU9XCJidG5cIlxyXG4gICAgYnV0dG9uRWxlbWVudC5pbm5lckhUTUw9IFwi0JTQvtCx0LDQstC40YLRjFwiXHJcbiAgICBidXR0b25FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG5hbWUgPSAkKCcjbmFtZScpLnZhbCgpXHJcbiAgICAgICAgdmFyIGdyb3VwID0gJCgnI2dyb3VwJykudmFsKClcclxuICAgICAgICB2YXIgc2NyaXB0ID0gJCgnI3NjcmlwdCcpLnZhbCgpXHJcbiAgICAgICAgdmFyIHdhdGNoID0gJCgnI3dhdGNoJykudmFsKClcclxuICAgICAgICB2YXIgbG9nID0gJCgnI2xvZycpLnZhbCgpXHJcbiAgICAgICAgdmFyIGhvc3QgPSAkKCcjaG9zdCcpLnZhbCgpXHJcbiAgICAgICAgdmFyIHBvcnQgPSAkKCcjcG9ydCcpLnZhbCgpXHJcblxyXG4gICAgICAgIHZhciBrZWVwID0gJCgnI2NoZWNrYm94S2VlcCcpLmlzKCc6Y2hlY2tlZCcpXHJcbiAgICAgICAgdmFyIGF0dGVtcHQgPSBwYXJzZUludCgkKCcja2VlcGNvdW50JykudmFsKCkpXHJcbiAgICAgICAgdmFyIGFwcCA9IGdldEFwcFRlbXBsYXRlKG5hbWUsZ3JvdXAsc2NyaXB0LHdhdGNoLGxvZyxob3N0LHBvcnQsa2VlcCxhdHRlbXB0KVxyXG4gICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogJy9hcHBzJyxcclxuICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcclxuICAgICAgICAgICAgZGF0YToge2FwcDogYXBwLFxyXG4gICAgICAgICAgICAgICAgICAgIHVpZDp1aWR9LFxyXG4gICAgICAgICAgICBqc29uOiB0cnVlLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGdldExpc3QoKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pXHJcbiAgICB9KVxyXG4gIC8vICBmb3JtRWxlbWVudC5hcHBlbmRDaGlsZChidXR0b25FbGVtZW50KVxyXG5cclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoYnV0dG9uRWxlbWVudCk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFJvbGUoKXtcclxuICAgIHZhciByZXN1bHQ9ZmFsc2VcclxuICAgYXdhaXQgJC5hamF4KHtcclxuICAgICAgICB1cmw6ICcvcm9sZScsXHJcbiAgICAgICAgZGF0YToge3VpZDp1aWR9LFxyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICBpZiAoSlNPTi5wYXJzZShyZXNwb25zZSlbJ2RhdGEnXSA9PSBcImFkbWluXCIpe1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZVxyXG4gICAgICAgICAgICB9ZWxzZXtyZXN1bHQ9ZmFsc2V9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGVycm9yKXtcclxuICAgICAgICAgICAgaWYoZXJyb3IhPW51bGwpXHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFNob3dTZXR0aW5ncyggICl7XHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogJy9jb25maWcvZ2V0c2V0dGluZ3MnLFxyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIGRhdGE6IHt1aWQ6dWlkfSxcclxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgdmFyIHNldHRpbmdzID0gSlNPTi5wYXJzZShyZXNwb25zZSlbJ2RhdGEnXVswXVxyXG4gICAgICAgICAgICBDbGVhclNjcmVlbihmYWxzZSxcItCd0LDRgdGC0YDQvtC50LrQuFwiKVxyXG5cclxuICAgICAgICAgICAgdmFyIGZvcm1FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpO1xyXG4gICAgICAgICAgICBnZXRSb2xlKCkudGhlbih2YWx1ZT0+e1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGFiZWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbEVsZW1lbnQuaW5uZXJIVE1MID0gJ9CX0LDQs9GA0YPQt9C60LAg0YHQv9C40YHQutCwINC/0YDQuNC70L7QttC10L3QuNC5INC40LcganNvbjonXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHBFbGVtLmFwcGVuZENoaWxkKGxhYmVsRWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICBmb3JtRWxlbWVudC5hcHBlbmRDaGlsZChwRWxlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlucHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRFbGVtZW50LmNsYXNzTmFtZSA9IFwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0blwiXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRFbGVtZW50LnR5cGUgPSBcImZpbGVcIlxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0RWxlbWVudC5uYW1lID0gXCJhcHBzRmlsZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRFbGVtZW50LmFjY2VwdCA9IFwiLmpzb25cIlxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaWxlID0gdGhpcy5maWxlc1swXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkZXIub25sb2FkZW5kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganNvbmZpbGVkYXRhID0gcmVhZGVyLnJlc3VsdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzVGV4dChmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwRWxlbTIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcEVsZW0yLmFwcGVuZENoaWxkKGlucHV0RWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICBmb3JtRWxlbWVudC5hcHBlbmRDaGlsZChwRWxlbTIpO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJ1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50LnR5cGUgPSBcImJ1dHRvblwiXHJcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudC5jbGFzc05hbWUgPSBcImJ0blwiXHJcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudC5pbm5lckhUTUwgPSBcItCX0LDQs9GA0YPQt9C40YLRjFwiXHJcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIGNvbnNvbGUubG9nKFwiZmlsZU5hbWVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICQoXCJpbnB1dFtuYW1lPSdhcHBzRmlsZSddXCIpLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHZhciBmaWxlTmFtZSA9ICQodGhpcykudmFsKCkvLygpLnNwbGl0KCcvJykucG9wKCkuc3BsaXQoJ1xcXFwnKS5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25maWxlZGF0YSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMb2FkU2V0dGluZ3MoanNvbmZpbGVkYXRhKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBFbGVtMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgICAgICAgICAgICAgICAgICBwRWxlbTMuYXBwZW5kQ2hpbGQoYnV0dG9uRWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICBmb3JtRWxlbWVudC5hcHBlbmRDaGlsZChwRWxlbTMpXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXRoaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgcGF0aGlucHV0LnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJ0ZXh0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHBhdGhpbnB1dC5zZXRBdHRyaWJ1dGUoXCJwbGFjZWhvbGRlclwiLCBcItCS0LLQtdC00LjRgtC1INC/0YPRgtGMINC00LvRjyDRgdC+0YXRgNCw0L3QtdC90LjRj1wiKTtcclxuICAgICAgICAgICAgICAgICAgICBwYXRoaW5wdXQuaWQgPSBcInBhdGhJbnB1dFwiXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBFbGVtNCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgICAgICAgICAgICAgICAgICBwRWxlbTQuYXBwZW5kQ2hpbGQocGF0aGlucHV0KVxyXG4gICAgICAgICAgICAgICAgICAgIGZvcm1FbGVtZW50LmFwcGVuZENoaWxkKHBFbGVtNClcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJ1dHRvbkVsZW1lbnQyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudDIudHlwZSA9IFwiYnV0dG9uXCJcclxuICAgICAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50Mi5jbGFzc05hbWUgPSBcImJ0blwiXHJcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudDIuaW5uZXJIVE1MID0gXCLQodC+0YXRgNCw0L3QuNGC0YxcIlxyXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbkVsZW1lbnQyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiAnL2NvbmZpZy9zYXZlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtmaWxlOiQoJyNwYXRoSW5wdXQnKS52YWwoKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldExpc3QoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBFbGVtNSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgICAgICAgICAgICAgICAgICBwRWxlbTUuYXBwZW5kQ2hpbGQoYnV0dG9uRWxlbWVudDIpXHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybUVsZW1lbnQuYXBwZW5kQ2hpbGQocEVsZW01KVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoZm9ybUVsZW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgdmFyIGRpdkVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgICAgICB2YXIgZGl2RWxlbTIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXHJcblxyXG4gICAgICAgICAgICB2YXIgZW1haWxpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcclxuICAgICAgICAgICAgZW1haWxpbnB1dC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dFwiKTtcclxuICAgICAgICAgICAgZW1haWxpbnB1dC5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBzZXR0aW5ncy50b2VtYWlsKTtcclxuICAgICAgICAgICAgZW1haWxpbnB1dC5zZXRBdHRyaWJ1dGUoXCJwbGFjZWhvbGRlclwiLCBcIkVtYWlsIHRvIG1lc3NhZ2VzXCIpO1xyXG4gICAgICAgICAgICBlbWFpbGlucHV0LmlkID0gXCJlbWFpbElucHV0XCJcclxuICAgICAgICAgICAgZGl2RWxlbS5hcHBlbmRDaGlsZChlbWFpbGlucHV0KVxyXG4gICAgICAgICAgICBkaXZFbGVtLmNsYXNzTmFtZSA9IFwiaW5wdXQtZmllbGQgY29sIHM2XCJcclxuXHJcbiAgICAgICAgICAgIHZhciBidXR0b25FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgICAgIGJ1dHRvbkVsZW1lbnQudHlwZSA9IFwiYnV0dG9uXCJcclxuICAgICAgICAgICAgYnV0dG9uRWxlbWVudC5jbGFzc05hbWUgPSBcImJ0blwiXHJcbiAgICAgICAgICAgIGJ1dHRvbkVsZW1lbnQuaW5uZXJIVE1MID0gXCLQodC+0YXRgNCw0L3QuNGC0YxcIlxyXG4gICAgICAgICAgICBidXR0b25FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvY29uZmlnL3NldGVtYWlsJyxcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7ZW1haWw6JCgnI2VtYWlsSW5wdXQnKS52YWwoKSx1aWQ6dWlkfSxcclxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgU2hvd1NldHRpbmdzKClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgfSlcclxuXHJcblxyXG4gICAgICAgICAgICBkaXZFbGVtLmFwcGVuZENoaWxkKGJ1dHRvbkVsZW1lbnQpXHJcbiAgICAgICAgICAgIGRpdkVsZW0yLmNsYXNzTmFtZSA9IFwicm93XCJcclxuICAgICAgICAgICAgZGl2RWxlbTIuYXBwZW5kQ2hpbGQoZGl2RWxlbSlcclxuICAgICAgICAgICAgZm9ybUVsZW1lbnQuY2xhc3NOYW1lID0gXCJjb2wgczEyXCJcclxuICAgICAgICAgICAgZm9ybUVsZW1lbnQuYXBwZW5kQ2hpbGQoZGl2RWxlbTIpXHJcblxyXG4gICAgICAgICAgICB2YXIgY2hlY2tib3hFeGl0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgIHZhciBjaGVja2JveENsb3NlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgIHZhciBjaGVja2JveENyYXNoRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgIGNoZWNrYm94RXhpdEVsZW1lbnQuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcImNoZWNrYm94XCIpO1xyXG4gICAgICAgICAgICBjaGVja2JveENsb3NlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiY2hlY2tib3hcIik7XHJcbiAgICAgICAgICAgIGNoZWNrYm94Q3Jhc2hFbGVtZW50LnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJjaGVja2JveFwiKTtcclxuICAgICAgICAgICAgY2hlY2tib3hDbG9zZUVsZW1lbnQubmFtZSA9IFwiY2hlY2tib3hDbG9zZVwiXHJcbiAgICAgICAgICAgIGNoZWNrYm94RXhpdEVsZW1lbnQubmFtZSA9IFwiY2hlY2tib3hFeGl0XCJcclxuICAgICAgICAgICAgY2hlY2tib3hDcmFzaEVsZW1lbnQubmFtZSA9IFwiY2hlY2tib3hDcmFzaFwiXHJcbiAgICAgICAgICAgIGNoZWNrYm94Q2xvc2VFbGVtZW50LmNoZWNrZWQgPSBzZXR0aW5ncy5zZW50Y2xvc2VcclxuICAgICAgICAgICAgY2hlY2tib3hDcmFzaEVsZW1lbnQuY2hlY2tlZCA9IHNldHRpbmdzLnNlbnRjcmFzaFxyXG4gICAgICAgICAgICBjaGVja2JveEV4aXRFbGVtZW50LmNoZWNrZWQgPSBzZXR0aW5ncy5zZW50ZXhpdFxyXG5cclxuICAgICAgICAgICAgY2hlY2tib3hDbG9zZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCl7XHJcblxyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvY29uZmlnL2Nsb3Nlc2VuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge2ZsYWc6IHRoaXMuY2hlY2tlZCwgdWlkOnVpZH0sXHJcbiAgICAgICAgICAgICAgICAgICAganNvbjogdHJ1ZSxcclxuXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBjaGVja2JveEV4aXRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpe1xyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvY29uZmlnL2V4aXRzZW5kJyxcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7ZmxhZzogdGhpcy5jaGVja2VkLCB1aWQ6dWlkfSxcclxuICAgICAgICAgICAgICAgICAgICBqc29uOiB0cnVlLFxyXG5cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIGNoZWNrYm94Q3Jhc2hFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpe1xyXG5cclxuICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL2NvbmZpZy9jcmFzaHNlbmQnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtmbGFnOiB0aGlzLmNoZWNrZWQsIHVpZDp1aWR9LFxyXG4gICAgICAgICAgICAgICAgICAgIGpzb246IHRydWUsXHJcblxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAvLyBmb3JtRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcclxuICAgICAgICAgICAgdmFyIHBFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgICAgICB2YXIgbGFiZWxFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcclxuICAgICAgICAgICAgdmFyIHNwYW5FbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgICAgICBzcGFuRWxlbS5pbm5lckhUTUwgPSBcItCf0L7RgdGL0LvQsNGC0Ywg0YHQvtC+0LHRidC10L3QuNC1INC/0YDQuCDQt9Cw0LrRgNGL0YLQuNC4INC/0YDQuNC70L7QttC10L3QuNGPXCJcclxuICAgICAgICAgICAgbGFiZWxFbGVtLmFwcGVuZENoaWxkKGNoZWNrYm94Q2xvc2VFbGVtZW50KTtcclxuICAgICAgICAgICAgbGFiZWxFbGVtLmFwcGVuZENoaWxkKHNwYW5FbGVtKVxyXG4gICAgICAgICAgICBwRWxlbS5hcHBlbmRDaGlsZChsYWJlbEVsZW0pXHJcbiAgICAgICAgICAgIGZvcm1FbGVtZW50LmFwcGVuZENoaWxkKHBFbGVtKVxyXG4gICAgICAgICAgICB2YXIgcEVsZW0yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgICAgICB2YXIgbGFiZWxFbGVtMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XHJcbiAgICAgICAgICAgIHZhciBzcGFuRWxlbTIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgICAgIHNwYW5FbGVtMi5pbm5lckhUTUwgPSBcItCf0L7RgdGL0LvQsNGC0Ywg0YHQvtC+0LHRidC10L3QuNC1INC/0YDQuCDQstGL0YXQvtC00LUg0LjQtyDQv9GA0LjQu9C+0LbQtdC90LjRj1wiXHJcbiAgICAgICAgICAgIGxhYmVsRWxlbTIuYXBwZW5kQ2hpbGQoY2hlY2tib3hFeGl0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIGxhYmVsRWxlbTIuYXBwZW5kQ2hpbGQoc3BhbkVsZW0yKVxyXG4gICAgICAgICAgICBwRWxlbTIuYXBwZW5kQ2hpbGQobGFiZWxFbGVtMilcclxuICAgICAgICAgICAgZm9ybUVsZW1lbnQuYXBwZW5kQ2hpbGQocEVsZW0yKVxyXG4gICAgICAgICAgICB2YXIgcEVsZW0zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgICAgICB2YXIgbGFiZWxFbGVtMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XHJcbiAgICAgICAgICAgIHZhciBzcGFuRWxlbTMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgICAgIHNwYW5FbGVtMy5pbm5lckhUTUwgPSBcItCf0L7RgdGL0LvQsNGC0Ywg0YHQvtC+0LHRidC10L3QuNC1INC/0YDQuCDQsNCy0LDRgNC40LnQvdC+0Lwg0LfQsNCy0LXRgNGI0LXQvdC40LhcIlxyXG4gICAgICAgICAgICBsYWJlbEVsZW0zLmFwcGVuZENoaWxkKGNoZWNrYm94Q3Jhc2hFbGVtZW50KTtcclxuICAgICAgICAgICAgbGFiZWxFbGVtMy5hcHBlbmRDaGlsZChzcGFuRWxlbTMpXHJcbiAgICAgICAgICAgIHBFbGVtMy5hcHBlbmRDaGlsZChsYWJlbEVsZW0zKVxyXG4gICAgICAgICAgICBmb3JtRWxlbWVudC5hcHBlbmRDaGlsZChwRWxlbTMpXHJcblxyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoZm9ybUVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRHcm91cHMoZGF0YSl7XHJcbiAgICB2YXIgaDRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDQnKTtcclxuICAgIGg0RWxlbWVudC5pbm5lckhUTUwgPSBcItCT0YDRg9C/0L/RizpcIlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsaXN0TWFuYWdlXCIpLmFwcGVuZENoaWxkKGg0RWxlbWVudClcclxuICAgIGRhdGEuZm9yRWFjaChlbGVtPT57XHJcbiAgICAgICAgdmFyIGxpRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcbiAgICAgICAgbGlFbGVtZW50LmNsYXNzTmFtZSA9IFwiZ3JvdXBcIlxyXG5cclxuICAgICAgICB2YXIgbGFiZWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcclxuICAgICAgICBsYWJlbEVsZW1lbnQuaW5uZXJIVE1MID0gZWxlbVxyXG4gICAgICAgIGxhYmVsRWxlbWVudC5zdHlsZSA9IFwiZm9udC1zaXplOiBtZWRpdW1cIlxyXG4gICAgICAgIGxhYmVsRWxlbWVudC5pbm5lckhUTUwgPSBlbGVtXHJcbiAgICAgICAgdmFyIGJ1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgICBidXR0b25FbGVtZW50LnR5cGUgPSBcInN1Ym1pdFwiXHJcbiAgICAgICAgYnV0dG9uRWxlbWVudC5jbGFzc05hbWU9XCJidG5cIlxyXG4gICAgICAgIGJ1dHRvbkVsZW1lbnQuaW5uZXJIVE1MPSfQl9Cw0L/Rg9GB0YLQuNGC0YwnO1xyXG4gICAgICAgICAgICBidXR0b25FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL2FwcHMvc3RhcnQnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtvcHRpb25zOiBbe25hbWU6XCJncm91cFwiLCB2YWx1ZTplbGVtfSwge25hbWU6XCJ1aWRcIix2YWx1ZTp1aWR9XX0sXHJcbiAgICAgICAgICAgICAgICAgICAganNvbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRTdG9wKClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIHZhciBidXR0b25FbGVtZW50MiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIGJ1dHRvbkVsZW1lbnQyLnR5cGUgPSBcInN1Ym1pdFwiXHJcbiAgICAgICAgYnV0dG9uRWxlbWVudDIuY2xhc3NOYW1lPVwiYnRuXCJcclxuICAgICAgICBidXR0b25FbGVtZW50Mi5pbm5lckhUTUw9J9Ce0YHRgtCw0L3QvtCy0LjRgtGMJztcclxuICAgICAgICAgICAgYnV0dG9uRWxlbWVudDIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvYXBwcy9zdG9wJyxcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7b3B0aW9uczogW3tuYW1lOlwiZ3JvdXBcIiwgdmFsdWU6ZWxlbX0sIHtuYW1lOlwidWlkXCIsdmFsdWU6dWlkfV19LFxyXG4gICAgICAgICAgICAgICAgICAgIGpzb246IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0U3RvcCgpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICBsYWJlbEVsZW1lbnQuYXBwZW5kQ2hpbGQoYnV0dG9uRWxlbWVudClcclxuICAgICAgICBsYWJlbEVsZW1lbnQuYXBwZW5kQ2hpbGQoYnV0dG9uRWxlbWVudDIpXHJcbiAgICAgICAgbGlFbGVtZW50LmFwcGVuZENoaWxkKGxhYmVsRWxlbWVudClcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxpc3RNYW5hZ2VcIikuYXBwZW5kQ2hpbGQobGlFbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgIClcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RWRpdChpc0ltYWdlKXtcclxuICAgICQuYWpheCh7XHJcbiAgICAgICAgdXJsOiAnL2FwcHMvbGlzdCcsXHJcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgZGF0YTp7dWlkOnVpZCxpbWFnZWxpc3Q6aXNJbWFnZX0sXHJcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIENsZWFyU2NyZWVuKGZhbHNlLFwi0KDQtdC00LDQutGC0LjRgNC+0LLQsNC90LjQtSBcIisgKChpc0ltYWdlKT8gXCLRgdC90LjQvNC60L7QsjpcIjon0LrQvtC90YLQtdC50L3QtdGA0L7QsicpKVxyXG5cclxuICAgICAgICAgICAgdmFyIGlucHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XHJcbiAgICAgICAgICAgIGlucHV0RWxlbWVudC5pZCA9ICdsaXN0TWFuYWdlJ1xyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoaW5wdXRFbGVtZW50KTtcclxuICAgICAgICAgICAgdmFyIGg0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0Jyk7XHJcbiAgICAgICAgICAgIGg0RWxlbWVudC5pbm5lckhUTUwgPSAoaXNJbWFnZSk/IFwi0KHQvdC40LzQutC4OlwiOifQmtC+0L3RgtC10LnQvdC10YDRiydcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsaXN0TWFuYWdlXCIpLmFwcGVuZENoaWxkKGg0RWxlbWVudCk7XHJcblxyXG4gICAgICAgICAgICBKU09OLnBhcnNlKHJlc3BvbnNlKVsnZGF0YSddLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxpRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlFbGVtZW50LmNsYXNzTmFtZSA9IFwibW9uaXRcIlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsRWxlbWVudC5zdHlsZSA9IFwiZm9udC1zaXplOiBtZWRpdW1cIlxyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgYnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbkVsZW1lbnQudHlwZSA9IFwic3VibWl0XCJcclxuICAgICAgICAgICAgICAgICAgICBidXR0b25FbGVtZW50LmNsYXNzTmFtZT1cImJ0blwiXHJcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uRWxlbWVudC5pbm5lckhUTUw9IGVsZW1lbnQubmFtZVxyXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbkVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBFZGl0KGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbEVsZW1lbnQuYXBwZW5kQ2hpbGQoYnV0dG9uRWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICBsaUVsZW1lbnQuYXBwZW5kQ2hpbGQobGFiZWxFbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGlzdE1hbmFnZVwiKS5hcHBlbmRDaGlsZChsaUVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIClcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG59XHJcbmZ1bmN0aW9uIGFwcEVkaXQoYXBwKXtcclxuICAgICQoJyNjb250ZW50JykuZW1wdHkoKVxyXG4gICAgJCgnI0hlYWRlcicpLmh0bWwoXCLQoNC10LTQsNC60YLQuNGA0L7QstCw0L3QuNC1INC/0YDQuNC70L7QttC10L3QuNGPIFxcXCJcIithcHAubmFtZStcIlxcXCJcIilcclxuICAgIGJ1aWxkRm9ybUFkZEVkaXQoKVxyXG4gICAgY29uc3QgSURzID0gWyduYW1lJywnZ3JvdXAnLCdzY3JpcHQnLCdob3N0JywncG9ydCcsJ3dhdGNoJywnbG9nJ11cclxuICAgIGNvbnN0IHZhbHVlID0gW2FwcC5uYW1lLGFwcC5ncm91cCxhcHAuc2NyaXB0LGFwcC5ob3N0LGFwcC5wb3J0LGFwcC53YXRjaC5wYXRoLGFwcC5sb2ddXHJcbiAgICB2YXIgaSA9IDBcclxuICAgIElEcy5mb3JFYWNoKGlkPT57XHJcbiAgICAgICAgJCgnIycraWQpLnZhbCh2YWx1ZVtpXSk7XHJcbiAgICAgICAgaSsrXHJcbiAgICAgICAgfVxyXG4gICAgKVxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoZWNrYm94S2VlcCcpLmNoZWNrZWQgPSBhcHAua2VlcFxyXG4gICAgLy8kKCcjY2hlY2tib3hLZWVwJykuY2hlY2tlZCA9IGFwcC5rZWVwXHJcbiAgICAkKCcja2VlcGNvdW50JykudmFsKGFwcC5hdHRlbXB0KVxyXG4gICAgdmFyIGJ1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgIGJ1dHRvbkVsZW1lbnQudHlwZSA9IFwic3VibWl0XCJcclxuICAgIGJ1dHRvbkVsZW1lbnQuY2xhc3NOYW1lPVwiYnRuXCJcclxuICAgIGJ1dHRvbkVsZW1lbnQuaW5uZXJIVE1MPSBcItCU0L7QsdCw0LLQuNGC0YxcIlxyXG4gICAgYnV0dG9uRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBuYW1lID0gJCgnI25hbWUnKS52YWwoKVxyXG4gICAgICAgIHZhciBncm91cCA9ICQoJyNncm91cCcpLnZhbCgpXHJcbiAgICAgICAgdmFyIHNjcmlwdCA9ICQoJyNzY3JpcHQnKS52YWwoKVxyXG4gICAgICAgIHZhciB3YXRjaCA9ICQoJyN3YXRjaCcpLnZhbCgpXHJcbiAgICAgICAgdmFyIGxvZyA9ICQoJyNsb2cnKS52YWwoKVxyXG4gICAgICAgIHZhciBob3N0ID0gJCgnI2hvc3QnKS52YWwoKVxyXG4gICAgICAgIHZhciBwb3J0ID0gJCgnI3BvcnQnKS52YWwoKVxyXG5cclxuICAgICAgICB2YXIga2VlcCA9ICQoJyNjaGVja2JveEtlZXAnKS5pcygnOmNoZWNrZWQnKVxyXG4gICAgICAgIHZhciBhdHRlbXB0ID0gcGFyc2VJbnQoJCgnI2tlZXBjb3VudCcpLnZhbCgpKVxyXG4gICAgICAgIHZhciBhcHBOb3cgPSBnZXRBcHBUZW1wbGF0ZShuYW1lLGdyb3VwLHNjcmlwdCx3YXRjaCxsb2csaG9zdCxwb3J0LGtlZXAsYXR0ZW1wdClcclxuICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6ICcvYXBwJyxcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIGRhdGE6IHtvcHRpb25zOiBbe25hbWU6J25hbWUnLHZhbHVlOm5hbWV9LHtuYW1lOidncm91cCcsdmFsdWU6Z3JvdXB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtuYW1lOidzY3JpcHQnLHZhbHVlOnNjcmlwdH0se25hbWU6J3dhdGNoJyx2YWx1ZTp3YXRjaH0se25hbWU6J2xvZycsdmFsdWU6bG9nfSxcclxuICAgICAgICAgICAgICAgICAgICB7bmFtZTonaG9zdCcsdmFsdWU6aG9zdH0se25hbWU6J3BvcnQnLHZhbHVlOnBvcnR9LHtuYW1lOidrZWVwJyx2YWx1ZTprZWVwfSx7bmFtZTonYXR0ZW1wdCcsdmFsdWU6YXR0ZW1wdH1dLFxyXG4gICAgICAgICAgICAgICAgc2VhcmNoOiBhcHAubmFtZSxcclxuICAgICAgICAgICAgICAgIHVpZDp1aWR9LFxyXG4gICAgICAgICAgICBqc29uOiB0cnVlLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGdldExpc3QoKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pXHJcbiAgICB9KVxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW50XCIpLmFwcGVuZENoaWxkKGJ1dHRvbkVsZW1lbnQpO1xyXG5cclxuICAgLy8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lXCIpLnZhbChhcHAubmFtZSlcclxufVxyXG5cclxuXHJcbmdsb2JhbC5zZXRVc2VySWQgPSBzZXRVc2VySWRcclxuZ2xvYmFsLmdldEVkaXQgPSBnZXRFZGl0XHJcbmdsb2JhbC5nZXRBZGQgPSBnZXRBZGRcclxuZ2xvYmFsLlNob3dTZXR0aW5ncz1TaG93U2V0dGluZ3NcclxuZ2xvYmFsLmdldExpc3QgPSBnZXRMaXN0XHJcbmdsb2JhbC5nZXRNb25pdCA9IGdldE1vbml0XHJcbmdsb2JhbC5zdGFydFN0b3AgPSBzdGFydFN0b3BcclxuZ2xvYmFsLlN0YXJ0QXBwID0gU3RhcnRBcHBcclxuZ2xvYmFsLlN0b3BBcHAgPSBTdG9wQXBwXHJcbi8qXHJcbiBiYXJDaGFydC5kYXRhLmRhdGFzZXRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ3t7bmFtZX19KFBJRDp7e3BpZH19KScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFt7e21lbX19XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3JzW2ldLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogY29sb3JzW2ldXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICBiYXJDaGFydDIuZGF0YS5kYXRhc2V0cy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICd7e25hbWV9fShQSUQ6e3twaWR9fSknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBbe3tjcHV9fV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGNvbG9yc1tpXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGNvbG9yc1tpXVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgaSA+IGNvbG9ycy5sZW5ndGggLSAxID8gaSA9IDAgOiBpKytcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBiYXJDaGFydC51cGRhdGUoKVxyXG4gICAgICAgICAgICAgICAgYmFyQ2hhcnQyLnVwZGF0ZSgpXHJcblxyXG4gICAgICAgICAgICAgICAgZmV0Y2hEYXRhKCBiYXJDaGFydCwgYmFyQ2hhcnQyIClcclxuXHJcbiovXHJcbiJdfQ==
