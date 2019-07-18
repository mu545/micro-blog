$(document).ready(function () {
  // a.k.a this
  let self = this;

  // element
  let dom = $('#post');

  // context data
  let context = {};

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    postNewForm(dom, context);
  };

  // Run init
  init();
});

/**
 * New post form.
 *
 * @param   jquery
 * @param   context
 * @return  void
 */
let postNewForm = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context
  dom = dom.find('#postNewForm');
  let ctx = context.postNewForm = {};

  // element
  let domContentSummernote = null;

  // input
  let input = ctx.input = dom.find('*[data-input="post"]');
  let select = ctx.select = dom.find('*[data-select="post"]');
  let button = ctx.button = dom.find('*[data-button="post"]');

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    swal({
      text: 'load post configuration',
      button: false,
      closeOnEsc: false,
      closeOnEnter: false,
      closeOnClickOutside: false
    });

    $.ajax({
      type: 'GET',
      url: '/users/api/v1/labels',
      data: {length: 999, offset: 0},
      error: function (jqXHR) {
        swal({
          icon: 'error',
          content: $(messageXHR(jqXHR))[0],
          button: 'Ok'
        });
      },
      success: function (data) {
        let selectLabels = '';

        for (var labelIndex in data.labels) {
          let label = data.labels[labelIndex];

          selectLabels += `<option value="${label._id}">${label.label}</option>`;
        }

        $(select[0]).html(selectLabels);

        domContentSummernote = $(input[2]).summernote({
          dialogsInBody: true,
          minHeight: 150,
          toolbar: [
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['strikethrough']],
            ['para', ['paragraph']]
          ]
        });

        $(dom).submit(self.createPost);

        swal({
          icon: 'success',
          button: 'Ok'
        });
      }
    });
  };

  /**
   * Create new post.
   *
   * return   void
   */
  this.createPost = function (jq) {
    jq.preventDefault();

    let newPost = {
      title: input[0].value,
      subtitle: input[1].value,
      labels: $(select[0]).val(),
      content: input[2].value
    };

    $.ajax({
      type: 'POST',
      url: '/users/api/v1/post',
      data: newPost,
      error: function (jqXHR) {
        swal({
          icon: 'error',
          content: $(messageXHR(jqXHR))[0],
          button: 'Ok'
        })
      },
      success: function (data, status, jqXHR) {
        swal({
          icon: 'success',
          content: $(messageXHR(jqXHR))[0],
          button: 'Ok'
        });
      }
    });
  };

  // Run init
  init();
};