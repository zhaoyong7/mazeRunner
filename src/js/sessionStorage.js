
function getSession(){
    if(!sessionStorage.getItem('mazeRunner')){
        var str = JSON.stringify({
            role : {
                id:0,
                x:0,
                y:0,
                complete : 0 ,
                step: 0 ,
                name:"" ,
                color:{
                    red :  Math.floor(Math.random() * 100) + 100 ,
                    green :  Math.floor(Math.random() * 100) + 100 ,
                    blue :  Math.floor(Math.random() * 100) + 100
                }
            } ,
            others :{}
        }) ;
        sessionStorage.mazeRunner = str ;
    }
    return sessionStorage.mazeRunner ;
}

function initStorage(){
    var mazeRunner = getSession() ;
    window.mazeRunner = JSON.parse(mazeRunner) ;
}

function clearStorage(){
    window.mazeRunner.others = {} ;
    updateSessionByWindow() ;
}

function updateSession(object,key,value){
    var mazeRunner = JSON.parse( getSession() ) ;
    if( typeof mazeRunner[object] == 'undefined' || typeof mazeRunner[object][key] == 'undefined' ){
        console.log(mazeRunner) ;
        return false ;
    }
    mazeRunner[object][key] = value ;
    window.mazeRunner = mazeRunner ;
    sessionStorage.mazeRunner = JSON.stringify(mazeRunner) ;
    return true ;
}

function updateSessionByWindow(){
    sessionStorage.mazeRunner = JSON.stringify(window.mazeRunner) ;
    return true ;
}

initStorage() ;