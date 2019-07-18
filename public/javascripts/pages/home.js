$(document).ready(function () {
  // a.k.a this
  let self = this;

  // element
  let dom = $('#home');

  // context data
  let context = {};

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    homeList(dom, context);
  };

  // Run init
  init();
});

/**
 * Home list of post.
 *
 * @param   jquery
 * @param   object
 * @return  void
 */
let homeList = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context data
  dom = dom.find('#homeList');
  let ctx = context.homeList = {
    dom: dom
  };

  // element
  let domContainer = dom.find('#homeListContainer');
  let domPages = dom.find('#homeListPages');

  // input
  let button = ctx.button = domPages.find('*[data-button="home"]');

  // pagination
  let paginate = {
    length: 10,
    offset: 0,
    title: null
  };

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function() {
    let urlSearch = new URLSearchParams(window.location.href);

    if (urlSearch.has('length')) {
      paginate.length = parseInt(urlSearch.get('length'));
    }

    if (urlSearch.has('offset')) {
      paginate.offset = parseInt(urlSearch.get('offset'));
    }

    if (urlSearch.has('title')) {
      paginate.title = urlSearch.get('title');
    }

    $(button[0]).click(self.movePage);
    $(button[1]).click(self.movePage);

    loadPosts();
  };

  /**
   * Load posts.
   *
   * @return  void
   */
  this.loadPosts = function () {
    let filter = {
      length: paginate.length,
      offset: paginate.offset
    };

    if (paginate.title != null) filter.title = paginate.title;

    $.ajax({
      type: 'GET',
      url: '/api/v1/posts',
      data: filter,
      error: function (jqXHR) {

      },
      success: function (data) {
        data.total = parseInt(data.total);

        let posts = '';

        for (var postIndex in data.posts) {
          let post = data.posts[postIndex];

          posts += `<div class="post-preview">
                      <a href="/post?_id=${post._id}">
                        <h2 class="post-title">
                          ${post.title}
                        </h2>
                        <h3 class="post-subtitle">
                          ${post.subtitle}
                        </h3>
                      </a>
                      <p class="post-meta">Published by
                        <a href="#">${post.created_by.name}</a>
                        on ${moment(post.created).format('MMMM Do, YYYY')}</p>
                    </div>
                    <hr>`;
        }

        domContainer.html(posts);

        let newerPage = paginate.offset - paginate.length;
        let olderPage = paginate.offset + paginate.length;

        if (newerPage >= 0) {
          button[0].dataset.offset = newerPage;

          $(button[0]).show();
        } else {
          $(button[0]).hide();
        }

        if (olderPage <= data.total) {
          button[1].dataset.offset = olderPage;

          $(button[1]).show();
        } else {
          $(button[1]).hide();
        }
      }
    })
  };

  /**
   * Move page.
   *
   * @param   jquery
   * @return  void
   */
  this.movePage = function (jq) {
    paginate.offset = parseInt(jq.target.dataset.offset);

    loadPosts();
  };

  // Run init
  init();
};
