<?php   
    //Configuración de módulo
    $prefijo = "cmp";
    $campos = ["codigo", "tipo_documento", "documento", "documento_categoria", "documento_expedicion", "documento_expiracion", "nombres", "apellidos", "celular", "email", 
    "profesion", "ocupacion", "pais", "ciudad", "direccion", "tipo", "comprobante", "cortesia", "cortesia_empresa", "modalidad", "facturar_a", "tipo_documento_facturacion",
     "documento_facturacion", "documento_categoria_facturacion", "documento_expedicion_facturacion", "documento_expiracion_facturacion", 
    "nombre_facturacion", "telefono_facturacion", "email_facturacion", "pais_facturacion", "ciudad_facturacion", "direccion_facturacion", "fecha_nacimiento_facturacion", 
    "pago_comprobante", "pago", "pago_valor", "modificado", "creado", "id"];
    $tipos = ['s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','d','s','s','i'];    
    
	require(__DIR__."/../../inc/funciones.php"); //Librería de funciones
    require(__DIR__."/../../inc/correos.php"); //Librería de funciones

    $toolSQL = new toolSQL();
    $tools   = new tools();
    $correos   = new correos();

    $tabla = "evento{$id_evento}";
    
    $creado = date("Y-m-d H:i:s");

    //Variables predefinidas
    $_POST["codigo"] = $tools->getCode(20);
    $_POST["modificado"] = $creado;
    $_POST["creado"] = $creado; 

    
    if($_POST['action'] == 'getPaises')
    {   
        $prepare = "SELECT pai_id, pai_pais FROM _paises WHERE ?";
        $params = [1];
        $types =  ['i'];
        $paisS = $toolSQL->selectSQL($prepare, $types, $params);
        if(is_array($paisS) && isset($paisS['error']))
        {   //Respuesta si hay error en la consulta
            http_response_code($paisS['error']);
            echo json_encode(["message" => $paisS['message'], "details" => "D1-1"]);
            exit();
        }
        else
        {
            http_response_code(200);
            echo json_encode(["paises" => $paisS]);
        
        }
    }
    else
    if($_POST['action'] == 'calcularTotal')
    {   
        $tipo = $_POST['tipo'];
        $cortesia = $_POST['cortesia'];

        include __DIR__."/_valor.php";

        http_response_code(200);
        echo json_encode(["total" => $total, "moneda" => $moneda]);
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
    if ($_POST['action'] == 'validarColegiado')
    {
        $prepare = "SELECT id FROM evento26021_activos WHERE documento = ?";
        $params  = [$_POST['documento'] . ""];
        $types   = ['s'];
        $result  = $toolSQL->selectSQL($prepare, $types, $params);

        if (is_array($result) && isset($result['error'])) {
            http_response_code($result['error']);
            echo json_encode(["message" => $result['message'], "details" => "D5-1"]);
            exit();
        }

        if ($result == 0 || count($result) == 0) {
            // No está en la tabla de colegiados activos
            http_response_code(403);
            echo json_encode(["message" => "Su documento no se encuentra registrado como Colegiado activo. Verifique su estado o seleccione otro tipo de inscripción.", "details" => "D5-2"]);
            exit();
        }

        http_response_code(200);
        echo json_encode(["valido" => true]);
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
        include(__DIR__."/_valor.php");
        $_POST['pago_valor'] = $total;

        if($_POST['pago_valor'] != 0)
            $_POST['pago'] = "No";
        else
            $_POST['pago'] = "Sí";

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