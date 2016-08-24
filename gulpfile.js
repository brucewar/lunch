/**
 * 静态文件打包
 */

var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var autoprefixer = require('gulp-autoprefixer');
var gulpUtil = require('gulp-util');
var webpack = require('webpack');

gulp.task('sass:build', function () {
  return sass(__dirname + '/public/src/sass/**/*.scss', { style: 'compressed', noCache: true})
    .on('error', function (err) {
      console.error('Error!', err.message);
    })
    .pipe(autoprefixer())
    .pipe(gulp.dest(__dirname + '/public/dist/css'));
});

var webpackConfig = require('./public/webpack.config');
var compiler = webpack(webpackConfig);

gulp.task('webpack:build', function () {
  compiler.run(function (err, stats) {
    if(err) throw new gutil.PluginError("webpack", err);
    gulpUtil.log("[webpack]", stats.toString({
      // output options
    }));
  });
});

gulp.task('webpack:watch', function () {
  compiler.watch(200, function (err, stats) {
    if(err) throw new gutil.PluginError("webpack", err);
  });
});

gulp.task('default', ['sass:build', 'webpack:build'], function(){});

gulp.task('watch', function () {
  gulp.watch('./public/src/sass/**/*.scss', ['sass:build']);
  gulp.watch('./public/src/js/**/*.js', ['webpack:build']);
});
