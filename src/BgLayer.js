var BgLayer = cc.Layer.extend({

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

    _stick: null,
    _stickHg: 0,
    _isStickReady: false,

    _score: 0,

    _gameOverLayer: null,

    _shakeNode: null,
    _shakeNodeGrid: null,

    ctor: function () {
        this._super();
        this._init();
    },
    _init: function () {

        // 添加随机背景图
        var bgRandNum = Math.floor(cc.random0To1() * 4);
        this._bgImg = new cc.Sprite(res['bg' + bgRandNum + '_png']);
        this._bgImg.attr({
            x: cc.winSize.width / 2,
            y: cc.winSize.height / 2
        });

        // 添加震动层
        this._shakeNode = new cc.Node();
        this._shakeNodeGrid = new cc.NodeGrid();
        this._shakeNodeGrid.addChild(this._shakeNode);
        this._shakeNode.addChild(this._bgImg);
        this.addChild(this._shakeNodeGrid);

        // 添加开始按钮
        this._btnStart = new cc.MenuItemImage(
            res.btnStartNormal_png,
            res.btnStartSelect_png,
            this.start,
            this
        );
        this._menu = new cc.Menu();
        this._menu.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
        this._menu.addChild(this._btnStart);
        this.addChild(this._menu);

        // 添加三个平台
        for(var i = 0; i < 3; i++){
            var stageTmp = new cc.Sprite(res.black_png);
            stageTmp.x = cc.winSize.width + stageTmp.width / 2;
            stageTmp.y = stageTmp.height / 2;
            if(0 == i){
                stageTmp.setScaleX(30);
                stageTmp.x = cc.winSize.width / 2;
            }
            this._stageList[i] = stageTmp;
            this.addChild(stageTmp, 3);
        }
        this._stageWd = this._stageList[0].width;
        this._stageHg = this._stageList[0].height;
        this._stageY = this._stageHg / 2;
        this._curStageIndex = 0;
        this._curStage = this._stageList[this._curStageIndex];
        this._curStageScaleWd = this._curStage.width * this._curStage.getScaleX();

        // 添加棍子
        this._stick = new cc.Sprite(res.black_png);
        this._stick.setScaleY(0);
        this._stick.setAnchorPoint(0.5, 0);
        this._stick.x = -this._stick.width;
        this._stick.y = this._stageHg;
        this.addChild(this._stick);

        // 添加事件监听器
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
        }, this);
    },

    // 开始游戏
    start: function () {

        // 移除开始按钮
        this.removeChild(this._menu);

        // 移动当前平台
        this._moveCurStage();

        // 添加下个平台
        this._addNextStage();

        // 初始化棍子
        this._initStick();
    },

    _moveCurStage: function () {

        // 移动当前平台到开始位置
        var curStageMoveTo = new cc.MoveTo(0.2, this._stageStartX, this._stageY);
        this._curStage.runAction(curStageMoveTo);
    },

    _moveOldStage: function () {

        var oldStageIndex = this._curStageIndex == 0 ? 2 : this._curStageIndex - 1;
        var oldStage = this._stageList[oldStageIndex];
        var oldStageScaleWd = oldStage.width * oldStage.getScaleX();

        var _this = this;
        oldStage.runAction(
            cc.sequence(
                cc.moveTo(0.2, -oldStageScaleWd, _this._stageY),
                cc.callFunc(function () {
                    oldStage.x = cc.winSize.width + oldStageScaleWd / 2;
                }, _this)
            )
        );
    },

    _addNextStage: function () {

        // 获取下个平台
        var nextStageIndex = this._curStageIndex == 2 ? 0 : this._curStageIndex + 1;
        var nextStage = this._stageList[nextStageIndex];

        // 设置下个平台的随机宽度 2 ~ 30
        var randomScale = Math.floor(cc.random0To1() * 30);
        randomScale = randomScale ? randomScale : 2;
        nextStage.setScaleX(randomScale);
        console.log('下个平台的随机宽度' + randomScale);

        // 设置下个平台的随机位置
        var randomX = cc.winSize.width / 2;
        var nextStageMoveTo = new cc.MoveTo(0.3, randomX, this._stageY);
        nextStage.runAction(nextStageMoveTo);
        console.log('下个平台的随机位置' + randomX);
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
    _initStick: function () {

        // 初始化棍子的角度和位置
        this._stick.setRotation(0);
        this._stick.setScaleY(0);
        this._stick.x = this._stageStartX + this._curStageScaleWd / 2;
        this._stickHg = 0;

        // 标记棍子已就绪
        this._isStickReady = true;
    },
    _extendStick: function () {
        this.schedule(this._extendStickCallback, 0.02);
    },
    _extendStickCallback: function () {
        this._stick.setScaleY(this._stick.scaleY + 0.07);
    },
    _unextendStick: function () {
        this.unschedule(this._extendStickCallback);
        this._stickHg = this._stick.height * this._stick.getScaleY();
        this._isStickReady = false;
    },
    _rotateStick1: function () {
        var _this = this;
        _this._stick.runAction(
            cc.sequence(
                cc.delayTime(0.3),
                cc.rotateBy(0.1, 90),
                cc.callFunc(_this._movePlayer, _this)
            )
        );
    },

    /**
     * 角色方法
     */
    _movePlayer: function () {

        var tagetStageIndex = this._curStageIndex == 2 ? 0 : this._curStageIndex + 1;
        var tagetStage = this._stageList[tagetStageIndex];
        var tagetStageScaleWd = tagetStage.width * tagetStage.getScaleX();

        var moveDistanceMin = tagetStage.x - tagetStageScaleWd / 2  - this._stageStartX - this._curStageScaleWd / 2;
        var moveDistanceMax = moveDistanceMin + tagetStageScaleWd;
        var moveDistance = 0;

        if(this._stickHg < moveDistanceMin){
            moveDistance = this._stageHg;
            console.log('太短了，移动到' + moveDistance + '时，角色掉下');
            this._fallStickAndPlayer(moveDistance);
        }else if(this._stickHg > moveDistanceMax){
            moveDistance = moveDistanceMax;
            console.log('太长了，移动到' + moveDistance + '时，角色掉下');
            this._fallStickAndPlayer(moveDistance);
        }else{
            moveDistance = moveDistanceMax - this._stageWd;
            console.log('刚刚好，移动到' + moveDistance + '时，角色停下，移动平台');

            // 分数加一
            this._score++;

            // 修改当前平台信息
            this._curStageIndex = this._curStageIndex == 2 ? 0 : this._curStageIndex + 1;
            this._curStage = this._stageList[this._curStageIndex];
            this._curStageScaleWd = this._curStage.width * this._curStage.getScaleX();

            // 移动旧的平台
            this._moveOldStage();

            // 移动当前平台
            this._moveCurStage();

            // 添加下个平台
            this._addNextStage();

            // 初始化棍子
            this._initStick();
        }
    },
    _fallStickAndPlayer: function (moveDistance) {
        // 角色掉落

        // 棍子掉落
        this._stick.runAction(cc.rotateBy(0.1, 90));

        // 震动屏幕
        this._shakeNodeGrid.runAction(cc.shaky3D(0.5, cc.size(1, 1), 10, false));

        // 显示游戏结束层
        //this._showGameOverLayer();
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