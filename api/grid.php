<?php
/**
 * Created by PhpStorm.
 * User: Qmore
 * Date: 16-9-1
 * Time: 下午11:16
 */
require_once 'functions.php';

$data = genGrid(55,27) ;

response_json(array('data'=>$data)) ;
// genGrid(10,10) ;



