
$("#show_hide_password i").on('click', function (event) {
  event.preventDefault();
  if ($('#show_hide_password input').attr("type") == "text") {
    $('#show_hide_password input').attr('type', 'password');
    $('#show_hide_password i').addClass("fa-eye");
    $('#show_hide_password i').removeClass("fa-eye-slash");
  } else if ($('#show_hide_password input').attr("type") == "password") {
    $('#show_hide_password input').attr('type', 'text');
    $('#show_hide_password i').removeClass("fa-eye");
    $('#show_hide_password i').addClass("fa-eye-slash");
  }
});