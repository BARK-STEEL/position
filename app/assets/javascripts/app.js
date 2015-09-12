console.log('scripts loaded');

var token = $('#api-token').val();
$.ajaxSetup({
  headers: {
    "token": token
  }
});
