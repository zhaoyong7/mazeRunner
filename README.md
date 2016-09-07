# mazeRunner

##移动迷宫

#配置main.js

 ws = new WebSocket("ws://120.25.105.202:8283");

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