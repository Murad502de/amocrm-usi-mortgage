<?php

return [
  'amoCRM' => [
    'client_secret'         => env( 'AMOCRM_CLIENT_SECRET', null ),
    'redirect_uri'          => env( 'AMOCRM_REDIRECT_URI', null ),
    'subdomain'             => env( 'AMOCRM_SUBDOMAIN', null ),
    'mortgage_pipeline_id'  => env( 'AMOCRM_MORTGAGE_PIPELINE_ID', null ), 
  ]
];