$(document).ready(function (req, res) {
  // a.k.a this
  let self = this;

  // element
  dom = $('#post-view');

  // context data
  let context = {};

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    postViewHeader(dom, context);
    postViewContent(dom, context);
  };

  // Run init
  init();
});

/**
 * Post header.
 *
 * @param   jquery
 * @param   object
 * @return  void
 */
let postViewHeader = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context
  dom = dom.find('#post-viewHeader');
  let ctx = context.postHeader = {
    dom: dom,
    post: null
  };

  // input
  let text = ctx.text = dom.find('*[data-text="post"]');

  // pagination
  let paginate = {
    _id: null
  };

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    let urlSearch = new URLSearchParams(window.location.search);

    if (urlSearch.has('_id')) {
      paginate._id = urlSearch.get('_id');
    }

    loadPost();
  };

  /**
   * Load post.
   *
   * @return  void
   */
  this.loadPost = function () {
    $.ajax({
      type: 'GET',
      url: '/api/v1/post',
      data: {_id: paginate._id},
      error: function (jqXHR) {

      },
      success: function (data) {
        $(text[0]).html(data.post.title);
        $(text[1]).html(data.post.subtitle);
        $(text[2]).html(`Published by ${data.post.created_by.name} on ${moment(data.post.created).format('MMMM Do, YYYY')}`);
        $(context.postContent.text[0]).html(data.post.content);
      }
    });
  };

  // Run init
  init();
};

/**
 * Post content.
 *
 * @param   jquery
 * @param   object
 * @return  void
 */
let postViewContent = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context
  dom = dom.find('#post-viewContent');
  let ctx = context.postContent = {
    dom: dom
  };

  // input
  let text = ctx.text = dom.find('*[data-text="post"]');

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