
/*地图数据初始化*/
var config = {
    mapXpx   : parseInt($("#map").css('margin-left')) ,
    mapYpx   : parseInt($(".header").height())
                + parseInt($(".header").css('margin-bottom'))
                + parseInt($(".header").css('margin-top'))
                + parseInt($(".header").css('padding-top'))
                + parseInt($(".header").css('padding-bottom')) ,
    mapWidth : 20 ,
    mapHeight: 20 ,
    wallLand : 2 ,
    boxSize  : 15 ,
    canvas   : document.querySelector("#canvas")
};

function genMapFromData(grid){
    var canvas = document.querySelector("#canvas") ;
    var width = config.mapWidth ;
    var height = config.mapHeight ;

    // 指定迷宫区域宽、高
    canvas.width = (config.wallLand + config.boxSize) * width + config.wallLand;
    canvas.height = (config.wallLand + config.boxSize) * height + config.wallLand;

    var canvas2D =  canvas.getContext("2d");
    // 填充黑色
    canvas2D.fillStyle = "black";
    canvas2D.fillRect(0, 0,
        (config.wallLand + config.boxSize) * width + config.wallLand,
        (config.wallLand + config.boxSize) * height + config.wallLand
    );
    //绘制出口
    canvas2D.clearRect(
        (config.wallLand + config.boxSize) * width,
        config.wallLand ,
        config.wallLand,config.boxSize);


    for (cr_l = 0; cr_l < height; cr_l++) {
        var x_data = grid.x[cr_l] ;
        var y_data = grid.y[cr_l] ;
        for (i = 0; i < width; i++){
            canvas2D.clearRect(
                (config.boxSize + config.wallLand) * i + config.wallLand,
                (config.boxSize + config.wallLand) * cr_l + config.wallLand,
                config.boxSize, config.boxSize
            ) ;

            if(x_data[i] == 0){
                canvas2D.clearRect(
                    (config.boxSize + config.wallLand)  * (i + 1) ,
                    (config.boxSize + config.wallLand)  * cr_l + config.wallLand,
                    config.wallLand, config.boxSize)
            }

            if(y_data[i] == 0){
                canvas2D.clearRect(
                    (config.boxSize + config.wallLand)  * i + config.wallLand,
                    (config.boxSize + config.wallLand)  * (cr_l + 1) ,
                    config.boxSize, config.wallLand)
            }

        }
    }

}

/*角色控制*/
function moveRole(toX,toY,clientID){
    var next_x = (config.wallLand + config.boxSize) * mazeRunner.role.x + config.wallLand +
        (toX > 0 ? (config.boxSize * toX) : (toX < 0 ? config.wallLand * toX : 0 ));
    var next_y = (config.wallLand + config.boxSize) * mazeRunner.role.y + config.wallLand +
        (toY > 0 ? (config.boxSize * toY) : (toY < 0 ? config.wallLand * toY : 0 ));

    var canvas2D = config.canvas.getContext("2d");
    var nextImageData = canvas2D.getImageData(
        next_x,
        next_y, 1, 1
    );

    // 如果图形颜色为黑(墙)，碰壁不走，否则增加的步数
    if(0 == nextImageData.data[0] &&
        0 == nextImageData.data[1] &&
            0 == nextImageData.data[2] &&
                255 == nextImageData.data[3])
            return ;

     mazeRunner.role.step ++ ;
     mazeRunner.role.x += toX ;
     mazeRunner.role.y += toY ;
     document.querySelector("#step").innerHTML = mazeRunner.role.step ;
    if(mazeRunner.role.x >= config.mapWidth || mazeRunner.role.y >= config.mapHeight) {
        mazeRunner.role.x = 0 ;
        mazeRunner.role.x = 0 ;
        document.querySelector("#step").innerHTML = mazeRunner.role.step = Math.floor(0);
        document.querySelector("#complete").innerHTML = Math.floor(++mazeRunner.role.complete);
    }

    document.querySelector(clientID).style.left =
        (config.wallLand + config.boxSize) * mazeRunner.role.x + config.wallLand + config.mapXpx + "px" ;
    document.querySelector(clientID).style.top  =
        ((config.wallLand +config.boxSize) * mazeRunner.role.y + config.wallLand + config.mapYpx) + "px";

    updateSessionByWindow() ;

    var role_info = mazeRunner.role ;
    role_info['type'] = 'move' ;
    ws.send(JSON.stringify(role_info))
}

/*键盘回调*/
function keyDownCallBack(keyObj){

    if(keyObj.keyCode == 13){
        if(!$('.footer > input').is(":focus")){
            $('.footer > input').focus() ;
        }
        return sendMessage() ;
    }

    36 < keyObj.keyCode &&
        41 > keyObj.keyCode &&
    moveRole((keyObj.keyCode - 38) % 2, (keyObj.keyCode - 39) % 2,"#myself")
}

/*发送消息*/
function sendMessage(){
    var text = removeHTMLTag($('.footer > input').val()) ;
    if(!text || text == undefined)
        return false;
    $('.footer>input').val('');
    layer.tips(text, '#myself',{
        tips: [4, '#3595CC'],
        time: 2500,
        tipsMore:true ,
        skin     : 'layer_tipes_skin'
    });
    var message = {
        type     : "message" ,
        name     : mazeRunner.role.name.replace(/"/g, '\\"') ,
        text     : text
    } ;
    ws.send(JSON.stringify(message));
}

/*过滤输入信息*/
function removeHTMLTag(str) {
    str = str.replace(/<script.*?>.*?<\/script>/ig, '');
    str = str.replace(/<\/?[^>]*>/g,''); //去除HTML tag
    str = str.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
    str=str.replace(/ /ig,'');//去掉
    return str;
}

$.ajax({
    type:"GET" ,
    url:"api/grid.php" ,
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

//启动控制
document.body.onkeydown = keyDownCallBack ;