<?php
	session_start();
    include(__DIR__ . '../../inc/vars.php');
    include(__DIR__ . '../../inc/secciones.php');
    include(__DIR__ . '../../inc/funciones.php');
?>

<!DOCTYPE html>
<html lang="es">
	<head>
		<title><?php echo $seccionesG[$moduloG]['nombre'] ?> - <?php echo SITENAME ?></title>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, minimal-ui">
		<link href="/css/materialize.min.css" rel="stylesheet" type="text/css"/>
		<link href="/css/dropify.min.css?<?php echo VERSION ?>" rel="stylesheet" type="text/css"/>
        <link href="/css/selectize.css" rel="stylesheet" type="text/css"/>
		<link href="/css/intlTelInput.css" rel="stylesheet" type="text/css"/>
		<link href="/css/_vars.css" rel="stylesheet" type="text/css"/>        
		<link href="/css/_componentes.css" rel="stylesheet" type="text/css"/>        
		<link href="/css/_general.css?<?php echo VERSION ?>" rel="stylesheet" type="text/css"/>
		<link href="/css/_front.css?<?php echo VERSION ?>" rel="stylesheet" type="text/css"/>
		<link href="/css/_helpers.css?<?php echo VERSION ?>" rel="stylesheet" type="text/css"/>
		<link href="css/quill.snow.css" rel="stylesheet" type="text/css"/>
		<link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
        <link rel="icon" type="image/png" href="img/favicon.png">
		
        <link href="/views/<?php echo $moduloG ?>/<?php echo $moduloG ?>.css?<?php echo VERSION ?>" rel="stylesheet" type="text/css"/>
	</head>
<body class="dark">
	<div class="loader panel-contenido-full" id="loader" style="display: none;">
		<div>
			<img src="/img/logo-blanco.png?0.0.1" alt=""><br>
			<div class="center-align loader-text">Procesando...</div>
			<div class="progress">
				<div class="indeterminate"></div>
			</div>
		</div>
	</div>
	<div class="loader panel-contenido-full" id="progreso" style="display: none;">
		<div>
			<img src="/img/logo-blanco.png?0.0.1" alt=""><br>
			<div class="center-align loader-text">Subiendo</div>
			<div class="progreso">
				<div class="progreso-bar" id="progreso-bar">
				
				</div>
			</div>
		</div>
	</div>
	<div class="row mb-10">
			<div class="col s12 m12 p-0 hide-on-small-only center-align">
				<a href="/">
					<img src="/img/banner.jpg?<?php echo VERSION ?>" class="responsive-img" alt="" style="max-height: 250px; margin: 0 auto; display: block;">
				</a>
			</div>
			<div class="col s12 m12 p-0 hide-on-med-and-up">
				<a href="/">
					<img src="/img/banner-mobile.jpg?<?php echo VERSION ?>" class="responsive-img" alt="">
				</a>
				
			</div>
		</div>


