
<?php

$fecha = strtotime(date("Y-m-d", time()));
error_log("_valor.php | tipo: [" . $tipo . "] | cortesia: [" . var_export($cortesia, true) . "] | fecha: " . date("Y-m-d", $fecha));

$datosPreventas = [
    ['inicio' => strtotime("2026-03-04"), 'fin' => strtotime("2026-05-30"), 'preventa' => 1, 'Particular' => 750000, 'Estudiante' => 350000, 'Extranjero' => 350],
    ['inicio' => strtotime("2026-06-01"), 'fin' => strtotime("2026-08-31"), 'preventa' => 2, 'Particular' => 850000, 'Estudiante' => 400000, 'Extranjero' => 400],
    ['inicio' => strtotime("2026-09-01"), 'fin' => strtotime("2026-10-31"), 'preventa' => 3, 'Particular' => 950000, 'Estudiante' => 450000, 'Extranjero' => 450],
];

$preventa = null;
$total    = 0;
$moneda   = "COP";

if ($cortesia === true) {
    $total  = 0;
    $moneda = "COP";
} elseif ($tipo == 'Afiliado Colabiocli' || $tipo == 'Colegiado activo') {
    $total  = 0;
    $moneda = "COP";
} else {
    foreach ($datosPreventas as $p) {
        if ($fecha >= $p['inicio'] && $fecha <= $p['fin']) {
            $preventa = $p['preventa'];
            if ($tipo == 'Particular') {
                $total  = $p['Particular'];
                $moneda = "COP";
            } elseif ($tipo == 'Estudiante') {
                $total  = $p['Estudiante'];
                $moneda = "COP";
            } elseif ($tipo == 'Extranjero') {
                $total  = $p['Extranjero'];
                $moneda = "USD";
            } else {
                $total  = 0;
                $moneda = "COP";
            }
            break;
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