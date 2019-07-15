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
    postUpdateForm(dom, context);
  };

  // Run init
  init();
});

/**
 * Update post form.
 *
 * @param   jquery
 * @param   context
 * @return  void
 */
let postUpdateForm = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context
  dom = dom.find('#postUpdateForm');
  let ctx = context.postUpdateForm = {
    post: {
      _id: null
    }
  };

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

    let urlSearch = new URLSearchParams(window.location.search);

    if (!urlSearch.has('_id')) {
      swal({
        icon: 'error',
        text: 'post id is required',
        button: 'Ok'
      });

      return;
    } else {
      ctx.post._id = urlSearch.get('_id');
    }

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

        $(dom).submit(self.updatePost);

        $.ajax({
          type: 'GET',
          url: '/users/api/v1/post',
          data: {_id: ctx.post._id},
          error: function (jqXHR) {
            swal({
              icon: 'error',
              content: $(messageXHR(jqXHR))[0],
              button: 'Ok'
            });
          },
          success: function (data) {
            input[0].value = data.post.title;
            input[1].value = data.post.subtitle;
            $(select[0]).val(data.post.labels);
            input[2].value = data.post.content;

            domContentSummernote = $(input[2]).summernote({
              dialogsInBody: true,
              minHeight: 150,
              toolbar: [
                ['style', ['bold', 'italic', 'underline', 'clear']],
                ['font', ['strikethrough']],
                ['para', ['paragraph']]
              ]
            });

            ctx.post = data.post;

            swal({
              icon: 'success',
              button: 'Ok'
            });
          }
        });
      }
    });
  };

  /**
   * Update current post.
   *
   * return   void
   */
  this.updatePost = function (jq) {
    jq.preventDefault();

    let updatePost = {
      _id: ctx.post._id,
      title: input[0].value,
      subtitle: input[1].value,
      labels: $(select[0]).val(),
      content: input[2].value
    };

    $.ajax({
      type: 'PUT',
      url: '/users/api/v1/post',
      data: updatePost,
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