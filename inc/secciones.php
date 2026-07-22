<?php
	//Variable para realizar búsquedas
	$seccionesG = array(
		'inscripcion'=>array('padre'=>'',				'buscar'=> false,	'titulo'=>true,	'nombre'=>"Inscripción", 		'icono'=>"dashboard"),
		'codigo'=>array('padre'=>'',				'buscar'=> false,	'titulo'=>true,	'nombre'=>"Inscripción", 		'icono'=>"dashboard"),
		'usuarios'=>array('padre'=>'Administrativo','buscar'=> true,	'titulo'=>true,	'nombre'=>"Usuarios", 		'icono'=>"settings"),
		'roles'=>array('padre'=>'Administrativo',	'buscar'=> true,	'titulo'=>true,	'nombre'=>"Roles", 			'icono'=>"settings"),
		'inscripciones'=>array('padre'=>'',		'buscar'=> true,	'titulo'=>true,	'nombre'=>"Inscripciones",	'icono'=>"person"),

		'asistente'=>array('padre'=>'',		'buscar'=> false,	'titulo'=>true,	'nombre'=>"Asistente",	'icono'=>"person"),
		
		'pagos'=>array('padre'=>'',			'buscar'=> true,	'titulo'=>true,	'nombre'=>"Pagos",	'icono'=>"payment"),
		'reportes'=>array('padre'=>'',				'buscar'=> false,	'titulo'=>true,	'nombre'=>"Reportes",		'icono'=>"line_axis"),
	);
?>