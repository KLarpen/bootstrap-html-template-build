"use strict";
const { src, dest, series, parallel, watch } = require("gulp");
const   sourcemaps      =       require("gulp-sourcemaps"),
        plumber         =       require("gulp-plumber"),
        rename          =       require('gulp-rename'),
        // watch           =       require("gulp-watch"),
        fse             =       require('fs-extra'),
        path            =       require('path');


const path2files = {
    scss: '../src/scss/**/*.scss',
    css: '../build/css/',
    srcJs: '../src/js/**/*.js',
    buildJs: '../build/js/',
    srcImages : '../src/images/**/*.*',
    buildImages: '../build/images/',
    srcHTML: '../src/html/*.html',
    buildHTML: '../build/',
    srcFonts: '../src/fonts/**/*',
    buildFonts: '../build/fonts/',

};

const copyFiles = function copyFiles(files) {
    const copy = (file, dest) => {
        fse.ensureDir(dest);
        return fse.copy(file, dest, err => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`Successfully copied file ${file}!`);
        });
    };
    files.forEach((file) => copy(
        file.from,
        `${file.dest}${path.basename(file.from)}`
    ));
};

const buildLib = function buildModules() {

    /* const modules = [
        {
            from: '../node_modules/jquery/dist/jquery.min.js',
            dest: '../build/lib/jquery/',
        },
        {
            from: '../node_modules/bootstrap/dist/css/bootstrap.min.css',
            dest: '../build/lib/bootstrap/v4/',
        },
        {
            from: '../node_modules/bootstrap/dist/css/bootstrap.min.css.map',
            dest: '../build/lib/bootstrap/v4/',
        }
    ];
    fse.ensureDir('./build/lib/')
        .then(() => {
            copyFiles(modules);
        })
        .catch(err => {
            console.error(err)
        }); */

};

function fontsTask(cb) {
    fse.ensureDir(path2files.buildFonts);
    src(path2files.srcFonts)
      .pipe(dest(path2files.buildFonts))
      .on('end', () => {
        console.log('Successfully copy Fonts');
      });
    cb();
};

function sass(cb) {
    const postcss         =       require('gulp-postcss');
    const autoprefixer    =       require("autoprefixer");
    const cssnano         =       require("cssnano");
    const sass            =       require('gulp-sass');

    src(path2files.scss)
       .pipe(plumber())
       .pipe(sourcemaps.init())
       .pipe(sass({
           sourceComments: 'normal'
       }))
       .pipe( postcss([ autoprefixer() ]) )
       .pipe(sourcemaps.write())
       .pipe(dest(path2files.css))
       .pipe( postcss([ cssnano() ]) )
       .pipe(rename({suffix: '.min'}))
       .pipe(dest(path2files.css));
    cb();
}

function js(cb) {
    const uglify = require("gulp-uglify-es").default;

    src(path2files.srcJs)
        .pipe(plumber())
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(dest(path2files.buildJs));
    cb();
}

/* HTML templating based on TwigJS. */
function html(cb) {
    const twig    = require("gulp-twig");

    src([path2files.srcHTML])
      .pipe(plumber())
      .pipe(twig())
      .pipe(dest(path2files.buildHTML));
    cb();
}

/* The same HTML templating with minification based on htmlmin. */
function html_min(cb) {
    const twig    = require("gulp-twig");
    const htmlmin = require('gulp-htmlmin');

    src([path2files.srcHTML])
      .pipe(plumber())
      .pipe(twig())
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(dest(path2files.buildHTML));
    cb();
}


function img(cb) {
    const imagemin = require('gulp-imagemin');

    src(path2files.srcImages)
       .pipe(imagemin({
           optimizationLevel: 3,
           progressive: true,
           svgoPlugins: [{removeViewBox: false}],
           interlaced: true
       }))
       .pipe(dest(path2files.buildImages));
    cb();
}

/*
* After using the image optimization task "img" you may clean the folder src/image by task: 
* "cleanSrcImg"
* */
function cleanSrcImg() {
    const del = require("del");
    return del(['../src/images/**/*', '!../src/images', '!../src/images/.gitkeep'], {force: true});
}

function watchChanges() {
    watch([ '../src/html/**/*.html' ], html);
    watch(path2files.scss, sass);
    watch(path2files.srcJs, js);
}  

// Make tasks public
exports.sass     = sass;
exports.js       = js;
exports.html     = html;
exports.html_min = html_min;
exports.img      = img;
exports.fonts    = fontsTask;
exports.buildLib    = buildLib;
exports.cleanSrcImg = cleanSrcImg;

exports.default = series(
    sass, 
    js, 
    html,
    watchChanges
);

exports.build = series(
    sass, 
    js, 
    html,
    img,
    fontsTask,
    buildLib
);
