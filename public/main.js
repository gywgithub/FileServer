$(function() {
	$('#socketMessage').html('xxx');

	let socket = io();
	socket.on('showMessage', function (message) {
		console.log('0000');
    $('#socketMessage').html(message);
  });

	$('#updateClick').click(function() {
		socket.emit('updateSocketStatus', Math.random());
	});

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
