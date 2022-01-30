"use strict";

//
// This file contains non-game-specific utility functions.
//
var LONG_TIME_AGO = -1000;

function unimplemented(name) {
    var _this = this;

    return function() {
        error(name + " is not implemented within " + _this.__class_name__);
    };
}

function getOrDefault(dict, key, defaultValue) {
    if (!dict) return defaultValue;
    var value = dict[key];
    return value ? value : defaultValue;
} //
// DOM INTERACTION
//

/** Sets the opacity of an element, and if that opacity is 0 sets the element to display: none. **/


function setElemOpacity(elem, opacity) {
    setElemStyle(elem, "opacity", opacity);
    setElemStyle(elem, "display", opacity <= 0 ? "none" : "");
}
/** Sets a style of an element, only if it has changed. **/


function setElemStyle(elem, style, value) {
    var previousStyles = elem.royalUrPreviousStyles;

    if (!previousStyles) {
        previousStyles = {};
        elem.royalUrPreviousStyles = previousStyles;
    } // Avoid updating the style if we do not need to.


    if (previousStyles[style] === value) return;
    elem.style[style] = value;
    previousStyles[style] = value;
}

function setSuperClass(subclass, superclass) {
    subclass.prototype = Object.create(superclass.prototype);
    Object.defineProperty(subclass.prototype, "constructor", {
        value: subclass,
        enumerable: false,
        writable: true
    });
}

function selectText(textBox) {
    textBox.select();
    textBox.setSelectionRange(0, 99999);
    textBox.focus();
}

function copyText(textBoxID) {
    var textBox = document.getElementById(textBoxID);
    selectText(textBox);
    document.execCommand("copy");
    textBox.selectionStart = textBox.selectionEnd;
    textBox.blur();
}

function isAudioElementPlaying(element) {
    return element.currentTime > 0 && !element.paused && !element.ended && element.readyState > 2;
}

function jumpToID(id) {
    var elem = document.createElement("a");
    elem.setAttribute("href", "#" + id);
    elem.click();
    elem.remove();
}
/**
 * Adds or removes a class from the given element {@param elem}.
 * If {@param added} is true, then the class {@param clazz} is added.
 * Otherwise, the class {@param clazz} is removed.
 */


function setElementClass(elem, clazz, added) {
    if (added) {
        elem.classList.add(clazz);
    } else {
        elem.classList.remove(clazz);
    }
} //
// COMPATIBILITY
//
// Timing.


var getTime = null;

if (typeof window !== "undefined") {
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function(f) {
        setTimeout(f, 1000 / 60);
    };

    if (window.performance.now) {
        getTime = function getTime() {
            return window.performance.now() / 1000;
        };
    } else if (window.performance.webkitNow) {
        getTime = function getTime() {
            return window.performance.webkitNow() / 1000;
        };
    }
}

if (getTime === null) {
    getTime = function getTime() {
        return new Date().getTime() / 1000;
    };
} // Check if an array includes an element.


if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, "includes", {
        enumerable: false,
        value: function value(obj) {
            for (var index = 0; index < this.length; ++index) {
                if (this[index] === obj) return true;
            }

            return false;
        }
    });
} // Get the first element from an array that matches a predicate.


if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
        value: function value(predicate) {
            if (this == null) throw TypeError('"this" is null or not defined');
            if (typeof predicate !== 'function') throw TypeError('predicate must be a function');
            var o = Object(this),
                len = o.length >>> 0,
                thisArg = arguments[1];

            for (var k = 0; k < len; ++k) {
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) return kValue;
            }

            return undefined;
        },
        configurable: true,
        writable: true
    });
}
/**
 * @author James Westgate
 */


function testWebPSupport(callback) {
    var webP = new Image();

    webP.onload = webP.onerror = function() {
        callback(webP.height === 2);
    };

    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
} //
// ERRORS
//


function error(cause) {
    var error = "[ERROR] " + cause;
    console.trace(error);
    throw new Error(error);
}

