$(document).ready(function () {
  // a.k.a this
  let self = this;

  // element
  let dom = $('#posts');

  // context data
  let context = {};

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    postsList(dom, context);
    postsDetailForm(dom, context);
  };

  // Run init
  init();
});

/**
 * List posts.
 *
 * @param   jquery
 * @param   context
 * @return  void
 */
let postsList = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context
  dom = dom.find('#postsList');
  let ctx = context.postsList = {
    dom: dom,
    table: null,
    posts: null
  };

  // element
  let domFilter = dom.find('#postsListFilter');
  let domTable = dom.find('#postsListTable');
  let domPage = dom.find('#postsListPage');

  // input
  let input = ctx.input = domFilter.find('*[data-input="posts"]');
  let select = ctx.select = domFilter.find('*[data-select="posts"]');
  let button = ctx.button = domFilter.find('*[data-button="posts"]');

  // pagination
  let paginate = {
    length: 10,
    offset: 0,
    title: null,
    instance: null,
    option: {
      totalPages: 0,
      startPage: 1,
      first: false,
      prev: '<i class="fas fa-angle-left"></i>',
      next: '<i class="fas fa-angle-right"></i>',
      last: false,
      initiateStartPageClick: false
    }
  };

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    ctx.table = domTable.DataTable({
      serverSide: true,
      ajax: {
        type: 'GET',
        url: '/users/api/v1/posts',
        data: self.loadData,
        dataSrc: self.loadSrc,
        error: function (jqXHR) {
          swal({
            icon: 'error',
            content: $(messageXHR(jqXHR))[0],
            button: 'Ok'
          });
        }
      },
      lengthChange: false,
      searching: false,
      ordering: false,
      paging: false,
      infoCallback: self.loadInfo
    });

    ctx.table.on('xhr.dt', self.loadXHR);
    ctx.table.on('draw.dt', self.loadDraw);

    domFilter.submit(self.searchPosts);
  };

  /**
   * Load posts data.
   *
   * @return  void
   */
  this.loadData = function () {
    swal({
      text: 'load available posts data',
      button: false,
      closeOnEsc: false,
      closeOnEnter: false,
      closeOnClickOutside: false
    });

    let filter = {
      length: paginate.length,
      offset: paginate.offset
    };

    if (paginate.title != null) filter.title = paginate.title;
    if (paginate.name != null) filter.name = paginate.name;
    if (paginate.labels != null) filter.labels = paginate.labels;

    return filter;
  };

  /**
   * Load posts source.
   *
   * @param   object
   * @return  void
   */
  this.loadSrc = function (json) {
    let posts = [];

    for (var postIndex in json.posts) {
      let post = json.posts[postIndex];

      posts.push([
        (parseInt(postIndex) + paginate.offset) + 1,
        `<a href="javascript:void(0)" data-button="posts" data-post-index="${postIndex}">${post.title}</a>`,
        moment(new Date(post.created)).fromNow(),
        post.created_by.name
      ]);
    }

    self.seeDetailPost({target: {dataset: {postIndex: 0}}});

    return posts;    
  };

  /**
   * Load labels xhr.
   *
   * @param   jquery
   * @param   object
   * @param   object
   * @param   object
   * @return  void
   */
  this.loadXHR = function (jq, setting, json, jqXHR) {
    json.recordsTotal = json.recordsFiltered = parseInt(json.total);
    paginate.option.totalPages = Math.ceil(json.recordsTotal / paginate.length);
    paginate.option.startPage = paginate.option.startPage;

    if (paginate.instance == null) {
      paginate.option.onPageClick = self.movePage;
      paginate.instance = domPage.twbsPagination(paginate.option);
    } else if (paginate.option.totalPages == 0) {
      domPage.twbsPagination('destroy');
    } else {
      domPage.twbsPagination('destroy');
      domPage.twbsPagination(paginate.option);
    }

    ctx.posts = json;
  };

  /**
   * Load posts info.
   *
   * @param   object
   * @param   number
   * @param   number
   * @param   number
   * @return  string
   */
  this.loadInfo = function (setting, start, end, max, total, pre) {
    return `Showing ${paginate.offset + 1} to ${paginate.offset + paginate.length} of ${total} posts`;
  };

  /**
   * Load posts has completed.
   *
   * @param   jquery
   * @param   object
   * @return  void
   */
  this.loadDraw = function (jq, setting) {
    domTable.find('*[data-button="posts"]').click(self.seeDetailPost);

    swal({
      icon: 'success',
      button: 'Ok'
    });
  };

  /**
   * Search posts.
   *
   * @param   jquery
   * @return  void
   */
  this.searchPosts = function (jq) {
    jq.preventDefault();

    if (input[0].value.length > 0) paginate.title = input[0].value;

    paginate.option.startPage = 1;

    ctx.table.ajax.reload();
  };

  /**
   * Move page.
   *
   * @param   jquery
   * @param   number
   * @return  void
   */
  this.movePage = function (jq, page) {
    paginate.offset = (paginate.length * page) - paginate.length;
    paginate.option.startPage = page;

    ctx.table.ajax.reload();
  };

  /**
   * See detail of post.
   *
   * @param   jquery
   * @return  void
   */
  this.seeDetailPost = function (jq) {
    let postIndex = jq.target.dataset.postIndex;
    let selectedPost = ctx.posts.posts[postIndex];

    context.postsDetailForm.input[0].value = selectedPost.title;

    let labels = '';

    for (var label of selectedPost.labels) {
      labels += `<option>${label.label}</option>`;
    }

    $(context.postsDetailForm.select[0]).html(labels);

    context.postsDetailForm.input[1].value = moment(new Date(selectedPost.created)).format('dddd, MMMM Do YYYY, h:mm:ss A');
    context.postsDetailForm.input[2].value = selectedPost.updated ? moment(new Date(selectedPost.updated)).format('dddd, MMMM Do YYYY, h:mm:ss A') : '-';
    context.postsDetailForm.input[3].value = selectedPost.created_by.name;
    context.postsDetailForm.post = selectedPost;
  };

  // Run init
  init();
};

