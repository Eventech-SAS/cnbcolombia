<?php   
    
    
	require(__DIR__."/../../inc/funciones.php"); //Librería de funciones
    require(__DIR__."/../../inc/correos.php"); //Librería de funciones

    //Configuración de módulo
    $prefijo = "cmp";
    $tabla = "evento{$id_evento}";

    $toolSQL = new toolSQL();
    $tools   = new tools();
    $correos   = new correos();

    
    
    $creado = date("Y-m-d H:i:s");

    //Variables predefinidas
    $_POST["codigo"] = $tools->getCode(20);
    $_POST["modificado"] = $creado;
    $_POST["creado"] = $creado; 

    
    if($_POST['action'] == 'validar')
    {   
        $prepare = "SELECT codigo FROM $tabla WHERE documento = ?";
        $params = [$_POST['documento']];
        $types =  ['s'];
        $parS = $toolSQL->selectSQL($prepare, $types, $params);
        if(is_array($parS) && isset($parS['error']))
        {   //Respuesta si hay error en la consulta
            http_response_code($parS['error']);
            echo json_encode(["message" => $parS['message'], "details" => "D1-1"]);
            exit();
        }
        else
        {
            http_response_code(200);
            echo json_encode(["datos" => $parS]);
        
        }
    }
    else
    {   //Respuesta si intentan acceder a un action que no existe
        http_response_code(404);
        echo json_encode(["message" => "La acción no está implementada", "details" => "D99"]);
        exit();
    }


?>