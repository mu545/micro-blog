$(document).ready(function () {
  // a.k.a this
  let self = this;

  // element
  let dom = $('#login');

  // context data
  let context = {};

  // Initialization
  let init = function () {
    loginForm(dom, context);
  };

  // Run init
  init();
});

/**
 * Login form.
 *
 * @param   jquery
 * @param   context
 * @return  void
 */
let loginForm = function(dom, context) {
  // a.k.a this
  let self = this;

  // create context
  dom = dom.find('#loginForm');
  let ctx = context.loginForm = {};

  // input
  let input = ctx.input = dom.find('*[data-input="login"]');
  let button = ctx.button = dom.find('*[data-button="login"]');

  // element
  let domMessages = dom.find('#loginFormMessages');

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    dom.submit(self.login);
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
      url: '/users/api/v1/auth',
      data: {username: input[0].value, password: input[1].value},
      error: function (jqXHR) {
        domMessages.html(messageXHR(jqXHR, {type: 'alert'}));
      },
      success: function (data, status, jqXHR) {
        domMessages.html(messageXHR(jqXHR, {type: 'alert'}));

        window.location.href = '/users/dashboard';
      }
    });
  
    jq.preventDefault();
  };

  // Run init
  init();
};