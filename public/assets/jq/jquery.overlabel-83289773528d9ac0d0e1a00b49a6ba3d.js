/*! Copyright (c) 2008 Brandon Aaron (http://brandonaaron.net)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) 
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Based on Making Compact Forms More Accessible by Mike Brittain (http://alistapart.com/articles/makingcompactformsmoreaccessible)
 */
(function(e){e.fn.overlabel=function(){this.each(function(){var t=e(this),n=e("#"+t.attr("for"));t.addClass("overlabel").bind("click",function(e){n.focus()}),n.bind("focus blur",function(e){t.css("display",e.type=="blur"&&!n.val()?"":"none")}).trigger("blur")})}})(jQuery);