<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\amoAPI\amoCRM;
use App\Models\Lead;

class LeadController extends Controller
{
  public function __construct () {}

  public function get ( Request $request )
  {
    echo 'qwertzuiopü';

    $inputData = $request->all();
    $id_target_lead = $inputData[ 'id_target_lead' ];

    $lead = new Lead();
    //$crtlead = $lead->get( $id_target_lead );

    //return $crtlead;
  }
}