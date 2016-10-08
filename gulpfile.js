var gulp = require('gulp');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');
var webpack = require('gulp-webpack');

var paths = {
    listenCss: ['./src/css/*.css'],
    listenJs: ['./src/js/*.js', './index.html'],
    css:[
        './src/css/*.css',
    ],
    script: [
        './vendor/*.js',
        './vendor/**/*.js',
        './src/js/*.js'
    ],
    cssDist: ['dist/css/*.css'],
    scriptDist: ['dist/js/*.js'],
    cssName: 'all.css',
    jsName: 'all.js'
};

gulp.task('testcss', function () {
    gulp.src(paths.css)
    .pipe(concat(paths.cssName))
    .pipe(gulp.dest('dist/css'))
    .pipe(livereload());
});

gulp.task('testjs', function () {
    gulp.src(paths.script)
    .pipe(concat(paths.jsName))
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
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest('build/js'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('rev/js'));
});

gulp.task('rev', ['mincss', 'minjs'], function () {
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

gulp.task('replace', ['testcss', 'testjs'], function () {
    var cssjson = require('./rev/css/rev-manifest.json');
    var jsjson = require('./rev/js/rev-manifest.json');

    gulp.src(['index.html'])
    .pipe(replace('build/css/' + cssjson[paths.cssName], 'dist/css/' + paths.cssName))
    .pipe(replace('build/js/' + jsjson[paths.jsName], 'dist/js/' + paths.jsName))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function () {
    livereload.listen();

    gulp.watch(paths.listenCss, ['testcss']);
    gulp.watch(paths.listenJs, ['testjs']);
});

gulp.task('test', ['replace']);
gulp.task('build', ['rev']);
