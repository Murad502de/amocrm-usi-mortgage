<?php

namespace App\Services\amoAPI;

use App\Services\amoAPI\amoHttp\amoClient;
use Illuminate\Support\Facades\Log;

class amoCRM
{
    private $client;
    private $pageItemLimit;
    private $amoData = [
        'client_id' => null,
        'client_secret' => null,
        'code' => null,
        'redirect_uri' => null,
        'subdomain' => null
    ];

    function __construct ( $amoData )
    {
        //echo 'const amoCRM<br>';

        $this->client = new amoClient();

        $this->pageItemLimit = 250;

        $this->amoData[ 'client_id' ]     = $amoData[ 'client_id' ] ?? null;
        $this->amoData[ 'client_secret' ] = $amoData[ 'client_secret' ] ?? null;
        $this->amoData[ 'code' ]          = $amoData[ 'code' ] ?? null;
        $this->amoData[ 'redirect_uri' ]  = $amoData[ 'redirect_uri' ] ?? null;
        $this->amoData[ 'subdomain' ]     = $amoData[ 'subdomain' ] ?? null;
        $this->amoData[ 'access_token' ]  = $amoData[ 'access_token' ] ?? null;
    }

    public function auth ()
    {
        /*echo 'amoCRM@auth<br>';

        echo '<pre>';
        print_r( $this->amoData );
        echo '</pre><br>';*/

        try
        {
            $response = $this->client->sendRequest(

                [
                    'url'     => 'https://' . $this->amoData[ 'subdomain' ] . '.amocrm.ru/oauth2/access_token',
                    'headers' => [
                        'Content-Type' => 'application/json'
                    ],
                    'method'  => 'POST',
                    'data'    => [
                        'grant_type'    => 'authorization_code',
                        'client_id'     => $this->amoData[ 'client_id' ],
                        'client_secret' => $this->amoData[ 'client_secret' ],
                        'code'          => $this->amoData[ 'code' ],
                        'redirect_uri'  => $this->amoData[ 'redirect_uri' ]
                    ]
                ]
            );

            if ( $response[ 'code' ] < 200 || $response[ 'code' ] > 204 )
            {
                throw new \Exception( $response[ 'code' ] );
            }

            /*echo 'amoCRM@auth : response<br>';
            echo '<pre>';
            print_r( $response );
            echo '</pre><br>';*/
        }
        catch ( \Exception $exception )
        {
            Log::error(
                __METHOD__,

                [
                    'message'  => $exception->getMessage()
                ]
            );

            //return response( [ 'Unauthorized' ], 401 );
        }

        return $response;
    }

    public function list ( $entity )
    {
        if ( !$entity ) return false;

        $page = 1;
        $entityList = [];
        $api = '';

        switch ( $entity )
        {
            case 'lead' :
                $api = '/api/v4/leads';
            break;

            case 'contact' :
            break;

            case 'users' :
                $api = '/api/v4/users';
            break;
            
            default:
            break;
        }

        for ( ;; $page++ )
        {
            //usleep( 500000 );

            $url = 'https://' . $this->amoData[ 'subdomain' ] . '.amocrm.ru' . $api . '?limit=' . $this->pageItemLimit . '&page=' . $page;

            $response = $this->client->sendRequest(

                [
                    'url'     => $url,
                    'headers' => [
                        'Content-Type'  => 'application/json',
                        'Authorization' => 'Bearer ' . $this->amoData[ 'access_token' ]
                    ],
                    'method'  => 'GET'
                ]
            );

            if ( $response[ 'code' ] < 200 || $response[ 'code' ] >= 204 ) break;

            $entityList[ $page - 1 ] = $response[ 'body' ];
        }

        return $entityList;
    }

    public function listByQuery ( $entity, $query )
    {
        if ( !$entity ) return false;

        $page = 1;
        $entityList = [];
        $api = '';

        switch ( $entity )
        {
            case 'lead' :
                $api = '/api/v4/leads';
            break;

            case 'contact' :
            break;

            case 'users' :
                $api = '/api/v4/users';
            break;

            case 'task' :
                $api = '/api/v4/tasks';
            break;
            
            default:
            break;
        }

        for ( ;; $page++ )
        {
            //usleep( 500000 );

            $url = 'https://' . $this->amoData[ 'subdomain' ] . '.amocrm.ru' . $api . '?limit=' . $this->pageItemLimit . '&page=' . $page . '&' . $query;

            $response = $this->client->sendRequest(

                [
                    'url'     => $url,
                    'headers' => [
                        'Content-Type'  => 'application/json',
                        'Authorization' => 'Bearer ' . $this->amoData[ 'access_token' ]
                    ],
                    'method'  => 'GET'
                ]
            );

            if ( $response[ 'code' ] < 200 || $response[ 'code' ] >= 204 ) break;

            $entityList[ $page - 1 ] = $response[ 'body' ];
        }

        return $entityList;
    }

    public function findLeadById ( $id )
    {
        $url = "https://integrat3.amocrm.ru/api/v4/leads/$id?with=contacts";

        try
        {
            $response = $this->client->sendRequest(

                [
                    'url'     => $url,
                    'headers' => [
                        'Content-Type'  => 'application/json',
                        'Authorization' => 'Bearer ' . $this->amoData[ 'access_token' ]
                    ],
                    'method'  => 'GET'
                ]
            );
    
            if ( $response[ 'code' ] < 200 || $response[ 'code' ] > 204 )
            {
                throw new \Exception( $response[ 'code' ] );
            }

            return $response;
        }
        catch ( \Exception $exception )
        {
            Log::error(
                __METHOD__,

                [
                    'message'  => $exception->getMessage()
                ]
            );

            return $response;
        }
    }
}
