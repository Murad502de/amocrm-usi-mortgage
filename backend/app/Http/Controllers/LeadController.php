<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Services\amoAPI\amoCRM;
use App\Models\Account;
use App\Models\Lead;
use App\Models\changeStage;

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
      return response( [ 'hauptLead ist nicht gefunden' ], 404 );
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
      return response( [ 'Contact ist nicht gefunden' ], 404 );
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

      //echo "mortgage id: $mortgageLeadId<br>";

      $amo->createTask(
        $mortgageLeadId,
        time() + 10800,
        '
          Менеджер повторно отправил запрос на ипотеку.
        '
      );

      // Datenbankeintrag fürs Hauptlead
      Lead::create(
        [
          'id_target_lead'  => $hauptLeadId,
          'related_lead'    => $mortgageLeadId
        ]
      );

      // Datenbankeintrag für die Hypothek
      Lead::create(
        [
          'id_target_lead'  => $mortgageLeadId,
          'related_lead'    => $hauptLeadId
        ]
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

      /*echo 'newLead<br>';
      echo '<pre>';
      print_r( $newLead );
      echo '</pre>';*/

      if ( $newLead )
      {
        $amo->createTask(
          $newLead,
          time() + 10800,
          '
            Менеджер отправил запрос на ипотеку.
          '
        );

        // Datenbankeintrag fürs Hauptlead
        Lead::create(
          [
            'id_target_lead'  => $hauptLeadId,
            'related_lead'    => $newLead
          ]
        );

        // Datenbankeintrag für die Hypothek
        Lead::create(
          [
            'id_target_lead'  => $newLead,
            'related_lead'    => $hauptLeadId
          ]
        );
      }

      return response( [ 'OK. Active Hypothek ist nicht gefunden. Ein neues Lead muss erstellt werden' ], 200 );
    }
  }

  public function deleteLeadWithRelated ( Request $request )
  {
    $lead = new Lead();
    $inputData = $request->all();

    $leadId = $inputData[ 'leads' ][ 'delete' ][ 0 ][ 'id' ];

    Log::info(
      __METHOD__,

      [ $leadId ]
    );

    return $lead->deleteWithRelated( $leadId ) ? response( [ 'OK' ], 200 ) : response( [ 'ERROR' ], 400 );
  }

  public function changeStage ( Request $request )
  {
    $inputData = $request->all();

    Log::info( __METHOD__, $inputData );

    $dataLead = $inputData[ 'leads' ][ 'status' ][ 0 ];

    changeStage::create(
      [
        'lead_id' => ( int ) $dataLead[ 'id' ],
        'lead'    => json_encode( $dataLead )
      ]
    );

    return response( [ 'OK' ], 200 );
  }

  public function cronChangeStage ()
  {
    $account  = new Account();
    $authData = $account->getAuthData();
    $amo      = new amoCRM( $authData );

    $isDev                    = false;
    $leadsCount               = 10;
    $MORTGAGE_PIPELINE_ID     = $isDev ? 4799893 : 4691106;
    $loss_reason              = $isDev ? 1038771 : 588811;
    $loss_reason_close_by_man = $isDev ? 618727 : 1311714;
    $loss_reason_comment      = $isDev ? 1038773 : 588813;
    $resp_user                = $isDev ? 7001125 : 7507200;

    $leads          = changeStage::take( $leadsCount )->get();
    $objChangeStage = new changeStage();

    foreach ( $leads as $lead )
    {
      $leadData = json_decode( $lead->lead, true );
      $lead_id  = ( int ) $leadData[ 'id' ];

      $ausDB = Lead::where( 'id_target_lead', $lead_id )->count();

      if ( $ausDB )
      {
        echo '<pre>';
        print_r( $leadData );
        echo '</pre>';

        $pipeline_id  = ( int ) $leadData[ 'pipeline_id' ];
        $status_id    = ( int ) $leadData[ 'status_id' ];
        $stage_close  = 143;

        if ( $pipeline_id === $MORTGAGE_PIPELINE_ID )
        {
          Log::info( __METHOD__, [ $lead_id . ' Es ist Hypothek-Pipeline' ] );

          if ( $status_id === $stage_close )
          {
            Log::info( __METHOD__, [ $lead_id . ' Hypothek-Lead ist geschlossen' ] );
          }
        }
        else
        {
          Log::info( __METHOD__, [ $lead_id . ' Es ist nicht Hypothek-Pipeline' ] );

          if ( $status_id === $stage_close )
          {
            Log::info( __METHOD__, [ $lead_id . ' Pipeline-Lead ist geschlossen' ] );

            $crtLead = Lead::where( 'id_target_lead', $lead_id )->first();

            echo $crtLead->related_lead . ' Es muss auch geschlossen werden';

            $amo->updateLead(
              [
                [
                  "id"        => ( int ) $crtLead->related_lead,
                  "status_id" => $stage_close,
                ]
              ]
            );
          }
        }
      }

      $objChangeStage->deleteLead( $lead_id );
    }
  }
}