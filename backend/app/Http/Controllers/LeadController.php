<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Services\amoAPI\amoCRM;
use App\Models\Account;
use App\Models\Lead;

class LeadController extends Controller
{
  public function __construct () {}

  public function get ( $id, Request $request )
  {
    $lead = new Lead();
    $crtlead = $lead->get( $id );

    if ( $crtlead )
    {
      $crtlead = [
        'data' => [
          'id_target_lead' => $crtlead->id_target_lead,
          'related_lead'   => $crtlead->related_lead,
        ],
      ];
    }
    else
    {
      $crtlead = [
        'data' => false,
      ];
    }

    return $crtlead;
  }

  public function createMortgage ( Request $request )
  {
    $account  = new Account();
    $authData = $account->getAuthData();
    $amo      = new amoCRM( $authData );

    $inputData    = $request->all();
    $hauptLeadId  = $inputData[ 'hauptLeadId' ] ?? false;

    $hauptLead = $amo->findLeadById( $hauptLeadId );

    if ( $hauptLead[ 'code' ] === 404 || $hauptLead[ 'code' ] === 400 )
    {
      return response( [ 'Bei der Suche nach einem hauptLead ist ein Fehler in der Serveranfrage aufgetreten' ], $hauptLead[ 'code' ] );
    }
    else if ( $hauptLead[ 'code' ] === 204 )
    {
      return response( [ 'hauptLead ist nicht gefunden' ], $hauptLead[ 'code' ] );
    }

    $mainContactId = null;
    $contacts = $hauptLead[ 'body' ][ '_embedded' ][ 'contacts' ];

    for ( $contactIndex = 0; $contactIndex < count( $contacts ); $contactIndex++ )
    {
      if ( $contacts[ $contactIndex ][ 'is_main' ] )
      {
        $mainContactId = ( int ) $contacts[ $contactIndex ][ 'id' ];
        break;
      }
    }

    $contact = $amo->findContactById( $mainContactId );

    if ( $contact[ 'code' ] === 404 || $contact[ 'code' ] === 400 )
    {
      return response( [ 'Bei der Suche nach einem Kontakt ist ein Fehler in der Serveranfrage aufgetreten ' ], $contact[ 'code' ] );
    }
    else if ( $contact[ 'code' ] === 204 )
    {
      return response( [ 'Contact ist nicht gefunden' ], $contact[ 'code' ] );
    }

    $leads                = $contact[ 'body' ][ '_embedded' ][ 'leads' ];
    $mortgage_pipeline_id = config( 'app.amoCRM.mortgage_pipeline_id' );
    $haveMortgage         = false;
    $mortgageLeadId       = false;

    for ( $leadIndex = 0; $leadIndex < count( $leads ); $leadIndex++ )
    {
      $lead = $amo->findLeadById( $leads[ $leadIndex ][ 'id' ] );

      $currentPipelineid = $lead[ 'body' ][ 'pipeline_id' ];

      if (
        ( int ) $mortgage_pipeline_id === ( int ) $currentPipelineid
          &&
        ( int ) $lead[ 'body' ][ 'status_id' ] !== 142
          &&
        ( int ) $lead[ 'body' ][ 'status_id' ] !== 143
      )
      {
        $haveMortgage   = true;
        $mortgageLeadId = $lead[ 'body' ][ 'id' ];
      }
    }

    if ( $haveMortgage )
    {
      // TODO eine Aufgabe für gefundenen Lead stellen

      Log::info(
        __METHOD__,

        [ 'Active Hypothek ist gefunden. Eine Aufgabe muss gestellt werden' ]
      );

      echo "mortgage id: $mortgageLeadId<br>";

      $amo->createTask(
        $mortgageLeadId,
        time() + 10800,
        '
          Менеджер повторно отправил запрос на ипотеку.
        '
      );

      return response( [ 'OK. Active Hypothek ist gefunden. Eine Aufgabe muss gestellt werden' ], 200 );
    }
    else
    {
      // TODO Lead erstellen und zwar das Hauptlead kopieren

      Log::info(
        __METHOD__,

        [ 'Active Hypothek ist nicht gefunden. Ein neues Lead muss erstellt werden' ]
      );

      $newLead = $amo->copyLead( $hauptLeadId );

      echo 'newLead<br>';
      echo '<pre>';
      print_r( $newLead );
      echo '</pre>';

      if ( $newLead )
      {
        $amo->createTask(
          $mortgageLeadId,
          time() + 10800,
          '
            Менеджер отправил запрос на ипотеку.
          '
        );
      }

      return response( [ 'OK. Active Hypothek ist nicht gefunden. Ein neues Lead muss erstellt werden' ], 200 );
    }
  }
}