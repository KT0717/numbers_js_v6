// プラグインの読み込み
var gulp = require("gulp");
var gulpSass = require("gulp-sass");
var gulpPostcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var browserSync = require('browser-sync').create();
var gulpPlumber = require('gulp-plumber');
var gulpNotify = require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const babel = require('gulp-babel');
const rename = require('gulp-rename');

// ソースディレクトリ
var source = 'src/';

// Bootstrap sass ディレクトリ
var bootstrapSass = {
    in: './node_modules/bootstrap/scss'
};

//JavaScript ディレクトリ
var js = {
    'distDir': source + 'dist/',
    'watchJs': source + 'js/*.js',
    'ignore': !source + 'js/lib/*.js'
}

// javascript
gulp.task('jsTask', function () {
    return gulp
        .src([
            js.watchJs,
            js.ignore,
        ])
        .pipe(concat('main.js'))
        .pipe(babel({
            presets: ["@babel/preset-env"]
        }))
        .pipe(uglify())
        .pipe(rename('main.min.js'))
        .pipe(gulp.dest(js.distDir));
});

// sass、css関連の変数を設定
var sass = {
    in: 'scss/**/*scss',
    out: source + 'css/',
    watch: 'scss/**/*',
    sassOpts: {
        // 圧縮方法（expanded、nested（ネストがインデントされる）、compact（規則集合毎が1行になる）、compressed（全CSSコードが1行になる））
        outputStyle: 'compressed',
        // @import機能で利用できるパスを指定
        includePaths: [bootstrapSass.in]
    }
};

// sassをコンパイルするタスク
gulp.task('sass', function () {
    // コンパイル対象のsassディレクトリを指定
    return gulp
        .src(sass.in)
        // ソースマップ作成
        .pipe(sourcemaps.init())
        // コンパイルエラー時、エラーメッセージをデスクトップ通知
        .pipe(gulpPlumber({
            errorHandler: gulpNotify.onError("Error: <%= error.message %>")
        }))
        // コンパイル実行（sass->css）
        .pipe(gulpSass(sass.sassOpts))
        // ベンダープレフェックス付与
        .pipe(gulpPostcss([autoprefixer()]))
        // ソースマップ書き込み
        .pipe(sourcemaps.write('./'))
        // cssをcssディレクトリに出力
        .pipe(gulp.dest(sass.out))
        .pipe(browserSync.stream())
        // コンパイル成功時、正常メッセージをデスクトップ通知
        .pipe(gulpNotify({
            message: 'Finished sass',
            sound: false,
        }));
});

// browser-syncの初期設定
gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            // browser-syncのコンテキストルートを指定
            baseDir: 'src/'
        },
        // 最初に開くページを指定
        startPath: 'index.html'
    });

    // sass,JS,ディレクトリを監視し、更新があれば自動コンパイルしてブラウザに反映
    gulp.watch(sass.watch, gulp.series('sass'));
    gulp.watch(js.watchJs, gulp.series('jsTask'));
    // htmlディレクトリ、jsディレクトリを監視し、更新があればブラウザをリロード
    gulp.watch(['src/' + '*html', source + 'css/*', source + 'js/*']).on('change', browserSync.reload);

});

// 各タスクを直列で実行
gulp.task('default', gulp.series('sass', 'jsTask', 'browser-sync'));