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

function defmatch(code) {
    var regex = /@def[ ]*([A-z0-9]*)[ ]*([^\r\n ]*)/g

    var matcharray = regex.execAll(code);

    matcharray.sort(function (a, b) {
        return b[1].length - a[1].length;
    })
    matcharray.forEach(function (match) {
        console.log("replacing " + match[1] + " with " + match[2]);

        code = code.replace(regex, "");
        var reg = new RegExp("(" + match[1] + ")", "g");
        var t = reg.execAll(code);
        t.forEach(function (ma) {
            code = code.replace(ma[1], match[2]);
        });
    });
    return code;
}
var code = "@def TEST 123\n\
@def TEST2 200\n\
console.log(TEST)\n\
console.log(TEST2 + 100)\n\
console.log(TEST + TEST2) //TeST\n\
TEST/a"
console.log("Input code\n\n" + code)
code = defmatch(code);

console.log("Output code" + code);
