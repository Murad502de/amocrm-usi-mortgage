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

    public function findContactById ( $id )
    {
        $url = "https://integrat3.amocrm.ru/api/v4/contacts/$id?with=leads";

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

	// FIXME das ist ein schlechte Beispiel- Man muss es nie wieder machen.
	public function copyLead ( $id )
	{
		echo 'copyLead<br>';
		$lead = $this->findLeadById( $id );

		//FIXME /////////////////////////////////////////////////////////
		$contacts = $lead[ 'body' ][ '_embedded' ][ 'contacts' ];

		$newLeadContacts = [];

		for ( $i = 0; $i < count( $contacts ); $i++ )
		{
			$newLeadContacts[] = [
				"to_entity_id" => $contacts[ $i ][ 'id' ],
				"to_entity_type" => "contacts",
				"metadata" => [
					"is_main" => $contacts[ $i ][ 'is_main' ] ? true : false
				]
			];
		}

		/*echo '<pre>';
		print_r( $newLeadContacts );
		echo '</pre>';*/
		//FIXME /////////////////////////////////////////////////////////

		//FIXME /////////////////////////////////////////////////////////
		$customFields = $lead[ 'body' ][ 'custom_fields_values' ];
		$newLeadCustomFields = [];

		
		//FIXME /////////////////////////////////////////////////////////

		return true; // FIXME

		/*try
		{
			$url = "https://integrat3.amocrm.ru/api/v4/leads";

			$newLead = $this->client->sendRequest(
				[
					'url'     => $url,
					'headers' => [
						'Content-Type'  => 'application/json',
						'Authorization' => 'Bearer ' . $this->amoData[ 'access_token' ]
					],
					'method'  => 'POST',
					'data'    => [
						[
							'name' => "Сделка для примера 1",
							'created_by' => 0,
							'price' => 2000,
							'pipeline_id' => 4799893,
							'custom_fields_values' => [
								[
									'field_id' => 1019271,
									'values' => [
										[
											'enum_id' => 606975
										]
									]
								]
							],
						]
					]
				]
			);

			if ( $newLead[ 'code' ] < 200 || $newLead[ 'code' ] > 204 )
			{
				throw new \Exception( $newLead[ 'code' ] );
			}

			$newLeadId = $newLead[ 'body' ][ '_embedded' ][ 'leads' ][ 0 ][ 'id' ];

			echo 'newLeadId: ' . $newLeadId . '<br>';

			$url = "https://integrat3.amocrm.ru/api/v4/leads/$newLeadId/link";

			$response = $this->client->sendRequest(
				[
					'url'			=> $url,
					'headers' => [
						'Content-Type'  => 'application/json',
						'Authorization' => 'Bearer ' . $this->amoData[ 'access_token' ]
					],
					'method'  => 'POST',

					'data'    => $newLeadContacts

				]
			);

			if ( $response[ 'code' ] < 200 || $response[ 'code' ] > 204 )
			{
				throw new \Exception( $response[ 'code' ] );
			}

			return $newLead;
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
		}*/
	}

	public function parseCustomFields ( $cf )
	{
		echo 'cf<br>';
		echo '<pre>';
		print_r( $cf );
		echo '</pre>';

		$parsedCustomFields = [];

		/*for ( $i = 0; $i < count( $cf ); $i++ )
		{
			switch (  ) {
				case '':
				break;
				
				default:
				break;
			}
		}*/
	}
}