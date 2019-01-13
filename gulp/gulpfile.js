"use strict";
const { src, dest, series, parallel } = require("gulp");
const   autoprefixer    =       require("autoprefixer"),
        postcss         =       require('gulp-postcss'),
        del             =       require("del"),
        sourcemaps      =       require("gulp-sourcemaps"),
        csscomb         =       require("gulp-csscomb"),
        imagemin        =       require('gulp-imagemin'),
        plumber         =       require("gulp-plumber"),
        sass            =       require("gulp-sass"),
        cssbeautify     =       require("gulp-cssbeautify"),
        uglify          =       require("gulp-uglify-es").default,
        cssnano         =       require("gulp-cssnano"),
        rename          =       require('gulp-rename'),
        watch           =       require("gulp-watch"),
        htmlmin         =       require('gulp-htmlmin');


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
    src(path.scss)
       .pipe(watch(path.scss))
       .pipe(plumber())
       .pipe(sourcemaps.init())
       .pipe(sass({
           sourceComments: 'normal'
       }))
       .pipe(sourcemaps.write())
       .pipe(cssbeautify())
       .pipe(csscomb())
       .pipe(postcss([ autoprefixer()]))
       .pipe(dest(path.css))
       .pipe(cssnano())
       .pipe(rename({suffix: '.min'}))
       .pipe(dest(path.css));
    cb();
}

function js(cb) {
    src(path.srcJs)
        .pipe(watch(path.srcJs))
        .pipe(plumber())
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(dest(path.buildJs));
    cb();
}

function html(cb) {
    src([path.srcHTML])
      .pipe(watch(path.srcHTML))
      .pipe(plumber())
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(dest(path.buildHTML));
    cb();
}


function img(cb) {
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
    return del(['../src/images/**/*', '!../src/images', '!../src/images/.gitkeep'], {force: true});
}


// Make tasks public
exports.scss    = scss;
exports.js      = js;
exports.html    = html;
exports.img     = img;
exports.cleanSrcImg = cleanSrcImg;

exports.default = series(
    scss, 
    js, 
    html 
);
