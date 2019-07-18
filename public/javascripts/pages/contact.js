$(document).ready(function (req, res) {
  // a.k.a this
  let self = this;

  // element
  let dom = $('#contact');

  // context data
  let context = {};

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    contactSendForm(dom, context);
  };

  // Run init
  init();
});

/**
 * Contact send form.
 *
 * @param   jquery
 * @param   object
 * @return  void
 */
let contactSendForm = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context data
  dom = dom.find('#contactSendForm');
  let ctx = context.contactSendForm = {};

  // input
  let input = ctx.input = dom.find('*[data-input="contact"]');
  let button = ctx.button = dom.find('*[data-button="contact"]');

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    dom.submit(self.sendMessage);
  };

  /**
   * Send message to email.
   *
   * @param   jquery
   * @return  void
   */
  this.sendMessage = function (jq) {
    let messageBody = `Hi, my name is ${input[0].value} ${input[1].value} ${input[2].value} \n ${input[3].value}`;

    window.open(`emailto:mus4.sutisn4@gmail.com?subject=contact%20me&body=${encodeURIComponent(messageBody)}`);

    jq.preventDefault();
  };

  // Run init
  init();
};