function assert(predicate, message) {
    if (!predicate) {
        error(message);
    }
} //
// GRAPHIC UTILITIES
//


function renderResource(width, height, renderFunction) {
    if (isNaN(width) || isNaN(height)) throw "Width and height cannot be NaN, was given " + width + " x " + height;
    if (width < 1 || height < 1) throw "Width and height must both be at least 1, was given " + width + " x " + height;
    var canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    renderFunction(ctx, canvas);
    return canvas;
}

function rgb(r, g, b) {
    if (g === undefined) {
        g = r;
        b = r;
    }

    return "rgb(" + Math.round(r) + ", " + Math.round(g) + ", " + Math.round(b) + ")";
}

function rgba(r, g, b, a) {
    if (b === undefined) {
        a = g;
        g = r;
        b = r;
    }

    a = a === undefined ? 1 : a;
    return "rgba(" + Math.round(r) + ", " + Math.round(g) + ", " + Math.round(b) + ", " + a + ")";
}

function drawCircularShadow(ctx, x, y, radius, r, g, b) {
    if (r === undefined) {
        r = 0;
        g = 0;
        b = 0;
    } else if (g === undefined) {
        g = r;
        b = r;
    }

    ctx.save();
    var gradient = ctx.createRadialGradient(x, y, radius * 0.75, x, y, radius * 1.3);
    gradient.addColorStop(0, rgba(r, g, b, 1));
    gradient.addColorStop(0.33, rgba(r, g, b, 0.7));
    gradient.addColorStop(0.66, rgba(r, g, b, 0.4));
    gradient.addColorStop(1, rgba(r, g, b, 0));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
}

function pathRoundedRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    return ctx;
}

function convertHSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;

        case 1:
            r = q;
            g = v;
            b = p;
            break;

        case 2:
            r = p;
            g = v;
            b = t;
            break;

        case 3:
            r = p;
            g = q;
            b = v;
            break;

        case 4:
            r = t;
            g = p;
            b = v;
            break;

        case 5:
            r = v;
            g = p;
            b = q;
            break;
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function isImageLoaded(image) {
    return image.complete && image.naturalWidth !== 0;
} //
// NUMBER UTILITIES
//


function max(a, b) {
    return a > b ? a : b;
}

function min(a, b) {
    return a < b ? a : b;
}

function clamp(num, min, max) {
    return num < min ? min : num > max ? max : num;
}

function randElement(array) {
    return array[randInt(array.length)];
}

function rand(min, max) {
    if (min === undefined) return Math.random();
    if (max === undefined) return min * Math.random();
    return min + (max - min) * Math.random();
}

function randInt(min, max) {
    if (min === undefined) return -1;

    if (max === undefined) {
        max = min;
        min = 0;
    }

    return clamp(Math.floor(rand(min, max)), min, max - 1);
}

function randBool() {
    return rand() < 0.5;
}

function easeInOutSine(value) {
    return (1 - Math.cos(value * Math.PI)) / 2;
}

function easeOutSine(value) {
    return Math.sin(value * 0.5 * Math.PI);
}

function easeInSine(value) {
    return 1 - easeOutSine(1 - value);
}
/** Allows the controlling of animations based on linearly interpolating between 0 and 1. **/


function Fade(defaultInDuration, defaultOutDuration) {
    this.__class_name__ = "Fade";
    this.defaultInDuration = defaultInDuration === undefined ? -1 : defaultInDuration;
    this.defaultOutDuration = defaultOutDuration === undefined ? this.defaultInDuration : defaultOutDuration;
    this.direction = "out";
    this.start = LONG_TIME_AGO;
    this.duration = -1;
}

Fade.prototype.fade = function(isFadeIn, duration, fromStart) {
    var currentValue = this.get();
    this.start = getTime();
    this.direction = isFadeIn ? "in" : "out";
    this.duration = duration !== undefined ? duration : isFadeIn ? this.defaultInDuration : this.defaultOutDuration; // Correct the start time so the get() value never jumps.

    if (!fromStart) {
        if (isFadeIn) {
            this.start -= currentValue * this.duration;
        } else {
            this.start -= (1 - currentValue) * this.duration;
        }
    }

    return this;
};

