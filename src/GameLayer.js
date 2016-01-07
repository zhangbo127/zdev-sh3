var GameLayer = cc.Layer.extend({

    _bgImg: null,

    _menu: null,
    _btnStart: null,

    _stageNum: 4,
    _stageList: [],
    _stageY: 0,
    _stageStartX: 120,
    _curStage: null,
    _curStageIndex: 0,

    _playerCtrl: null,
    _playerSpr: null,

    _stickList: [],
    _curStick: null,
    _curStickHg: 0,
    _curStickIndex: null,

    _stick: null,
    _stickHg: 0,
    _isStickReady: false,

    _score: 0,

    _gameOverLayer: null,

    ctor: function () {
        this._super();
        this._init();
    },
    _init: function () {

        var _this = this;

        // 添加随机背景图
        var bgImgIndex = Math.floor(cc.random0To1() * 4);
        var bgImg = new cc.Sprite(res['bg' + bgImgIndex + '_png']);
        bgImg.setScale(1.1);
        bgImg.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
        _this.addChild(bgImg);
        _this._bgImg = bgImg;

        // 添加开始按钮
        var btnStart = new cc.MenuItemImage(
            res.btnStartNormal_png,
            res.btnStartSelect_png,
            _this.start,
            _this
        );
        var btnMenu = new cc.Menu();
        btnMenu.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
        btnMenu.addChild(btnStart);
        _this.addChild(btnMenu);
        _this._menu = btnMenu;
        _this._btnStart = btnStart;

        // 添加四个平台
        for(var i = 0; i < _this._stageNum; i++){

            // 创建平台
            var tmpStage = new cc.Sprite(res.black_png);
            tmpStage.setAnchorPoint(0.5, 0);
            tmpStage.setTextureRect(cc.rect(0, 0, 160, tmpStage.height));
            tmpStage.setPosition(cc.winSize.width + tmpStage.width, 0);
            _this._stageList[i] = tmpStage;

            // 创建棍子
            var tmpStick = new cc.Sprite(res.black_png);
            tmpStick.setScaleY(0);
            tmpStick.setAnchorPoint(0.5, 0);
            tmpStick.setPosition(tmpStage.width, tmpStage.height);
            _this._stickList[i] = tmpStick;

            // 保存全局的信息
            if(0 == i){

                // 设置第一个平台的属性
                tmpStage.setPositionX(cc.winSize.width / 2);

                // 保存当前平台的信息
                _this._curStageIndex = 0;
                _this._curStage = tmpStage;

                // 保存当前棍子的信息
                _this._curStickIndex = 0;
                _this._curStick = tmpStick;

                // 保存全局平台的信息
                _this._stageHg = tmpStage.height;
            }

            // 添加平台和棍子
            tmpStage.addChild(tmpStick, 1);
            _this.addChild(tmpStage, 3);
        }


        // 添加角色
        var playerCtrl = Player.init();
        var playerSpr = playerCtrl.getPlayerSprite();
        playerSpr.setPosition(cc.winSize.width / 2, _this._curStage.height);
        playerCtrl.setPlayerStanding();
        _this.addChild(playerSpr);
        _this._playerCtrl = playerCtrl;
        _this._playerSpr = playerSpr;

        // 添加事件监听器
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                return _this._onTouchBegan.call(_this, touch, event);
            },
            onTouchEnded: function (touch, event) {
                _this._onTouchEnded.call(_this, touch, event);
            }
        }, this);

        // 设置声音大小
        cc.audioEngine.setEffectsVolume(1);
        cc.audioEngine.setMusicVolume(1);
    },

    // 开始游戏
    start: function () {

        // 播放音效
        cc.audioEngine.playEffect(res.button_ogg);

        // 移除开始按钮
        this.removeChild(this._menu);

        // 移动当前平台
        this._moveCurStage();

        // 添加下一个平台
        this._addNextStage();
    },

    _moveCurStage: function () {

        var _this = this;

        // 计算移动距离
        var moveDistance = _this._curStage.x - _this._stageStartX;

        // 移动主角
        _this._playerSpr.runAction(
            cc.sequence(
                cc.moveBy(0.2, - moveDistance, 0),
                cc.callFunc(function () {

                    // 计算主角的开始位置
                    var playerStartX = this._stageStartX + this._curStage.width / 2 - this._playerSpr.width / 2;
                    playerStartX = Math.round(playerStartX * 10) / 10;

                    // 判断主角是否已经在开始位置
                    var playerCurX = Math.round(this._playerSpr.x * 10) / 10;
                    if(playerCurX != playerStartX){
                        this._playerSpr.runAction(cc.moveTo(0.1, playerStartX, this._curStage.height));
                    }

                }, this)
            )
        );

        // 移动当前平台
        _this._curStage.runAction(
            cc.sequence(
                cc.moveBy(0.2, - moveDistance, 0),
                cc.callFunc(function () {
                    _this._initCurStick();
                }, _this)
            )
        );
    },

    _moveOldStage: function () {

        var _this = this;

        // 获取旧的平台
        var oldStage = _this._curStage;

        // 更新当前平台的信息
        _this._curStageIndex = ((_this._curStageIndex + 1) % _this._stageNum);
        _this._curStage = _this._stageList[_this._curStageIndex];

        // 更新当前棍子的信息
        _this._curStick = _this._stickList[_this._curStageIndex];
        _this._curStickHg = 0;

        // 移动上一个平台
        var moveDistance = _this._curStage.x - _this._stageStartX;
        oldStage.runAction(cc.moveBy(0.2, - moveDistance, 0));
    },

    _addNextStage: function () {

        var _this = this;

        // 获取下一个平台
        var nextStageIndex = ((_this._curStageIndex + 1) % _this._stageNum);
        var nextStage = _this._stageList[nextStageIndex];

        // 设置下一个平台的随机宽度 10 ~ 110
        //var randomWidth = Math.floor(cc.random0To1() * 100) + 10;
        var randomWidth = 100;
        var nextStageRect = nextStage.getTextureRect();
        nextStageRect.width = randomWidth;
        nextStage.setTextureRect(nextStageRect);

        // 设置下一个平台的初始化位置
        nextStage.setPositionX(cc.winSize.width + randomWidth);

        // 移动下一个平台到随机位置
        var randomX = cc.winSize.width / 2;
        var nextStageMoveTo = cc.moveTo(0.2, randomX, _this._curStage.y);
        nextStage.runAction(nextStageMoveTo);

        // 初始化下一个棍子
        var nextStick = _this._stickList[nextStageIndex];
        nextStick.setScaleY(0);
    },
    _getNextStageRandomX: function (nextStage) {

    },

    /**
     * 事件监听器方法
     */
    _onTouchBegan: function () {
        if(this._isStickReady){
            this._extendStick();
        }
        return true;
    },

    _onTouchEnded: function () {
        if(this._isStickReady){
            // 停止延长棍子
            this._unextendStick();
            // 旋转棍子
            this._rotateStick1();
        }
    },

    /**
     * 棍子方法
     */
    _initCurStick: function () {

        var _this = this;

        // 初始化棍子的角度和位置
        _this._curStick.setRotation(0);
        _this._curStick.setScaleY(0);
        _this._curStick.setPositionX(_this._curStage.width);
        _this._curStickHg = 0;

        // 标记棍子已就绪
        _this._isStickReady = true;
    },
    _extendStick: function () {
        this.schedule(this._extendStickCallback, 0.02);
        // 播放棍子伸长的声音
        cc.audioEngine.playMusic(res.stickExtend_ogg, true);
    },
    _extendStickCallback: function () {
        this._curStick.setScaleY(this._curStick.scaleY + 0.07);
    },
    _unextendStick: function () {
        this.unschedule(this._extendStickCallback);
        this._curStickHg = this._curStick.height * this._curStick.getScaleY();
        this._isStickReady = false;
        // 停止播放棍子伸长的声音
        cc.audioEngine.stopMusic();
    },
    _rotateStick1: function () {
        var _this = this;
        _this._curStick.runAction(
            cc.sequence(
                cc.delayTime(0.3),
                cc.rotateBy(0.1, 90),
                cc.callFunc(function () {
                    // 播放棍子到位的声音
                    cc.audioEngine.playEffect(res.stickRotate_ogg);
                    // 移动角色
                    _this._movePlayer();
                }, _this)
            )
        );
    },

    /**
     * 角色方法
     */
    _movePlayer: function () {

        var _this = this;

        var targetStageIndex = ((_this._curStageIndex + 1) % _this._stageNum);
        var targetStage = _this._stageList[targetStageIndex];

        var moveDistanceMin = targetStage.x - targetStage.width / 2  - _this._stageStartX - _this._curStage.width / 2;
        var moveDistanceMax = moveDistanceMin + targetStage.width;
        var moveDistance = 0;

        if(_this._curStickHg < moveDistanceMin){
            moveDistance = _this._curStickHg;
            //console.log('太短了，移动到' + moveDistance + '时，角色掉下');
            _this._fallStickAndPlayer(moveDistance);
        }else if(_this._curStickHg > moveDistanceMax){
            moveDistance = moveDistanceMax;
            //console.log('太长了，移动到' + moveDistance + '时，角色掉下');
            _this._fallStickAndPlayer(moveDistance);
        }else{
            moveDistance = moveDistanceMax;
            //console.log('刚刚好，移动到' + moveDistance + '时，角色停下，移动平台');

            _this._playerSpr.runAction(
                cc.sequence(
                    cc.moveBy(0.2, moveDistance, 0),
                    cc.callFunc(function () {

                        // 分数加一
                        _this._score ++;

                        // 播放加分声音
                        cc.audioEngine.playEffect(res.score_ogg);

                        // 移动旧的平台
                        _this._moveOldStage();

                        // 移动当前平台
                        _this._moveCurStage();

                        // 添加下个平台
                        _this._addNextStage();

                    }, _this)
                )
            );
        }
    },
    _fallStickAndPlayer: function (moveDistance) {

        var _this = this;
        var moveByX = moveDistance + _this._playerSpr.width / 2;

        _this._playerSpr.runAction(
            cc.sequence(
                cc.moveBy(0.2, moveByX, 0),
                cc.callFunc(function () {

                    // 棍子掉落
                    _this._curStick.runAction(cc.rotateBy(0.1, 90));

                    // 角色掉落
                    _this._playerSpr.runAction(
                        cc.sequence(
                            cc.moveBy(0.3, 0, - (_this._stageHg + _this._playerSpr.height)),
                            cc.callFunc(function () {
                                // 震动背景层
                                _this._bgImg.runAction(
                                    cc.sequence(
                                        cc.jumpBy(0.2, cc.p(0, 0), 10, 2),
                                        cc.callFunc(function () {
                                            // 播放角色掉落的声音
                                            cc.audioEngine.playEffect(res.playerFall_ogg);
                                            // 显示游戏结束层
                                            _this._showGameOverLayer();
                                        }, this)
                                    )
                                );
                            }, _this)
                        )
                    );

                }, _this)
            )
        );
    },

    /**
     * 游戏结束层
     */
    _showGameOverLayer: function () {
        this._gameOverLayer = new GameOverLayer();
        this._gameOverLayer.showScore(this._score);
        this.addChild(this._gameOverLayer);
    }
});