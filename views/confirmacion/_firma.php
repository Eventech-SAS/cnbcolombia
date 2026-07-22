<?php   
$merchantId = "508029";
        $accountId  = "512321"; // Colombia
        $apiKey     = "4Vj8eK4rloUd272L48hsrarnUA";
        $urlPago    = "https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/";
        $test       = 1;

        // Producción (comentar sandbox y descomentar esto cuando estés listo)
        // $merchantId = "TU_MERCHANT_ID";
        // $accountId  = "TU_ACCOUNT_ID";
        // $apiKey     = "TU_API_KEY";
        // $urlPago    = "https://checkout.payulatam.com/ppp-web-gateway-payu/";
        // $test       = 0;

        $referenceCode = "94538165-1784665939";
        $amount        = "350.00";
        $currency      = "COP";

        // Cálculo de IVA (19% sobre base sin IVA)
        // Si el congreso ya incluye IVA en el valor, separamos:
        // base = round(amount / 1.19, 2)  →  tax = amount - base
        // Si NO incluye IVA y se cobra aparte, ajusta según tu caso
    
        // Firma: MD5(apiKey~merchantId~referenceCode~amount~currency)
        $firma = md5("$apiKey~$merchantId~$referenceCode~$amount~$currency");

        echo "$apiKey~$merchantId~$referenceCode~$amount~$currency";
        echo "Firma generada: $firma<br>";
?>