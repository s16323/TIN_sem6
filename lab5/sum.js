/*jshint globalstrict: true, devel: true, node:true */
'use strict';

function sum() {
    var args = Array.prototype.slice.call(arguments);
    var sum = args.reduce(function (a, b) {
        return a + b;
    })
    return sum;
}

console.log(sum(10,-5));
