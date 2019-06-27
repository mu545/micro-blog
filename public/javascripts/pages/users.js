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
    userNewForm(dom, context);
    userUpdateForm(dom, context);
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

  // pagination
  let paginate = ctx.paginate = {
    length: 10,
    offset: 0,
    name: null,
    email: null
  }

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    loadUsers();
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

    if (paginate.name) filter.name = paginate.name;
    if (paginate.email) filter.email = paginate.email;

    $.ajax({
      type: 'GET',
      url: '/users/api/v1/users',
      data: filter,
      error: function (jqXHR) {
        swal({
          content: $(messageXHR(jqXHR))[0],
          button: 'Ok'
        });
      },
      success: function (data, status, jqXHR) {
        let usersListHtml = '';

        ctx.users = data.users;

        for (let userIndex in data.users) {
          let user = data.users[userIndex];

          usersListHtml += `<div class="col-4 col-md-4 col-lg-2 col-xl-2 mb-4" data-button="userPhoto" data-user-index="${userIndex}"><div class="avatar-item">
                              <img alt="image" src="/stisla/img/avatar/avatar-1.png" class="img-fluid" data-toggle="tooltip" data-placement="top" title="" data-original-title="${user.user_info.name}">
                              <div class="avatar-badge" title="" data-toggle="tooltip" data-placement="right" data-original-title="${user.user_role.role}"><i class="fas fa-${user.user_role.role == 'admin' ? 'star' : (user.user_role.role == 'author' ? 'pencil-alt' : 'user')}"></i></div>
                            </div></div>`;
        }

        let usersListDom = dom.html(usersListHtml);

        usersListDom.find('*[data-button="userPhoto"]').click(self.seeUserDetail);
        usersListDom.find('*[data-toggle="tooltip"]').tooltip();

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
   * See user detail.
   *
   * @return  void
   */
  this.seeUserDetail = function (jq) {
    let userIndex = jq.currentTarget.dataset.userIndex;
    let user = ctx.users[userIndex];

    context.userNewForm.dom.hide();
    context.userUpdateForm.dom.show();
    context.userUpdateForm.select[0].value = user.user_role.role;
    context.userUpdateForm.input[0].value = user.user_info.name;
    context.userUpdateForm.input[1].value = user.user_info.email;
    context.userUpdateForm.input[2].value = user.user_info.phone;
    context.userUpdateForm.input[3].value = user.username;
    context.userUpdateForm.user = user;
  };

  // Run init
  init();
};

/**
 * New user form.
 *
 * @param   jquery
 * @param   context
 * @return  void
 */
let userNewForm = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context
  dom = dom.find('#usersNewForm');
  let ctx = context.userNewForm = {
    dom: dom
  };

  // input
  let select = ctx.select = dom.find('*[data-select="users"]');
  let input = ctx.input = dom.find('*[data-input="users"]');
  let button = ctx.button = dom.find('*[data-button="users"]');

  // element
  let domMessages = dom.find('#usersNewFormMessages');

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
          text: 'failure to create new user',
          button: 'Ok'
        });
      },
      success: function (data, status, jqXHR) {
        domMessages.html('');
        select[0].value = 'user';
        input[0].value = '';
        input[1].value = '';
        input[2].value = '';
        input[3].value = '';
        input[4].value = '';
        input[5].value = '';
        dom.removeClass('was-validated');

        swal({
          text: 'successful create new user',
          button: 'Ok'
        });
      }
    });

    jq.preventDefault();
  };

  // Run init
  init();
};

/**
 * userUpdateForm.
 *
 * @param   jquery
 * @param   context
 * @return  void
 */
let userUpdateForm = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context
  dom = dom.find('#usersUpdateForm');
  let ctx = context.userUpdateForm = {
    dom: dom,
    user: null
  };

  // input
  let input = ctx.input = dom.find('*[data-input="users"]');
  let select = ctx.select = dom.find('*[data-select="users"]');
  let button = ctx.button = dom.find('*[data-button="users"]');

  // element
  let domMessages = dom.find('#usersUpdateFormMessages');

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
    context.userNewForm.dom.show();
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
          text: 'failure to update user',
          button: 'Ok'
        });
      },
      success: function (data, status, jqXHR) {
        swal({
          icon: 'success',
          text: 'successful update user',
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