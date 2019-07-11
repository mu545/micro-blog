$(document).ready(function () {
  // a.k.a this
  let self = this;

  // element
  let dom = $('#main');

  // context data
  let context = {};

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    mainSidebar(dom, context);
    mainNavbar(dom, context);
  };

  // Run init
  init();
});

/**
 * Main sidebar.
 *
 * @param   jquery
 * @return  context
 * @return  void
 */
let mainSidebar = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context
  dom = dom.find('#mainSidebar');
  let ctx = context.mainSidebar = {
    dom: dom
  };

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
  };

  // Run init
  init();
};

/**
 * Main navbar.
 *
 * @param   jquery
 * @param   context
 * @return  void
 */
let mainNavbar = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context
  dom = dom.find('#mainNavbar');
  let ctx = context.mainNavbar = {};

  // input
  let button = ctx.button = dom.find('*[data-button="main"]');

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
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
      type: 'DELETE',
      url: '/users/api/v1/auth',
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
};