Fade.prototype.isFadeIn = function() {
    return this.direction === "in";
};

Fade.prototype.isFadeOut = function() {
    return this.direction === "out";
};

Fade.prototype.fadeIn = function(duration) {
    return this.fade(true, duration);
};

Fade.prototype.fadeOut = function(duration) {
    return this.fade(false, duration);
};

Fade.prototype.visible = function() {
    return this.fade(true, 0);
};

Fade.prototype.invisible = function() {
    return this.fade(false, 0);
};

Fade.prototype.getRaw0To1 = function() {
    var time = getTime();
    if (time >= this.start + this.duration) return 1;
    if (time <= this.start) return 0;
    return (time - this.start) / this.duration;
};

Fade.prototype.get = function() {
    var raw = this.getRaw0To1();
    return this.direction === "in" ? raw : 1 - raw;
};
/** An asymmetric fade which fades in, waits, and then fades out. **/


function StagedFade(inDuration, stayDuration, outDuration) {
    if (inDuration === undefined || stayDuration === undefined || outDuration === undefined) throw "Must specify inDuration, stayDuration, and outDuration";
    Fade.call(this, inDuration + stayDuration + outDuration, outDuration);
    this.__class_name__ = "StagedFade";
    this.inDuration = inDuration;
    this.stayDuration = stayDuration;
    this.outDuration = outDuration;
    this.inRatio = inDuration / this.defaultInDuration;
    this.stayRatio = stayDuration / this.defaultInDuration;
    this.outRatio = outDuration / this.defaultInDuration;
}

setSuperClass(StagedFade, Fade);

StagedFade.prototype.fade = function(isFadeIn, duration, fromStart) {
    var currentValue = this.get();
    Fade.prototype.fade.call(this, isFadeIn, duration, true); // Correct the start time so that the fades line up.

    if (!fromStart) {
        if (isFadeIn) {
            this.start += currentValue * this.inDuration;
        } else {
            this.start -= (1 - currentValue) * this.outDuration;
        }
    }

    return this;
};

StagedFade.prototype.get = function() {
    var value = Fade.prototype.get.call(this);
    if (Fade.prototype.isFadeOut.call(this)) return value;
    if (value <= this.inRatio) return value / this.inRatio;
    if (value <= this.inRatio + this.stayRatio) return 1;
    return (1 - value) / this.outRatio;
};

StagedFade.prototype.isFadeIn = function() {
    if (Fade.prototype.isFadeOut.call(this)) return false;
    return Fade.prototype.get.call(this) <= this.inDuration + this.stayDuration;
};

StagedFade.prototype.isFadeOut = function() {
    if (Fade.prototype.isFadeOut.call(this)) return true;
    return Fade.prototype.get.call(this) > this.inDuration + this.stayDuration;
}; //
// STRING STUFF
//


function pad(value, length, prefix) {
    if (value.length >= length) return value;
    if (prefix === undefined) prefix = ' ';
    var string = value;

    while (string.length < length) {
        string = prefix + string;
    }

    return string.substring(string.length - length, string.length);
}
/**
 * A format function used on Stack Overflow to format strings.
 *
 * e.g. formatUnicorn(
 *             "Hello, {name}, are you feeling {adjective}?",
 *             {name:"Gabriel", adjective: "OK"})
 *     outputs:
 *         "Hello, Gabriel, are you feeling OK?"
 */


function formatUnicorn(str) {
    for (var _len = arguments.length, parameters = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        parameters[_key - 1] = arguments[_key];
    }

    if (!parameters.length) return str;
    var isArray = typeof parameters[0] === "string" || typeof parameters[0] === "number",
        args = isArray ? Array.prototype.slice.call(parameters) : parameters[0];

    for (var key in args) {
        if (args.hasOwnProperty(key)) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }

    return str;
} //
// VECTORS
//


