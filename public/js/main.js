// sizing & layout

if ($('.article-sidebar').length) $('#content-wrapper').css('min-height', $('.article-sidebar').height() + 140)

// responsiveness

$('.navbar-burger').on('click', function() {
  $(this).toggleClass('is-active')
  $('.navbar-menu').toggleClass('is-active')
})

// interactivity

$('#status-notification .delete').on('click', function() {
  $(this).parent().fadeOut()
})

$('.modal').on('click', '.modal-close, .modal-cancel, .modal-background', function() {
  $(this).parentsUntil('.modal').parent().removeClass('is-active')
})
