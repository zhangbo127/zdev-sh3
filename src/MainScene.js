var MainScene = cc.Scene.extend({
    onEnter: function () {
        this._super();

        var bgLayer = new BgLayer();
        this.addChild(bgLayer);
    }
});