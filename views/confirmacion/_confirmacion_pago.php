<?php   
    //Configuración de módulo
    
	require(__DIR__."/../../inc/funciones.php"); //Librería de funciones
    require(__DIR__."/../../inc/correos.php"); //Librería de funciones

    $toolSQL = new toolSQL();
    $tools   = new tools();
    $correos   = new correos();

    $tabla = "evento{$id_evento}";
    
    $creado = date("Y-m-d H:i:s");

            // PayU llama a esta URL por POST sin action, por eso el OR
        $referenceCode = $_POST['reference_sale'] ?? '';
        $estadoPayU    = $_POST['state_pol']      ?? ''; // 4=Aprobado, 6=Rechazado, 104=Error
        $valorPayU     = $_POST['value']          ?? 0;
        $moneda        = $_POST['currency']       ?? '';
        $firmaPayU     = $_POST['sign']           ?? '';

        // Verificar firma que manda PayU
        $apiKey     = "4Vj8eK4rloUd272L48hsrarnUA";
        $merchantId = "508029";
        $new_value  = number_format(round(floatval($valorPayU), 2), 2, '.', '');
        $firmaLocal = md5("$apiKey~$merchantId~$referenceCode~$new_value~$moneda~$estadoPayU");
         echo "$apiKey~$merchantId~$referenceCode~$new_value~$moneda" ;


        echo "Firma local: $firmaLocal<br>";
        echo "Firma PayU: $firmaPayU<br>";
        

        $logFile = __DIR__ . "/sonda_payu.txt";
        $logData = "==========================================" . PHP_EOL;
        $logData .= "FECHA/HORA    : " . date("Y-m-d H:i:s") . PHP_EOL;
        $logData .= "IP ORIGEN     : " . ($_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN') . PHP_EOL;
        $logData .= "REFERENCIA    : " . $referenceCode . PHP_EOL;
        $logData .= "ESTADO POL    : " . $estadoPayU . PHP_EOL;
        $logData .= "VALOR RECIBIDO: " . $valorPayU . PHP_EOL;
        $logData .= "VALOR FIRMA   : " . $new_value . PHP_EOL;
        $logData .= "FIRMA PAYU    : " . $firmaPayU . PHP_EOL;
        $logData .= "FIRMA LOCAL   : " . $firmaLocal . PHP_EOL;
        $logData .= "ESTADO FIRMA  : " . ($esValida ? "VÁLIDA" : "INVÁLIDA") . PHP_EOL;
        $logData .= "PAYLOAD POST  : " . json_encode($_POST, JSON_UNESCAPED_UNICODE) . PHP_EOL;
        $logData .= "==========================================" . PHP_EOL . PHP_EOL;

        // Escribir en el archivo de sonda (FILE_APPEND evita sobrescribir)
        file_put_contents($logFile, $logData, FILE_APPEND | LOCK_EX);
        
        if ($firmaLocal !== $firmaPayU) {
            http_response_code(400);
            echo "Firma inválida";
            exit();
        }

        // El referenceCode viene como "12345678-1748291234", extraemos el documento
        $documento = explode("-", $referenceCode)[0];

        if ($estadoPayU == 4) { // Solo actualizamos si el pago fue aprobado
            $prepare = "UPDATE $tabla SET pago = 'Sí' WHERE documento = ?";
            $params  = [$documento . ""];
            $types   = ['s'];
            $toolSQL->updateSQL($prepare, $types, $params);
        }

        http_response_code(200);
        echo "OK";
        exit();
?>


