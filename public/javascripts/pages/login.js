$(document).ready(function () {
  // a.k.a this
  let self = this;

  // input
  let input = [];
  let button = [];

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    input = $('#formLogin').find('*[data-input="login"]');
    button = $('#formLogin').find('*[data-button="login"]');

    $('#formLogin').submit(self.login);
  };

  /**
   * Login to micro blog.
   *
   * @return  void
   */
  this.login = function (jq) {
    if (jq.target.checkValidity() == false) return;

    $.ajax({
      type: 'POST',
      url: '/users/api/login',
      data: {username: input[0].value, password: input[1].value},
      error: function (jqXHR) {
        $('#formMessages').html(messageXHR(jqXHR, {type: 'alert'}));
      },
      success: function (data, status, jqXHR) {
        $('#formMessages').html(messageXHR(jqXHR, {type: 'alert'}));

        window.location.href = '/users/dashboard';
      }
    });
  
    jq.preventDefault();
  };

  // Run init
  init();
});