var VEC_NEG1 = new Vector2D(-1, -1);

function Vector2D(x, y) {
    this.x = x;
    this.y = y;
}

Vector2D.prototype.toString = function() {
    return "Vector2D(" + this.x + ", " + this.y + ")";
};
/**
 * Create a vector with the given {@param x} and {@param y} components.
 */


function vec(x, y) {
    if (typeof x !== "number" || typeof y !== "number") throw "x and y must be numbers: " + x + ", " + y;
    if (isNaN(x) || isNaN(y)) throw "x and y cannot be NaN: " + x + ", " + y;
    if (x === -1 && y === -1) return VEC_NEG1;
    return new Vector2D(x, y);
}
/**
 * Construct a list of vectors from a list of pairs of coordinates in the form [x1, y1, x2, y2, ..., xn, yn].
 */


function vecList() {
    if (arguments.length % 2 !== 0) throw "Arguments must be of even length";
    var vecs = [];

    for (var index = 0; index < arguments.length; index += 2) {
        var x = arguments[index],
            y = arguments[index + 1],
            v = vec(x, y);
        vecs.push(v);
    }

    return vecs;
}

function vecAdd(v1, v2) {
    return vec(v1.x + v2.x, v1.y + v2.y);
}

function vecSub(v1, v2) {
    return vec(v1.x - v2.x, v1.y - v2.y);
}

function vecMul(v, mul) {
    return vec(mul * v.x, mul * v.y);
}
/**
 * Linearly interpolate between {@param v1} and {@param v2} with {@param t}
 * giving the distance moved from v1 to v2 as a value from 0 to 1 inclusive.
 */


function vecLin(v1, v2, t) {
    return vec(v1.x * (1 - t) + v2.x * t, v1.y * (1 - t) + v2.y * t);
}

function vecLenSquared(v) {
    return v.x * v.x + v.y * v.y;
}

function vecLen(v) {
    return Math.sqrt(vecLenSquared(v));
}
/**
 * Get the dot product of {@param v1} and {@param v2}.
 */


function vecDot(v1, v2) {
    return v1.x * v2.x + v1.y * v2;
}
/**
 * Get the vector projection of {@param v1} onto {@param v2}.
 */


function vecProject(v1, v2) {
    return vecDot(v1, v2) / vecLen(v2);
}

function vecMidpoint(v1, v2) {
    return vec((v1.x + v2.x) / 2, (v1.y + v2.y) / 2);
}

function vecEquals(v1, v2) {
    return v1.x === v2.x && v1.y === v2.y;
}

function vecDist(v1, v2) {
    return vecLen(vecSub(v1, v2));
}

function vecListIndexOf(locations, v) {
    for (var index = 0; index < locations.length; ++index) {
        if (vecEquals(locations[index], v)) return index;
    }

    return -1;
}

function vecListContains(locations, v) {
    return vecListIndexOf(locations, v) !== -1;
} //
// This file contains the code that manages
// the loading of resources for Royal Ur.
//


function ResourceLoader(stagedResources) {
    this.__class_name__ = "ResourceLoader"; // Detection of WebP support.

    this.webpSupportKnown = false;
    this.supportsWebP = "unknown";
    this.webpSupportListeners = [];
    testWebPSupport(function(supported) {
        this.webpSupportKnown = true;
        this.supportsWebP = supported;

        for (var index = 0; index < this.webpSupportListeners.length; ++index) {
            this.webpSupportListeners[index](supported);
        }

        this.webpSupportListeners.length = 0;
        document.body.classList.add(supported ? "webp" : "no-webp");
    }.bind(this)); // Detection of the resolution of the user's browser.

    this.max_resolution = "u_u";
    this.resolutions = ["u_720", "u_1080", "u_1440", "u_2160", this.max_resolution];
    this.resolution = this.calculateResolution(); // Organise all of the resources to be loaded.

    this.loadingStage = -1;
    this.stagedResources = stagedResources ? stagedResources : null;
    this.allResources = [];

    if (stagedResources) {
        for (var index = 0; index < stagedResources.length; ++index) {
            this.allResources.push.apply(this.allResources, stagedResources[index]);
        }
    } // Some callbacks to be set elsewhere.


    this.resourceLoadedCallback = null;
    this.stageLoadedCallback = null;
}

