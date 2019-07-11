$(document).ready(function () {
  // a.k.a this
  let self = this;

  // element
  let dom = $('#labels');

  // context data
  let context = {};

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    labelsList(dom, context);
    labelsNewForm(dom, context);
    labelsUpdateForm(dom, context);
  };

  // Run init
  init();
});

/**
 * List labels
 *
 * @param   jquery
 * @param   context
 * @return  void
 */
let labelsList = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context
  dom = dom.find('#labelsList');
  let ctx = context.labelsList = {
    dom: dom,
    table: null,
    labels: null
  };

  // element
  let domFilter = dom.find('#labelsListFilter');
  let domTable = dom.find('#labelsListTable');
  let domPage = dom.find('#labelsListPage');

  // input
  let input = ctx.input = domFilter.find('*[data-input="labels"]');
  let button = ctx.button = domFilter.find('*[data-button="labels"]');

  // pagination
  let paginate = {
    length: 10,
    offset: 0,
    label: null,
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
        url: '/users/api/v1/labels',
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

    domFilter.submit(self.searchLabels);
  };

  /**
   * Load labels data.
   *
   * @return  void
   */
  this.loadData = function () {
    swal({
      text: 'load available labels data',
      button: false,
      closeOnEsc: false,
      closeOnEnter: false,
      closeOnClickOutside: false
    });

    let filter = {
      length: paginate.length,
      offset: paginate.offset
    };

    if (paginate.label != null) filter.label = paginate.label;

    return filter;
  };

  /**
   * Load labels source.
   *
   * @param   object
   * @return  array
   */
  this.loadSrc = function (json) {
    let labels = [];

    for (var labelIndex in json.labels) {
      let label = json.labels[labelIndex];

      labels.push([
        parseInt(labelIndex) + paginate.offset + 1,
        `<a href="javascript:void(0)" data-button="labels" data-label-index="${labelIndex}">${label.label}</a>`,
        label.total_posts
      ]);
    }

    return labels;
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
    json.recordsTotal = json.recordsFiltered = json.total = parseInt(json.total);
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

    ctx.labels = json;
  };

  /**
   * Load labels info.
   *
   * @param   object
   * @param   number
   * @param   number
   * @param   number
   * @param   number
   * @param   number
   * @return  void
   */
  this.loadInfo = function (setting, start, end, max, total, pre) {
    return `Showing ${paginate.offset + 1}  to ${paginate.offset + paginate.length} of ${total} labels`;
  };

  /**
   * Load labels has completed.
   *
   * @param   jquery
   * @param   object
   * @return  void
   */
  this.loadDraw = function (jq, setting) {
    domTable.find('*[data-button="labels"]').click(self.seeDetailLabel);

    swal({
      icon: 'success',
      button: 'Ok'
    });
  };

  /**
   * Search labels.
   *
   * @param   jquery
   * @return  void
   */
  this.searchLabels = function (jq) {
    jq.preventDefault();

    if (input[0].value.length > 0) paginate.label = input[0].value;
    else paginate.label = null;

    paginate.option.startPage = 1;

    ctx.table.ajax.reload();
  };

  /**
   * Move page.
   *
   * @param   jq
   * @param   number
   * @return  void
   */
  this.movePage = function (jq, page) {
    paginate.offset = (paginate.length * page) - paginate.length;
    paginate.option.startPage = page;

    ctx.table.ajax.reload();
  };

  /**
   * See detail of label.
   *
   * @param   jquery
   * @return  void
   */
  this.seeDetailLabel = function (jq) {
    let labelIndex = jq.target.dataset.labelIndex;
    let label = ctx.labels.labels[labelIndex];

    context.labelsNewForm.dom.hide();
    context.labelsUpdateForm.dom.show();
    context.labelsUpdateForm.input[0].value = label.label;
    context.labelsUpdateForm.label = label;
  };

  // Run init
  init();
};

/**
 * Form new label.
 *
 * @param   jquery
 * @param   context
 * @return  void
 */
let labelsNewForm = function(dom, context) {
  // a.k.a this
  let self = this;

  // create context
  dom = dom.find('#labelsNewForm');
  let ctx = context.labelsNewForm = {
    dom: dom
  };

  // element
  let domMessages = dom.find('#labelsNewFormMessages');

  // Input
  let input = dom.find('*[data-input="labels"]');
  let button = dom.find('*[data-button="labels"]');

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    dom.submit(self.createNewLabel);
  };

  /**
   * Create new label.
   *
   * @param   jquery
   * @return  void
   */
  this.createNewLabel = function (jq) {
    if (jq.target.checkValidity() == false) return;

    swal({
      text: 'creating new label',
      button: false,
      closeOnEsc: false,
      closeOnEnter: false,
      closeOnClickOutside: false
    });

    let newLabel = {
      label: input[0].value
    };

    $.ajax({
      type: 'POST',
      url: '/users/api/v1/label',
      data: newLabel,
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
          context.labelsList.table.ajax.reload();
        });
      }
    });

    jq.preventDefault();
  };

  // Run init
  init();
};

/**
 * Form info label.
 *
 * @param   jquery
 * @param   context
 * @return  void
 */
let labelsUpdateForm = function (dom, context) {
  // a.k.a this
  let self = this;

  // create context
  dom = dom.find('#labelsUpdateForm');
  let ctx = context.labelsUpdateForm = {
    dom: dom,
    label: null
  };

  // element
  let domMessages = dom.find('#labelsUpdateFormMessages');

  // input
  let input = ctx.input = dom.find('*[data-input="labels"]');
  let button = ctx.button = dom.find('*[data-button="labels"]');

  /**
   * Initialization.
   *
   * @return  void
   */
  let init = function () {
    $(button[0]).click(self.closeDetailLabel);
    dom.submit(self.updateLabel);
  };

  /**
   * Close form update label.
   *
   * @return  void
   */
  this.closeDetailLabel = function () {
    dom.hide();
    context.labelsNewForm.dom.show();
  };

  /**
   * Update label.
   *
   * @return  void
   */
  this.updateLabel = function (jq) {
    if (jq.target.checkValidity() == false) return;

    let updateLabel = {
      _id: ctx.label._id,
      label: input[0].value
    };

    $.ajax({
      type: 'PUT',
      url: '/users/api/v1/label',
      data: updateLabel,
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

        swal({
          icon: 'success',
          content: $(messageXHR(jqXHR))[0],
          button: 'Ok'
        });

        context.labelsList.table.ajax.reload();
      }
    });

    jq.preventDefault();
  };

  // Init
  init();
};