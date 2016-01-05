var GameLayer = cc.Layer.extend({

    _bgImg: null,

    _menu: null,
    _btnStart: null,

    _stageList: [],
    _stageWd: 0,
    _stageHg: 0,
    _stageY: 0,
    _stageStartX: 120,
    _curStage: null,
    _curStageIndex: 0,
    _curStageScaleWd: 0,

    _playerCtrl: null,
    _playerSpr: null,

    _stickList: [],
    _curStick: null,
    _curStickIndex: null,
    _curStickHg: 0,

    _stageGroupList: [],
    _curStageGroup: null,

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
        bgImg.x = cc.winSize.width / 2;
        bgImg.y = cc.winSize.height / 2;
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

        // 添加三个平台组
        for(var i = 0; i < 3; i++){

            // 创建平台
            var stageTmp = new cc.Sprite(res.black_png);
            stageTmp.setAnchorPoint(0.5, 0);
            stageTmp.y = 0;
            if(0 == i) {
                // 设置首个平台的属性
                stageTmp.setTextureRect(new cc.Rect(0, 0, 100, 100));
                // 设置当前平台的信息
                _this._curStageIndex = 0;
                _this._curStage = stageTmp;
                _this._curStageScaleWd = stageTmp.width * stageTmp.getScaleX();
                // 设置全局平台的信息
                _this._stageWd = stageTmp.width;
                _this._stageHg = stageTmp.height;
            }
            _this._stageList[i] = stageTmp;

            // 创建棍子
            var stickTmp = new cc.Sprite(res.black_png);
            stickTmp.setAnchorPoint(0.5, 0);
            stickTmp.y = stageTmp.height;
            if(0 == i) {
                // 设置当前棍子的信息
                _this._curStickIndex = 0;
                _this._curStick = stickTmp;
            }
            _this._stickList[i] = stickTmp;

            // 创建平台组
            var stageGroupTmp = new cc.Sprite();
            stageGroupTmp.setAnchorPoint(0.5, 0);
            stageGroupTmp.y = 0;
            if(0 == i){
                // 设置首个平台组的属性
                stageGroupTmp.x = cc.winSize.width / 2;
                // 设置当前平台组的信息
                _this._curStageGroup = stageGroupTmp;
            }else{
                // 设置其他平台组的属性
                stageGroupTmp.x = cc.winSize.width - stageTmp.width / 2 - 50;
            }
            _this._stageGroupList[i] = stageGroupTmp;

            // 添加平台组
            stageGroupTmp.addChild(stageTmp, 1);
            stageGroupTmp.addChild(stickTmp, 2);
            _this.addChild(stageGroupTmp, 3);
        }

        // 添加角色
        var playerCtrl = Player.init();
        var playerSpr = playerCtrl.getPlayerSprite();
        playerSpr.x = _this._curStageGroup.x;
        playerSpr.y = _this._stageHg;
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
        }, _this);

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

        // 添加下个平台
        this._addNextStage();
    },

    _moveCurStage: function () {

        // 计算移动距离
        var moveDistance = this._curStageGroup.x - this._stageStartX;

        // 移动主角
        this._playerSpr.runAction(
            cc.sequence(
                cc.moveBy(0.2, - moveDistance, 0),
                cc.callFunc(function () {

                    // 计算主角的开始位置
                    /*
                    var playerStartX = this._stageStartX + this._curStageScaleWd / 2 - this._playerSpr.width / 2;
                    playerStartX = Math.round(playerStartX * 10) / 10;

                    // 判断主角是否已经在开始位置
                    var playerCurX = Math.round(this._playerSpr.x * 10) / 10;
                    if(playerCurX != playerStartX){
                        this._playerSpr.runAction(cc.moveTo(0.1, playerStartX, this._stageHg));
                    }
                    */

                }, this)
            )
        );

        // 移动当前平台组
        this._curStageGroup.runAction(
            cc.sequence(
                cc.moveBy(0.2, - moveDistance, 0),
                cc.callFunc(function () {
                    this._initCurStick();
                }, this)
            )
        );
    },

    _moveOldStage: function () {

        // 获取旧的平台
        var oldStage = this._curStage;
        var oldStageScaleWd = this._curStageScaleWd;

        // 获取旧的棍子
        var oldStick = this._curStick;

        // 更新当前平台的信息
        this._curStageIndex = this._curStageIndex == 2 ? 0 : this._curStageIndex + 1;
        this._curStage = this._stageList[this._curStageIndex];
        this._curStageScaleWd = this._curStage.width * this._curStage.getScaleX();

        // 更新当前棍子的信息
        this._curStickIndex = this._curStageIndex;
        this._curStick = this._stickList[this._curStickIndex];
        this._curStickHg = 0;

        // 移动旧的平台
        var oldMoveByX = - (this._curStage.x - this._stageStartX);
        oldStage.runAction(
            cc.sequence(
                cc.moveBy(0.2, oldMoveByX, 0),
                cc.callFunc(function () {
                    // 移动完成后，将旧的平台放到窗口右侧
                    oldStage.x = cc.winSize.width + oldStageScaleWd / 2;
                }, this)
            )
        );

        // 移动旧的棍子
        oldStick.runAction(cc.moveBy(0.2, oldMoveByX, 0));
    },

    _addNextStage: function () {

        // 设置下个平台的随机宽度 2 ~ 30
        var nextStageIndex = (this._curStageIndex == 2 ? 0 : this._curStageIndex + 1);
        var nextStage = this._stageList[nextStageIndex];
        var randomScale = Math.floor(cc.random0To1() * 30) + 5;
        nextStage.setScaleX(randomScale);
        console.log('下个平台的原始位置：' + nextStage.y);

        // 设置下个平台组的随机位置
        var nextStageGroup = this._stageGroupList[nextStageIndex];
        var randomX = cc.winSize.width / 2;
        nextStageGroup.runAction(cc.moveTo(0.2, randomX, 0));
        console.log('下个平台组的随机位置：' + randomX);
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

        // 初始化棍子的角度和位置
        this._curStick.setRotation(0);
        this._curStick.setScaleY(0.1);
        this._curStick.x = this._curStageScaleWd / 2;
        this._curStickHg = 0;

        // 标记棍子已就绪
        this._isStickReady = true;
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

        var tagetStageIndex = _this._curStageIndex == 2 ? 0 : _this._curStageIndex + 1;
        var tagetStage = _this._stageList[tagetStageIndex];
        var tagetStageScaleWd = tagetStage.width * tagetStage.getScaleX();

        var moveDistanceMin = tagetStage.x - tagetStageScaleWd / 2  - _this._stageStartX - _this._curStageScaleWd / 2;
        var moveDistanceMax = moveDistanceMin + tagetStageScaleWd;
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

                        // 初始化棍子
                        _this._initCurStick();

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