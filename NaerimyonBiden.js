// ==UserScript==
// @name	   Nalimyeon Biden
// @namespace	   Nalimyeon.Biden
// @description	   날리면 바이든
// @include	   *
// @exclude	   file://*
// @version	   1
// @grant	   none
// @author	   @sapjuppuri
// @run-at	   Tampermonkey (Greasemonkey) 설치후 사용
// ==/UserScript==
// cited from https://gist.github.com/foriequal0/154e73d3289d808e8ce94603f5eff6a4

(function () {
    var test = (function () {
        var rules = [];
        (function () {
            function getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min)) + min;
            }

            var join = function () {
                var x = "";
                for (var i = 0; i < arguments.length; i++) {
                    if (arguments[i]) {
                        x = x + arguments[i];
                    }
                }
                return x;
            }

            var constant = function (v) {
                return function () {
                    return v;
                }
            }
            var xx_ = function (p) {
                return function (x) {
                    return join(p, x[2]);
                }
            }
            var _xx = function (p) {
                return function (x) {
                    return join(x[0], p);
                }
            }
            var x_x = function (p) {
                return function (x) {
                    return join(x[0], p, x[1]);
                }
            }

            var add = function (type) {
                return function (pattern) {
                    var pattern_args = arguments;
                    if (type === "char") {
                        var regex = new RegExp(pattern);
                        var match = function (x) {
                            return x.match(regex)
                        };
                    } else {
                        match = function (x) {
                            if (x.startsWith(pattern)) return pattern;
                            else null;
                        };
                    }
                    if (pattern_args.length == 2) {
                        rules.push({
                            type: type,
                            match: match,
                            process: arguments[1]
                        });
                    } else {
                        rules.push({
                            type: type,
                            match: match,
                            process: function (x) {
                                var i = getRandomInt(1, pattern_args.length);
                                var select = pattern_args[i];
                                return select(x);
                            }
                        });
                    }
                }
            }
            var word = add("word");
            var char = add("char");
            var rword = function () {
                var candidates = arguments;
                for (var i = 0; i < candidates.length; i++) {
                    var pivot = candidates[i];
                    var args = [pivot];
                    for (var j = 0; j < candidates.length; j++) {
                        if (i == j) continue;
                        args.push(constant(candidates[j]));
                    }
                    word.apply(this, args);
                }
            }

            var rchar = function () {
                var candidates = arguments;
                for (var i = 0; i < candidates.length; i++) {
                    var pivot = candidates[i];
                    var args = [pivot];
                    for (var j = 0; j < candidates.length; j++) {
                        if (i == j) continue;
                        args.push(xx_(candidates[j]));
                    }
                    char.apply(this, args);
                }
            }

            rword("날리면", "바이든");
        })();

        var findMatch = function (arr, func) {
            for (var i = 0; i < arr.length; i++) {
                if (func(arr[i])) {
                    return arr[i];
                }
            }
            return undefined;
        }

        return {
            convert: function (text) {
                var res = "";

                while (text.length > 0) {
                    var rule = findMatch(rules, function (r) {
                        if (r.type == 'word') {
                            return r.match(text);
                        } else {
                            return r;
                        }
                    });

                    if (rule) {
                        if (rule.type == 'word') {
                            var match = rule.match(text);
                            var processed = rule.process(match);
                            res = res + processed;
                            text = text.substring(match.length);
                            continue;
                        } else if (rule.type == 'char') {
                            var char = text[0];
                            res = res;
                            text = text.substring(1);
                        }
                    } else {
                        char = text[0];
                        res = res + char;
                        text = text.substring(1);
                    }
                }
                return res;
            }
        }
    })();

    var converted = new Set();
    function converter(root) {
        for (var child of root.childNodes || []) {
            converter(child);
        }
        if (root.nodeName == "#text" && !converted.has(root)) {
            root.nodeValue = test.convert(root.nodeValue);
            converted.add(root);
        }
    }

    converter(document.body);

    var observer = new MutationObserver(function (changes) {
        for (var change of changes) {
            converter(change.target);
        }
    });

})();
