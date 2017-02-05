"use strict";

var gulp = require('gulp');
var connect = require('gulp-connect'); //Runs a local dev server
var open = require('gulp-open'); //Open a URL in a web browser
var browserify = require('browserify'); //Bundles Js
var reactify = require('reactify'); //Transforms React JSX to JS
var source = require('vinyl-source-stream'); // Use conventional text stream with gulp
var concat = require('gulp-concat'); //Concatenate files
var eslint = require('gulp-eslint'); //Lint js files including jsx

var config = {
	port: 9005,
	devBaseUrl: 'http://localhost',
	paths: {
		html: './src/*.html',
		js: './src/**/*.js',
		mainJs: './src/main.js',
		dist: './dist',
		css: [
				'node_modules/bootstrap/dist/css/bootstrap.min.css',
				'node_modules/bootstrap/dist/css/bootstrap-theme.min.css'
			]

	}
}

//Start a local dev server
gulp.task('connect', function(){
	connect.server({
		root: ['dist'],
		port: config.port,
		base: config.devBaseUrl,
		livereload: true
	});
});

//Opens a file on the server
gulp.task('open', ['connect'], function(){
	gulp.src('dist/index.html')
	.pipe(open({uri: config.devBaseUrl + ':' + config.port + '/'}));
});

//take html files and drop them into the dist folder. Then reload the web server.
gulp.task('html', function(){
	gulp.src(config.paths.html)
	.pipe(gulp.dest(config.paths.dist))
	.pipe(connect.reload());
});

gulp.task('js', function(){
	browserify(config.paths.mainJs)
		.transform(reactify)
		.bundle()
		.on('error', console.error.bind(console))
		.pipe(source('bundle.js'))
		.pipe(gulp.dest(config.paths.dist + '/scripts'))
		.pipe(connect.reload());
});

gulp.task('css', function(){
	gulp.src(config.paths.css)
		.pipe(concat('bundle.css'))
		.pipe(gulp.dest(config.paths.dist + '/css'));
});

gulp.task('lint', function(){
	return gulp.src(config.paths.js)
		.pipe(eslint({config: 'eslint.config.json'}))
		.pipe(eslint.format());
});

//Watches for html and js changes and reloads the app
gulp.task('watch', function(){
	gulp.watch(config.paths.html, ['html']);
	gulp.watch(config.path.js, ['js', 'lint']);
});

gulp.task('default', ['html', 'js', 'css', 'lint', 'open', 'watch']);