# Template build with HTML/TwigJS, SCSS, JS, images

## Processing
Template uses the [Gulp](https://gulpjs.com/) task runner. Check the all task`s names by executing ```gulp --tasks``` in the terminal. The tasks might be called by ```gulp [task-name]``` . Alternatively you may call tasks by scripts alias in package.json as  ```npm run [script-name]``` :
* ```start``` – run default task wich will process sass, js, html and will continue to watch changes;
* ```build``` – update the build folder by executing all sass, js, html processing, optimize & copy images, copy fonts and 3rd party libraries;
* ```sass``` – process scss files once;
* ```js``` – process js files once;
* ```html``` – process html/twig files once (without minification);
* ```html_min``` – process and minify html/twig files once;
* ```img``` – optimize images and save it into build folder;
* ```fonts``` – copy fonts to the build folder;
* ```lib``` – copy 3rd party libraries (js, css, etc.), the project dependent on, from the node_modules to the build folder;
* ```cleanSrcImg``` – remove all images from the src folder (Caution! You can not rebuild the images after clearing the source!).

## Structure
All project's source files placed in the ```src``` folder, specifically in the typed subfolders:
* ```src/html```
* ```src/scss```
* ```src/js```
* ```src/images```
* ```src/fonts```

The ```build``` folder structure are quite diferent:
* all html files will be placed in the root of the directory;
* ```build/css```
* ```build/js```
* ```build/images```
* ```build/lib``` folder will contain frontend dependency 3rd party libraries` distributive files copied from the ```node_modules```.

The workflow assumes that tasks do not clean the ```build``` folder. It might be even saved in the VCS repository. In case that's needed remove the folder using ```rm -R ./build```.

## HTML templating engine
The project uses [TwigJS](https://github.com/twigjs/twig.js) HTML templating engine. The task runner processes ```.twig``` files as well as files with normal ```.html``` extension. The build folder will get the processed result of the all root level files from the ```./src/html``` folder! All source partials and includes must be placed in subfolders, e.g. ```./src/html/template-parts```.