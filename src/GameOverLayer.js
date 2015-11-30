var GameOverLayer = cc.Layer.extend({

    _maskLayer: null,

    _menu: null,
    _btnRestart: null,
    _btnHome: null,

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

        // 添加菜单
        this._menu = new cc.Menu();
        this._menu.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
        this._menu.addChild(this._btnRestart);
        this._menu.addChild(this._btnHome);
        this.addChild(this._menu);

    },
    _onRestart: function () {
        console.log('重新开始');
    },
    _onHome: function () {
        console.log('回到首页');
    }
});