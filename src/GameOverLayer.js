var GameOverLayer = cc.Layer.extend({

    _maskLayer: null,

    _menu: null,
    _btnRestart: null,
    _btnHome: null,
    _btnWxShare: null,

    _curScore: 0,

    ctor: function () {
        this._super();
        this._init();
    },
    _init: function () {

        // 添加遮罩层
        this._maskLayer = new cc.LayerColor(cc.color(125, 125, 125, 125));
        this.addChild(this._maskLayer);

        // 添加重新开始按钮
        this._btnRestart = new cc.MenuItemImage(
            res.btnRestart_png,
            res.btnRestart_png,
            this._onRestart,
            this
        );
        this._btnRestart.setPosition(100, 0);

        // 添加回到首页按钮
        this._btnHome = new cc.MenuItemImage(
            res.btnHome_png,
            res.btnHome_png,
            this._onHome,
            this);
        this._btnHome.setPosition(-100, 0);

        // 添加微信分享按钮
        this._btnWxShare= new cc.MenuItemImage(
            res.btnWxShare_png,
            res.btnWxShare_png,
            this._onWxShare, this);
        this._btnWxShare.setPosition(0, cc.winSize.height / 2 - this._btnWxShare.getContentSize().height);

        // 添加按钮菜单
        this._menu = new cc.Menu();
        this._menu.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
        this._menu.addChild(this._btnRestart);
        this._menu.addChild(this._btnHome);
        this._menu.addChild(this._btnWxShare);
        this.addChild(this._menu);

    },
    _onRestart: function () {

        console.log('重新开始');

        // 移除游戏结束层
        this.removeFromParent(true);

        // 创建新的场景，重新开始游戏
        var tmpScene = new cc.Scene();
        var bgLayer = new BgLayer();
        tmpScene.addChild(bgLayer, -1, 0);
        cc.director.runScene(tmpScene);
        bgLayer.start();
    },
    _onHome: function () {

        console.log('回到首页');

        // 移除游戏结束层
        this.removeFromParent(true);

        // 重新运行主场景
        cc.director.runScene(new MainScene());
    },
    _onWxShare: function () {
        console.log('微信分享');
    },

    showScore: function(curScore){

        this._curScore = curScore;
        cc.sys.localStorage.setItem("curScore", curScore);

        // 添加分数精灵
        var sbg = new cc.Sprite(res.scoreBg_png);
        var sbgSize = sbg.getContentSize();
        sbg.x = cc.winSize.width / 2;
        sbg.y = cc.winSize.height / 2 + 220;

        // 添加分数文本
        var curScoreText = new cc.LabelTTF("", "Arial", 50);
        curScoreText.setPosition(cc.p(sbgSize.width / 2, sbgSize.height / 2));
        curScoreText.setColor(cc.color(0, 0, 0));
        curScoreText.setString(curScore);
        sbg.addChild(curScoreText, 2);

        this.addChild(sbg, 1);
    }
});