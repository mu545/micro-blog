/**
 * Message xhr
 * creating bootstrap message from jquery xhr result.
 *
 * @author    Musa Sutisna <mus4.sutisn4@gmail.com> (http://gitlab.com/mu545)
 * @link      Gitlab <git@gitlab.com:mu545/javascripts.git> (http://gitlab.com/mu545/javascripts)
 * @license   MIT (http://gitlab.com/mu545/javascripts/LICENSE)
 * @version   1.1.0
 * @updated   20 June 2019
 */

/**
 * Message xhr.
 *
 * @param   object    jquery xhr result
 * @param   object    message option
 *                    type of message
 * @return  string
 */
var messageXHR = function (jqXHR, option) {
  option = typeof option === 'undefined' ? {} : option;
  option.type = typeof option.type  === 'undefined' ? 'p' : option.type;
  option.title = typeof option.title === 'undefined' ? false : option.title;
  option.class = typeof option.class === 'undefined' ? '' : option.class;

  let msg = '', lvl;

  if (jqXHR.status >= 500) {
    lvl = 'error';
  } else if (jqXHR.status >= 300) {
    lvl = 'warning'
  } else {
    lvl = 'success';
  }

  if (jqXHR.responseJSON) {
    msg = '' + (typeof jqXHR.responseJSON.err === 'undefined' ? '' : messageXHRExtract(jqXHR.responseJSON.err)) + '' + (typeof jqXHR.responseJSON.msg === 'undefined' ? '' : messageXHRExtract(jqXHR.responseJSON.msg)) + '';
  } else {
    msg = '<p>' + jqXHR.responseText + '</p>';
  }

  if (option.type === 'callout') {
    msg = '<div class="callout callout-' + lvl + ' ' + option.class + '">' + (option.title ? ('<h4>' + option.title + '</h4>') : '') + '<p>' + msg + '</p></div>';
  } else if (option.type === 'alert') {
    msg = '<div class="alert alert-' + lvl + ' ' + option.class + '">' + (option.title ? ('<h4>' + option.title + '</h4>') : '') + '<p>' + msg + '</p></div>';    
  } else if (option.type === 'p') {
    msg = '<span class="text-' + lvl + ' ' + option.class + '">' + msg + '</span>'
  }

  return msg;
};

/**
 * Extract message xhr.
 *
 * @param   mixed   message object
 * @return          string
 */
var messageXHRExtract = function (msg) {
  if (typeof msg === 'object') {
    let result = '';

    for (let i in msg) {
      if (i == 'msg' || i == 'err' || parseInt(i) >= 0) {
        result += messageXHRExtract(msg[i]);
      }
    }

    return result;
  } else {
    return '<p>' + msg + '</p>'
  }
};