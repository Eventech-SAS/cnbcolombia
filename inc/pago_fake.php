<?php
     // Para que tu código funcione igual, convertimos el array a JSON y luego lo decodificamos
    $fakeInput = [
        "data" => [
            "transaction" => [
                "id" => "1262708-1781038225-33181",
                "reference" => "2J11w48wuyCdTYSxqOCh",
                "status" => "APPROVED",
                "amount_in_cents" => 142800000 // Esto equivale a 4,500.00
            ]
        ]
    ];
    $jsonSimulado = json_encode($fakeInput);
    $data = json_decode($jsonSimulado, true);

	require("funciones.php");
    require("correos.php");

	$toolSQL = new toolSQL();
	$tools   = new tools();
    $correos = new correos();

	$creado = date("Y-m-d H:i:s");

	//$data = json_decode(file_get_contents('php://input'), true);

	$id = $data['data']['transaction']['id'];
	$codigo = $data['data']['transaction']['reference'];

	$estado = $data['data']['transaction']['status'];
	$valor = doubleval($data['data']['transaction']['amount_in_cents']) / 100;

	$logFile = __DIR__ . '/../logs/wompi.log';
    $archivo = fopen($logFile,"a");
    fwrite($archivo, 'ID: '.$id.", ");
    fwrite($archivo, 'Código: '.$codigo.", ");
    fwrite($archivo, 'Valor: '.$valor.", ");
    fwrite($archivo, 'Estado: '.$estado.", ");
    fwrite($archivo, 'Fecha: '.$creado." ");
    
    
    if($estado == "APPROVED")
    {
        $url = $urlbase.$id;
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Authorization: Bearer ' . $token,
        ));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);
        $data = json_decode($response, true);
        if($data['data']['status'] == "APPROVED")
        {

        }
        else
        {
            fwrite($archivo, 'El pago no pudo se validado. Posible estafa');
            fwrite($archivo, "\r\n");
            fwrite($archivo, "\r\n");
            fclose($archivo);
            $prepare = "UPDATE evento{$id_evento}_pagos SET estado=?, transaccion=?, valor_pagado=? WHERE codigo = ?";
            $params = [
                "INCONSISTENCIA",
                $id,
                $valor,
                $codigo,
            ];
            $types = ['s','s','d','s'];
            $pagU = $toolSQL->updateSQL($prepare, $types, $params);
            exit();

        }
    }

    $prepare = "SELECT * FROM evento{$id_evento}_pagos WHERE codigo = ?";
    $params = [$codigo];
    $types = ['s'];
    $pagS = $toolSQL->selectSQL($prepare, $types, $params);
    if(is_array($pagS) && isset($pagS['error']))
    {   //Respuesta si hay error en la consulta
        fwrite($archivo, 'No se pudo obtener los datos del pago. Error: '.$pagS['message']);
        fwrite($archivo, "\r\n");
        fwrite($archivo, "\r\n");
        fclose($archivo);
        exit();
    }
    else
    if(count($pagS) == 0)
    {
        fwrite($archivo, 'No se encontró el pago en la base de datos.');
        fwrite($archivo, "\r\n");
        fwrite($archivo, "\r\n");
        fclose($archivo);
        exit();
    }
    
    if($pagS[0]['estado'] == "Aprobado")
    {
        fwrite($archivo, 'El pago ya se encuentra registrado como aprobado en la base de datos. No se realizarán cambios.');
        fwrite($archivo, "\r\n");
        fwrite($archivo, "\r\n");
        fclose($archivo);
        exit();
    }

    if($estado == "APPROVED")
        $estado = "Aprobado";
    elseif($estado == "PENDING")
        $estado = "Pendiente";
    else
        $estado = "Rechazado";


    $prepare = "UPDATE evento{$id_evento}_pagos SET estado=?, transaccion=?, valor_pagado=? WHERE codigo = ? AND estado != 'Aprobado'";
    $params = [
        $estado,
        $id,
        $valor,
        $codigo,
    ];
    $types = ['s','s','d','s'];
    $pagU = $toolSQL->updateSQL($prepare, $types, $params);
    if(is_array($pagU) && isset($pagU['error']))
    {   //Respuesta si hay error en la consulta
        fwrite($archivo, 'No se pudo actualizar el estado del pago en la base de datos. Error: '.$pagU['message']);
        fwrite($archivo, "\r\n");
        fwrite($archivo, "\r\n");
        fclose($archivo);
        exit();
    }


       

    if($pagU == 1)
    {
        if($estado == "Aprobado")
        {   
            $usuario = "";

            $prepare = "SELECT usr_codigo FROM evento{$id_evento}_usuarios WHERE usr_email = ?";
            $params = [$pagS[0]['email']];
            $types = ['s'];
            $usrS = $toolSQL->selectSQL($prepare, $types, $params);
            if(is_array($usrS) && isset($usrS['error']))
            {   //Respuesta si hay error en la consulta
                fwrite($archivo, 'No se pudo obtener los datos del usuario para validar si se crea o se actualiza. Error: '.$usrS['message']);
                fwrite($archivo, "\r\n");
                fwrite($archivo, "\r\n");
                fclose($archivo);
                exit();
            }
            
        
            if($usrS == 0)
            {
                $codigo = $tools->getCode(20);
                $password = $tools->getCode(10);

                $usuario = $codigo;

                $prepare = "INSERT INTO evento{$id_evento}_usuarios (usr_password_original, usr_codigo, usr_tipo_documento, usr_documento, usr_nombres, usr_apellidos, usr_email, usr_celular, usr_empresa, usr_nit, 
                usr_pais, usr_ciudad,  usr_orden_compra, usr_facturar_a, usr_tipo_documento_facturacion, usr_documento_facturacion, usr_nombres_facturacion, usr_email_facturacion, usr_celular_facturacion, 
                usr_pais_facturacion, usr_ciudad_facturacion, usr_password, usr_cupos, usr_modificado, usr_creado) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
            
                $params = [$password, $codigo, $pagS[0]['tipo_documento'], $pagS[0]['documento'], $pagS[0]['nombres'], $pagS[0]['apellidos'], $pagS[0]['email'], $pagS[0]['celular'], $pagS[0]['empresa'], 
                $pagS[0]['nit'], $pagS[0]['pais'], $pagS[0]['ciudad'], $pagS[0]['orden_compra'], $pagS[0]['facturar_a'], $pagS[0]['tipo_documento_facturacion'], 
                $pagS[0]['documento_facturacion'], $pagS[0]['nombres_facturacion'], $pagS[0]['email_facturacion'], $pagS[0]['celular_facturacion'], 
                $pagS[0]['pais_facturacion'], $pagS[0]['ciudad_facturacion'], password_hash($password, PASSWORD_BCRYPT), intval($pagS[0]['cantidad']), $creado, $creado];
                $types = ['s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','s','i','s','s'];
                $usrI = $toolSQL->insertSQL($prepare, $types, $params);
                if(is_array($usrI) && isset($usrI['error']))
                {   //Respuesta si hay error en la consulta
                    fwrite($archivo, 'No se pudo crear el usuario en la base de datos. Error: '.$usrI['message']);
                    fwrite($archivo, "\r\n");
                    fwrite($archivo, "\r\n");
                    fclose($archivo);
                    exit();
                }


                //Validamos si se compró solo una boleta para él. No le enviamos correo de cuenta
                if($pagS[0]['cantidad'] == 1 && $pagS[0]['comprar_a'] == "Mí")
                {

                }
                else
                {
                    if($correos->mailCuenta($pagS[0]['nombres']." ".$pagS[0]['apellidos'], $pagS[0]['email'], $password, $pagS[0]['cantidad']))
                    {
                        fwrite($archivo, 'Proceso OK. Se creó nuevo usuario');
                        fwrite($archivo, "\r\n");
                        fwrite($archivo, "\r\n");
                        fclose($archivo);
                        exit();
                        
                    }
                    else
                    {
                        fwrite($archivo, 'No se pudo enviar el correo de creación de cuenta.');
                        fwrite($archivo, "\r\n");
                        fwrite($archivo, "\r\n");
                        fclose($archivo);
                        exit();
                    }
                }
                
            }
            else
            {
                $usuario = $usrS[0]['usr_codigo'];

                $prepare = "UPDATE evento{$id_evento}_usuarios SET usr_cupos = usr_cupos + ? WHERE usr_email = ?";
                $params = [$pagS[0]['cantidad'], $pagS[0]['email']];
                $types = ['i','s'];
                $usrU = $toolSQL->updateSQL($prepare, $types, $params);
                if(is_array($usrU) && isset($usrU['error']))
                {   //Respuesta si hay error en la consulta 
                    fwrite($archivo, 'No se pudo actualizar el usuario para signarle más cupos: '.$pagS[0]['cantidad'].'. Error: '.$usrU['message']);
                    fwrite($archivo, "\r\n");
                    fwrite($archivo, "\r\n");
                    fclose($archivo);
                    exit();
                }

                if($correos->mailCupos($pagS[0]['nombres']." ".$pagS[0]['apellidos'], $pagS[0]['email'], $pagS[0]['cantidad']))
                {
                    fwrite($archivo, 'Proceso OK. Se agregaron ' . $pagS[0]['cantidad'] . ' cupos al usuario');
                    fwrite($archivo, "\r\n");
                    fwrite($archivo, "\r\n");
                    fclose($archivo);
                    exit();
                    
                }
                else
                {
                    fwrite($archivo, 'No se pudo enviar el correo de actualización de cupos.');
                    fwrite($archivo, "\r\n");
                    fwrite($archivo, "\r\n");
                    fclose($archivo);
                    exit();
                }

                
                
            }

            //Creamos los inscritos según la selección
            if($pagS[0]['cantidad'] == 1 && $pagS[0]['comprar_a'] == "Mí")
            {
                $password = $tools->getCode(10);

                $prepare = "INSERT INTO evento{$id_evento}
                (codigo, tipo_documento, documento, nombres, apellidos, celular, email, empresa, pais, ciudad, usuario, password, modificado, creado)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                $params = [
                    $tools->getCode(20),
                    $pagS[0]['tipo_documento'], 
                    $pagS[0]['documento'], 
                    $pagS[0]['nombres'], 
                    $pagS[0]['apellidos'], 
                    $pagS[0]['celular'], 
                    $pagS[0]['email'], 
                    $pagS[0]['empresa'], 
                    $pagS[0]['pais'], 
                    $pagS[0]['ciudad'], 
                    $usuario,
                    password_hash($password, PASSWORD_BCRYPT), 
                    $creado, 
                    $creado
                ];
                $types = ['s','s','s','s','s','s','s','s','s','s','s','s','s','s'];
                $usrI = $toolSQL->insertSQL($prepare, $types, $params);
                if(is_array($usrI) && isset($usrI['error']))
                {   //Respuesta si hay error en la consulta
                    fwrite($archivo, 'No se pudo crear el usuario en la base de datos. Error: '.$usrI['message']);
                    fwrite($archivo, "\r\n");
                    fwrite($archivo, "\r\n");
                    fclose($archivo);
                    exit();
                }

                if($correos->mailCuentaInscrito($pagS[0]['nombres']." ".$pagS[0]['apellidos'], $pagS[0]['email'], $password))
                {
                    fwrite($archivo, 'Proceso OK. Se creó nuevo usuario');
                    fwrite($archivo, "\r\n");
                    fwrite($archivo, "\r\n");
                    fclose($archivo);
                    exit();
                    
                }
                else
                {
                    fwrite($archivo, 'No se pudo enviar el correo de creación de cuenta.');
                    fwrite($archivo, "\r\n");
                    fwrite($archivo, "\r\n");
                    fclose($archivo);
                    exit();
            }



        }
    }

    
}




    
