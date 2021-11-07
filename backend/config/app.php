<?php

return [
  'amoCRM' => [
    'client_secret'                 => env( 'AMOCRM_CLIENT_SECRET', null ),
    'redirect_uri'                  => env( 'AMOCRM_REDIRECT_URI', null ),
    'subdomain'                     => env( 'AMOCRM_SUBDOMAIN', null ),
    'mortgage_pipeline_id'          => ( int ) env( 'AMOCRM_MORTGAGE_PIPELINE_ID', null ),
    'mortgage_responsible_user_id'  => ( int ) env( 'AMOCRM_MORTGAGE_RESPONSIBLE_USER', null ),
  ]
];