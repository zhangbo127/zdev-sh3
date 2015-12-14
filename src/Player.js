var Player = {

    _sfc: null,

    _playerSpr: null,

    init: function () {

        // 初始化精灵帧缓存
        this._sfc = cc.spriteFrameCache;
        this._sfc.addSpriteFrames(res.playerKick_plist, res.playerKick_png);
        this._sfc.addSpriteFrames(res.playerShake_plist, res.playerShake_png);
        this._sfc.addSpriteFrames(res.playerWalk_plist, res.playerWalk_png);
        this._sfc.addSpriteFrames(res.playerYao_plist, res.playerYao_png);

        // 初始化精灵
        this._playerSpr = new cc.Sprite('#d0001.png');
        this._playerSpr.setAnchorPoint(0.5, 0);
    },

    getPlayerSprite: function () {
        return this._playerSpr;
    },

    // 棍子延长时的动画
    setPlayerAnimation1: function () {

        this._playerSpr.stopAllActions();

        var animFrames = [];
        var str = '';
        var frame;
        for (var i = 1; i < 10; i++) {
            str = 'dq000' + i + '.png';
            frame = this._sfc.getSpriteFrame(str);
            animFrames.push(frame);
        }

        var animation = new cc.Animation(animFrames, 0.1);
        this._playerSpr.runAction(cc.animate(animation).repeatForever());
    },

    // 移动时的动画
    setPlayerRunning: function () {

        this._playerSpr.stopAllActions();

        var animFrames = [];
        var str = '';
        var frame;
        for (var i = 1; i < 10; i++) {
            str = 'z000' + i + '.png';
            frame = this._sfc.getSpriteFrame(str);
            animFrames.push(frame);
        }

        var animation = new cc.Animation(animFrames, 0.1);
        this._playerSpr.runAction(cc.animate(animation).repeatForever());
    },

    // 开始移动时的动画
    setPlayerStartRun: function () {

        this._playerSpr.stopAllActions();

        var animFrames = [];
        var str = '';
        var frame;
        for (var i = 1; i < 10; i++) {
            str = 't000' + i + '.png';
            frame = this._sfc.getSpriteFrame(str);
            animFrames.push(frame);
        }

        var animation = new cc.Animation(animFrames, 0.05);
        this._playerSpr.runAction(cc.animate(animation).repeatForever());
    },

    // 站着时的动画
    setPlayerStanding: function () {

        this._playerSpr.stopAllActions();

        var animFrames = [];
        var str = '';
        var frame;
        for (var i = 1; i < 10; i++) {
            str = 'd00' + (i < 10 ? ('0' + i) : i) + '.png';
            frame = this._sfc.getSpriteFrame(str);
            animFrames.push(frame);
        }

        var animation = new cc.Animation(animFrames, 0.1);
        this._playerSpr.runAction(cc.animate(animation).repeatForever());
    },
};