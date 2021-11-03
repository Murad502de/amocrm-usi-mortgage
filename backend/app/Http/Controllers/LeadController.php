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
    // https://integrat3.amocrm.ru/api/v4/leads/11407311?with=contacts

    $account = new Account();
    $authData = $account->getAuthData();
    $amo = new amoCRM( $authData );

    $inputData = $request->all();
    $hauptLeadId = $inputData[ 'hauptLeadId' ] ?? false;

    return $amo->findLeadById( $hauptLeadId );
  }
}