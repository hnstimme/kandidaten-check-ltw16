'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var header = require('gulp-header');
var rename = require('gulp-rename');

gulp.task('sass', function () {
  gulp.src('*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(header('/* Hey there! \n this is the minified version of main.css. If you want to read the code properly head to this file in the url! */'))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('css/'));
  gulp.src('*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('css/'));
});

gulp.task('sass:watch', function () {
  gulp.watch('*.scss', ['sass']);
});

gulp.task('compress', function() {
  return gulp.src('js/*.js')
    .pipe(uglify())
    .pipe(concat('all.js'))
    .pipe(gulp.dest('js'));
});

gulp.task('compress:watch', function () {
  gulp.watch('js/*.js', ['compress']);
});
