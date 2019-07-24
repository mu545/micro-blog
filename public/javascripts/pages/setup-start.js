$(document).ready(function () {
  // a.k.a this
  let self = this;

  // element
  let dom = $('#start');

  // context data
  let context = {};

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    startSetupForm(dom, context);
  };

  // Run init
  init();
});

/**
 * Form start setup.
 *
 * @param   jquery
 * @param   object
 * @return  void
 */
let startSetupForm = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context data
  dom = dom.find('#startSetupForm');
  let ctx = context.startSetupForm = {
    dom: dom
  };

  // input
  let button = ctx.button = dom.find('*[data-button="start"]');

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    dom.submit(self.startSetup);
  };

  /**
   * Start setup.
   *
   * @param   jquery
   * @return  void
   */
  this.startSetup = function (jq) {
    swal({
      text: 'starting setup system',
      button: false,
      closeOnEsc: false,
      closeOnEnter: false,
      closeOnClickOutside: false
    });

    $.ajax({
      type: 'POST',
      url: '/api/v1/start',
      data: {},
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