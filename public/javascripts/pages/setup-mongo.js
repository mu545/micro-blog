$(document).ready(function () {
  // a.k.a this
  let self = this;

  // element
  let dom = $('#mongo');

  // context data
  let context = {};

  /**
   * Intialization.
   *
   * @return  void
   */
  let init = function () {
    mongoSetupForm(dom, context);
  };

  // Run init
  init();
});

/**
 * Form mongo setup.
 *
 * @param   jquery
 * @param   object
 * @return  void
 */
let mongoSetupForm = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context data
  dom = dom.find('#mongoSetupForm');
  let ctx = context.mongoSetupForm = {
    dom: dom
  };

  // input
  let input = ctx.input = dom.find('*[data-input="mongo"]');
  let button = ctx.button = dom.find('*[data-button="mongo"]');

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    dom.submit(self.setupMongo);
  };

  /**
   * Setup mongo.
   *
   * @param   jquery
   * @return  void
   */
  this.setupMongo = function (jq) {
    swal({
      text: 'connecting to database',
      button: false,
      closeOnEsc: false,
      closeOnEnter: false,
      closeOnClickOutside: false
    });

    let mongoSetup = {
      mongo_string: input[0].value,
      username: input[1].value,
      password: input[2].value
    };

    $.ajax({
      type: 'POST',
      url: '/api/v1/mongo',
      data: mongoSetup,
      error: function(jqXHR) {
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