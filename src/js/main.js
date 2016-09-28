/**
 * @author chenzs
 * @modify dongsh 
 * @time 2016-09-19
 */
(function () {  

    var DEBUG = true ;
    // 保存选择器
    var SelectorApi = {
        $canvas: $("#canvas"),
        $step: $('#step'),
        $complete: $('#complete'),
        $messege: $('#messege'),
        $roles: $("#roles")
    };

    var Console = {
        log : function(log){
            !DEBUG || console.log(log) ;
        }
    } ;

    // 工具类
    var Utils = (function () {
        return {
            // 过滤输入信息
            removeHTMLTag: function (str) {
                str = str.replace(/<script.*?>.*?<\/script>/ig, '');
                str = str.replace(/<\/?[^>]*>/g, ''); // 去除HTML tag
                str = str.replace(/[ | ]*\n/g, '\n'); // 去除行尾空白
                str = str.replace(/ /ig, ''); // 去掉
                return str;
            },

            // 随机颜色
            randomColor: function () {
                return '#' + ('00000' + (Math.random()*0x1000000<<0).toString(16)).slice(-6);
            },

            // 唯一ID
            guidGenerator: function () {
                var S4 = function() {
                   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
                };

                return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
            }
        }
    })();

    // socket通信类
    var Socket = (function () {
        // 配置路径
        var config = {
            host : '120.25.105.202' ,
            port : '8283' ,
            webSocket : null
        };

        function onclose(){
            Console.log("连接关闭，定时重连") ;
            Socket.connect() ;
        }

        function onopen(){
            var loginData = LocalData.getData('role') ;
            loginData.type = 'login' ;
            Socket.send(loginData) ;
        }

        function onerror(){
            Console.log("出现错误");
        }

        function onmessage(e){
            var data = JSON.parse(e.data) ;
            Console.log(data) ;
            switch (data.type){
                case 'login' :
                    LocalData.appendData('others',data.id,data) ;
                    Role.repaintOther(data.x,data.y,data.id,data.color) ;
                    break ;
                case 'self':
                    LocalData.updateData('role','id',data.id) ;
                    for(var clientID in data.client_list  ){
                        if(clientID == data.id)
                            continue ;
                        var other = data.client_list[clientID] ;
                        Role.repaintOther(other.x,other.y,other.id,other.color) ;
                    }
                    break;
                case 'move' :
                    Role.move(data.x,data.y,data.id) ;
                    break ;
                case 'message' :
                    var text = Utils.removeHTMLTag( data.text );
                    layer.tips(text, '#'+data.id, {
                        tips: [4, '#3595CC'],
                        time: 2500,
                        tipsMore: true ,
                        skin: 'layer_tipes_skin'
                    });
                    break ;
                case 'broadcast' :
                    break ;
                case 'complete':
                    break ;
                case 'check' :
                    break ;
                case 'logout':
                    Role.clearOther(data.id) ;
                    break ;
            }
        }

        // 方法
        return {
            connect : function(){
                var host = DEBUG ? 'localhost' : config.host ;
                config.webSocket = new WebSocket("ws://"+host+":"+config.port);

                config.webSocket.onopen    = onopen ;

                config.webSocket.onclose   = onclose ;

                config.webSocket.onerror   = onerror ;

                config.webSocket.onmessage = onmessage ;
            },
            send : function(data){
               config.webSocket.send(JSON.stringify(data)) ;
            },
            message:function(text){
               config.webSocket.send(JSON.stringify({type:'message',text:text}))
            },
            move:function(){
               var moveData = LocalData.getData('role') ;
               moveData.type = 'move' ;
               config.webSocket.send(JSON.stringify(moveData))
            },
            complete:function(){

            }
        }
    })(); 

    // 坐标以及角色数据放本地
    var LocalData = (function () {
        var data = {
            role: {
                id: 0,
                sid: 0 ,
                x: 0,
                y: 0,
                complete: 0 ,
                step: 0 ,
                name: null ,
                color:null
            },
            others: {}
        };

        return {
            getData: function (target, key) {
                if ( !data.hasOwnProperty(target) ) return false;
                if(!key || key == 'undefined') return data[target] ;
                if ( !data[target].hasOwnProperty(key) ) return false;
                return data[target][key];
            },
            updateData: function (target, key, value) {
                if ( !data.hasOwnProperty(target) ) return false;
                if ( !data[target].hasOwnProperty(key) ) return false;
                data[target][key] = value;
            },
            appendData: function(target,key,value){
               if ( !data.hasOwnProperty(target) ) return false;
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
            // 绘制自己角色
            paintRole: function (x, y) {
                var x_px = Maps.getConfig('dist') * x + Maps.getConfig('xLen');
                var y_px = Maps.getConfig('dist') * y + Maps.getConfig('yLen');

                var color = Utils.randomColor() ;

                $('<div id="myself" class="role"></div>')
                .appendTo(SelectorApi.$roles)
                .css({
                    'left': x_px, 
                    'top': y_px, 
                    'width': Maps.getConfig('boxSize'), 
                    'height': Maps.getConfig('boxSize'), 
                    'backgroundColor': color
                });
                LocalData.updateData('role','color',color) ;
                SelectorApi.$mySelf = $('#myself');
            },

            // 绘制其他人角色
            repaintOther: function (x, y, clientID, color) {
                var x_px = Maps.getConfig('dist') * x + Maps.getConfig('xLen');
                var y_px = Maps.getConfig('dist') * y + Maps.getConfig('yLen');

                $('<div id="'+ clientID +'" class="role"></div>')
                .appendTo(SelectorApi.$roles)
                .css({
                    'left': x_px, 
                    'top': y_px, 
                    'width': Maps.getConfig('boxSize'), 
                    'height': Maps.getConfig('boxSize'), 
                    'backgroundColor': color
                });
                SelectorApi[clientID] = $("#"+ clientID);
            },
            clearOther : function(clientID){
                SelectorApi[clientID].remove() ;
            },
            // 通信中其他人角色移动
            move: function (x, y, clientID) {
                var x_px = Maps.getConfig('dist') * x + Maps.getConfig('xLen');
                var y_px = Maps.getConfig('dist') * y + Maps.getConfig('yLen');

                SelectorApi[clientID].css({'left': x_px, 'top': y_px});
            }
        }
    })();

    // 地图数据
    var Maps = (function () {
        var config = {
            mapXpx: parseInt( $("#map").css('margin-left') ),
            mapYpx: parseInt( $("#header").outerHeight() ) + parseInt( $("#header").css('margin-bottom') ),
            mapWidth: 20,
            mapHeight: 20,
            wallLand: 2,
            boxSize: 15
        };
        config.dist = config.wallLand + config.boxSize,
        config.xLen = config.wallLand + config.mapXpx,
        config.yLen = config.wallLand + config.mapYpx

        return {
            getConfig: function (key) {
                if ( !config.hasOwnProperty(key) ) return false;

                return config[key];
            },
            setConfig: function (key, value) {
                if ( !config.hasOwnProperty(key) ) return false;

                config[key] = value;
            },

            // 初始化地图
            initMapFromData: function (grid) {
                var canvas = SelectorApi.$canvas[0];
                var width = config.mapWidth;
                var height = config.mapHeight;
                var canvas2D = canvas.getContext("2d");

                // 指定迷宫区域宽、高
                canvas.width = config.dist * width + config.wallLand;
                canvas.height = config.dist * height + config.wallLand;

                // 填充黑色
                canvas2D.fillStyle = "black";
                canvas2D.fillRect(
                    0, 
                    0, 
                    config.dist * width + config.wallLand,
                    config.dist * height + config.wallLand
                );

                // 绘制出口
                canvas2D.clearRect(
                    config.dist * width,
                    config.wallLand,
                    config.wallLand,
                    config.boxSize
                );

                for ( cr_l = 0; cr_l < height; cr_l++ ) {
                    var x_data = grid.x[cr_l];
                    var y_data = grid.y[cr_l];

                    for ( i = 0; i < width; i++) {
                        canvas2D.clearRect(
                            config.dist * i + config.wallLand,
                            config.dist * cr_l + config.wallLand,
                            config.boxSize, config.boxSize
                        );
                        if ( x_data[i] == 0 ) {
                            canvas2D.clearRect(
                                config.dist * (i + 1),
                                config.dist * cr_l + config.wallLand,
                                config.wallLand,
                                config.boxSize
                            );
                        }
                        if ( y_data[i] == 0 ) {
                            canvas2D.clearRect(
                                config.dist * i + config.wallLand,
                                config.dist * (cr_l + 1),
                                config.boxSize, 
                                config.wallLand
                            );
                        };
                    };
                };
            },

            // 角色控制
            moveRole: function (toX, toY) {
                var next_x = config.dist * LocalData.getData('role', 'x') + config.wallLand +
                    (toX > 0 ? (config.boxSize * toX) : (toX < 0 ? config.wallLand * toX : 0 ));
                var next_y = config.dist * LocalData.getData('role', 'y') + config.wallLand +
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
                    return false;
                }
        
                LocalData.updateData('role', 'step', LocalData.getData('role', 'step') + 1);
                LocalData.updateData('role', 'x', LocalData.getData('role', 'x') + toX);
                LocalData.updateData('role', 'y', LocalData.getData('role', 'y') + toY);
    
                SelectorApi.$step.text( LocalData.getData('role', 'step') );

                // 通关
                if ( LocalData.getData('role', 'x') >= config.mapWidth || LocalData.getData('role', 'y') >= config.mapHeight ) {
                    LocalData.updateData('role', 'x', 0);
                    LocalData.updateData('role', 'y', 0);
                    LocalData.updateData('role', 'step', 0);
                    SelectorApi.$step.text(0);
                    SelectorApi.$complete.text( LocalData.getData('role', 'complete') + 1 );
                    Socket.complete() ;
                }

                SelectorApi.$mySelf.css({
                    'left': config.dist * LocalData.getData('role', 'x') + config.xLen,
                    'top': config.dist * LocalData.getData('role', 'y') + config.yLen
                });

                Socket.move() ;
            }
        };
    })();

    // 发送消息
    function sendMessage () {
        var text = Utils.removeHTMLTag( SelectorApi.$messege.val() );
        if ( !text || text == undefined ) return false;

        SelectorApi.$messege.val('');
        layer.tips(text, '#myself', {
            tips: [4, '#3595CC'],
            time: 2500,
            tipsMore: true ,
            skin: 'layer_tipes_skin'
        });

        var message = {
            type : 'message' ,
            text : text
        } ;
        Socket.send(message)
    };

    // 输入姓名
    function inputYourName () {
        var name = window.prompt("请输入昵称:") ;
        if ( !name || name == 'null' ) {
            alert("输入名字为空或者为'null'，请重新输入！");
            show_prompt();
        }

        LocalData.updateData('role', 'name', name);
        SelectorApi.$step.text( LocalData.getData('role', 'step') );
        SelectorApi.$complete.text( LocalData.getData('role', 'complete') );
        Role.paintRole( LocalData.getData('role', 'x'), LocalData.getData('role', 'y') );
    }

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

        inputYourName();

        //链接Socket
        Socket.connect() ;
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