/**
 * @author chenzs
 * @modify dongsh 
 * @time 2016-09-19
 */
(function () {  

    // 保存选择器
    var SelectorApi = {
        $canvas: $("#canvas"),
        $step: $('#step'),
        $complete: $('#complete'),
        $messege: $('#messege')
    };

    // 坐标以及角色数据放本地
    var LocalData = (function () {
        var data = {
            role: {
                id: 0,
                x: 0,
                y: 0,
                complete: 0 ,
                step: 0 ,
                name: null,
                color: {
                    red: Math.floor(Math.random() * 100) + 100,
                    green: Math.floor(Math.random() * 100) + 100,
                    blue: Math.floor(Math.random() * 100) + 100
                }
            },
            others: {}
        };

        return {
            getData: function (target, key) {
                if ( !data.hasOwnProperty(target) ) return false;
                if ( !data[target].hasOwnProperty(key) ) return false;

                return data[target][key];
            },
            updateData: function (target, key, value) {
                if ( !data.hasOwnProperty(target) ) return false;
                if ( !data[target].hasOwnProperty(key) ) return false;
                if ( !value ) return false;

                data[target][key] = value;
            },
            clearOther: function () {
                data.others = {};
            }
        };
    })();

    // 角色控制类
    var Role = (function () {
        return {
            paintRole: function (x, y) {
                var x_px = (Maps.getConfig('wallLand') + Maps.getConfig('boxSize')) * x + 
                    Maps.getConfig('wallLand') + Maps.getConfig('mapXpx') + "px" ;
                var y_px = ((Maps.getConfig('wallLand') + Maps.getConfig('boxSize')) * y + 
                    Maps.getConfig('wallLand') + Maps.getConfig('mapYpx')) + "px";

                var r = LocalData.getData('role', 'color').red;
                var g = LocalData.getData('role', 'color').green;
                var b = LocalData.getData('role', 'color').blue;
               
                if ( $('#myself').length == 0 ) {
                    $("#roles").append('<div id="myself" class="role"></div>');
                    SelectorApi.$mySelf = $('#myself');
                }
                SelectorApi.$mySelf.css({
                    'left': x_px, 
                    'top': y_px, 
                    'width': Maps.getConfig('boxSize'), 
                    'height': Maps.getConfig('boxSize'), 
                    'backgroundColor': "rgba("+r+","+g+","+b+", 1)"
                });
            },
            repaintOther: function (x, y, clientID, r, g, b) {
                var x_px = (Maps.getConfig('wallLand') + Maps.getConfig('boxSize')) * x + 
                    Maps.getConfig('wallLand') + Maps.getConfig('mapXpx') + "px" ;
                var y_px = ((Maps.getConfig('wallLand') + Maps.getConfig('boxSize')) * y + 
                    Maps.getConfig('wallLand') + Maps.getConfig('mapYpx')) + "px";

                $("#roles").append('<div id="'+clientID+'"class="role"></div>');
                $("#" + clientID).css({
                    'left': x_px, 
                    'top': y_px, 
                    'width': Maps.getConfig('boxSize'), 
                    'height': Maps.getConfig('boxSize'), 
                    'backgroundColor': "rgba("+r+","+g+","+b+", 1)"
                });
            },
            move: function (x, y, clientID) {
                var x_px = (Maps.getConfig('wallLand') + Maps.getConfig('boxSize')) * x + 
                    Maps.getConfig('wallLand') + Maps.getConfig('mapXpx') + "px" ;
                var y_px = ((Maps.getConfig('wallLand') + Maps.getConfig('boxSize')) * y + 
                    Maps.getConfig('wallLand') + Maps.getConfig('mapYpx')) + "px";

                $("#"+ clientID).css({'left': x_px, 'top': y_px});
            }
        }
    })();

    // 地图数据
    var Maps = (function () {
        var config = {
            mapXpx: parseInt( $("#map").css('margin-left') ),
            mapYpx: parseInt( $("#header").outerHeight() ) + 20,
            mapWidth: 20,
            mapHeight: 20,
            wallLand: 2,
            boxSize: 15,
        };

        return {
            getConfig: function (key) {
                if ( !config.hasOwnProperty(key) ) return false;

                return config[key];
            },
            setConfig: function (key, value) {
                if ( !config.hasOwnProperty(key) ) return false;
                if ( !value ) return false;

                config[key] = value;
            },

            // 初始化地图
            initMapFromData: function (grid) {
                var canvas = SelectorApi.$canvas[0];
                var width = config.mapWidth;
                var height = config.mapHeight;
                var canvas2D = canvas.getContext("2d");

                // 指定迷宫区域宽、高
                canvas.width = (config.wallLand + config.boxSize) * width + config.wallLand;
                canvas.height = (config.wallLand + config.boxSize) * height + config.wallLand;

                // 填充黑色
                canvas2D.fillStyle = "black";
                canvas2D.fillRect(
                    0, 
                    0, 
                    (config.wallLand + config.boxSize) * width + config.wallLand,
                    (config.wallLand + config.boxSize) * height + config.wallLand
                );

                // 绘制出口
                canvas2D.clearRect(
                    (config.wallLand + config.boxSize) * width,
                    config.wallLand,
                    config.wallLand,
                    config.boxSize
                );

                for ( cr_l = 0; cr_l < height; cr_l++ ) {
                    var x_data = grid.x[cr_l];
                    var y_data = grid.y[cr_l];

                    for ( i = 0; i < width; i++) {
                        canvas2D.clearRect(
                            (config.boxSize + config.wallLand) * i + config.wallLand,
                            (config.boxSize + config.wallLand) * cr_l + config.wallLand,
                            config.boxSize, config.boxSize
                        );
                        if ( x_data[i] == 0 ) {
                            canvas2D.clearRect(
                                (config.boxSize + config.wallLand) * (i + 1),
                                (config.boxSize + config.wallLand) * cr_l + config.wallLand,
                                config.wallLand,
                                config.boxSize
                            );
                        }
                        if ( y_data[i] == 0 ) {
                            canvas2D.clearRect(
                                (config.boxSize + config.wallLand) * i + config.wallLand,
                                (config.boxSize + config.wallLand) * (cr_l + 1),
                                config.boxSize, 
                                config.wallLand
                            );
                        };
                    };
                };
            },

            // 角色控制
            moveRole: function (toX, toY) {
                var next_x = (config.wallLand + config.boxSize) * LocalData.getData('role', 'x') + config.wallLand +
                    (toX > 0 ? (config.boxSize * toX) : (toX < 0 ? config.wallLand * toX : 0 ));
                var next_y = (config.wallLand + config.boxSize) * LocalData.getData('role', 'y') + config.wallLand +
                    (toY > 0 ? (config.boxSize * toY) : (toY < 0 ? config.wallLand * toY : 0 ));
                var canvas2D = SelectorApi.$canvas[0].getContext("2d");
                var nextImageData = canvas2D.getImageData(
                    next_x,
                    next_y, 
                    1, 
                    1
                );

                // 如果图形颜色为黑(墙)，碰壁不走，否则增加的步数
                if ( 0 == nextImageData.data[0] && 0 == nextImageData.data[1] &&
                        0 == nextImageData.data[2] && 255 == nextImageData.data[3]) {
                    return;
                }

                LocalData.updateData('role', 'step', +LocalData.getData('role', 'step') + 1);
                LocalData.updateData('role', 'x', +LocalData.getData('role', 'x') + +toX);
                LocalData.updateData('role', 'y', +LocalData.getData('role', 'y') + +toY);
                SelectorApi.$step.text( LocalData.getData('role', 'step') );

                // 通关
                if ( LocalData.getData('role', 'x') >= config.mapWidth || LocalData.getData('role', 'y') >= config.mapHeight ) {
                    LocalData.updateData('role', 'x', 0);
                    LocalData.updateData('role', 'step', 0);
                    SelectorApi.$step.text(0);
                    SelectorApi.$complete.text( Math.floor(++LocalData.getData('role', 'complete')) );
                }

                SelectorApi.$mySelf.css({'left': (config.wallLand + config.boxSize) * LocalData.getData('role', 'x')
                    + config.wallLand + config.mapXpx,
                    'top': ((config.wallLand +config.boxSize) * LocalData.getData('role', 'y') 
                    + config.wallLand + config.mapYpx)
                });
            }
        };
    })();

    // 发送消息
    function sendMessage () {
        var text = removeHTMLTag( SelectorApi.$messege.val() );
        if ( !text || text == undefined ) return false;

        SelectorApi.$messege.val('');
        layer.tips(text, '#myself', {
            tips: [4, '#3595CC'],
            time: 2500,
            tipsMore: true ,
            skin: 'layer_tipes_skin'
        });
    }

    // 过滤输入信息
    function removeHTMLTag (str) {
        str = str.replace(/<script.*?>.*?<\/script>/ig, '');
        str = str.replace(/<\/?[^>]*>/g, ''); // 去除HTML tag
        str = str.replace(/[ | ]*\n/g, '\n'); // 去除行尾空白
        str = str.replace(/ /ig, ''); // 去掉
        return str;
    };

    // 输入姓名
    function show_prompt () {
        var name = window.prompt("请输入昵称:") ;
        if ( !name || name == 'null' ) {
            alert("输入名字为空或者为'null'，请重新输入！");
            show_prompt();
        }
        LocalData.updateData('role', 'name', name);
        bengin();
    }

    function bengin () {
        SelectorApi.$step.text( LocalData.getData('role', 'step') );
        SelectorApi.$complete.text( LocalData.getData('role', 'complete') );
        Role.paintRole( LocalData.getData('role', 'x'), LocalData.getData('role', 'y') );
    };

    // 初始化地图与事件
    function initMapAndEvent (source) {
        // 调用地图
        Maps.setConfig('mapWidth', source.data.width);
        Maps.setConfig('mapHeight', source.data.height);
        Maps.initMapFromData(source.data);

        // 启动控制,监听键盘
        document.body.onkeydown = function (e) {
            if ( e.keyCode == 13 ) {
                if ( !SelectorApi.$messege.is(":focus") ) {
                    SelectorApi.$messege.focus();
                }
                return sendMessage();
            }
            if ( e.keyCode > 36 && e.keyCode < 41 ) {
                Maps.moveRole((e.keyCode - 38) % 2, (e.keyCode - 39) % 2);
            }
        };

        show_prompt();
    };

    // 拿地图数据
    $.ajax({
        type: "GET",
        url: "http://120.25.105.202:2123/mazeRunner/api/grid.php" ,
        dataType: "JSON" ,
        beforeSend: function () {
            $("#load_text").remove();
        },
        success: function (source) {
            initMapAndEvent(source);
        }
    });
})();