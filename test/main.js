

//绘制迷宫区域
function genMap(width,height){

    config.mapWidth = width ;
    config.mapHeight = height ;

    // 指定迷宫区域宽、高
    config.canvas.width = (config.wallLand + config.boxSize) * width + config.wallLand;
    config.canvas.height = (config.wallLand + config.boxSize) * height + config.wallLand;

    var canvas2D = config.canvas.getContext("2d");
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

    //绘制网格
    genGird(width,height) ;
}

//绘制迷宫网格
function genGird(width_step,height_step){
    // 声明阵列存储多个当前小区，为墙的权利和在底壁的值的值的值的
    var canvas2D = config.canvas.getContext("2d");
    var a = Array(width_step);  //用于判断是否属于一个间隙的小组（相同值）
    var b = Array(width_step);  //用于判断底部是否要打开（封锁）
    var k = Array(width_step);  //用于判断左右是否要打开（风扇）
    // 当前组
    var q = 1; //为间隙提供唯一值

    var grid = {x:[],y:[]} ;


    for (cr_l = 0; cr_l < height_step; cr_l++) {
        var temp_k = [] ;
        var temp_b = [] ;
        for (i = 0; i < width_step; i++){
            temp_k[i] = 1 ;
            temp_b[i] = 1 ;

            canvas2D.clearRect(
                (config.boxSize + config.wallLand) * i + config.wallLand,
                (config.boxSize + config.wallLand) * cr_l + config.wallLand,
                config.boxSize, config.boxSize
            ) ;
            k[i] = 0 ;
            if( 0 == cr_l )
                a[i] = 0 ;
            if(1 == b[i])
                b[i] = a[i] = 0 ;
            if(0 == a[i])
                a[i] = q++ ;
        }

        //创建右侧和底部的一个随机墙
        for (i = 0; i < width_step; i++) {
            k[i] = Math.floor(2 * Math.random()); //用于消除右边 0消除 1不消除
            b[i] = Math.floor(2 * Math.random()); //用于消除底部 0消除 1不消除

            //消除右墙
            if ((0 == k[i] || cr_l == height_step - 1) && i != width_step - 1 && a[i + 1] != a[i]) {
                var l = a[i + 1];
                for (j = 0; j < width_step; j++)
                    if(a[j] == l)
                        a[j] = a[i] ;

                canvas2D.clearRect(
                    (config.boxSize + config.wallLand)  * (i + 1) ,
                    (config.boxSize + config.wallLand)  * cr_l + config.wallLand,
                    config.wallLand, config.boxSize)

                temp_k[i] = 0 ;

            }

            //消除底部的墙
            if(cr_l != height_step - 1 && 0 == b[i]){
                canvas2D.clearRect(
                    (config.boxSize + config.wallLand)  * i + config.wallLand,
                    (config.boxSize + config.wallLand)  * (cr_l + 1) ,
                    config.boxSize, config.wallLand)

                temp_b[i] = 0 ;
            }

        }

        // 检查是否封锁。
        for (i = 0; i < width_step; i++) {
            var p = l = 0;
            for (j = 0; j < width_step; j++) //如果a[i] == a[j]说明横坐标方向相通
                a[i] == a[j] && 0 == b[j] ? p++ : l++; //不相通了，底部也不开，为阻塞。要打开封锁

            if(0 == p) {
                b[i] = 0;
                canvas2D.clearRect(
                    (config.boxSize + config.wallLand) * i + config.wallLand,
                    (config.boxSize + config.wallLand) * (cr_l+1) ,
                    config.boxSize, config.wallLand) ;
                temp_b[i] = 0 ;
            }
        }
        grid.x.push(temp_k) ;
        grid.y.push(temp_b) ;
    }
}

/*角色控制*/
function actionController(toX,toY,roleID){
    var next_x = (config.wallLand + config.boxSize) * role.x + config.wallLand +
        (toX > 0 ? (config.boxSize * toX) : (toX < 0 ? config.wallLand * toX : 0 ));
    var next_y = (config.wallLand + config.boxSize) * role.y + config.wallLand +
        (toY > 0 ? (config.boxSize * toY) : (toY < 0 ? config.wallLand * toY : 0 ));

    var canvas2D = config.canvas.getContext("2d");
    var nextImageData = canvas2D.getImageData(
        next_x,
        next_y, 1, 1
    );

    // 如果图形颜色为黑(墙)，碰壁不走，否则增加的步数
    0 == nextImageData.data[0] &&
        0 == nextImageData.data[1] &&
            0 == nextImageData.data[2] &&
                255 == nextImageData.data[3] ?
                    toX = toY = 0 : document.querySelector("#step").innerHTML = Math.floor(document.querySelector("#step").innerHTML) + 1;

    role.x += toX ;
    role.y += toY ;

    if(role.x >= config.mapWidth || role.y >= config.mapHeight) {
        role.x = 0 ;
        role.x = 0 ;
        document.querySelector("#step").innerHTML = Math.floor(0);
        document.querySelector("#complete").innerHTML = Math.floor(++config.complete);
    }

    document.querySelector(roleID).style.left =
        (config.wallLand + config.boxSize) * role.x + config.wallLand + "px" ;
    document.querySelector(roleID).style.top  =
        ((config.wallLand +config.boxSize) * role.y + config.wallLand + 16) + "px";

}

/*键盘回调*/
function keyDownCallBack(keyObj){
    36 < keyObj.keyCode &&
        41 > keyObj.keyCode &&
            actionController((keyObj.keyCode - 38) % 2, (keyObj.keyCode - 39) % 2,"#myself")
}

var config = {
        mapX     : 0 ,
        mapY     : 0 ,
        mapWidth : 0 ,
        mapHeight: 0 ,
        wallLand : 3 ,
        boxSize  : 10 ,
        canvas   : document.querySelector("#canvas"),
        complete : 0
    } ,
    role = {x:0,y:0} ,
    others = [] ;

//启动地图
genMap(20,20) ;

//启动控制
document.body.onkeydown = keyDownCallBack ;