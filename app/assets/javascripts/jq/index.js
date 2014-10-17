  $(document).ready(function() {
    $("a:has(img), a img").css("border", "none");
    
    $('input[type=text]').focus(function(){ 
      if($(this).val() == $(this).attr('defaultValue'))
      {
        $(this).val('');
      }
    });

    $('input[type=text]').blur(function(){
      if($(this).val() == '')
      {
        $(this).val($(this).attr('defaultValue'));
      } 
    });

	$(".overlabel").overlabel();

  });

