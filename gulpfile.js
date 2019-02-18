// package vars
const pkg = require('./package.json');

// gulp
const gulp = require("gulp");

// load all plugins in "devDependencies" into the variable $
const $ = require("gulp-load-plugins")({
    pattern: ['*'],
    replaceString: /\bgulp[\-.]/,
    scope: ["devDependencies"]
});

const DEVELOPMENT = !!($.yargs.argv.development);

// error logging
const onError = (err) => {
    console.log(err);
};

// Task runners
gulp.task('default', (cb) => {
    $.runSequence('build', 'serve', 'watch', cb);
});

// Task builders
gulp.task('build', (cb) => {
    $.runSequence(['sass', 'scripts', 'images'], cb);
});

// TASKS
// ---------------------------------------------------------------------

gulp.task('scripts', () => {
    gulp.src([
        pkg.paths.src.jsFolder + "calendar.js",
    ])
    .pipe($.babel({
        presets: [["@babel/preset-env", { modules: false }]]
    }))
    .pipe($.concat("calendar.js"))
    .pipe($.if(!DEVELOPMENT, $.uglify()).on('error', (e) => {
        console.log(e);
    }))
    .pipe($.rename({suffix: '.min'}))
    .pipe($.cached(pkg.paths.dist.js))
    .pipe(gulp.dest(pkg.paths.dist.js))
    .pipe($.browserSync.stream());
});

//Compile Sass into css and auto-inject into browsers
gulp.task('sass', () => {
    gulp.src(pkg.paths.src.sass)
        //filter out unchanged scss files, only works when watching
        .pipe($.if(global.isWatching, $.cached('sass')))
        //find files that depend on the files that have changed
        .pipe($.sassInheritance({dir: pkg.paths.src.sassIncludes}))
        //filter out internal imports (folders and files starting with "_" )
        .pipe($.filter(function (file) {
            return !/\/_/.test(file.path) || !/^_/.test(file.relative);
        }))
        .pipe($.sass({
            includePaths: pkg.paths.src.sassIncludes,
            outputStyle: 'expanded',
            errLogToConsole: true
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({ browsers: ['last 2 versions', 'ie >= 10'], flexbox: 'no-2009' }))
        .pipe($.csscomb())
        .pipe($.if(!DEVELOPMENT, $.cssnano({
            safe: true
        })))
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest(pkg.paths.dist.css))
        .pipe($.browserSync.stream());
});

//Optimize Images
gulp.task('images', () => {
    gulp.src(pkg.paths.src.img)
        .pipe($.imagemin({
            optimizationLevel: 5,
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .pipe($.cached(pkg.paths.dist.img))
        .pipe(gulp.dest(pkg.paths.dist.img));
});

//Compile HTML Templates
gulp.task('templates', () => {
    gulp.src(pkg.paths.src.templates)
        .pipe($.cached(pkg.paths.dist.html))
        .pipe(gulp.dest(pkg.paths.dist.html))
        .pipe($.browserSync.stream());
});

gulp.task('serve', () => {
    $.browserSync.init({
        proxy: 'local.calendar-app',
        reloadOnRestart: true,
        reloadDelay: 0,
        open: false,
        notify: false
    });
});

gulp.task('setWatch', () => {
    global.isWatching = true;
});

gulp.task('clean', () => {
    $.del.sync(pkg.paths.dist.img);
});

// Watch files and run tasks
gulp.task('watch', () => {
    gulp.watch(pkg.paths.src.sass, ['setWatch', 'sass']);
    gulp.watch(pkg.paths.src.templatesAndIncludes, ['templates']);
    gulp.watch(pkg.paths.src.js, ['scripts']);
});