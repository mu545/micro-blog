$(document).ready(function () {
  // a.k.a this
  let self = this;

  // element
  let dom = $('#dashboard');

  // context data
  let context = {};

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    dashboardInfo(dom, context);
  };

  // Run init
  init();
});

/**
 * Dashboard info.
 *
 * @param   jquery
 * @param   context
 * @return  void
 */
let dashboardInfo = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context
  dom = dom.find('#dashboardInfo');
  let ctx = context.dashboardInfo = {};

  // input
  let text = dom.find('*[data-text="dashboard"]');

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
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
      url: '/users/api/v1/system-information',
      error: function (jqXHR) {
        swal({
          icon: 'error',
          content: $(messageXHR(jqXHR))[0],
          button: 'Ok'
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
};