/**
 * Created by Qmore on 16-8-27.
 */
connect() ;

function connect() {
    // 创建websocket
    ws = new WebSocket("ws://"+document.domain+":8283");
    // 当socket连接打开时，输入用户名
    ws.onopen = onopen;
    //// 当有消息时根据消息类型显示不同信息
    ws.onmessage = onmessage;

    ws.onclose = function() {
        console.log("连接关闭，定时重连");
        clearStorage() ;

        $(".role_list").children("div").remove() ;
        $("#roles").children("div").remove() ;
        connect();
    };

    ws.onerror = function() {
        console.log("出现错误");
    };
}

// 输入姓名
function show_prompt(){
    var name = prompt('输入你的名字：', '');
    name = removeHTMLTag(name) ;
    if(!name || name=='null'){
        alert("输入名字为空或者为'null'，请重新输入！");
        show_prompt();
    }
    updateSession('role','name',name) ;
}

function onopen()
{
    if(!mazeRunner.role.name){
        show_prompt()
    }
    var login_data = {
        type     : "login" ,
        name     : mazeRunner.role.name.replace(/"/g, '\\"') ,
        x        : mazeRunner.role.x ,
        y        : mazeRunner.role.y ,
        complete : mazeRunner.role.complete ,
        step     : mazeRunner.role.step ,
        color    : mazeRunner.role.color
    } ;
    document.querySelector("#step").innerHTML = mazeRunner.role.step ;
    document.querySelector("#complete").innerHTML = mazeRunner.role.complete ;
    paintRole(mazeRunner.role.x ,mazeRunner.role.y) ;
    ws.send(JSON.stringify(login_data));
}

// 服务端发来消息时
function onmessage(e)
{
    var repsonse = JSON.parse(e.data);
    switch(repsonse['type']){
        // 服务端ping客户端
        case 'ping':
            ws.send('{"type":"pong"}');
            break;
        //登陆更新用户列表(其他用户会接收到)
        case 'login':
            var count = $(".role_list").children('div').length + 1 ;
            var html =
                "<div class='role_one' client_id='"+repsonse['id']+"' style=' border-radius: 2px;background-color: rgb("+repsonse['color']['red']+", "+repsonse['color']['green']+", "+repsonse['color']['blue']+");'>"+
                    "<span class='role_metal'>"+count+"</span>"+
                    "<span class='role_name'>"+repsonse['name']+"</span>"+
                    "<span class='role_score'>"+repsonse['complete']+"分</span>"+
                "</div>"
            $(".role_list").append(html) ;
            if(!mazeRunner.others[repsonse['id']]){
                delete(repsonse['type'])
                mazeRunner.others[repsonse['id']] = repsonse;
                updateSessionByWindow() ;
                repaintOther(
                    repsonse['x'],repsonse['y'],repsonse['id'],
                    repsonse['color']['red'] ,
                    repsonse['color']['green'] ,
                    repsonse['color']['blue']
                )
            }
            break ;
        //保存自己信息（自己接收到）
        case 'self':
            updateSession('role','id',repsonse['id']) ;
            var count = 1 ;
            $.each(repsonse['client_list'] ,function(index,value){
                var html =
                "<div class='role_one' client_id='"+value['id']+"' style=' border-radius: 2px;background-color: rgb("+value['color']['red']+", "+value['color']['green']+", "+value['color']['blue']+");'>"+
                    "<span class='role_metal'>"+count+"</span>"+
                    "<span class='role_name'>"+value['name']+"</span>"+
                    "<span class='role_score'>"+value['complete']+"分</span>"+
                "</div>"
                $(".role_list").append(html) ;
                if(!mazeRunner.others[value['id']] && value['id'] != repsonse['id']){
                    mazeRunner.others[value['id']] = value;
                    updateSessionByWindow() ;
                }
                if(value['id'] != repsonse['id']){
                    repaintOther(
                        value['x'],value['y'],value['id'] ,
                        value['color']['red'],
                        value['color']['green'],
                        value['color']['blue']
                    ) ;
                }
                count++ ;
            }) ;
            break ;
        //用户退出
        case 'logout':
            $(".role_list").children("div[client_id='"+repsonse['id']+"']").remove() ;
            $("#roles").children("#"+repsonse['id']).remove() ;
            if(mazeRunner.others[repsonse['id']]){
                delete(mazeRunner.others[repsonse['id']]) ;
                updateSessionByWindow() ;
            }
            break;
        case 'move':
            move(repsonse['x'],repsonse['y'],repsonse['id']) ;
            break ;
        case 'message':
            layer.tips(repsonse['text'], '#'+repsonse['id'],{
                tips: [4, '#3595CC'],
                time: 4000,
                tipsMore:true ,
                skin    : 'layer_tipes_skin'
            });
            break ;
    }
}

function paintRole(x,y){
    var x_px = (config.wallLand + config.boxSize) * x + config.wallLand + config.mapXpx + "px" ;
    var y_px = ((config.wallLand +config.boxSize) * y + config.wallLand + config.mapYpx) + "px";

    var r = mazeRunner.role.color.red ;
    var g = mazeRunner.role.color.green ;
    var b = mazeRunner.role.color.blue ;

    if(!$("#myself").length > 0){
        var html =  '<div id="myself" class="role"></div>';
        $("#roles").append(html) ;
    }
    $("#myself").css({'left':x_px,'top':y_px,'width':config.boxSize,'height':config.boxSize,'backgroundColor':"rgba("+r+","+g+","+b+",1)"}) ;
}

function repaintOther(x,y,clientID,r,g,b){
    var x_px = (config.wallLand + config.boxSize) * x + config.wallLand + config.mapXpx + "px" ;
    var y_px = ((config.wallLand +config.boxSize) * y+ config.wallLand + config.mapYpx) + "px";
    var html =  '<div id="'+clientID+'"class="role"></div>'
    $("#roles").append(html) ;
    $("#"+clientID).css({'left':x_px,'top':y_px,'width':config.boxSize,'height':config.boxSize,'backgroundColor':"rgba("+r+","+g+","+b+",1)"}) ;
}

function move(x,y,clientID){
    var x_px = (config.wallLand + config.boxSize) * x + config.wallLand +  config.mapXpx +"px" ;
    var y_px = ((config.wallLand +config.boxSize) * y+ config.wallLand + config.mapYpx) + "px";
    $("#"+clientID).css({'left':x_px,'top':y_px}) ;
}