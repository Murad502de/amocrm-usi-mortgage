<?php

$router->get( '/api/auth', 'Api\Services\amoAuthController@auth' );

$router->get( '/lead/get', 'LeadController@get' );