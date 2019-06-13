/*jshint globalstrict: true, devel: true, node:true */
'use strict';

function cached(cache, fun) {
    var f = function rec (n) {
        if (cache[n] !== undefined){
            return cache[n];
        }
        else {
            cache[n] = fun(rec, n);
            return cache[n];
        }
    }
    return f;
}

var fibonacci = cached([0,1], function(rec, n){
    return rec(n-1) + rec(n-2);
});

var factorial = cached([1], function (rec, n) {
    return rec(n-1) *n;
});
console.log(fibonacci(5));
console.log(factorial(5));
