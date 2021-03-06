var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');

gulp.task('clean', function() {
    del('dist');
});

gulp.task('scripts', ['clean'], function() {
    return gulp.src('src/*.js')
        .pipe(uglify())
        .pipe(concat('MiradorDisableZoom.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('stylesheets', ['clean'], function() {
    return gulp.src('src/*.css')
        .pipe(cleanCSS())
        .pipe(concat('MiradorDisableZoom.min.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['scripts', 'stylesheets']);
