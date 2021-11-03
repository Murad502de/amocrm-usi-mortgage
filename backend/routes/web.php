<?php

$router->get( '/api/auth', 'Api\Services\amoAuthController@auth' );

$router->get( '/lead/{id}', 'LeadController@get' );