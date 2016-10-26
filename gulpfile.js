/*
 * @Author: liheyao
 * @Date:   2016-10-25 10:56:42
 * @Last Modified by:   liheyao
 * @Last Modified time: 2016-10-25 16:15:32
 */
//引入gulp和组件
var gulp            = require('gulp'),//gulp基础库
	gulpLoadPlugins = require('gulp-load-plugins'),//引入依赖插件
	del             = require('del'),// 文件夹删除清空
	// 实时刷新
	tinylr          = require('tiny-lr'),
	browerSync      = require('browser-sync'),
	server 	        = tinylr(),
	port            = 3080;
// load all gulp plugins
var plugins         = gulpLoadPlugins(), //package.json中的gulp依赖项
    env             = process.env.NODE_ENV || 'development',//开发环境  dev 还是pro
	isProduction    = env == 'production',
	ipJS            = isProduction ? "src/js/dev.js":"src/js/pro.js";//根据不同的开放环境引入不同的js
/** css,js缓存配置 **/
var time            = new Date();
var timeStamp       = dateToString(time);
var timeStamp_prod  = time.valueOf();
function dateToString(time) {
    var year = time.getYear() + 1900;
    var month = time.getMonth() + 1;  //月  
    var day = time.getDate();         //日  
    var hh = time.getHours();       //时  
    var mm = time.getMinutes();    //分  
    var str= year + "-";
    if(month < 10){
        str += "0";     
    }
    str += month + "-";  
    if(day < 10)  
        str += "0";  
    str += day + " ";
    str += hh + ':';
    str += mm;
    return(str);   
}
//html处理
gulp.task('html',function(){
	gulp.src('src/*.html')
	// 判断  如果是pro 压缩html
	.pipe(plugins.if(isProduction, plugins.htmlmin({
		collapseWhitespace: true,//空白
      	removeComments: true//注释
	})))
	// 判断  如果是pro 加时间戳
	.pipe(plugins.if(isProduction, plugins.replace(/_VERSION_/gi, '.min_'+timeStamp_prod), plugins.replace(/_VERSION_/gi, '.min')))
	.pipe(gulp.dest('dist/'))
	// 实时监听
	.pipe(browerSync.reload({
		stream: true
	}));
});
//sass
gulp.task('sass',function () {
	// 多个路径用中括号
	gulp.src(['src/sass/*.scss','!src/sass/_*.scss'])
	// 编辑scss
	.pipe(plugins.sass())
	// 合并css
	.pipe(plugins.concat('index.css'))
	// 判断  如果是pro 压缩
	.pipe(plugins.if(isProduction,plugins.minifyCss()))
	// 判断  如果是pro 加时间戳
	.pipe(plugins.if(isProduction,plugins.rename({suffix:'.min_'+timeStamp_prod}),plugins.rename({suffix:'.min'})))
	.pipe(gulp.dest('dist/css'))
	.pipe(browerSync.reload({
		stream: true
	}));
});
//图片处理
gulp.task('image',function(){
	gulp.src('src/images/*.*')
	.pipe(plugins.imagemin())
	.pipe(gulp.dest('dist/images'))
	.pipe(browerSync.reload({
		stream: true
	}));
});
//js处理
gulp.task('js',function () {
	 gulp.src(['src/js/*.js',"!"+ipJS+""])
	 .pipe(plugins.babel())
	 .pipe(plugins.concat('main.js'))
	 .pipe(plugins.if(isProduction,plugins.uglify()))
	 .pipe(plugins.if(isProduction,plugins.rename({suffix:'.min_'+timeStamp_prod}),plugins.rename({suffix:'.min'})))
	 .pipe(gulp.dest('dist/js'))
	 .pipe(browerSync.reload({
	 	stream:true
	 }));
});
gulp.task('libs',function() {
	gulp.src('src/libs/**/*')
	.pipe(gulp.dest('dist/libs'))
	.pipe(browerSync.reload({
	 	stream:true
	 }));
})
//清空图片 样式 js
gulp.task('clean', del.bind(null, ['dist/*']));
// 实时监听
gulp.task('serve',function(){
	browerSync({
		server:{
			baseDir:['dist']
		},
		port: port
	},function(err,bs){
		 console.log(bs.options.getIn(["urls", "local"]));
	});
	gulp.watch('src/sass/*.scss',['sass']);
	gulp.watch('src/js/*.js',['js']);
	gulp.watch('src/*.html',['html']);
	gulp.watch('src/images/*.*',['image']);
});
gulp.task('build',['clean'],function() {
	gulp.start('libs','sass','js','html','image')
})