ResourceLoader.prototype.setStageLoadedCallback = function(callback) {
    this.stageLoadedCallback = callback;

    for (var missed = 0; missed < this.loadingStage; ++missed) {
        callback(missed);
    }
};

ResourceLoader.prototype.setResourceLoadedCallback = function(callback) {
    this.resourceLoadedCallback = callback;
};

ResourceLoader.prototype.testWebP = function(callback) {
    if (this.webpSupportKnown) {
        callback(this.supportsWebP);
    } else {
        this.webpSupportListeners.push(callback);
    }
};

ResourceLoader.prototype.findRasterImageExtension = function(callback) {
    this.testWebP(function(supported) {
        return callback(supported ? "webp" : "png");
    });
};

ResourceLoader.prototype.completeRasterImageURL = function(url, callback, skipResolution) {
    this.findRasterImageExtension(function(ext) {
        var size = !skipResolution && this.resolution !== this.max_resolution ? "." + this.resolution : "";
        callback(url + size + (ext.length ? "." + ext : ""));
    }.bind(this));
};
/** We normalise screen sizes to landscape-oriented, and apply the device scaling. **/


ResourceLoader.prototype.getEffectiveScreenSize = function() {
    var width = document.documentElement.clientWidth,
        height = document.documentElement.clientHeight,
        normedSize = vec(max(width, height), min(width, height));
    return vecMul(normedSize, window.devicePixelRatio);
};

ResourceLoader.prototype.calculateResolution = function() {
    var size = this.getEffectiveScreenSize();

    for (var index = 0; index < this.resolutions.length; ++index) {
        var resolution = this.resolutions[index],
            resolution_parts = resolution.split("_"),
            res_width = resolution_parts[0] === "u" ? -1 : parseInt(resolution_parts[0]),
            res_height = resolution_parts[1] === "u" ? -1 : parseInt(resolution_parts[1]);
        if (res_width > 0 && size.x > res_width) continue;
        if (res_height > 0 && size.y > res_height) continue;
        return resolution;
    }

    return this.max_resolution;
};

ResourceLoader.prototype.getPercentageLoaded = function(stage) {
    if (stage < 0 || stage >= this.stagedResources.length) return 0;
    var resources = this.stagedResources[stage];
    var loaded = 0,
        total = 0;

    for (var index = 0; index < resources.length; ++index) {
        var resource = resources[index];
        if (!resource.hasMeaningfulLoadStats() || !resource.blocksLoading) continue;
        total += 1;

        if (resource.loaded) {
            loaded += 1;
        }
    }

    return total === 0 ? 0 : loaded / total;
};

ResourceLoader.prototype.startLoading = function() {
    if (this.loadingStage !== -1) return;
    this.loadingStage = 0;
    this.startLoadingStage();
};

ResourceLoader.prototype.startLoadingStage = function() {
    if (this.loadingStage >= this.stagedResources.length) return; // Start the loading of all resources of the current stage.

    var resources = this.stagedResources[this.loadingStage];

    for (var index = 0; index < resources.length; ++index) {
        resources[index].load(this);
    } // In case there are no resources left to load at this stage.


    this.onResourceLoaded(null);
};

ResourceLoader.prototype.onResourceLoaded = function(resource) {
    if (this.resourceLoadedCallback) {
        this.resourceLoadedCallback(resource);
    } // Check if there are resources that are not yet loaded.


    var resources = this.stagedResources[this.loadingStage];

    for (var index = 0; index < resources.length; ++index) {
        var _resource = resources[index];
        if (_resource.blocksLoading && !_resource.loaded) return;
    } // All resources at the current stage have been loaded.


    var previousStage = this.loadingStage;
    this.loadingStage += 1;

    if (this.stageLoadedCallback) {
        this.stageLoadedCallback(previousStage);
    }

    this.startLoadingStage();
}; //
// This file contains the code for managing finding image resources to display.
//


