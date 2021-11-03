<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
	use HasFactory;

	protected $table;

	public function __construct ()
	{
		$this->table = 'leads';
	}

	public function get ( $id )
  {
    return $this->where( 'id_target_lead', $id )->first();
  }

  public function add () {}

  public function delete () {}

  public function aktualisieren () {}
}
