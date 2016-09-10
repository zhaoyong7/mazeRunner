var gulp = require('gulp');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');

var paths = {
    listen: ['./src/js/*.js', './index.html'],
    cssAll:[
        './src/css/*.css',
    ],
    scriptAll: [
        './vendor/jquery.js',
        './vendor/json2.js',
        './vendor/layer/layer.js',
        './vendor/notify.js',
        './src/js/*.js'
    ]
};

gulp.task('css', function () {
    gulp.src(paths.cssAll)
    .pipe(minifyCss({
        keepSpecialComments: 0
    }))
    .pipe(gulp.dest('dist/css'))
    .pipe(livereload());
});

gulp.task('scripts', function () {
    gulp.src(paths.scriptAll)
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
    .pipe(livereload());
});

gulp.task('watch', function () {
    livereload.listen();

    gulp.watch(paths.cssAll, ['css']);
    gulp.watch(paths.listen, ['scripts']);
});

gulp.task('build', ['css', 'scripts']);