function ImageSystem(resourceLoader) {
    this.__class_name__ = "ImageSystem";
    this.resourceLoader = resourceLoader;
    this.dynamicButtons = [];
    this.dynamicButtonRedrawLoopStarted = false;
}

ImageSystem.prototype.loadImage = function(urlWithoutExt, loadCallback, errorCallback) {
    this.resourceLoader.completeRasterImageURL(urlWithoutExt, function(url) {
        var image = new Image();

        image.onload = function() {
            return loadCallback(image);
        };

        image.onerror = errorCallback;
        image.src = url;
    }, true);
};

ImageSystem.prototype.findImageResource = function(key) {
    var resources = this.resourceLoader.allResources;

    for (var index = 0; index < resources.length; ++index) {
        var resource = resources[index];
        if (resource instanceof ImageResource && resource.name === key) return resource;
    }

    return null;
};

ImageSystem.prototype.getImageResource = function(key, width, returnNullIfNotLoaded) {
    var imageResource = this.findImageResource(key);
    if (!imageResource) throw "Missing image resource " + key;

    if (!imageResource.loaded) {
        if (returnNullIfNotLoaded) return null;
        throw "Image resource " + key + " is not yet loaded!";
    }

    if (!width) return imageResource.image;
    return imageResource.getScaledImage(width);
};

ImageSystem.prototype.computeImageURL = function(key, callback) {
    var resource = this.findImageResource(key);
    this.resourceLoader.completeRasterImageURL(resource.url, callback);
};

ImageSystem.prototype.populateDynamicImages = function() {
    var _this2 = this;

    var images = document.body.getElementsByTagName("img");

    var _loop = function _loop(index) {
        var image = images[index],
            dynamicSrc = image.getAttribute("data-src");
        if (!dynamicSrc) return "continue";
        image.removeAttribute("data-src");

        _this2.resourceLoader.completeRasterImageURL(dynamicSrc, function(completedURL) {
            image.src = completedURL;
        });
    };

    for (var index = 0; index < images.length; ++index) {
        var _ret = _loop(index);

        if (_ret === "continue") continue;
    }
};

ImageSystem.prototype.loadDynamicButtons = function() {
    var _this3 = this;

    var canvases = document.body.getElementsByTagName("canvas");

    var _loop2 = function _loop2(index) {
        var canvas = canvases[index],
            dynamicSrcInactive = canvas.getAttribute("data-src-inactive"),
            dynamicSrcActive = canvas.getAttribute("data-src-active");
        if (!dynamicSrcInactive || !dynamicSrcActive) return "continue";
        canvas.removeAttribute("data-src-inactive");
        canvas.removeAttribute("data-src-active");

        _this3.resourceLoader.completeRasterImageURL(dynamicSrcInactive, function(srcInactive) {
            this.resourceLoader.completeRasterImageURL(dynamicSrcActive, function(srcActive) {
                var button = new DynamicButton(canvas, srcInactive, srcActive);
                this.dynamicButtons.push(button);
            }.bind(this));
        }.bind(_this3));
    };

    for (var index = 0; index < canvases.length; ++index) {
        var _ret2 = _loop2(index);

        if (_ret2 === "continue") continue;
    } // Start the redraw loop for the dynamic buttons.


    if (!this.dynamicButtonRedrawLoopStarted) {
        this._redrawDynamicButtonsLoop();

        this.dynamicButtonRedrawLoopStarted = true;
    }
};

ImageSystem.prototype._redrawDynamicButtonsLoop = function() {
    var _this4 = this;

    for (var index = 0; index < this.dynamicButtons.length; ++index) {
        this.dynamicButtons[index].redraw();
    }

    window.requestAnimationFrame(function() {
        return _this4._redrawDynamicButtonsLoop();
    });
};

