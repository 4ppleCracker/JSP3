var fs = require('fs');
function readfile(file) {
    return fs.readFileSync(file, 'utf8')
}

RegExp.prototype.execAll = function (string) {
    var match = null;
    var matches = new Array();
    while (match = this.exec(string)) {
        var matchArray = [];
        for (i in match) {
            if (parseInt(i) == i) {
                matchArray.push(match[i]);
            }
        }
        matches.push(matchArray);
    }
    return matches;
}
function debug() {
    return true;
}
global.defineds = [];

function match(regex, code, callback) {
    var matcharray = regex.execAll(code);
    matcharray.sort(function (a, b) {
        return b[1].length - a[1].length;
    })
    matcharray.forEach(function (match) {
        callback(match, matcharray, regex);
    });
}
function defmatch(code) {
    var reg = new RegExp("@def[ ]*([A-z0-9]*)[ ]*([^\r\n ]*)", "g");
    match(reg, code, function (match) {
        global.defineds.push(match[1]);
    });
    return code;
}
function defreplace() {
    var defregex = new RegExp("@def[ ]*([A-z0-9]*)[ ]*([^\r\n ]*)", "g");
    match(defregex, code, function (match) {
        if (debug()) console.log("replacing " + match[1] + " with " + match[2]);

        code = code.replace(defregex, "");
        var reg = new RegExp("(" + match[1] + ")", "g");
        var t = reg.execAll(code);
        t.forEach(function (ma) {
            code = code.replace(ma[1], match[2]);
        });
    });
    return code;
}
function fdefmatch(code) {
    var regex = new RegExp("@fdef[ ]*([^\r\n ]*)\(([A-z, ]*)\)[ ]*([^\r\n]*)", "g");
    match(regex, code, function (match) {
        if (debug()) console.log("replacing " + match[1] + " function");

        code = code.replace(regex, "");
        var regstring = match[1] + "\(([^\r\n\)]*)\)"//"\(([^\r\n\)]*)\)";
        var reg = new RegExp(regstring, "g");
        var t = reg.execAll(code)
        t.forEach(function (ma) {
            var param = ma[1].replace(/[\(\) ]*/g, "").split(",")
            var funcparam = match[2].replace(/[ ]*/g, "").split(",");
            var funccode = match[3];
            funcparam.forEach(function (p, index) {
                funccode = funccode.replace(p, param[index]);
            });
            var toreplace = ma[0]
            code = code.replace(toreplace, "(" + funccode);
        });
    });
    return code;
}
function ifdefmatch(code) {
    var regex = new RegExp("@ifdef[ ]*([^{ ]*)[ ]*{[\n\r]*([^}]*)}", "g");
    match(regex, code, function (match) {
        if (debug()) console.log("");
        if (global.defineds.includes(match[1])) {
            if (debug()) console.log("defined! replacing " + match[0] + " with " + match[2]);
            code = code.replace(match[0], match[2]);
        } else {
            if (debug()) console.log("not defined! replacing " + match[0] + " with nothing");
            code = code.replace(match[0], "");
        }
    });
    return code;
}
function ifelsedefmatch(code) {
    var regex = new RegExp("@ifdef[ ]*([^{ ]*)[ ]*{[\n\r]*([^}]*)}[ ]*@else[ ]*{[\n\r]*([^}]*)}", "g");
    match(regex, code, function (match) {
        if (debug()) console.log("");
        if (global.defineds.includes(match[1])) {
            if (debug()) console.log("defined! replacing " + match[0] + " with " + match[2]);
            code = code.replace(match[0], match[2]);
        } else {
            if (debug()) console.log("not defined! replacing " + match[0] + " with " + match[3]);
            code = code.replace(match[0], match[3]);
        }
    });
    return code;
}
function includematch(code) {
    var regex = new RegExp("@include[ ]*(.*\.js)", "g");
    match(regex, code, function (match) {
        if (debug()) console.log("Including file " + match[1]);
        var file = readfile(match[1]);
        code = code.replace(match[0], file);
    });
    return code;
}
var code = "@def TEST 10\n\
@ifdef TEST {\n\
    console.log(\"TE-ST is defined\" + TEST)\n\
}";
var matches = [
    includematch,
    defmatch,
    fdefmatch,
    ifelsedefmatch,
    ifdefmatch,
    defreplace
]
matches.forEach(function (func) {
    code = func(code);
});

console.log("Output code:\n" + code.replace(/^\s*[\r\n]/gm, ""));
