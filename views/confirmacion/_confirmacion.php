<?php   
    //Configuración de módulo
    
	require(__DIR__."/../../inc/funciones.php"); //Librería de funciones
    require(__DIR__."/../../inc/correos.php"); //Librería de funciones

    $toolSQL = new toolSQL();
    $tools   = new tools();
    $correos   = new correos();

    $tabla = "evento{$id_evento}";
    
    $creado = date("Y-m-d H:i:s");

    
    
    if($_POST['action'] == 'getDatos')
    {   
        $prepare = "SELECT * FROM $tabla WHERE codigo = ?";
        $params = [$_POST['codigo']];
        $types =  ['s'];
        $datos = $toolSQL->selectSQL($prepare, $types, $params);
        if(is_array($datos) && isset($datos['error']))
        {   //Respuesta si hay error en la consulta
            http_response_code($datos['error']);
            echo json_encode(["message" => $datos['message'], "details" => "D1-1"]);
            exit();
        }
        $merchantId = "764001";
        $accountId  = "770591"; // Colombia
        $apiKey     = "bPL9o1U5ZgQby6GZ5dx7vPqDUT";
        $urlPago    = "https://checkout.payulatam.com/ppp-web-gateway-payu/";
        $test       = 0;

        // Producción (comentar sandbox y descomentar esto cuando estés listo)
        // $merchantId = "TU_MERCHANT_ID";
        // $accountId  = "TU_ACCOUNT_ID";
        // $apiKey     = "TU_API_KEY";
        // $urlPago    = "https://checkout.payulatam.com/ppp-web-gateway-payu/";
        // $test       = 0;

        $referenceCode = $datos[0]['documento'] . "-" . time();
        $amount = number_format(doubleval($datos[0]['pago_valor']), 2, '.', '');
        $currency      = $moneda = ($datos[0]['tipo'] == 'Extranjero') ? "USD" : "COP";

        // Cálculo de IVA (19% sobre base sin IVA)
        // Si el congreso ya incluye IVA en el valor, separamos:
        // base = round(amount / 1.19, 2)  →  tax = amount - base
        // Si NO incluye IVA y se cobra aparte, ajusta según tu caso
    
        // Firma: MD5(apiKey~merchantId~referenceCode~amount~currency)
        
        $firma = md5("$apiKey~$merchantId~$referenceCode~$amount~$currency");
        
        {
            http_response_code(200);
            echo json_encode(["datos" => $datos, "firma" => $firma, "merchantId" => $merchantId, "accountId" => $accountId, "referenceCode" => $referenceCode, "amount" => $amount, "currency" => $currency,  "urlPago" => $urlPago, "test" => $test]);
        
        }
    }
    else
    if($_POST['action'] == 'calcularTotal')
    {   
        $tipo = $_POST['tipo'];
        //$curso1 = $_POST['curso1'];
        //$curso2 = $_POST['curso2'];
        //$curso3 = $_POST['curso3'];
        $cortesia = $_POST['cortesia'];

        include __DIR__."/_valor.php";

        http_response_code(200);
        echo json_encode(["total" => $total]);
    }
    else
    if($_POST['action'] == 'getCiudades')
    {   
        $prepare = "SELECT ciu_ciudad FROM _paises pai INNER JOIN _ciudades ciu ON pai.pai_id = ciu.pai_id WHERE pai_pais = ? ORDER BY ciu_ciudad ASC";
        $params = [$_POST['pais']];
        $types =  ['s'];
        $ciuS = $toolSQL->selectSQL($prepare, $types, $params);
        if(is_array($ciuS) && isset($ciuS['error']))
        {   //Respuesta si hay error en la consulta
            http_response_code($ciuS['error']);
            echo json_encode(["message" => $ciuS['message'], "details" => "D1-1"]);
            exit();
        }
        else
        {
            echo json_encode(["ciudades" => $ciuS]);
        }
    }
    else
    if($_POST['action'] == 'crear' || $_POST['action'] == 'editar')
    {  
        //Validamos si hay cortesia
        if($_POST['cortesia'] != "")
        {
            $prepare = "SELECT empresa, estado FROM {$tabla}_cortesias WHERE codigo = ?";
            $params = [$_POST['cortesia']];
            $types =  ['s'];
            $cortesia = $toolSQL->selectSQL($prepare, $types, $params, "Usuario");
            if(is_array($cortesia) && isset($cortesia['error']))
            {   //Respuesta si hay error en la consulta
                http_response_code($cortesia['error']);
                echo json_encode(["message" => $cortesia['message'], "details" => "D1-3", "token" => ""]);
                exit();
            }
            else
            if($cortesia[0]['estado'] == 1)
            {
                http_response_code(400);
                echo json_encode(["message" => "La cortesía ingresada ya ha sido utilizada", "details" => "D1-4", "token" => ""]);
                exit();
            }
            $prepare = "UPDATE {$tabla}_cortesias SET estado = ? WHERE codigo = ?";
            $params = [1, $_POST['cortesia']];
            $types =  ['i', 's'];
            $cortesia = $toolSQL->updateSQL($prepare, $types, $params, "Usuario");
            if(is_array($cortesia) && isset($cortesia['error']))
            {   //Respuesta si hay error en la consulta
                http_response_code($cortesia['error']);
                echo json_encode(["message" => $cortesia['message'], "details" => "D1-5", "token" => ""]);
                exit();
            }
            $_POST['cortesia_empresa'] = $cortesia[0]['empresa'];
            $_POST['pago_valor'] = 0;
            $cortesia = true;
        }
        else
        {
            $_POST['cortesia'] = "";
            $_POST['cortesia_empresa'] = "";
            $cortesia = false;
        }

        $tipo = $_POST['tipo'];
        //$curso1 = $_POST['curso1'];
        //$curso2 = $_POST['curso2'];
        //$curso3 = $_POST['curso3'];
        
        include(__DIR__."/_valor.php");
        $_POST['pago_valor'] = $total;

        //Subimos comprobante y comprobante de pago
        $datS = $tools->gestionarArchivoSinPrefijo('comprobante', $_POST, $_FILES, __DIR__."/../../documentos/", $_POST['action'], ['pdf', 'jpg', 'jpeg', 'png']);
        if(is_array($datS) && isset($datS['error']))
        {   
            http_response_code($datS['error']);
            echo json_encode(["message" => $datS['message'], "details" => "D2-2", "token" => $jwt]);
            exit();
        }
        else
            $_POST["comprobante"] = $datS;  

      

        $datS = $tools->gestionarArchivoSinPrefijo('pago_comprobante', $_POST, $_FILES, __DIR__."/../../documentos/", $_POST['action'], ['pdf', 'jpg', 'jpeg', 'png']);
        if(is_array($datS) && isset($datS['error']))
        {   
            http_response_code($datS['error']);
            echo json_encode(["message" => $datS['message'], "details" => "D2-2", "token" => $jwt]);
            exit();
        }
        else
            $_POST["pago_comprobante"] = $datS;  

        //Validamos si es persona natural o jurídica para facturación
        if($_POST['facturar_a'] == "Persona natural")
        {
            if(isset($_POST['persona_datos']) && $_POST['persona_datos'] == "datos_informacion")
            {
                $_POST['tipo_documento_facturacion'] = $_POST['tipo_documento'];
                $_POST['documento_facturacion'] = $_POST['documento'];
                $_POST['nombre_facturacion'] = $_POST['nombres']." ".$_POST['apellidos'];
                $_POST['telefono_facturacion'] = $_POST['celular'];
                $_POST['email_facturacion'] = $_POST['email'];
                $_POST['pais_facturacion'] = $_POST['pais'];
                $_POST['ciudad_facturacion'] = $_POST['ciudad'];
                $_POST['direccion_facturacion'] = $_POST['direccion'];
                $_POST['documento_categoria_facturacion'] = $_POST['documento_categoria'];
                $_POST['documento_expedicion_facturacion'] = $_POST['documento_expedicion'];
                $_POST['documento_expiracion_facturacion'] = $_POST['documento_expiracion'];
            }
        }
        else
        {
            $_POST['tipo_documento_facturacion'] = "NIT";
        }

        $camposQuery = [];
        $variablesQuery = [];
        $tiposQuery = [];
        $valoresQuery = [];

        for($i=0; $i<count($campos) - 1; $i++)
		{   //Si estamos editando, no modificamos campos creados, id o código
            //Agregamos campos a los arrays de consulta
            array_push($camposQuery, $campos[$i]);
            array_push($tiposQuery, $tipos[$i]);
            if($_POST['action'] == 'crear')
                    array_push($variablesQuery, '?');
            //Según el tipo de dato, ajustamos el valor a insertar            
            if($tipos[$i] == 'i')
                array_push($valoresQuery, intval($_POST[$campos[$i]]));
            else
            if($tipos[$i] == 'd')
                array_push($valoresQuery, doubleval($_POST[$campos[$i]]));
            else
                array_push($valoresQuery, $_POST[$campos[$i]]."");
		}
         
        $campos = implode(",", $camposQuery);
        $variables = implode(",", $variablesQuery);
         
        $prepare = "INSERT INTO $tabla ($campos) VALUES ($variables)";
        $queryR = $toolSQL->insertSQL($prepare, $tiposQuery, $valoresQuery, "Usuario");
        if(is_array($queryR) && isset($queryR['error']))
        {   //Respuesta si hay error en la consulta
            if($queryR['error'] == 1062) //Registro duplicado
            {
                //Cambiamos el código de error a 409 para indicar conflicto de duplicidad
                http_response_code(409);
                $camposDuplicados = [];
                foreach($queryR['campo'] as $cmp => $valor)
                {
                    if($valor != "")
                        array_push($camposDuplicados, $valor);
                }
                $complemento = implode(", ", $camposDuplicados);
            }
            else
            {//Otro error
                http_response_code($queryR['error']);
                $complemento = "";
            }    
           
            echo json_encode(["message" => $queryR['message']." ".$complemento, "details" => "D3-1", "token" => $jwt]);
            exit();
        }
        else
        {  
            /* --- Generar código y QR --- */
            include(__DIR__.'/../../inc/qrcode/qrlib.php');
            $archivoQR = $_POST['documento'];
            QRcode::png($archivoQR, __DIR__.'/../../qr_generados/'.$archivoQR.'.png', QR_ECLEVEL_L, 6);
            
            //Respuesta si la consulta es exitosa
            if($_POST['pago_valor'] == 0)
                if($_POST['modalidad'] == "Virtual")
                    $correos->mailVirtual($_POST['nombres']." ".$_POST['apellidos'], $_POST['email'], $_POST['documento'], $_POST['codigo']);
                else
                    $correos->mailPresencial($_POST['nombres']." ".$_POST['apellidos'], $_POST['email'], $_POST['documento'], $_POST['codigo']);


            http_response_code(200);
            echo json_encode(["codigo" => $_POST['codigo']]);
        }

    }

    else
    if($_POST['action'] == 'validarCortesia')
    {   
        $prepare = "SELECT estado FROM {$tabla}_cortesias WHERE codigo = ?";
        $params = [$_POST['cortesia']];
        $types =  ['s'];
        $cortesia = $toolSQL->selectSQL($prepare, $types, $params, "Usuario");
        if(is_array($cortesia) && isset($cortesia['error']))
        {   //Respuesta si hay error en la consulta
            http_response_code($cortesia['error']);
            echo json_encode(["message" => $cortesia['message'], "details" => "D1-3"]);
            exit();
        }
        else
        {
            http_response_code(200);
            echo json_encode(["datos" => $cortesia]);
        }
    }
    else
    {   //Respuesta si intentan acceder a un action que no existe
        http_response_code(404);
        echo json_encode(["message" => "La acción no está implementada", "details" => "D99"]);
        exit();
    }
?>


