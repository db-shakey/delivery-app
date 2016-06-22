var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var minify = require('gulp-minify');
var angularTemplateCache = require('gulp-angular-templatecache');

var paths = {
  sass: ['./scss/**/*.scss'],
  html : ["www/**/*.html","!www/lib/**/*.html"]
};
var config = {
    srcTemplates:['./www/js/modules/**/**/templates/*.html'],
    destPartials: './www/js/modules/'
};
gulp.task('default', ['sass', 'templates']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.html, ['templates']);
});

gulp.task('templates', function(){
  return gulp.src(config.srcTemplates)
    .pipe(angularTemplateCache('templates.js', { module:'dorrbell'})
    ).pipe(gulp.dest(config.destPartials));
})

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('compress', function(){
  gulp.src(["./www/extras/jquery-2.1.4.min.js",

            "./www/extras/angular-ios9-uiwebview.patch.js",
            "./www/extras/socket.io.js",
            "./www/lib/oclazyload/dist/ocLazyLoad.min.js",
            "./www/lib/angular-input-masks/angular-input-masks-standalone.min.js",
            "./www/lib/angular-filter/dist/angular-filter.min.js",
            "./www/lib/ngCordova/dist/ng-cordova.min.js",
            "./www/lib/ng-cordova-oauth/dist/ng-cordova-oauth.min.js",
            "./www/lib/ionic-native-transitions/dist/ionic-native-transitions.min.js",
            "./www/lib/ionic-datepicker/dist/ionic-datepicker.bundle.min.js",
            "./www/lib/angular-lazy-img/release/angular-lazy-img.min.js",
            "./www/lib/ionic-filter-bar/dist/ionic.filter.bar.js",
            "./www/lib/ion-autocomplete/dist/ion-autocomplete.min.js",
            "./www/lib/humanize-duration/humanize-duration.js",
            "./www/lib/angular-timer/dist/angular-timer.min.js",
            "./www/lib/swiper/dist/js/swiper.min.js",
            "./www/lib/angular-swiper/dist/angular-swiper.js",
            "./www/lib/ngmap/build/scripts/ng-map.min.js",
            "./www/lib/moment/min/moment.min.js",
            "./www/lib/angular-moment/angular-moment.min.js",
            "./www/lib/ion-gallery/dist/ion-gallery.js",
            "./www/lib/ng-img-crop-full-extended/compile/minified/ng-img-crop.js",

            //Calendar stuff
            "./www/lib/angular-ui-calendar/src/calendar.js",
            "./www/lib/fullcalendar/dist/fullcalendar.min.js",
            "./www/lib/fullcalendar/dist/gcal.js",
            "./www/lib/ng-material-floating-button/src/mfb-directive.js",

            ])
            .pipe(concat('all.js'))
            .pipe(minify())
            .pipe(gulp.dest("./www"));
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
