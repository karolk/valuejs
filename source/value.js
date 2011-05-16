//ver 0.2
//copyright Karol Kowalski <kowcik@gmail.com>

function Value(conf) {
    
    if ( !instance_of_Value(this) ) {
        return new Value(conf);
    }
        
    var me = this,
    
    //was conf passed, if not it'll empty
        conf = conf || {},
    
        n_value =         (is_numeric(conf.value) && conf.value) || 0,
        n_min =           (is_numeric(conf.min) && conf.min) || (n_value>=0 ? 0 : n_value),
        n_max =           (is_numeric(conf.max) && conf.max) || Number.MAX_VALUE,
        n_nudge =         (is_numeric(conf.nudge) && numeric_positive(conf.nudge)) || 1,
        n_plus_nudge =    (is_numeric(conf.plus_nudge) && numeric_positive(conf.plus_nudge)) || n_nudge,
        n_minus_nudge =   (is_numeric(conf.minus_nudge) && numeric_negative(conf.minus_nudge)) || numeric_negative(n_nudge),
        
        b_frozen =        (typeof conf.frozen === 'boolean') ? conf.frozen : false,
        
        //formatting defaults
        s_separator = '',
        s_symbol = '',
        s_position = 'after',
        s_nill = '',
        b_format_thousands = false,
        
        s_prefix = '',
        s_suffix = '',
        subscribers = [],
        delta = 0,
        
        //useful formatting defaults
        formats = {
            quantity: {symbol:'',format_thousands: true},
            money: {symbol:'$', position: 'before', format_thousands: true},
            percent: {symbol:'%'}
        };
    
    handle_format_change(conf.format);
    
    function instance_of_Value(val) {
        return val instanceof Value
    }
    
    function handle_format_change(new_o_format) {
        if (new_o_format) {
            typeof( new_o_format ) === 'object' && apply_format(new_o_format);
            typeof( new_o_format ) === 'string' && new_o_format in formats && apply_format(formats[new_o_format]);
        }
    }
    
    function apply_format(new_o_format) {
        
        is_string(new_o_format.separator)   && (s_separator = new_o_format.separator);
        is_string(new_o_format.symbol)      && (s_symbol = new_o_format.symbol);
        is_string_not_empty(new_o_format.position) && (s_position = new_o_format.position);
        is_string(new_o_format.nill) && (s_nill = new_o_format.nill);
        typeof new_o_format.format_thousands === 'boolean' && (b_format_thousands = new_o_format.format_thousands);
        
        switch(s_position) {
            
            case 'before':
                s_prefix = s_symbol+s_separator;
                break;

            case 'after':
            default:
                s_suffix = s_separator+s_symbol;
                break;

        }
   
    }
    
    //priv methods
    function is_numeric(input) {
        //let's use parseFloat instead of Number for converstion
        //because it's more forgiving
        //for example:
        //Number ('1.23test') => NaN
        //parseFloat ('1.23test') => 1.23
        return !(isNaN(parseFloat(input)));
    }
    
    function numeric_positive(num) {
        return Math.abs(num);
    }
    
    function numeric_negative(num) {
        return -1*Math.abs(num);
    }
    
    function is_string(str) {
        return typeof str === 'string';
    }
    
    function is_string_not_empty(str) {
        return is_string(str) && str.length;
    }
    
    function is_within_limit(test_value) {
        return test_value>=n_min && test_value<=n_max;
    }
    
    function format_thousands(num) {
                
        var floor = Math.floor(num)
        var decimal = num - floor;
        var str_nr=floor+'';
        
        var len = str_nr.length;
        var prefix_len = len%3||3;
        //chop of the first 1 character (this may change)
        var start = str_nr.substr(0,prefix_len);
        var end = str_nr.substr(prefix_len);
        
        //add commas
        end = end.replace(/(\d{3})/g, ",$1");
        
        if (decimal) {
            end+=(decimal+'').substr(1);
        }
                
        return start+end;

    };
                
    //prepares output string
    function format_value(val) {
        
        var fmt_value = val || n_value;
        
        var str_value;
        
        //num to string
        if (b_format_thousands) {
            str_value = format_thousands(fmt_value);
        }
        else {
            str_value = fmt_value+'';
        }
        
        var ret = s_prefix+str_value+s_suffix;
        
        if (fmt_value===0) {
            if (s_nill) {
                ret = s_nill;
            }
        }
        
        return ret;

    }
        
    //removes formatting and returns value
    //useful for validating input
    function unformat_value(input) {
        
        var input = input+'';
        
        if (input===s_nill) {
            return 0;
        }
        else {
            return input.replace(/\D/gi,''); 
        }
        
    }
    
    function nudge(change, callback) {
        var new_value = n_value+change;
        me.set(new_value, callback);
    }
    
    function handle_callback(passed_callback) {
        
        //there are 2 kinds of callback
        //subscribers
        //callback passed to value changing method
        //if passed callback returned false don't fire subscribers
        
        var passed_callback_ret = passed_callback && passed_callback.call(me, me);
        
        if (passed_callback_ret!==false) {
            
            for (var i=0, l=subscribers.length; i<l; i++) {
                subscribers[i].call(me, me)
            }
            
        }
        
        
    }
    
    //for other object to make informed decision about the direction
    //delta is going to be passed with the callback
    function save_delta(new_value) {
        delta = new_value - n_value;
    }
    
    //function that does the actual change
    function CHANGE(new_value) {
        if (!b_frozen) {
            n_value = new_value;
        }
    }
    
    me.format = function(new_o_format) {
        
        if (new_o_format) {
            handle_format_change(new_o_format);
            return me;
        }
        
        else {
            //if nothing was passed, format will return
            //new object with fields copied by value
            return {
                    separator:s_separator,
                    symbol:s_symbol,
                    position:s_position,
                    nill:s_nill,
                    format_thousands:b_format_thousands
            }
        }
        
    }
    
    me.setNudge = function(new_nudge) {
    
        if ( is_numeric(new_nudge) ) {
        
            n_nudge = numeric_positive(new_nudge);
            
            n_plus_nudge = numeric_positive(n_nudge);
            n_minus_nudge = numeric_negative(n_nudge);
            
            return me;
        }
        
        else {
            //something other than a number was passed
            //assume it just wants to be a getter
            return n_nudge;
        }
    
    };
    
    me.plusNudge = function(new_nudge) {
        
        if ( is_numeric(new_nudge) ) {
            
            n_plus_nudge = numeric_positive(new_nudge);
            return me;
            
        }
        
        else {
            return n_plus_nudge;
        }
        
    };
    
    me.minusNudge = function(new_nudge) {
        
        if ( is_numeric(new_nudge) ) {
            
            n_minus_nudge = numeric_negative(new_nudge);
            return me;
            
        }
        
        else {
            return n_minus_nudge;
        }
        
    };
    
    me.nudge = function(nudge_value, callback) {
        
        nudge(nudge_value, callback);
        
        return me;
    
    };
    
    me.plus = function(nudge_value, callback) {
        
        var nv = is_numeric(arguments[0]) ? nudge_value : n_plus_nudge,
            callback = typeof(arguments[0])==='function' ? arguments[0] : arguments[1];
        
        nudge(nv, callback);
        
        return me;
        
    }

    me.minus = function(nudge_value, callback) {
        
        var nv = is_numeric(arguments[0]) ? nudge_value : n_minus_nudge,
            callback = typeof(arguments[0])==='function' ? arguments[0] : arguments[1];
        
        nudge(nv, callback);
        
        return me;
        
    }

    me.get = function() {
    
        return format_value();
    
    }
    
    me.set = function(input_value, callback) {
        
        //if there is something
        if (input_value !== '') {
            
            if (is_numeric(input_value)) {
                 //if the value can be converted to numeric, convert it now
                 var test_value = parseFloat(input_value);
            }
            
            else {
            
                //might be something like '$1000 stolen money'
                //need to unformat first
                var test_value = unformat_value(input_value);
                //console.log('after unformat', test_value);
                //might be an empty string at this moment
                //but this will be NaN, so will fail on next check
                test_value = parseFloat(test_value);
            
            }
            
            //test value might be numeric - no problem, or NaN - then perhaps we need to convert it back
            if (!isNaN(test_value)) {
                              
                //new value should stay within limit
                if (is_within_limit(test_value)) {
                    
                    //if the value is the same don't change it
                    if (test_value!==n_value) {
                        
                        save_delta(test_value);
                        CHANGE(test_value);
                        handle_callback(callback);
                    
                    }
                    
                }
                
                else {
                    //this should be intelligent enough to set new value as
                    //the upper limit if the value was too high
                    //and low limit if too low
                    
                }
            
            }
            
            
       
        }
        
        //lack of anything might mean nill, if it's allowed
        //otherwise nothing should set, and the value stays as before
        else {
        
        
        }
        
        return me;
       
    };

    this.value = function() {
        return n_value
    };
 
    this.max = function(new_max) {
        
        if ( is_numeric(new_max) ) {
        
            n_max = new_max;
            
            if (!(is_within_limit(n_value))) {
                me.set(n_max);
            }
            
            if (n_min>n_max) {
                me.min(n_max);
            }
            return me;
        }
        
        else {
            //something other than a number was passed
            //assume it just wants to be a getter
            return n_max;
        }
        
    };

    this.min = function(new_min) {
        
        if ( is_numeric(new_min) ) {
        
            n_min = new_min;
            
            if (!(is_within_limit(n_value))) {
                me.set(n_min);
            }
            
            if (n_min>n_max) {
                me.max(n_min);
            }
            return me;
        }
        
        else {
            //something other than a number was passed
            //assume it just wants to be a getter
            return n_min;
        }

    };
    
    this.delta = function() {
        return delta;
    };
    
    this.freeze = function() {
        
        b_frozen = true;
        
        return me;
        
    };
    
    this.defrost = function() {
        
        b_frozen = false;
        
        return me;
        
    };
    
    this.subscribe = function(handler) {
        
        subscribers.push(handler);
        
        return me;
        
    }
    
    this.derive = function() {
    
        var args = Array.prototype.slice.apply(arguments, [0,arguments.length-1]),
            formula = arguments[arguments.length-1],
            formula_callback = function() {me.set( formula.apply(me, args) )},
            new_min = 1,
            new_max = 1;
        
        //all arguments but last must be values
        //last argument is a formula to define relationship
        for (var i=0, l=arguments.length-1; i<l; i++) {
            var arg = arguments[i];
            if ( !instance_of_Value(arg) ) {
                return false;
            }
            //because we don't know the relation between components, we can't estabilish min/max
            arg.subscribe(formula_callback)
        }
        
        formula_callback();
        
        return me;
    
    }
    
    this.toString = this.get
    
    this.valueOf = this.value
    
};