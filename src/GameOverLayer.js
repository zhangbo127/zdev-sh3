var GameOverLayer = cc.Layer.extend({

    _maskLayer: null,

    _menu: null,
    _btnRestart: null,
    _btnHome: null,
    _btnWxShare: null,

    _isOnWxShare: false,

    _curScore: 0,

    ctor: function () {
        this._super();
        this._init();
    },
    _init: function () {

        // 添加遮罩层
        this._maskLayer = new cc.LayerColor(cc.color(125, 125, 125, 125));
        this.addChild(this._maskLayer);

        // 添加回到首页按钮
        this._btnHome = new cc.MenuItemImage(
            res.btnHome_png,
            res.btnHome_png,
            this._onHome,
            this);
        this._btnHome.setPosition(cc.winSize.width / 4, 0);

        // 添加重新开始按钮
        this._btnRestart = new cc.MenuItemImage(
            res.btnRestart_png,
            res.btnRestart_png,
            this._onRestart,
            this
        );
        this._btnRestart.setPosition(cc.winSize.width / 2, 0);

        // 添加微信分享按钮
        this._btnWxShare= new cc.MenuItemImage(
            res.btnWxShare_png,
            res.btnWxShare_png,
            this._onWxShare, this);
        this._btnWxShare.setPosition(cc.winSize.width * 3 / 4, 0);

        // 添加按钮菜单
        this._menu = new cc.Menu();
        this._menu.addChild(this._btnRestart);
        this._menu.addChild(this._btnHome);
        this._menu.addChild(this._btnWxShare);
        this._menu.setPosition(0, cc.winSize.height / 2 - this._btnHome.height - 30);
        this.addChild(this._menu);

    },
    _onRestart: function () {

        // 移除游戏结束层
        this.removeFromParent(true);

        // 切换到新的主场景（淡入淡出），并重新开始游戏
        var newScene = new cc.Scene();
        var gameLayer = new GameLayer();
        newScene.addChild(gameLayer, -1, 0);
        cc.director.runScene(new cc.TransitionFade(1, newScene, false));
        gameLayer.start();
    },
    _onHome: function () {

        // 移除游戏结束层
        this.removeFromParent(true);

        // 切换到新的主场景（淡入淡出）
        cc.director.runScene(new cc.TransitionFade(1, new MainScene(), false));
    },
    _onWxShare: function () {
        if(!this._isOnWxShare) {
            var wxShareTip = new cc.Sprite(res.wxShareTip_png);
            wxShareTip.setPosition(cc.winSize.width / 2, cc.winSize.height - wxShareTip.height / 2);
            this.addChild(wxShareTip, 2);
        }
    },

    showScore: function(curScore){

        // 保存当前分数
        this._curScore = curScore;
        cc.sys.localStorage.setItem('curScore', curScore);

        // 创建分数背景层
        var scoreBg = new cc.Sprite(res.overScoreBg_png);
        scoreBg.x = cc.winSize.width / 2;
        scoreBg.y = cc.winSize.height / 2 + scoreBg.height / 2;

        // 添加当前分数标题
        //var curScoreTitleLbl = new cc.LabelTTF('分数', '微软雅黑', 24);
        //curScoreTitleLbl.setPosition(cc.p(scoreBg.width / 2, scoreBg.height - 50));
        //curScoreTitleLbl.setColor(cc.color(0, 0, 0));
        //scoreBg.addChild(curScoreTitleLbl, 2);

        // 添加当前分数文本
        var curScoreLbl = new cc.LabelTTF(curScore.toString(), 'Arial', 50);
        curScoreLbl.setPosition(cc.p(scoreBg.width / 2, scoreBg.height - 100));
        curScoreLbl.setColor(cc.color(0, 0, 0));
        scoreBg.addChild(curScoreLbl, 2);

        // 添加最佳分数标签
        //var bestScoreLbl = new cc.LabelTTF('最佳', '微软雅黑', 24);
        //bestScoreLbl.setPosition(cc.p(scoreBg.width / 2, scoreBg.height - 160));
        //bestScoreLbl.setColor(cc.color(0, 0, 0));
        //scoreBg.addChild(bestScoreLbl, 2);

        // 获取最佳分数
        var bestScore = cc.sys.localStorage.getItem('bestScore');
        if(!bestScore){
            bestScore = 0;
        }
        bestScore = curScore < bestScore ? bestScore : curScore;
        cc.sys.localStorage.setItem('bestScore', bestScore);

        // 添加最佳分数文本
        var bestScoreText = new cc.LabelTTF(bestScore.toString(), 'Arial', 50);
        bestScoreText.setPosition(cc.p(scoreBg.width / 2, scoreBg.height - 210));
        bestScoreText.setColor(cc.color(0, 0, 0));
        scoreBg.addChild(bestScoreText, 2);

        // 添加分数背景层
        this.addChild(scoreBg, 1);
    }
});