$('.navbar-burger').on('click', function() {
  $(this).toggleClass('is-active')
  $('.navbar-menu').toggleClass('is-active')
})

$('#status-notification .delete').on('click', function() {
  $(this).parent().fadeOut()
})
