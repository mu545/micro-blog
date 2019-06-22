$(document).ready(function () {
  // a.k.a this
  let self = this;

  // input
  let text = [];

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    text = $('#dashboard').find('*[data-text="dashboard"]');

    self.loadSystemInformation();
  };

  /**
   * Load system information.
   *
   * @return  void
   */
  this.loadSystemInformation = function () {
    swal({
      text: 'load system information',
      button: false,
      closeOnEsc: false,
      closeOnEnter: false,
      closeOnClickOutside: false
    });

    $.ajax({
      type: 'GET',
      url: '/users/api/system-information',
      error: function (jqXHR) {
        swal({
          icon: 'error',
          content: $(messageXHR(jqXHR))[0]
        });
      },
      success: function (data) {
        text[0].innerHTML = data.total_users;
        text[1].innerHTML = data.total_active_users;

        swal({
          icon: 'success',
          button: 'Ok'
        });
      }
    })
  };

  // Run init
  init();
});