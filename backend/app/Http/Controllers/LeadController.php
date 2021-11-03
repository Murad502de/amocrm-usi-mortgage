<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\amoAPI\amoCRM;
use App\Models\Lead;

class LeadController extends Controller
{
  public function __construct () {}

  public function get ( $id, Request $request )
  {
    echo 'qwertzuiopü ' . $id;

    $lead = new Lead();
    //$crtlead = $lead->get( $id_target_lead );

    //return $crtlead;
  }
}