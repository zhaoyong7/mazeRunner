<?php
use Workerman\Protocols\HttpCache;
use GatewayWorker\Lib\Db;

/**
 * Created by PhpStorm.
 * User: Qmore
 * Date: 16-9-1
 * Time: 下午11:29
 */


//创建迷宫。。。。
function genGrid($width,$height){
    $db1 = Db::instance('db1') ;
    if($map = $db1->select('data','width','length')->from('tbMazeMap')->where('status = 0')->row()){
        return json_decode($map['data']) ;
    }
    $grid = [] ;
    $count = 1 ;
    $a = $b = $k = array_fill(0,$width,null) ;
    for ($cr_l = 0; $cr_l < $height; $cr_l++) {
        $temp_k = $temp_b = array_fill(0,$width,1) ;
        for ($i = 0; $i < $width; $i++){
            $k[$i] = 0 ;
            if( 0 == $cr_l )
                $a[$i] = 0 ;
            if(1 == $b[$i])
                $b[$i] = $a[$i] = 0 ;
            if(0 == $a[$i])
                $a[$i] = $count++ ;
        }
        //进行消除
        for($i = 0; $i < $width ;$i++ ){
            $k[$i] = floor(rand(0,1)) ;
            $b[$i] = floor(rand(0,1)) ;
            //消除左右
            if((0 == $k[$i] || $cr_l == $height -1) && $i != $width -1 && $a[$i+1] != $a[$i] ){
                $l = $a[$i +1] ;
                for($j = 0 ; $j < $width; $j ++){
                    if($a[$j] == $l)
                        $a[$j] = $a[$i] ;
                }
                $temp_k[$i] = 0 ;
            }
            //消除底部
            if(0 == $b[$i] && $cr_l != $height - 1){
                $temp_b[$i] = 0 ;
            }
        }
        //消除封闭
        for($i = 0 ; $i < $width ; $i++){
            $p = $l = 0 ;
            for($j = 0 ; $j < $width ; $j++){
                $a[$i] == $a[$j] && 0 == $b[$j] ? $p++ : $l++ ;
            }

            if( 0 == $p){
                $b[$i] = 0 ;
                $temp_b[$i] = 0 ;
            }
        }
        $grid['x'][]    = $temp_k ;
        $grid['y'][]    = $temp_b ;
        $grid['width']  = $width ;
        $grid['height'] = $height ;
    }
    $db1->insert('tbMazeMap')->cols([
        'data'   => json_encode($grid) ,
        'time'   => date('Y-m-d H:i:s') ,
        'status' => 0
    ])->query() ;
    return $grid ;
}

function response_json($result, $status = 0,$msg = 'success'){
    \Workerman\Protocols\Http::header('Content-Type: application/json;charset=utf-8') ;
    \Workerman\Protocols\Http::header('Access-Control-Allow-Origin: *') ;

    if(is_null($result)){
        $result = array();
    }
    isset($result['status']) or $result['status']= $status;
    isset($result['msg']) or $result['msg']= $msg;
    $callback = isset($_GET['callback']);
    if($callback){
        echo $callback."(".json_encode($result).")";
    }else{
        echo json_encode($result);
    }
    \Workerman\Protocols\Http::end() ;
}