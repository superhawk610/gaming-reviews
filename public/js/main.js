$('.navbar-burger').on('click', function() {
  $(this).toggleClass('is-active')
  $('.navbar-menu').toggleClass('is-active')
})

$('#status-notification .delete').on('click', function() {
  $(this).parent().fadeOut()
})

$('.modal').on('click', '.modal-close, .modal-cancel, .modal-background', function() {
  $(this).parentsUntil('.modal').parent().removeClass('is-active')
})
