<?php

namespace App\Http\Controllers;

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

    /*echo '<pre>';
    print_r( $hauptLead );
    echo '</pre>';*/

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

    echo $mainContactId . '<br>';

    /*echo '<pre>';
    print_r( $hauptLead[ 'body' ][ '_embedded' ][ 'contacts' ] );
    echo '</pre>';*/

    $contact = $amo->findContactById( $mainContactId );

    /*echo '<pre>';
    print_r( $contact );
    echo '</pre>';*/

    if ( $contact[ 'code' ] === 404 || $contact[ 'code' ] === 400 )
    {
      return response( [ 'Bei der Suche nach einem Kontakt ist ein Fehler in der Serveranfrage aufgetreten' ], $contact[ 'code' ] );
    }
    else if ( $contact[ 'code' ] === 204 )
    {
      return response( [ 'Contact ist nicht gefunden' ], $contact[ 'code' ] );
    }

    /*echo 'Leads <br>';
    echo '<pre>';
    print_r( $contact[ 'body' ][ '_embedded' ][ 'leads' ] );
    echo '</pre>';*/

    $leads                = $contact[ 'body' ][ '_embedded' ][ 'leads' ];
    $mortgage_pipeline_id = config( 'app.amoCRM.mortgage_pipeline_id' );
    $haveMortgage         = false;

    for ( $leadIndex = 0; $leadIndex < count( $leads ); $leadIndex++ )
    {
      $lead = $amo->findLeadById( $leads[ $leadIndex ][ 'id' ] );

      echo 'Lead <br>';
      echo '<pre>';
      print_r( $lead[ 'body' ][ 'pipeline_id' ] );
      echo '</pre>';

      $currentPipelineid = $lead[ 'body' ][ 'pipeline_id' ];

      if ( $mortgage_pipeline_id == $currentPipelineid )
      {
        echo 'target pipeline ist gefunden: ' . $currentPipelineid . '<br>';
        $haveMortgage = true;
      }
    }

    if ( $haveMortgage )
    {
      // TODO eine Aufgabe für gefundenen Lead stellen
      echo 'Hypothek ist gefunden<br>';
    }
    else
    {
      // TODO Lead erstellen und zwar das Hauptlead kopieren
      echo 'Hypothek ist nicht gefunden. Eine Aufgabe muss gestellt werden<br>';
    }

    return response( [ 'OK' ], 200 );
  }
}