$(function() {
  console.log('load');
  $('#socketMessage').html('xxx');
  console.log(location.origin);

  $('#btnGetToken').click(function() {
  	console.log('get token');
  	$.ajax({
	  	url: location.origin + '/get_upload_token',
	  	success: function(data) {
	  		console.log(data);
	  		$('#txtToken').val(data);
	  	}
	  });
  });
  
});