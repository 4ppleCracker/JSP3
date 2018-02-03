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
function defmatch(code) {
    var defregex = /@def[ ]*([A-z0-9]*)[ ]*([^\r\n ]*)/g

    var matcharray = defregex.execAll(code);

    matcharray.sort(function (a, b) {
        return b[1].length - a[1].length;
    })
    matcharray.forEach(function (match) {
        global.defineds.push(match[1]);
    });
}
function defreplace() {
    var defregex = /@def[ ]*([A-z0-9]*)[ ]*([^\r\n ]*)/g

    var matcharray = defregex.execAll(code);

    matcharray.sort(function (a, b) {
        return b[1].length - a[1].length;
    })
    matcharray.forEach(function (match) {
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
    var regex = /@fdef[ ]*([^\r\n ]*)\(([A-z, ]*)\)[ ]*([^\r\n]*)/g

    var matcharray = regex.execAll(code);

    matcharray.sort(function (a, b) {
        return b[1].length - a[1].length;
    })
    matcharray.forEach(function (match) {
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
    var regex = /@ifdef[ ]*([^{ ]*)[ ]*{[\n\r]*([^}]*)}/g

    var matcharray = regex.execAll(code);

    matcharray.sort(function (a, b) {
        return b[1].length - a[1].length;
    })
    matcharray.forEach(function (match) {
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
    var regex = /@ifdef[ ]*([^{ ]*)[ ]*{[\n\r]*([^}]*)}[ ]*@else[ ]*{[\n\r]*([^}]*)}/g

    var matcharray = regex.execAll(code);

    matcharray.sort(function (a, b) {
        return b[1].length - a[1].length;
    })
    matcharray.forEach(function (match) {
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
    var regex = /@include[ ]*(.*\.js)/g

    var matcharray = regex.execAll(code);

    matcharray.sort(function (a, b) {
        return b[1].length - a[1].length;
    })
    matcharray.forEach(function (match) {
        if (debug()) console.log("Including file " + match[1]);
        var file = readfile(match[1]);
        code = code.replace(match[0], file);
    });
    return code;
}
var code = "@def TEST 10\n\
@ifdef TEST {\n\
    console.log(\"TE-ST is defined\")\n\
}";
code = includematch(code)
defmatch(code);
code = fdefmatch(code);
code = ifelsedefmatch(code);
code = ifdefmatch(code);
code = defreplace(code);

console.log("Output code:\n" + code.replace(/^\s*[\r\n]/gm, ""));
