
<?php

    $fecha = strtotime(date("Y-m-d", time()));
    error_log("_valor.php | tipo: [" . $tipo . "] | cortesia: [" . var_export($cortesia, true) . "] | fecha: " . date("Y-m-d", $fecha));

    $datosPreventas = [
        ['inicio' => strtotime("2026-07-22"), 'fin' => strtotime("2026-09-03"), 'preventa' => 1, 'Particular' => 710000, 'Estudiante' => 350000, 'Extranjero' => 300, 'Estudiante extranjero' => 150],
        ['inicio' => strtotime("2026-09-03"), 'fin' => strtotime("2026-12-31"), 'preventa' => 2, 'Particular' => 930000, 'Estudiante' => 450000, 'Extranjero' => 400, 'Estudiante extranjero' => 250],
        ['inicio' => strtotime("2026-09-01"), 'fin' => strtotime("2026-10-31"), 'preventa' => 3, 'Particular' => 950000, 'Estudiante' => 450000, 'Extranjero' => 450],
    ];

    $preventa = null;
    $total    = 0;
    $moneda   = "COP";

    if ($cortesia === true)
    {
        $total  = 0;
        $moneda = "COP";
    } 
    elseif($tipo == 'Afiliado Colabiocli' || $tipo == 'Colegiado activo' || $tipo == 'Funcionario')
    {
        $total  = 450000;
        $moneda = "COP";
        $iva = 0;
    }
    else
    {
        foreach ($datosPreventas as $p)
        {
            if ($fecha >= $p['inicio'] && $fecha <= $p['fin'])
            {
                $preventa = $p['preventa'];
                if ($tipo == 'Particular')
                {
                    $total  = $p['Particular'];
                    $moneda = "COP";
                    $iva = 19;
                }
                elseif ($tipo == 'Estudiante')
                {
                    $total  = $p['Estudiante'];
                    $moneda = "COP";
                    $iva = 0;
                }
                elseif ($tipo == 'Extranjero')
                {
                    $total  = $p['Extranjero'];
                    $moneda = "USD";
                    $iva = 0;
                }
                elseif ($tipo == 'Estudiante extranjero')
                {
                    $total  = $p['Estudiante extranjero'];
                    $moneda = "USD";
                    $iva = 0;
                }
                else
                {
                    $total  = 0;
                    $moneda = "COP";
                    $iva = 0;
                }
                break;
            }
        }
    }

    $antesdeiva = $total;

    $total = $total + ($total * $iva / 100); 

   

    //Definido $total y $moneda
    if(isset($confirmacion))
    {
    
        if($datos[0]['pago_valor'] != $total)
        {
            //Viene desde _confirmacion.php
            $prepare = "UPDATE $tabla SET pago_valor = ? WHERE id = ?";
            $params  = [doubleval($total), intval($datos[0]['id'])];
            $types   = ['d', 'i'];
            $queryR = $toolSQL->updateSQL($prepare, $types, $params);
           
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
        }
        

    }


//if ($cortesia) {
   // $total   = 0;
    //$moneda  = "COP";
//} elseif ($tipo == 'Particular') {
   // $total   = 750000;
    //$moneda  = "COP";
//} elseif ($tipo == 'Estudiante') {
  //  $total   = 350000;
   // $moneda  = "COP";
//} elseif ($tipo == 'Extranjero') {
 //   $total   = 350;
  //  $moneda  = "USD";
//} elseif ($tipo == 'Afiliado Colabiocli') {
 //   $total   = 0;
  //  $moneda  = "COP";
//} elseif ($tipo == 'Colegiado activo') {
    //$total   = 0;
//    $moneda  = "COP";
//} else {
    //$total   = 0;
  //  $moneda  = "COP";
//}

?>