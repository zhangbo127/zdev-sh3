var MainScene = cc.Scene.extend({
    onEnter: function () {
        this._super();

        var gameLayer = new GameLayer();
        this.addChild(gameLayer);
    }
});