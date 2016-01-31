var GameLayer = cc.Layer.extend({

    _bgSpr: null,           // 游戏背景精灵
    _guideText: null,       // 游戏说明文本
    _titleText: null,       // 游戏标题文本

    _startMenu: null,       // 开始菜单
    _startBtn: null,        // 开始按钮

    _stageNum: 3,           // 平台数量
    _stageList: [],         // 平台列表
    _stageY: 0,             // 平台纵坐标
    _stageGapMin: 50,       // 平台最小间距
    _stageStartX: 120,      // 平台起始位置
    _curStage: null,        // 当前平台
    _curStageIndex: 0,      // 当前平台下标

    _playerInst: null,      // 角色控制器
    _playerSpr: null,       // 角色精灵

    _stickList: [],         // 棍子列表
    _curStick: null,        // 当前棍子
    _curStickHg: 0,         // 当前棍子高度
    _curStickIndex: null,   // 当前棍子下标

    _isStickReady: false,   // 棍子是否就绪
    _isPlayerReady: false,  // 角色是否就绪

    _score: 0,              // 分数
    _scoreText: null,       // 分数文本
    _scoreBgSpr: null,      // 分数背景精灵

    _gameOverLayer: null,   // 游戏结束层

    ctor: function () {
        this._super();
        this._init();
    },
    _init: function () {

        var _this = this;

        // 添加游戏背景
        _this._addBg();

        // 添加标题文本
        _this._addTitleText();

        // 添加开始按钮
        _this._addStartBtn();

        // 创建平台和棍子
        _this._createStageAndStick();

        // 创建角色
        _this._createPlayer();

        // 添加事件监听器
        _this._addEventListener();

        // 默认开启声音
        cc.audioEngine.setEffectsVolume(1);
        cc.audioEngine.setMusicVolume(1);
    },

    /**
     * 开始
     */
    start: function () {

        var _this = this;

        // 播放按钮音效
        cc.audioEngine.playEffect(res.button_ogg);

        // 移除标题文本
        _this._removeTitleText();

        // 移除开始按钮
        _this._removeStartBtn();

        // 移动当前平台
        _this._moveCurStage();

        // 添加下一个平台
        _this._addNextStage();

        // 添加游戏说明
        _this._addGuideText();

        // 添加分数提示
        _this._addScoreTip();
    },

    /**
     * 移动当前平台
     */
    _moveCurStage: function () {

        var _this = this;

        // 计算要移动的距离
        var moveDistance = _this._curStage.x - _this._stageStartX;

        // 移动主角
        _this._playerSpr.runAction(
            cc.sequence(
                cc.moveBy(0.2, - moveDistance, 0),
                cc.callFunc(function () {
                    if(false == _this._isPlayerReady){
                        // 计算主角的开始位置
                        var playerStartX = _this._stageStartX + _this._curStage.width / 2 - _this._playerSpr.width / 2;
                        // 移动主角到开始位置
                        _this._playerSpr.runAction(cc.moveTo(0.1, playerStartX, _this._curStage.height));
                        // 标记主角就绪
                        _this._isPlayerReady = true;
                    }
                }, _this)
            )
        );

        // 移动当前平台
        _this._curStage.runAction(cc.moveBy(0.2, - moveDistance, 0));
    },

    /**
     * 角色移动后，移动旧的平台
     * @private
     */
    _moveOldStage: function () {

        var _this = this;

        // 获取旧的平台
        var oldStageIndex = _this._getOldStageIndex();
        var oldStage = _this._stageList[oldStageIndex];

        // 移动旧的平台
        var moveDistance = _this._curStage.x - _this._stageStartX;
        oldStage.runAction(cc.moveBy(0.2, - moveDistance, 0));

        // 移动下一个平台
        var nextStageIndex = _this._getNextStageIndex();
        var nextStage = _this._stageList[nextStageIndex];
        nextStage.runAction(
            cc.sequence(
                cc.moveBy(0.1, - moveDistance, 0),
                cc.callFunc(function () {
                    _this._addNextStage();
                }, _this)
            )
        );
    },

    /**
     * 添加下一个平台
     * @private
     */
    _addNextStage: function () {

        var _this = this;

        // 初始化下一个平台
        var nextStageIndex = _this._getNextStageIndex();
        var nextStage = _this._stageList[nextStageIndex];
        var nextStageWidth = _this._getNextStageWidth();
        var nextStageRect = nextStage.getTextureRect();
        nextStageRect.width = nextStageWidth;
        nextStage.setTextureRect(nextStageRect);
        nextStage.setPositionX(cc.winSize.width + nextStageWidth / 2);

        // 初始化下一个棍子
        var nextStick = _this._stickList[nextStageIndex];
        nextStick.setScaleY(0);

        // 移动下一个平台到随机位置
        var nextStageX = _this._getNextStageX(nextStageWidth);
        var nextStageMoveTo = cc.moveTo(0.2, nextStageX, _this._curStage.y);
        nextStage.runAction(
            cc.sequence(
                nextStageMoveTo,
                cc.callFunc(function () {
                    // 初始化当前棍子
                    _this._initCurStick();
                }, _this)
            )
        );
    },

    /**
     * 获取下一个平台的随机宽度
     * @returns {*}
     * @private
     */
    _getNextStageWidth: function () {
        return this._getRandomNum(50, 150);
    },

    /**
     * 获取下一个平台的位置
     * @param nextStageWidth
     * @returns {*}
     * @private
     */
    _getNextStageX: function (nextStageWidth) {
        var _this = this;
        var minX = _this._stageStartX + _this._curStage.width / 2 + _this._stageGapMin + nextStageWidth / 2;
        var maxX = cc.winSize.width - nextStageWidth / 2;
        return _this._getRandomNum(minX, maxX);
    },

    /**
     * 事件监听器回调
     */
    _onTouchBegan: function () {
        var _this = this;
        if(_this._isStickReady){
            _this._extendStick();
        }
        return true;
    },
    _onTouchEnded: function () {
        var _this = this;
        if(_this._isStickReady){
            _this._unextendStick();
            _this._rotateStick1();
        }
    },

    /**
     * 初始化当前棍子
     */
    _initCurStick: function () {
        var _this = this;
        // 初始化棍子的角度和位置
        _this._curStick.setRotation(0);
        _this._curStick.setScaleY(0);
        _this._curStick.setPositionX(_this._curStage.width);
        _this._curStickHg = 0;
        // 标记棍子就绪
        _this._isStickReady = true;
    },

    /**
     * 伸长棍子
     * @private
     */
    _extendStick: function () {
        this.schedule(this._extendStickCallback, 0.02);
        // 播放棍子伸长的声音
        cc.audioEngine.playMusic(res.stickExtend_ogg, true);
    },

    /**
     * 伸长棍子回调
     * @private
     */
    _extendStickCallback: function () {
        var _this = this;
        _this._curStick.setScaleY(_this._curStick.scaleY + 0.08);
    },

    /**
     * 停止伸长棍子
     * @private
     */
    _unextendStick: function () {
        var _this = this;
        _this.unschedule(_this._extendStickCallback);
        _this._curStickHg = _this._curStick.height * _this._curStick.scaleY;
        _this._isStickReady = false;
        // 停止播放棍子伸长的声音
        cc.audioEngine.stopMusic();
    },

    /**
     * 翻转棍子
     * @private
     */
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
     * 移动角色
     */
    _movePlayer: function () {

        var _this = this;

        // 获取下一个平台
        var targetStageIndex = _this._getNextStageIndex();
        var targetStage = _this._stageList[targetStageIndex];

        // 计算移动距离
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

            // 移动角色到指定距离
            _this._playerSpr.runAction(
                cc.sequence(
                    cc.moveBy(0.2, moveDistance, 0),
                    cc.callFunc(function () {

                        // 更新当前平台和棍子
                        var nextStageIndex = _this._getNextStageIndex();
                        var nextStage = _this._stageList[nextStageIndex];
                        _this._curStageIndex = nextStageIndex;
                        _this._curStage = _this._stageList[nextStageIndex];
                        _this._curStick = _this._stickList[nextStageIndex];
                        _this._curStickHg = 0;

                        // 增加分数
                        _this._increaseScore();
                        // 移动旧的平台
                        _this._moveOldStage();
                        // 移动当前平台
                        _this._moveCurStage();
                    }, _this)
                )
            );
        }
    },

    /**
     * 跌落棍子和角色
     * @param moveDistance
     * @private
     */
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

                                // 震动背景
                                _this._bgSpr.runAction(
                                    cc.sequence(
                                        cc.jumpBy(0.2, cc.p(0, 0), 10, 2),
                                        cc.callFunc(function () {
                                            // 播放角色掉落的声音
                                            cc.audioEngine.playEffect(res.playerFall_ogg);
                                            // 显示游戏结束层
                                            _this._showGameOverLayer();
                                        }, _this)
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
     * 显示游戏结束层
     * @private
     */
    _showGameOverLayer: function () {
        var _this = this;
        _this.removeChild(_this._guideText);
        _this.removeChild(_this._scoreBgSpr);
        _this._gameOverLayer = new GameOverLayer();
        _this._gameOverLayer.showScore(_this._score);
        _this.addChild(_this._gameOverLayer);
    },

    /**
     * 增加分数
     * @private
     */
    _increaseScore: function () {
        var _this = this;
        // 加分
        _this._score ++;
        _this._scoreText.setString(_this._score);
        // 播放加分声音
        cc.audioEngine.playEffect(res.score_ogg);
    },

    /**
     * 添加分数提示
     * @private
     */
    _addScoreTip: function () {

        var _this = this;

        var scoreBgSpr = new cc.Sprite(res.scoreBg_png);
        scoreBgSpr.x = cc.winSize.width / 2;
        scoreBgSpr.y = cc.winSize.height - 200;
        _this.addChild(scoreBgSpr);
        _this._scoreBgSpr = scoreBgSpr;

        var tmpText = new cc.LabelTTF('0', 'Arial', 46);
        tmpText.setPosition(cc.p(scoreBgSpr.width / 2, scoreBgSpr.height / 2));
        tmpText.setColor(cc.color(255, 255, 255));
        scoreBgSpr.addChild(tmpText,2);
        _this._scoreText = tmpText;
    },

    /**
     * 添加游戏说明
     * @private
     */
    _addGuideText: function () {
        var _this = this;
        var guideText = cc.Sprite.create(res.guideText_png);
        guideText.setPosition(cc.winSize.width / 2, cc.winSize.height - 350);
        guideText.setColor(cc.color(0, 0, 0));
        _this.addChild(guideText, 2);
        _this._guideText = guideText;
    },

    /**
     * 移除游戏说明
     * @private
     */
    _removeGuideText: function () {
        var _this = this;
        if(_this._guideText){
            _this.removeChild(_this._guideText);
        }
    },

    /**
     * 添加背景
     * @private
     */
    _addBg: function () {
        var _this = this;
        var bgIdx = Math.floor(cc.random0To1() * 3);
        var bgSpr = new cc.Sprite(res['bg' + bgIdx + '_png']);
        bgSpr.setScale(1.1);
        bgSpr.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
        _this.addChild(bgSpr);
        _this._bgSpr = bgSpr;
    },

    /**
     * 添加标题文本
     * @private
     */
    _addTitleText: function () {
        var _this = this;
        var titleText = cc.LabelTTF.create('STICK\nHERO', 'Arial', 100, null, cc.TEXT_ALIGNMENT_CENTER);
        titleText.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height - 200));
        titleText.setColor(cc.color(0, 0, 0));
        _this.addChild(titleText);
        _this._titleText = titleText;
    },

    /**
     * 移除标题文本
     * @private
     */
    _removeTitleText: function () {
        var _this = this;
        _this.removeChild(_this._titleText);
    },

    /**
     * 添加开始按钮
     * @private
     */
    _addStartBtn: function () {

        var _this = this;

        var startBtn = new cc.MenuItemImage(
            res.btnStartNormal_png,
            res.btnStartSelect_png,
            _this.start,
            _this
        );

        var startMenu = new cc.Menu();
        startMenu.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
        startMenu.addChild(startBtn);

        var startBtnMoveBy = cc.moveBy(1, cc.p(0, 10));
        var startBtnAct = cc.sequence(startBtnMoveBy.clone(), startBtnMoveBy.reverse(), cc.delayTime(0.25)).repeatForever();
        startMenu.runAction(startBtnAct);

        _this.addChild(startMenu);
        _this._startMenu = startMenu;
        _this._startBtn = startBtn;
    },

    /**
     * 移除开始按钮
     * @private
     */
    _removeStartBtn: function () {
        var _this = this;
        _this.removeChild(_this._startMenu);
    },

    /**
     * 创建平台和棍子
     * @private
     */
    _createStageAndStick: function () {

        var _this = this;

        for(var i = 0; i < _this._stageNum; i++){

            // 创建平台
            var tmpStage = new cc.Sprite(res.black_png);
            tmpStage.setAnchorPoint(0.5, 0);
            tmpStage.setTextureRect(cc.rect(0, 0, 160, tmpStage.height));
            tmpStage.setPosition(cc.winSize.width * 2, 0);  // 需要把平台放到窗口外
            _this._stageList[i] = tmpStage;

            // 创建棍子
            var tmpStick = new cc.Sprite(res.black_png);
            tmpStick.setScaleY(0);
            tmpStick.setAnchorPoint(0.5, 0);
            tmpStick.setPosition(tmpStage.width, tmpStage.height);
            _this._stickList[i] = tmpStick;

            // 初始化平台和棍子的全局信息
            if(0 == i){

                // 设置第一个平台的属性
                tmpStage.setPositionX(cc.winSize.width / 2);

                // 保存第一个平台为当前平台
                _this._curStageIndex = 0;
                _this._curStage = tmpStage;

                // 保存第一个棍子为当前棍子
                _this._curStickIndex = 0;
                _this._curStick = tmpStick;

                // 保存全局平台的信息
                _this._stageHg = tmpStage.height;
            }

            // 添加平台和棍子到当前层
            tmpStage.addChild(tmpStick, 1);
            _this.addChild(tmpStage, 3);
        }
    },

    /**
     * 创建角色
     * @private
     */
    _createPlayer: function () {
        var _this = this;
        var playerInst = Player.init();
        var playerSpr = playerInst.getPlayerSprite();
        playerSpr.setPosition(cc.winSize.width / 2, _this._curStage.height);
        playerInst.setPlayerStanding();
        _this.addChild(playerSpr);
        _this._playerInst = playerInst;
        _this._playerSpr = playerSpr;
    },

    /**
     * 添加事件监听器
     * @private
     */
    _addEventListener: function () {
        var _this = this;
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
    },

    /**
     * 获取随机数
     * @param minNum
     * @param maxNum
     * @private
     */
    _getRandomNum: function(minNum, maxNum) {
        return Math.floor(Math.random() * (maxNum - minNum) + minNum);
    },

    /**
     * 获取旧的平台下标
     * @private
     */
    _getOldStageIndex: function () {
        var _this = this;
        var prevStageIndex = _this._curStageIndex - 1;
        return prevStageIndex >= 0 ? prevStageIndex : _this._stageNum - 1;
    },

    /**
     * 获取下一个平台下标
     * @private
     */
    _getNextStageIndex: function () {
        var _this = this;
        var nextStageIndex = _this._curStageIndex + 1;
        return nextStageIndex >= _this._stageNum ? 0 : nextStageIndex;
    }
});