<?php

$router->get( '/api/auth', 'Api\Services\amoAuthController@auth' );

$router->get( '/', function () use ( $router ) {
    return 'test commit hallo';
} );