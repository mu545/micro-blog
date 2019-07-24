$(document).ready(function (req, res) {
  // a.k.a this
  let self = this;

  // element
  let dom = $('#user');

  // context data
  let context = {};

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    userSetupForm(dom, context);
  };

  // Run init
  init();
});

/**
 * Form user setup.
 *
 * @param   jquery
 * @param   object
 * @return  void
 */
let userSetupForm = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context data
  dom = dom.find('#userSetupForm');
  let ctx = context.userSetupForm = {
    dom: dom
  };

  // input
  let input = ctx.input = dom.find('*[data-input="user"]');
  let button = ctx.button = dom.find('*[data-button="user"]');

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    dom.submit(self.setupUser);
  };

  /**
   * Setup user.
   *
   * @param   jquery
   * @return  void
   */
  this.setupUser = function (jq) {
    if (jq.target.checkValidity() == false) return;

    swal({
      text: 'creating user admin',
      button: false,
      closeOnEsc: false,
      closeOnEnter: false,
      closeOnClickOutside: false
    });

    let setupUser = {
      name: input[0].value,
      email: input[1].value,
      phone: input[2].value,
      username: input[3].value,
      password: input[4].value,
      confirm: input[5].value
    };

    $.ajax({
      type: 'POST',
      url: '/api/v1/user',
      data: setupUser,
      error: function (jqXHR) {
        swal({
          icon: 'error',
          content: $(messageXHR(jqXHR))[0],
          button: 'OK'
        });
      },
      success: function (data, status, jqXHR) {
        swal({
          icon: 'success',
          content: $(messageXHR(jqXHR))[0],
          button: 'OK'
        })
        .then(function () {
          window.location.reload();
        });
      }
    });

    jq.preventDefault();
  };

  // Run init
  init();
};