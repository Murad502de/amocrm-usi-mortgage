<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class changeStage extends Model
{
	use HasFactory;

	protected $table = 'change_stage';
	protected $fillable = [
		'lead',
	];
}
