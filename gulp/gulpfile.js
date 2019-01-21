"use strict";
const { src, dest, series, parallel } = require("gulp");
const   sourcemaps      =       require("gulp-sourcemaps"),
        plumber         =       require("gulp-plumber"),
        rename          =       require('gulp-rename'),
        watch           =       require("gulp-watch");


const path = {
    scss: '../src/scss/**/*.scss',
    css: '../build/css/',
    srcJs: '../src/js/**/*.js',
    buildJs: '../build/js/',
    srcImages : '../src/images/**/*.*',
    buildImages: '../build/images/',
    srcHTML: '../src/html/*.html',
    buildHTML: '../build/',
    srcFonts: '../src/fonts/',
    buildFonts: '../build/fonts/',

};

function scss(cb) {
    const postcss         =       require('gulp-postcss');
    const autoprefixer    =       require("autoprefixer");
    const cssnano         =       require("cssnano");
    const sass            =       require('gulp-sass');

    src(path.scss)
       .pipe(watch(path.scss))
       .pipe(plumber())
       .pipe(sourcemaps.init())
       .pipe(sass({
           sourceComments: 'normal'
       }))
       .pipe( postcss([ autoprefixer() ]) )
       .pipe(sourcemaps.write())
       .pipe(dest(path.css))
       .pipe( postcss([ cssnano() ]) )
       .pipe(rename({suffix: '.min'}))
       .pipe(dest(path.css));
    cb();
}

function js(cb) {
    const uglify = require("gulp-uglify-es").default;

    src(path.srcJs)
        .pipe(watch(path.srcJs))
        .pipe(plumber())
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(dest(path.buildJs));
    cb();
}

/* HTML templating based on TwigJS. */
function html(cb) {
    const twig    = require("gulp-twig");

    src([path.srcHTML])
      .pipe(watch(path.srcHTML))
      .pipe(plumber())
      .pipe(twig())
      .pipe(dest(path.buildHTML));
    cb();
}

/* The same HTML templating with minification based on htmlmin. */
function html_min(cb) {
    const twig    = require("gulp-twig");
    const htmlmin = require('gulp-htmlmin');

    src([path.srcHTML])
      .pipe(watch(path.srcHTML))
      .pipe(plumber())
      .pipe(twig())
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(dest(path.buildHTML));
    cb();
}


function img(cb) {
    const imagemin = require('gulp-imagemin');

    src(path.srcImages)
       .pipe(imagemin({
           optimizationLevel: 3,
           progressive: true,
           svgoPlugins: [{removeViewBox: false}],
           interlaced: true
       }))
       .pipe(dest(path.buildImages));
    cb();
}

/*
* After using the image optimization task "img" you should clean the folder src/image by task: 
* "cleanSrcImg"
* */
function cleanSrcImg() {
    const del = require("del");
    return del(['../src/images/**/*', '!../src/images', '!../src/images/.gitkeep'], {force: true});
}


// Make tasks public
exports.scss     = scss;
exports.js       = js;
exports.html     = html;
exports.html_min = html_min;
exports.img      = img;
exports.cleanSrcImg = cleanSrcImg;

exports.default = series(
    scss, 
    js, 
    html_min 
);
