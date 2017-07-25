var editor;

var opts = [
  [{ 'header': [1, 2, 3, false] }],
  ['bold', 'italic'],
  ['blockquote'],
  ['link', 'image', 'insert'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  ['clean']
];

editor = new Quill('#editor', {
  modules: { toolbar: opts },
  theme: 'snow'
});
var toolbar = editor.getModule('toolbar');
toolbar.addHandler('image', imageHandler);  // defined in main.js

var win;
var selectPicture = $('.ql-image').html();
$('.ql-image').html('<i style="padding-top: 2px" class="fa fa-cloud-upload"></i>');
$('.ql-insert').html(selectPicture).on('click', function() {
  win = PopupCenter('files/img/upload?select=1', 'Select an Image', 800, 600);
});

function insertSelectedFile(src) {
  var index = 0
  if (editor.getSelection()) index = editor.getSelection().index
  editor.insertEmbed(index, 'image', src);
  win.close()
}

$('.rhide').on('click', function() {
  $('.rhide').removeClass('is-active');
  $(this).addClass('is-active');
});