/**
 * Form detail of post.
 *
 * @param   jquery
 * @param   context
 * @return  void
 */
let postsDetailForm = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context
  dom = dom.find('#postsDetailForm');
  let ctx = context.postsDetailForm = {
    dom: dom,
    post: null
  };

  // input
  let input = ctx.input = dom.find('*[data-input="posts"]');
  let select = ctx.select = dom.find('*[data-select="posts"]');
  let button = ctx.button = dom.find('*[data-button="posts"]');

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    $(button[0]).click(self.updatePost);
    $(button[1]).click(self.deletePost);
  };

  /**
   * Update post.
   *
   * @return  void
   */
  this.updatePost = function () {
    window.open(`/users/post/update?_id=${ctx.post._id}`);
  };

  /**
   * Delete post.
   *
   * @return  void
   */
  this.deletePost = function () {
    swal({
      icon: 'warning',
      text: `Are you sure to delete "${ctx.post.title}"?`,
      buttons: {
        cancel: 'No',
        confirm: 'Yes'
      },
      dangerMode: true,
      closeOnEsc: false,
      closeOnEnter: false,
      closeOnClickOutside: false
    })
    .then(function (val) {
      if (val) {
        swal({
          text: `delete post "${ctx.post.title}"`,
          button: false,
          closeOnEsc: false,
          closeOnEnter: false,
          closeOnClickOutside: false
        });

        $.ajax({
          type: 'DELETE',
          url: `/users/api/v1/post`,
          data: {_id: ctx.post._id},
          error: function (jqXHR) {
            swal({
              icon: 'error',
              content: $(messageXHR(jqXHR))[0],
              button: 'Ok'
            });
          },
          success: function (data, status, jqXHR) {
            swal({
              icon: 'success',
              content: $(messageXHR(jqXHR))[0],
              button: 'Ok'
            });
          }
        });
      }
    });
  };

  // Run init
  init();
}