<?php
	define("SERVER","localhost");
	define("DB","dbtksxeg0nozsx");
	define("USER","ubswmtxlzrepa");
	define("PASS",'51@}#hwx%dCw');

	define('SECRET_KEY', 'M}(l;,0L3XCCazqZDVsgKZ`H\9$XL^jsKaR<l4P`Q\z;4n!`£Y');
	define('URLSITE', 'https://cnbcolombia.eventos26.eventechvirtual.com');
	
	//Depuración
	define("DEBUG",false);
	define("CLIENTE",'cnbcolombia');
	define("EVENTO","24 CONGRESO INTERNACIONAL DEL COLEGIO NACIONAL DE BACTERIOLOGÍA 2026");
	
    define("VERSION","0.4.1");

	$cms_max_results = [
		"usuarios"=>20,
		"clientes"=>20,
	];

	//Correo Electrónico para recuperacíón
    date_default_timezone_set('America/Bogota');

    if(DEBUG)
		ini_set('display_errors', 1);
	else
		ini_set('display_errors', 0);

	define("SITENAME","24 CONGRESO INTERNACIONAL DEL COLEGIO NACIONAL DE BACTERIOLOGÍA 2026");


	define("HOST_EMAIL", "smtp.gmail.com");
	define("EMAIL_CONTACT", "notificaciones@congresoseventech.com");
	define("PASS_CONTACT", 'smcbiocxapgfjzbd');	

	$id_evento = 26021;

	
?>