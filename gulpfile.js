const gulp    = require('gulp')

gulp.task('jquery', () => {
  return gulp.src('node_modules/jquery/dist/jquery.min.js')
             .pipe(gulp.dest('public/js'))
})

gulp.task('bulma', () => {
  return gulp.src('node_modules/bulma/css/bulma.css')
             .pipe(gulp.dest('public/css'))
})

gulp.task('fontawesome', () => {
  gulp.src('node_modules/font-awesome/fonts/*')
      .pipe(gulp.dest('public/fonts'))
  gulp.src('node_modules/font-awesome/css/font-awesome.min.css')
      .pipe(gulp.dest('public/css'))
})

gulp.task('datepicker', () => {
  gulp.src('node_modules/air-datepicker/dist/css/datepicker.min.css')
      .pipe(gulp.dest('public/css'))
  gulp.src(['node_modules/air-datepicker/dist/js/datepicker.min.js',
            'node_modules/air-datepicker/dist/js/i18n/datepicker.en.js'])
      .pipe(gulp.dest('public/js'))
})

gulp.task('moment', () => {
  gulp.src('node_modules/moment/moment.js')
      .pipe(gulp.dest('public/js'))
})

gulp.task('default', [ 'jquery', 'bulma', 'fontawesome', 'datepicker', 'moment' ])
