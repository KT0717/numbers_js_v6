'use strict';

// 0以上10未満の数値の中から1つ数値を選ぶ
// Math.random()の結果に数値を掛け合わせ、Math.floor()で小数点以下を切り捨てることで目的の数値を得ることができます。
// Math.random()が0以上、1未満の数値を返すため(1は返らない)、10をかけても10になることはありません。
// var num = Math.floor(Math.random() * 10);
// console.log(num);

{
  // Panel クラス
  class Panel {
    constructor() {
      // 要素（li）をプロパティとして持たせたいので、プロパティ名は、 element の el と
      this.el = document.createElement('li');
      this.el.classList.add('pressed');
      this.el.addEventListener('click', () => {
        this.check();
      });
    }

    // 単に el プロパティを返す
    getEl() {
      return this.el;
    }

    // パネルに配置する数値が渡ってくるので、とりあえず num という引数で受けてあげましょう。
    // これが Board クラスの panel.activate(0) の元
    activate(num) {
      this.el.classList.remove('pressed');
      this.el.textContent = num;
    }

    // currentNum と押し込んだパネルの数値が合っているか比較したいのですが、 this.el.textContent は文字列なので、 parseInt() で数値にしてあげて、比較
    check() {
      if (currentNum === parseInt(this.el.textContent, 10)) {
        this.el.classList.add('pressed');
        currentNum++;

        // clearTimeout()は、setTimeout()でセットしたタイマーを解除する際に使用します。
        if (currentNum === 4) {
          clearTimeout(timeoutId);
        }
      }
    }
  }

  // パネルを管理する Board クラスを作成
  class Board {
    // コンストラクターの処理ですが、パネルを管理したいので、とりあえずプロパティ（this.panels）で配列として持っておきましょう。
    constructor() {
      // 空の配列
      this.panels = [];
      // パネルを 4 枚作りたいので、ループ
      for (let i = 0; i < 4; i++) {
        // this.panels に対してあとで作っていく Panel クラスのインスタンスを push()
        this.panels.push(new Panel());
      }
      // console.log("プロパティとは名前（キー）と値（バリュー）が対になったもの");
      // this.panels におけるプロパティの実態を確認
      let keyArray = Object.keys(this.panels);
      keyArray.forEach(function (element) {
        // console.log(element);
      });
      let valueArray = Object.values(this.panels);
      valueArray.forEach(function (element) {
        // console.log(element);
      });
      let elementArray = Object.values(this.panels);
      elementArray.forEach(function (element) {
        // console.log(element.el);
      });
      // パネルを 4 つ保持している
      // console.log(this.panels);
      // 4 つのパネルをページに追加していく
      // コンストラクターのほうではそれを呼び出すだけ
      this.setup();
    }

    setup() {
      // setup() の中でしか使わないので、プロパティにする必要はなくて const で定数で宣言
      const board = document.getElementById('board');
      this.panels.forEach(panel => {
        // panels 配列から各プロパティ（element）を取り出し board.appendChild
        // クラスのプロパティに外部から直接アクセスしないほうがよいとされているので、こちらのプロパティ（element）はメソッド経由 getEl() で取得する
        // board.appendChild(panel.el) ではなく
        board.appendChild(panel.getEl()); // これをカプセル化
      });
    }

    // これが board.activate() になる
    activate() {
      const nums = [0, 1, 2, 3];
      // それぞれのパネルに対して、処理をしたいので forEach() で回す
      this.panels.forEach(panel => {
        // nums から splice() を使ってランダムな位置から要素をひとつ取り出す
        // 基本的には以下のように取り出す
        //  console.log(nums.splice(0)[0]); -> 0
        // ランダムに取り出す場合は、以下となる
        const num = nums.splice(Math.floor(Math.random() * nums.length), 1)[0];
        // panel のほうにも activate するという意味で、同名のメソッドを作ってあげる
        // console.log(panel);
        panel.activate(num);
      });
    }
  }

  // （※２）
  function runTimer() {
    const timer = document.getElementById('timer');
    timer.textContent = ((Date.now() - startTime) / 1000).toFixed(2);
    // ！！よく使うパターン！！
    // 自身の関数 runTimer() を繰り返し実行、かつ setTimeout() の返り値を timeoutId に格納することによって、
    timeoutId = setTimeout(() => {
      runTimer();
    }, 10);
  }

  // インスタンス
  const board = new Board();

  // 0 からクリックすることで、押し込んでいけるようにしてあげましょう。
  // 今押し込むべき数値を currentNum で保持しておきたいと思います
  // let currentNum = 0;
  // currentNum は START ボタンを押すたびにリセットされるべきなので、こちら let currentNum = 0; は宣言だけにしてあげましょう
  let currentNum;
  // スタートボタンを押したときの時刻の格納変数
  let startTime;
  // タイマーを止めるための setTimeout() の返り値が必要なので、変数を宣言
  let timeoutId;

  // ボタンをクリックしたらゲームが始まるようにしてあげましょう
  const btn = document.getElementById('btn');
  btn.addEventListener('click', () => {
    // ボタンを押すたびにタイマーが走ってしまう（ runTimer() が何度も実行されてしまうから）
    // 2回目以降に runTimer を呼びだすと，それらも自身を setTimeout に設定するとともに timeoutId を新しい ID に書き換えてしまいます。すると，clearTimeout(timeoutId); ではすでに書き変わってしまった timeoutId に対してタイマーを止めているので，最初のsetTimeoutの方は止めることができません（２回クリックすると１回目のタイマー止めれなくなる）
    // 防ぐためには
    // timeoutId が undefined でなければ（すでにタイマーが走っていたら）
    // ２回目以降のクリック時は、文字の初期化は行われ、かつその（２回目の） timeoutId の上書きをクリアーする（要するに１回目は生き残る）
    console.log(timeoutId);
    if (typeof timeoutId !== 'undefined') {
      clearTimeout(timeoutId);
    }

    // スタートボタンを押されたときに currentNumをリセット
    currentNum = 0;
    // ゲームが始まるようにしたいので、インスタンス board に activate() というメソッドをあとで作る
    board.activate();
    // startTime に現在時刻を代入
    startTime = Date.now();
    // 時刻を走らせる関数は長くなるから別の場所で、あとで作る
    runTimer();
    // 上記の runTimer(); は、ここで、下記の（※）関数を実行しているのと同じである。だから addEventListener 内で宣言した startTime = Date.now(); が別の場所に書かれた （※２）function runTimer() でも参照できる
    // （※）function runTimer() {
    //   ..
    // }
    // runTimer();
  });
}
