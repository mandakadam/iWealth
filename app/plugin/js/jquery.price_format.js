/*

* Price Format jQuery Plugin
* Created By Eduardo Cuducos cuducos [at] gmail [dot] com
* Currently maintained by Flavio Silveira flavio [at] gmail [dot] com
* Version: 1.7
* Release: 2012-02-22

* original char limit by Flavio Silveira 
* original keydown event attachment by Kaihua Qi
* keydown fixes by Thasmo 
* Clear Prefix on Blur suggest by Ricardo Mendes from PhonoWay
* original allow negative by Cagdas Ucar 
* keypad fixes by Carlos Vinicius 
* original Suffix by Marlon Pires Junior

*/

(function($j) {

	/****************
	* Main Function *
	*****************/
	$j.fn.priceFormat = function(options)
	{

		var defaults =
		{
			prefix: 'US$ ',
            suffix: '',
			centsSeparator: '.',
			thousandsSeparator: ',',
			limit: false,
			centsLimit: 2,
			clearPrefix: false,
            clearSufix: false,
			allowNegative: false
		};

		var options = $j.extend(defaults, options);

		return this.each(function()
		{

			// pre defined options
			var obj = $j(this);
			var is_number = /[0-9]/;

			// load the pluggings settings
			var prefix = options.prefix;
            var suffix = options.suffix;
			var centsSeparator = options.centsSeparator;
			var thousandsSeparator = options.thousandsSeparator;
			var limit = options.limit;
			var centsLimit = options.centsLimit;
			var clearPrefix = options.clearPrefix;
            var clearSuffix = options.clearSuffix;
			var allowNegative = options.allowNegative;

			// skip everything that isn't a number
			// and also skip the left zeroes
			function to_numbers (str)
			{
				var formatted = '';
				for (var i=0;i<(str.length);i++)
				{
					char_ = str.charAt(i);
					if (formatted.length==0 && char_==0) char_ = false;

					if (char_ && char_.match(is_number))
					{
						if (limit)
						{
							if (formatted.length < limit) formatted = formatted+char_;
						}
						else
						{
							formatted = formatted+char_;
						}
					}
				}

				return formatted;
			}

			// format to fill with zeros to complete cents chars
			function fill_with_zeroes (str)
			{
				while (str.length<(parseInt(centsLimit)+1)) str = '0'+str;
				return str;
			}

			// format as price
			function price_format (str)
			{
// 		   var str =""+str
// 		   var newstr = (str + "").split(".");
// 
// 		   var decDig=newstr[1];
// 		   var intPart=newstr[0]||0;
// 
// 		   if(decDig)
// 		     decDig=$j.trim(""+decDig)
// 		   if(intPart)
// 		     intPart=$j.trim(""+intPart);
// 		     
// 		     var decPnt=decDig?decDig.length:0;
// 		     if(decPnt<centsLimit)
// 		     {
// 		        str=str+".";
//            for(var i=0,len=centsLimit-decPnt;i<len;i++)
//               str=str+"0";
//          }  
//          else if(centsLimit<decPnt)
//              str=intPart+"."+decDig//.substr(0,centsLimit);

				// formatting settings
				var formatted = fill_with_zeroes(to_numbers(str));
				var thousandsFormatted = '';
				var thousandsCount = 0;

				// split integer from cents
				var centsVal = formatted.substr(formatted.length-centsLimit,centsLimit);
				var integerVal = formatted.substr(0,formatted.length-centsLimit);
				
        // apply cents pontuation
				if(centsLimit!="0")
				  formatted = integerVal+centsSeparator+centsVal;
				else
				  formatted = integerVal
          
				// apply thousands pontuation
				if (thousandsSeparator)
				{
					for (var j=integerVal.length;j>0;j--)
					{
						char_ = integerVal.substr(j-1,1);
						thousandsCount++;
						if (thousandsCount%3==0) char_ = thousandsSeparator+char_;
						thousandsFormatted = char_+thousandsFormatted;
					}
					if (thousandsFormatted.substr(0,1)==thousandsSeparator) thousandsFormatted = thousandsFormatted.substring(1,thousandsFormatted.length);
    			if(centsLimit!="0")
		  			formatted = thousandsFormatted+centsSeparator+centsVal;
		  		else
            formatted = thousandsFormatted	
				}
				// if the string contains a dash, it is negative - add it to the begining (except for zero)
				if (allowNegative && str.indexOf('-') != -1 && (integerVal != 0 || centsVal != 0)) formatted = '-' + formatted;

				// apply the prefix
				if (prefix) formatted = prefix+formatted;
                
                // apply the suffix
				if (suffix) formatted = formatted+suffix;

				return formatted;
			}

			// filter what user type (only numbers and functional keys)
			function key_check (e)
			{
				var code = (e.keyCode ? e.keyCode : e.which);
				var typed = String.fromCharCode(code);
				var functional = false;
	      if(isNaN(typed))
          return; 		

				var str = obj.val();
				var newValue = price_format(str+typed);

				// allow key numbers, 0 to 9
				if((code >= 48 && code <= 57) || (code >= 96 && code <= 105)) functional = true;

				// check Backspace, Tab, Enter, Delete, and left/right arrows
				if (code ==  8) functional = true;
				if (code ==  9) functional = true;
				if (code == 13) functional = true;
				if (code == 46) functional = true;
				if (code == 37) functional = true;
				if (code == 39) functional = true;
				if (allowNegative && (code == 189 || code == 109)) functional = true; // dash as well

				if (!functional)
				{
					e.preventDefault();
					e.stopPropagation();
					if (str!=newValue) obj.val(newValue);
				}

			}

			// inster formatted price as a value of an input field
			function price_it ()
			{
				var str = obj.val();
				var price = price_format(str);
				if (str != price) obj.val(price);
			}

			// Add prefix on focus
			function add_prefix()
			{
				var val = obj.val();
				obj.val(prefix + val);
			}
            
            function add_suffix()
			{
				var val = obj.val();
				obj.val(val + suffix);
			}

			// Clear prefix on blur if is set to true
			function clear_prefix()
			{
				if($j.trim(prefix) != '' && clearPrefix)
				{
					var array = obj.val().split(prefix);
					obj.val(array[1]);
				}
			}
            
            // Clear suffix on blur if is set to true
			function clear_suffix()
			{
				if($j.trim(suffix) != '' && clearSuffix)
				{
					var array = obj.val().split(suffix);
					obj.val(array[0]);
				}
			}

			// bind the actions
			$j(this).bind('keydown', key_check);
			$j(this).bind('keyup', function(e){
      var code = (e.keyCode ? e.keyCode : e.which);
      if (code ==  8) return;
      price_it()
      });
      $j(this).bind('focusout', function()
			{
					$j(this).val($j(this).unmask())
			});
			// Clear Prefix and Add Prefix
			if(clearPrefix)
			{
				$j(this).bind('focusout', function()
				{
				  price_it();
					clear_prefix();
					$j(this).val($j(this).unmask())
				});

				$j(this).bind('focusin', function()
				{
					add_prefix();
				});
			}
			
			// Clear Suffix and Add Suffix
			if(clearSuffix)
			{
				$j(this).bind('focusout', function()
				{
                    clear_suffix();
				});

				$j(this).bind('focusin', function()
				{
                    add_suffix();
				});
			}

			// If value has content
			if ($j(this).val().length>0)
			{
				price_it();
				clear_prefix();
                clear_suffix();
			}

		});

	};
	
	/******************
	* Unmask Function *
	*******************/
	jQuery.fn.unmask = function(){
		var field = ""+$j(this).val();
		var result = "";
		for(var i = 0 ; i < field.length; i++)
    {
      f=field.charAt(i);
      if(f=='.')result += f
      else if(!isNaN(f) || f== "-") result += f;
          
    }		
		return result;
	};

})(jQuery);