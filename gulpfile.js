var gulp = require('gulp');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');

var paths = {
    listenCss: ['./src/css/*.css'],
    listenJs: ['./src/js/*.js', './index.html'],
    css:[
        './src/css/*.css',
    ],
    script: [
        './vendor/jquery.js',
        './vendor/json2.js',
        './vendor/layer/layer.js',
        './vendor/notify.js',
        './src/js/*.js'
    ],
    cssDist: ['dist/css/*.css'],
    scriptDist: ['dist/js/*.js']
};

gulp.task('testcss', function () {
    gulp.src(paths.css)
    .pipe(gulp.dest('dist/css'))
    .pipe(livereload());
});

gulp.task('testjs', function () {
    gulp.src(paths.script)
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(livereload());
});

gulp.task('mincss', function () {
    gulp.src(paths.cssDist)
    .pipe(minifyCss({
        keepSpecialComments: 0
    }))
    .pipe(rev())
    .pipe(gulp.dest('build/css'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('rev/css'));
});

gulp.task('minjs', function () {
    gulp.src(paths.scriptDist)
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest('build/js'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('rev/js'));
});

gulp.task('rev', function () {
    gulp.src(['rev/**/*.json', 'index.html'])
    .pipe(revCollector({
        replaceReved: true,
        dirReplacements: {
            'dist/css': 'build/css',
            'dist/js': 'build/js'
        }
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('reverse', function () {
    gulp.src(['rev/**/*.json', 'index.html'])
    .pipe(revCollector({
        replaceReved: true,
        dirReplacements: {
            'dist/css': 'build/css',
            'dist/js': 'build/js'
        }
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function () {
    livereload.listen();

    gulp.watch(paths.listenCss, ['testcss']);
    gulp.watch(paths.listenJs, ['testjs']);
});

gulp.task('test', ['testcss', 'testjs']);
gulp.task('build', ['mincss', 'minjs', 'rev']);
