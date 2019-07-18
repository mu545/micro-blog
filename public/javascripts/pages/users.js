$(document).ready(function () {
  // a.k.a this
  let self = this;

  // element
  let dom = $('#users');

  // context data
  let context = {};

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    usersList(dom, context);
    usersNewForm(dom, context);
    usersUpdateForm(dom, context);
  };

  // Run init
  init();
});

/**
 * List users.
 *
 * @param   jquery
 * @param   context
 * @return  void
 */
let usersList = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context
  dom = dom.find('#usersList');
  let ctx = context.usersList = {
    dom: dom,
    users : []
  };

  // element
  let domUsersListFilter = dom.find('#usersListFilter');
  let domUsersListContainer = dom.find('#usersListContainer');
  let domPage = dom.find('#usersListPage');

  // input
  let input = ctx.input = domUsersListFilter.find('*[data-input="users"]');

  // pagination
  let paginate = ctx.paginate = {
    length: 10,
    offset: 0,
    username: null,
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
  }

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    swal({
      text: 'load user configuration',
      button: false,
      closeOnEsc: false,
      closeOnEnter: false,
      closeOnClickOutside: false
    });

    $.ajax({
      type: 'GET',
      url: '/users/api/v1/user-roles',
      data: {length: 999, offset: 0},
      error: function (jqXHR) {
        swal({
          icon: 'error',
          content: $(messageXHR(jqXHR))[0],
          button: 'Ok'
        });
      },
      success: function (data, status, jqXHR) {
        let selectRoles = '';

        for (var roleIndex in data.roles) {
          let role = data.roles[roleIndex];

          selectRoles += `<option value="${role._id}">${role.role}</option>`;
        }

        $(context.usersNewForm.select[0]).html(selectRoles);
        $(context.usersUpdateForm.select[0]).html(selectRoles);

        domUsersListFilter.submit(self.searchUsers);

        loadUsers();
      }
    });
  };

  /**
   * Load available users.
   *
   * @return  void
   */
  this.loadUsers = function () {
    swal({
      text: 'load available users data',
      button: false,
      closeOnEsc: false,
      closeOnEnter: false,
      closeOnClickOutside: false
    });

    let filter = {
      length: paginate.length,
      offset: paginate.offset
    };

    if (paginate.username) filter.username = paginate.username;

    $.ajax({
      type: 'GET',
      url: '/users/api/v1/users',
      data: filter,
      error: function (jqXHR) {
        swal({
          icon: 'error',
          content: $(messageXHR(jqXHR))[0],
          button: 'Ok'
        });
      },
      success: function (data, status, jqXHR) {
        data.total = parseInt(data.total);

        let usersListHtml = '';

        for (let userIndex in data.users) {
          let user = data.users[userIndex];

          usersListHtml += `<div class="col-4 col-md-4 col-lg-2 col-xl-2 mb-4" data-button="userPhoto" data-user-index="${userIndex}"><div class="avatar-item">
                              <img alt="image" src="/stisla/img/avatar/avatar-1.png" class="img-fluid" data-toggle="tooltip" data-placement="top" title="" data-original-title="${user.user_info.name}">
                              <div class="avatar-badge" title="" data-toggle="tooltip" data-placement="right" data-original-title="${user.user_role.role}"><i class="fas fa-${user.user_role.role == 'admin' ? 'star' : (user.user_role.role == 'author' ? 'pencil-alt' : 'user')}"></i></div>
                            </div></div>`;
        }

        let usersListDom = domUsersListContainer.html(usersListHtml);

        usersListDom.find('*[data-button="userPhoto"]').click(self.seeDetailUser);
        usersListDom.find('*[data-toggle="tooltip"]').tooltip();

        paginate.option.totalPages = Math.ceil(data.total / paginate.length);

        if (paginate.instance == null) {
          paginate.option.onPageClick = self.movePage;
          paginate.instance = domPage.twbsPagination(paginate.option);
        } else {
          domPage.twbsPagination('destroy');
          domPage.twbsPagination(paginate.option);
        }

        ctx.users = data;

        swal({
          icon: 'success',
          button: 'Ok'
        });
      }
    });
  };

  ctx.loadUsers = function () {
    self.loadUsers();
  };

  /**
   * Search users.
   *
   * @param   jquery
   * @return  void
   */
  this.searchUsers = function (jq) {
    jq.preventDefault();

    paginate.offset = 0;
    paginate.username = input[0].value;
    paginate.option.startPage = 1;

    self.loadUsers();
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

    self.loadUsers();
  };

  /**
   * See detail of user.
   *
   * @param   jquery
   * @return  void
   */
  this.seeDetailUser = function (jq) {
    let userIndex = jq.currentTarget.dataset.userIndex;
    let user = ctx.users.users[userIndex];

    context.usersNewForm.dom.hide();
    context.usersUpdateForm.dom.show();
    context.usersUpdateForm.select[0].value = user.user_role._id;
    context.usersUpdateForm.input[0].value = user.user_info.name;
    context.usersUpdateForm.input[1].value = user.user_info.email;
    context.usersUpdateForm.input[2].value = user.user_info.phone;
    context.usersUpdateForm.input[3].value = user.username;
    context.usersUpdateForm.user = user;
  };

  // Run init
  init();
};

