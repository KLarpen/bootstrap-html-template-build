"use strict";
const { src, dest, series, parallel, watch } = require("gulp");
const   sourcemaps    = require("gulp-sourcemaps"),
        plumber       = require("gulp-plumber"),
        rename        = require('gulp-rename'),
        fse           = require('fs-extra'),
        uglify        = require("gulp-uglify-es").default,
        postcss       = require('gulp-postcss'),
        autoprefixer  = require("autoprefixer"),
        cssnano       = require("cssnano"),
        sass          = require('gulp-sass'),
        twig          = require("gulp-twig");


const path2files = {
    scss: './src/scss/**/*.scss',
    css: './build/css/',
    srcJs: './src/js/**/*.js',
    buildJs: './build/js/',
    srcImages : './src/images/**/*.*',
    buildImages: './build/images/',
    srcHTML: './src/html/*.html',
    buildHTML: './build/',
    srcFonts: './src/fonts/**/*',
    buildFonts: './build/fonts/',

};
const libs = [
    {
        from: './node_modules/jquery/dist/',
        dest: './build/lib/jquery/',
    },
    {
        from: './node_modules/bootstrap/dist/',
        dest: './build/lib/bootstrap/',
    },
    {
        from: './node_modules/bs-custom-file-input/dist',
        dest: './build/lib/plugins/',
    }
];

const copyFiles = function (files, cb) {
    const copy = (file, dest) => {
        fse.ensureDir(dest);
        return fse.copy(file, dest)
        .then(() => {
            console.log(`Successfully copied ${file}`);
        })
        .catch(err => {
            console.error(err);
        });
        
    };
    let result = files.map( file => copy( file.from, file.dest ) );
    Promise.all(result).then( () => cb() );
};

function buildLib(cb) {
    fse.ensureDir('./build/lib/')
        .then(() => {
            copyFiles(libs, cb);
        })
        .catch(err => {
            console.error(err)
        });
};

function fontsTask(cb) {
    fse.ensureDir(path2files.buildFonts);
    src(path2files.srcFonts)
      .pipe(dest(path2files.buildFonts))
      .on('end', () => {
        console.log('Fonts successfully copied');
        cb();
      });
};

function sassTask(cb) {
    fse.ensureDir(path2files.css);
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
       .pipe(dest(path2files.css))
       .on('end', () => { cb(); });
}

function jsTask(cb) {
    fse.ensureDir(path2files.buildJs);
    src(path2files.srcJs)
        .pipe(plumber())
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(dest(path2files.buildJs))
        .on('end', () => { cb(); });
}

/* HTML templating based on TwigJS. */
function html(cb) {
    fse.ensureDir(path2files.buildHTML);
    src([path2files.srcHTML])
      .pipe(plumber())
      .pipe(twig())
      .pipe(dest(path2files.buildHTML))
      .on('end', () => { cb(); });
}

/* The same HTML templating with minification based on htmlmin. */
function html_min(cb) {
    const htmlmin = require('gulp-htmlmin');

    fse.ensureDir(path2files.buildHTML);
    src([path2files.srcHTML])
      .pipe(plumber())
      .pipe(twig())
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(dest(path2files.buildHTML))
      .on('end', () => { cb(); });
}


function imgTask(cb) {
    const imagemin = require('gulp-imagemin');

    fse.ensureDir(path2files.buildImages);
    src(path2files.srcImages)
       .pipe(imagemin({
           optimizationLevel: 3,
           progressive: true,
           svgoPlugins: [{removeViewBox: false}],
           interlaced: true
       }))
       .pipe(dest(path2files.buildImages))
       .on('end', () => { cb(); });
}

/*
* After using the image optimization task "img" you may clean the folder src/image by task: 
* "cleanSrcImg"
* */
function cleanSrcImg(cb) {
    const del = require("del");
    return del(['./src/images/**/*', '!./src/images', '!./src/images/.gitkeep', '!./src/images/icons', '!./src/images/icons/.gitkeep'], {force: true})
        .then(paths => {
            console.log('Deleted: ', paths);
            cb();
        });
}

function watchChanges() {
    watch([ './src/html/**/*.html' ], html);
    watch(path2files.scss, sassTask);
    watch(path2files.srcJs, jsTask);
}  

// Make tasks public
exports.sass     = sassTask;
exports.js       = jsTask;
exports.html     = html;
exports.html_min = html_min;
exports.img      = imgTask;
exports.fonts    = fontsTask;
exports.lib      = buildLib;
exports.cleanSrcImg = cleanSrcImg;

exports.default = series(
    parallel(
        sassTask, 
        jsTask, 
        html
    ),
    watchChanges
);

exports.build = series(
    html,
    fontsTask,
    buildLib,
    parallel(
        sassTask, 
        jsTask, 
        imgTask
    )
);
