// sizing & layout

if ($('.article-sidebar').length) $('#content-wrapper').css('min-height', $('.article-sidebar').height() + 140)

$('.backsplash').animate({
  height: '300px',
  opacity: 0.4
}, 650, 'swing')

// responsiveness

$('.navbar-burger').on('click', function() {
  $(this).toggleClass('is-active')
  $('.navbar-menu').toggleClass('is-active')
})

// interactivity

$('a[href="#"]').on('click', function(e) { e.preventDefault() })

$('.article-review').on('click', function(e) {
  e.preventDefault()
  $('s').fadeToggle()
})

$('#status-notification .delete').on('click', function() {
  $(this).parent().fadeOut()
})

$('.modal').on('click', '.modal-close, .modal-cancel, .modal-background', function() {
  $(this).parentsUntil('.modal').parent().removeClass('is-active')
})

$('#content-wrapper.popup').on('click', '.content-box', function() {
  console.log('test')
  window.opener.insertSelectedFile($(this).find('img').attr('src'))
})

$('.upload-file').on('click', function() {
  imageHandler(function() {
    window.location.reload()
  });
})

$('.panel .panel-tabs a').on('click', function(e) {
  e.preventDefault()
  var $tab = $(this),
      $panel = $tab.parent().parent()
  if ($tab.hasClass('is-active')) return
  $tab.addClass('is-active').siblings('.is-active').removeClass('is-active')
  $panel.find('.panel-page.is-active').removeClass('is-active').end().find($tab.attr('href')).addClass('is-active')
  console.log($tab.attr('href'))
})

function imageHandler(cb) {
  if (!$('#q-img-upload').length)
    $('body').append('<input type="file" id="q-img-upload" style="display: none">');
  $('#q-img-upload').off().on('change', function() {
    if (this.files && this.files[0]) {
      var reader = new FileReader();
      var mime = this.files[0].type;
      if ([ 'image/jpg', 'image/jpeg', 'image/png', 'image/gif' ].indexOf(mime) < 0) {
        alert('Image format not supported. Please select a .jpg, .png, or .gif image.');
        $('#q-img-upload').remove();
        return;
      }
      reader.onload = function (e) {
        var data = new FormData();
        var image = e.target.result;
        var base64ImageContent = image.replace(new RegExp('^data:' + mime + ';base64,'), '')
        var blob = base64ToBlob(base64ImageContent, mime);
        data.append('mime', mime);
        data.append('image', blob);
        $.post({
          url: 'upload',
          cache: false,
          contentType: false,
          processData: false,
          data: data,
          success: function(response) {
            if (typeof editor !== 'undefined' && editor !== null) editor.insertEmbed(editor.getSelection().index, 'image', response.location);
            $('#q-img-upload').remove();
            if (cb) cb();
          }
        });
      }
      reader.readAsDataURL(this.files[0]);
    }
  }).click();
}

// thanks to Tony M on Stack Overflow
function PopupCenter(url, title, w, h) {
    // Fixes dual-screen position                         Most browsers      Firefox
    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;
    var newWindow = window.open(url, title, 'scrollbars=yes,status=yes,toolbar=no,menubar-no,location=no,addressbar=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

    // Puts focus on the newWindow
    if (window.focus) {
        newWindow.focus();
    }
    return newWindow;
}

// thanks to Jeremy Banks on StackOverflow
function base64ToBlob(base64, mime)
{
    mime = mime || '';
    var sliceSize = 1024;
    var byteChars = window.atob(base64);
    var byteArrays = [];

    for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
        var slice = byteChars.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: mime});
}