/**
 * Form new user.
 *
 * @param   jquery
 * @param   context
 * @return  void
 */
let usersNewForm = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context
  dom = dom.find('#usersNewForm');
  let ctx = context.usersNewForm = {
    dom: dom
  };

  // element
  let domMessages = dom.find('#usersNewFormMessages');

  // input
  let select = ctx.select = dom.find('*[data-select="users"]');
  let input = ctx.input = dom.find('*[data-input="users"]');
  let button = ctx.button = dom.find('*[data-button="users"]');

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    dom.submit(self.createNewUser);
  };

  /**
   * Create new user.
   *
   * @param   jquery
   * @return  void
   */
  this.createNewUser = function (jq) {
    if (jq.target.checkValidity() == false) return;

    swal({
      text: 'creating new user',
      button: false,
      closeOnEsc: false,
      closeOnEnter: false,
      closeOnClickOutside: false
    });

    let newUser = {
      role: select[0].value,
      name: input[0].value,
      email: input[1].value,
      phone: input[2].value,
      username: input[3].value,
      password: input[4].value,
      confirm: input[5].value
    };

    $.ajax({
      type: 'POST',
      url: '/users/api/v1/user',
      data: newUser,
      error: function (jqXHR) {
        domMessages.html(messageXHR(jqXHR, {type: 'alert'}));

        swal({
          icon: 'error',
          content: $(messageXHR(jqXHR))[0],
          button: 'Ok'
        });
      },
      success: function (data, status, jqXHR) {
        domMessages.html('');
        input.val('');
        $(jq.target).removeClass('was-validated');

        context.usersList.loadUsers();
      }
    });

    jq.preventDefault();
  };

  // Run init
  init();
};

/**
 * Form update user.
 *
 * @param   jquery
 * @param   context
 * @return  void
 */
let usersUpdateForm = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context
  dom = dom.find('#usersUpdateForm');
  let ctx = context.usersUpdateForm = {
    dom: dom,
    user: null
  };

  // element
  let domMessages = dom.find('#usersUpdateFormMessages');

  // input
  let input = ctx.input = dom.find('*[data-input="users"]');
  let select = ctx.select = dom.find('*[data-select="users"]');
  let button = ctx.button = dom.find('*[data-button="users"]');

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    $(button[0]).click(self.closeDetailUser);
    dom.submit(self.updateUser);
  };

  /**
   * Close form update user.
   *
   * @return  void
   */
  this.closeDetailUser = function () {
    ctx.dom.hide();
    context.usersNewForm.dom.show();
  };

  /**
   * Update user.
   *
   * @return  void
   */
  this.updateUser = function (jq) {
    if (jq.target.checkValidity() == false) return;

    swal({
      text: 'updating user data',
      button: false,
      closeOnEsc: false,
      closeOnEnter: false,
      closeOnClickOutside: false
    });

    let updateUser = {
      _id: ctx.user.user_info._id,
      role: select[0].value,
      name: input[0].value,
      phone: input[2].value
    };

    $.ajax({
      type: 'PUT',
      url: '/users/api/v1/user',
      data: updateUser,
      error: function (jqXHR) {
        domMessages.html(messageXHR(jqXHR, {type: 'alert'}));

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
        })
        .then(function () {
          context.usersList.loadUsers();
        });
      }
    });

    jq.preventDefault();
  };

  // Run init
  init();
};