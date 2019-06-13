/*jshint globalstrict: true, devel: true, node:true */
'use strict';

var obj = {
    className: 'first bordered'
}

function switchClassName(object, className ) {
    var arr = object.className.split(' ');
    var itemFound = false;
    var itemIndex = new Array();

    for (let i = 0; i < arr.length; i++) {
        
        if( arr[i] == className ){
            itemFound = true;
            itemIndex.push(i);
            break;
        }

    }

    for (let i = 0; i < itemIndex.length; i++){ 
        arr.splice(itemIndex[i], 1);
    }

    if (!itemFound){
        arr.push(className);
    }

    arr = arr.join(' ');
    object.className = arr;

    return object.className;
}



switchClassName(obj, 'visible');
console.log(obj.className);

switchClassName(obj, 'bordered');
console.log(obj.className);
