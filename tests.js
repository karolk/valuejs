/* console with warn and info is required to run it*/

// var console=function(){var b=["log","info","debug","warn","error","assert","group","groupEnd"],c=function(){},d="console"in window&&typeof console==="object",e={},f=0;for(;f<b.length;f++)e[b[f]]=d&&b[f]in console&&(typeof console[b[f]]).match(/function|object/)?function(){var g=b[f];return function(){try{console[g].apply(console,arguments)}catch(j){for(var k=0;k<arguments.length;k++)console[g](arguments[k])}}}():c;return e}();


var tests = [];
var passed_node = document.getElementById('passed');
var failed_node = document.getElementById('failed');
var passed = 0;
var failed = 0;

function take_test(test, index) {
    
    var res = test();
    
    if (res) {
        console.info('passed')
        passed++;
        
    }
    else {
		failed++;
       console.warn(index, ': ', res, test.toString())
    }
	
	passed_node.innerHTML = passed;
	failed_node.innerHTML = failed;
    
}

tests.push(function() {a = new Value(); return !!a}) //constuctor
tests.push(function() {b = Value(); return !!b}) //no new
tests.push(function() {c = Value({value:10, max:11, min:9}); return !!c}) //no new
tests.push(function() {d = new Value({value:1000, max:1100, min:900, format:{symbol:'%'}}); return !!d}) //no new
tests.push(function() {return a instanceof Value}) //no new
tests.push(function() {return b instanceof Value})
tests.push(function() {return c instanceof Value})
tests.push(function() {return d instanceof Value})

//these depend on the order

tests.push(function() {return a.set(100) instanceof Value})
tests.push(function() {return a.get()==='100'})
tests.push(function() {return a.value()===100})
tests.push(function() {return a.min(10) instanceof Value})
tests.push(function() {return a.set(10).get() === '10'})
tests.push(function() {return a.set(8).get() === '10'})             
tests.push(function() {return a.max(7) instanceof Value})
tests.push(function() {return a.get() === '7'})
tests.push(function() {return a.min() === 7})                       
tests.push(function() {return a.min(80).get() === '80'})
tests.push(function() {return a.max() === 80})
tests.push(function() {return c.get() === '10'})
tests.push(function() {return c.min() === 9})
tests.push(function() {return c.max() === 11})
tests.push(function() {return d.get() === '1000%'})
tests.push(function() {return d.min() === 900})
tests.push(function() {return d.max() === 1100})
tests.push(function() {return a.minus() instanceof Value})
tests.push(function() {return a.get() === '80'})
tests.push(function() {return a.plus() instanceof Value})
tests.push(function() {return a.get() === '80'})
tests.push(function() {return a.min(10).max(100) instanceof Value})

//separate nudge
tests.push(function() {return d.plusNudge(3.8) instanceof Value})
tests.push(function() {return d.minusNudge(-7.2) instanceof Value})


//formatting
tests.push(function() {return a.max(10000).set(5123.5).format({symbol:'$', position:'before', format_thousands:true}) instanceof Value})
tests.push(function() {return a.get() === '$5,123.5'})
tests.push(function() {return a.value() === 5123.5})
tests.push(function() {return a.format().symbol === '$'})
tests.push(function() {return d.format().separator === '' && d.format().symbol === '%'})

//broad input
tests.push(function() {return b.set('()U&*(8Y&7TGB ').get() === '87'})

//null_input
tests.push(function() {b.format({nill:'-'}); b.set('-');return b.value() === 0})

//freezing/defrosting
tests.push(function() {return b.setNudge(10).plus().get() === '10'})
tests.push(function() {return b.freeze() instanceof Value})
tests.push(function() {return b.max(100).plus().get() === '10'})
tests.push(function() {return b.defrost() instanceof Value})
tests.push(function() {return b.plus().plus().get() === '30'})

//setting callback
tests.push(function() {var x = 1; b.plus(function(val) {if (val.format().separator === '' && val instanceof Value && b === val) {x = 2}});return x === 2});
tests.push(function() {var y = 1; b.set(20, function(val) {if (val.format().separator === '' && val instanceof Value && b === val && val.get() === '20') {y = 2}});return y === 2});
//setting callback
tests.push(function() {var z = 1; b.minus(function(val) {if (val.format().separator === '' && val instanceof Value && b === val && b.get() === '10') {z = 2}});return z === 2});

//subscribtion
tests.push(function() {
    //b is currently 10, nudge is 10
    window.x = 1;
    b.subscribe(function() {
      x++;  
    })
    b.plus();
    return b.get()==='20' && x===2
})
//2 callbacks
tests.push(function() {
    window.y = 1;
    b.subscribe(function() {
      y++;  
    })
    b.plus(); //x and y were incremented so x===3 and y===2
    return b.get()==='30' && x===3 && y===2
})
//no callbacks defined but they should still fire
tests.push(function() {
    b.plus();
    return b.get()==='40' && x===4 && y===3
})
//no callbacks defined but they should still fire
tests.push(function() {
    //immediate callback will -1 from x, but the subscribing callback will +1, so it will remain
    //the same. Meanwhile y will be +1
    b.minus(function() {
        x--;
    });
    return b.get()==='30' && x===4 && y===4
})
tests.push(function() {
    //immediate callback will set x and y and return false, preventing the subscribers from fireing
    b.minus(function() {
        x=1;
        y=1;
        return false
    });
    return b.get()==='20' && x===1 && y===1
})
for (var i=0;i<tests.length;i++) {
    take_test(tests[i], i);
}


