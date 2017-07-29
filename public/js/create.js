$('.article-submit').on('click', function() {
  $(this).addClass('is-loading');

  // article content processing
  $ed = $('.ql-editor')
  $ed.find('img').each(function() {
    $(this).unwrap('p')
    $(this).prependTo($(this).prev('p'))
  })
  $ed.find('p').has('img').addClass('img')
  $ed.html($ed.html().replace(/--/g, '&mdash;'))

  var data = $('#content-form').serializeArray();
  var o = {};
  $(data).each(function(i, x) {
    if (x.value.trim().length) {
      o[x.name] = x.value;
    }
  });
  o.publishedOn = moment(o.date, 'MM/DD/YYYY').toDate();
  delete o.date;
  o.content = $ed.html();
  if (o.ups) {
    o.ups = o.ups.split(',').map(function(x) {
      return x.trim();
    });
  }
  if (o.downs) {
    o.downs = o.downs.split(',').map(function(x) {
      return x.trim();
    });
  }
  o._id = $(this).attr('data-id');
  var that = this;
  $.ajax({
    method: (o._id ? 'post' : 'put'),
    url: 'manage/articles/' + (o._id ? o._id : ''),
    data: o,
    success: function(response) {
      $(that).removeClass('is-loading');
      var msg = (response.status == 200 ? (o._id ? 'Updated' : 'Saved') + ' successfully!' : 'Something went wrong: ' + response.message);
      var status = (response.status == 200 ? 'primary' : 'warning');
      $('#status-notification').addClass('is-' + status).find('span').text(msg).end().fadeIn();
      setTimeout(function() {
        $('#status-notification').fadeOut(function() {
          $(this).removeClass('is-' + status);
          if (response._id) window.location.replace('manage/articles/' + response._id);
        });
      }, 1250);
    }
  })
});

$('.article-delete').on('click', function() {
  $('.article-delete-confirmation .modal-confirm').attr('data-id', $(this).attr('data-id')).attr('data-type', 'articles');
  $('.modal#page-modal .modal-content .box').html($('.article-delete-confirmation').html()).parent().parent().addClass('is-active');
});

$('.modal').on('click', '.modal-confirm', function() {
  var that = this;
  $('.article-delete, .author-delete, .game-delete').addClass('is-loading');
  $(this).parentsUntil('.modal').parent().removeClass('is-active');
  $.ajax({
    method: 'delete',
    url: 'manage/' + $(this).attr('data-type') + '/' + $(this).attr('data-id'),
    success: function(response) {
      $('.article-delete, .author-delete, .game-delete').removeClass('is-loading').prop('disabled', true).html('<span class="icon is-small"><i class="fa fa-check"></i></span>&nbsp;&nbsp;Deleted');
      var msg = (response.status == 200 ? 'Successfully deleted' : 'Something went wrong: ' + response);
      var status = (response.status == 200 ? 'danger' : 'warning');
      $('#status-notification').addClass('is-' + status).find('span').text(msg).end().fadeIn();
      setTimeout(function() {
        $('#status-notification').fadeOut(function() {
          $(this).removeClass('is-' + status);
          //window.location.replace('/manage/' + $(that).attr('data-type'));
          window.location.replace('manage');
        });
      }, 1250);
    }
  });
});
