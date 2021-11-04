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
    $account = new Account();
    $authData = $account->getAuthData();
    $amo = new amoCRM( $authData );

    $inputData = $request->all();
    $hauptLeadId = $inputData[ 'hauptLeadId' ] ?? false;

    $lead = $amo->findLeadById( $hauptLeadId );

    /*echo '<pre>';
    print_r( $lead );
    echo '</pre>';*/

    if ( $lead[ 'code' ] === 404 || $lead[ 'code' ] === 400 )
    {
      return 'Es wurde ein Fehler bei der Serveranfrage aufgetreten';
    }
    else if ( $lead[ 'code' ] === 204 )
    {
      return 'Lead ist nicht gefunden';
    }

    $mainContactId = null;
    $contacts = $lead[ 'body' ][ '_embedded' ][ 'contacts' ];

    for ( $contactIndex = 0; $contactIndex < count( $contacts ); $contactIndex++ )
    {
      if ( $contacts[ $contactIndex ][ 'is_main' ] )
      {
        $mainContactId = ( int )$contacts[ $contactIndex ][ 'id' ];
        break;
      }
    }

    echo $mainContactId . '<br>';

    /*echo '<pre>';
    print_r( $lead[ 'body' ][ '_embedded' ][ 'contacts' ] );
    echo '</pre>';*/

    $contact = $lead = $amo->findContactById( $mainContactId );

    /*echo '<pre>';
    print_r( $contact );
    echo '</pre>';*/

    if ( $contact[ 'code' ] === 404 || $contact[ 'code' ] === 400 )
    {
      return 'Es wurde ein Fehler bei der Serveranfrage aufgetreten';
    }
    else if ( $contact[ 'code' ] === 204 )
    {
      return 'Contact ist nicht gefunden';
    }

    /*echo 'Leads <br>';
    echo '<pre>';
    print_r( $contact[ 'body' ][ '_embedded' ][ 'leads' ] );
    echo '</pre>';*/

    $leads                = $contact[ 'body' ][ '_embedded' ][ 'leads' ];
    $mortgage_pipeline_id = config( 'app.amoCRM.mortgage_pipeline_id' );
    $haveMortgage = false;

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
      }
    }

    return $haveMortgage ? 'Hypothek ist gefunden' : 'Hypothek ist nicht gefunden';
  }
}