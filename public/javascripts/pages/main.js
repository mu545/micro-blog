$(document).ready(function () {
  // a.k.a this
  let self = this;

  // input
  let button = [];

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    button = $('#navbar').find('*[data-button="navbar"]');

    $(button[0]).click(self.logout);
  };

  /**
   * Logout from system.
   *
   * @return  void
   */
  this.logout = function () {
    swal({
      text: 'logout from system',
      button: false,
      closeOnEsc: false,
      closeOnEnter: false,
      closeOnClickOutside: false
    });

    $.ajax({
      type: 'GET',
      url: '/users/api/logout',
      error: function (jqXHR) {
        swal({
          icon: 'error',
          text: 'failure to logout from system',
          button: 'Ok'
        });
      },
      success: function (data, status, jqXHR) {
        swal({
          icon: 'success',
          text: 'successful logout from system',
          button: false
        });

        window.location.href = '/users/login';
      }
    });
  };

  // Run init
  init();
});