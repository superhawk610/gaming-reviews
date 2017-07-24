var editor;

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

function imageHandler() {
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
            editor.insertEmbed(editor.getSelection().index, 'image', response.location);
            $('#q-img-upload').remove();
          }
        });
      }
      reader.readAsDataURL(this.files[0]);
    }
  }).click();
}

var opts = [
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic'],
  ['blockquote'],
  ['image'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  ['clean']
];

editor = new Quill('#editor', {
  modules: { toolbar: opts },
  theme: 'snow'
});
var toolbar = editor.getModule('toolbar')
toolbar.addHandler('image', imageHandler)

$('.rhide').on('click', function() {
  $('.rhide').removeClass('is-active');
  $(this).addClass('is-active');
});