function DynamicButton(canvas, src, srcHover) {
    this.__class_name__ = "DynamicButton";
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.hovered = false;
    canvas.addEventListener("mouseover", this.onMouseOver.bind(this));
    canvas.addEventListener("mouseout", this.onMouseOut.bind(this));
    window.addEventListener("resize", this.forceRedraw.bind(this));
    this.image = new Image();
    this.hoverImage = new Image();
    this.image.onload = this.resize.bind(this);
    this.hoverImage.onload = this.resize.bind(this);

    this.image.onerror = function() {
        return console.log("Error loading image " + src);
    };

    this.hoverImage.onerror = function() {
        return console.log("Error loading image " + srcHover);
    };

    this.image.src = src;
    this.hoverImage.src = srcHover;
    this.nextRedrawForced = false;
    this.isDrawn = false;
    this.isDrawnHovered = false;
}

DynamicButton.prototype.onMouseOver = function() {
    this.hovered = true;
};

DynamicButton.prototype.onMouseOut = function() {
    this.hovered = false;
};

DynamicButton.prototype.resize = function() {
    var width = -1,
        height = -1;

    if (isImageLoaded(this.image)) {
        width = this.image.width;
        height = this.image.height;
    }

    if (isImageLoaded(this.hoverImage)) {
        width = Math.max(width, this.image.width);
        height = Math.max(height, this.image.height);
    }

    if (width > 0 && height > 0) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    this.forceRedraw();
};

DynamicButton.prototype.forceRedraw = function() {
    this.nextRedrawForced = true;
};

DynamicButton.prototype.redraw = function() {
    // Get the image to be drawn.
    var image = this.hovered ? this.hoverImage : this.image;
    if (!isImageLoaded(image)) return; // Check if we need to redraw the button.

    if (!this.nextRedrawForced && this.isDrawn && this.isDrawnHovered === this.hovered) return; // Redraw the button.

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
    this.nextRedrawForced = false;
    this.isDrawn = true;
    this.isDrawnHovered = this.hovered;
}; //
// This file manages the loading of resources for the home page.
//


var resourceLoader = new ResourceLoader(),
    imageSystem = new ImageSystem(resourceLoader);
imageSystem.populateDynamicImages();
imageSystem.loadDynamicButtons();
imageSystem.loadImage("/res/board_background", function() {
    document.getElementById("greeting-background").classList.add("loaded");
}, function(err) {
    return console.error("Failed to load home background: " + err);
});

var ml4 = {};
ml4.opacityIn = [0, 1];
ml4.scaleIn = [0.2, 1];
ml4.scaleOut = 3;
ml4.durationIn = 800;
ml4.durationOut = 600;
ml4.delay = 500;

anime.timeline({ loop: true })
    .add({
        targets: '.ml4 .letters-1',
        opacity: ml4.opacityIn,
        scale: ml4.scaleIn,
        duration: ml4.durationIn
    }).add({
        targets: '.ml4 .letters-1',
        opacity: 0,
        scale: ml4.scaleOut,
        duration: ml4.durationOut,
        easing: "easeInExpo",
        delay: ml4.delay
    }).add({
        targets: '.ml4 .letters-2',
        opacity: ml4.opacityIn,
        scale: ml4.scaleIn,
        duration: ml4.durationIn
    }).add({
        targets: '.ml4 .letters-2',
        opacity: 0,
        scale: ml4.scaleOut,
        duration: ml4.durationOut,
        easing: "easeInExpo",
        delay: ml4.delay
    }).add({
        targets: '.ml4 .letters-3',
        opacity: ml4.opacityIn,
        scale: ml4.scaleIn,
        duration: ml4.durationIn
    }).add({
        targets: '.ml4 .letters-3',
        opacity: 0,
        scale: ml4.scaleOut,
        duration: ml4.durationOut,
        easing: "easeInExpo",
        delay: ml4.delay
    }).add({
        targets: '.ml4',
        opacity: 0,
        duration: 500,
        delay: 500
    });