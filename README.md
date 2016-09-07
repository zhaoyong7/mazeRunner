#移动迷宫小游戏

#配置websocket.js
```js
 ws = new WebSocket("ws://120.25.105.202:8283");

```

#配置main.js
```js
 $.ajax({
    type:"GET" ,
    url:"http://120.25.105.202:2123/mazeRunner/api/grid.php" ,
    dataType:"JSON" ,
    beforeSend:function(){
        $("#load_text").remove() ;
    },
    success:function(source){
        //调用地图
        config.mapWidth  = source.data.width ;
        config.mapHeight = source.data.height ;
        genMapFromData(source.data) ;
    }
}) ;
```

#详细内容看tower文档
https://tower.im/projects/cc98b20272ce417fb27bf4c8f87227a1/