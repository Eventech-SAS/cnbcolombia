<?php
if ($cortesia) {
    $total   = 0;
    $moneda  = "COP";
} elseif ($tipo == 'Particular') {
    $total   = 750000;
    $moneda  = "COP";
} elseif ($tipo == 'Estudiante') {
    $total   = 350000;
    $moneda  = "COP";
} elseif ($tipo == 'Extranjero') {
    $total   = 350;
    $moneda  = "USD";
} elseif ($tipo == 'Afiliado Colabiocli') {
    $total   = 0;
    $moneda  = "COP";
} elseif ($tipo == 'Colegiado activo') {
    $total   = 0;
    $moneda  = "COP";
} else {
    $total   = 0;
    $moneda  = "COP";
}
?>