(function mapGen(b, c, e, a, m) {

    // 步骤总数，通过总数
    document.querySelector("#step").innerHTML = Math.floor(a);
    document.querySelector("#complete").innerHTML = Math.floor(m);

    //墙壁厚度、方块大小、方块位置,单位像素
    var wallLand = 3 ,
        boxSize = 10 ,
        box_x = 0 ,
        box_y = 0 ;

    // 选择绘图区域
    b = document.querySelector(b);
    // 指定迷宫区域宽、高
    b.width = (wallLand + boxSize) * c + wallLand;
    b.height = (wallLand + boxSize) * e + wallLand;

    var d = b.getContext("2d");
    // 填充黑色
    d.fillStyle = "black";
    d.fillRect(0, 0,
        (wallLand + boxSize) * c + wallLand,
        (wallLand + boxSize) * e + wallLand
    );
    //绘制出口
    d.clearRect( (wallLand + boxSize) * c, wallLand , wallLand, boxSize);

    //绘制网格
    gridGen(c,e) ;

    // 字符控制
    function character(toX, toY) {
        // 当前要移动区域的信息
       var   next_x = (wallLand + boxSize) * box_x + wallLand +
           (toX > 0 ? (boxSize * toX) : (toX < 0 ? wallLand * toX : 0 ));
       var   next_y = (wallLand + boxSize) * box_y + wallLand +
           (toY > 0 ? (boxSize * toY) : (toY < 0 ? wallLand * toY : 0 ));

        var h = d.getImageData(
            next_x,
            next_y, 1, 1
        );
        // 如果图形颜色为黑，碰壁不走，否则增加的步数
        0 == h.data[0] &&
            0 == h.data[1] &&
                0 == h.data[2] &&
                    255 == h.data[3] ?
            toX = toY = 0 : document.querySelector("#step").innerHTML = Math.floor(document.querySelector("#step").innerHTML) + 1;
        // 着色字符
        d.clearRect(
            (wallLand + boxSize) * box_x + wallLand,
            (wallLand + boxSize) * box_y + wallLand, boxSize, boxSize);
        // 更改其当前位置
        box_x += toX;
        box_y += toY;
        // 再次绘制
        d.fillRect(
            (wallLand + boxSize) * box_x + wallLand,
            (wallLand + boxSize) * box_y + wallLand, boxSize, boxSize);

        // 如果角色已经超越了迷宫
        if(box_x >= c || box_y >= e) {
//             mapGen("#canvas", c, e, 0, m + 1)
            box_x = 0 ;
            box_y = 0 ;
            character(-1, -1);
            document.querySelector("#step").innerHTML = Math.floor(0);
            document.querySelector("#complete").innerHTML = Math.floor(++m);
        }
    }

    function gridGen(width_step,height_step){
        // 声明阵列存储多个当前小区，为墙的权利和在底壁的值的值的值的
        a = Array(width_step);
        b = Array(width_step);
        var k = Array(width_step);
        // 当前组
        var q = 1;

        for (cr_l = 0; cr_l < height_step; cr_l++) {
            for (i = 0; i < width_step; i++){
                d.clearRect(
                    (boxSize + wallLand) * i + wallLand,
                    (boxSize + wallLand) * cr_l + wallLand,
                    boxSize, boxSize
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

                    d.clearRect(
                        (boxSize + wallLand)  * (i + 1) ,
                        (boxSize + wallLand)  * cr_l + wallLand,
                        wallLand, boxSize)
                }

                //消除底部的墙
                if(cr_l != height_step - 1 && 0 == b[i])
                  d.clearRect(
                      (boxSize + wallLand)  * i + wallLand,
                      (boxSize + wallLand)  * (cr_l + 1) ,
                      boxSize, wallLand)
            }

            // 检查是否封锁。
            for (i = 0; i < width_step; i++) {
                var p = l = 0;
                for (j = 0; j < width_step; j++) //如果a[i] == a[j]说明横坐标方向相通
                    a[i] == a[j] && 0 == b[j] ? p++ : l++; //不相通了，底部也不开，为阻塞。要打开封锁

                if(0 == p) {
                    b[i] = 0;
                    d.clearRect(
                        (boxSize + wallLand) * i + wallLand,
                        (boxSize + wallLand) * (cr_l+1) ,
                        boxSize, wallLand) ;
                }
            }

        }
    }

    // 用户设置红色
    d.fillStyle = "red";
    // 我们把一个字符到迷宫的开始
//    character(3, 3);
    // 点击箭头等待
//    document.body.onkeydown = function (keyObj) {
//        //小键盘  左：37 ； 右：39 ； 上：38 ； 下：39；   x = -1 往左 x = 1 往右 ; y = -1 往上 y = 1 往下
//        36 < keyObj.keyCode && 41 > keyObj.keyCode && character((keyObj.keyCode - 38) % 2, (keyObj.keyCode - 39) % 2)
//    }
    document.body.onkeydown = function (keyObj) {
        //小键盘  左：37 ； 右：39 ； 上：38 ； 下：39；   x = -1 往左 x = 1 往右 ; y = -1 往上 y = 1 往下
//        36 < keyObj.keyCode && 41 > keyObj.keyCode && character((keyObj.keyCode - 38) % 2, (keyObj.keyCode - 39) % 2)

        if(! (36 < keyObj.keyCode && 41 > keyObj.keyCode) ){
            return ;
        }
        var toX = (keyObj.keyCode - 38) % 2;
        var toY = (keyObj.keyCode - 39) % 2;

        var next_x = (wallLand + boxSize) * box_x + wallLand +
            (toX > 0 ? (boxSize * toX) : (toX < 0 ? wallLand * toX : 0 ));
        var   next_y = (wallLand + boxSize) * box_y + wallLand +
            (toY > 0 ? (boxSize * toY) : (toY < 0 ? wallLand * toY : 0 ));

        var h = d.getImageData(
            next_x,
            next_y, 1, 1
        );

        // 如果图形颜色为黑，碰壁不走，否则增加的步数
        0 == h.data[0] &&
            0 == h.data[1] &&
            0 == h.data[2] &&
            255 == h.data[3] ?
            toX = toY = 0 : document.querySelector("#step").innerHTML = Math.floor(document.querySelector("#step").innerHTML) + 1;

        // 更改其当前位置
        box_x += toX;
        box_y += toY;
        // 如果角色已经超越了迷宫
        if(box_x >= c || box_y >= e) {
//             mapGen("#canvas", c, e, 0, m + 1)
            box_x = 0 ;
            box_y = 0 ;
//            character(-1, -1);
            document.querySelector("#step").innerHTML = Math.floor(0);
            document.querySelector("#complete").innerHTML = Math.floor(++m);
        }
        console.log((wallLand + boxSize) * box_x + wallLand) ;
        document.querySelector("#personal_box").style.left = (wallLand + boxSize) * box_x + wallLand +"px" ;
        document.querySelector("#personal_box").style.top =16 +(wallLand + boxSize) * box_y + wallLand +"px";
    }
})("#canvas", 40,40, 0, 0);