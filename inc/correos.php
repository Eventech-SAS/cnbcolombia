<?php 

    use PHPMailer\PHPMailer\PHPMailer;
	use PHPMailer\PHPMailer\SMTP;
	use PHPMailer\PHPMailer\Exception;

	require 'mail/Exception.php';
	require 'mail/PHPMailer.php';
	require 'mail/SMTP.php';

	
	class correos
	{
        function mailGeneral($nombre, $email, $documento, $codigo)
        {
           
			$mail = new PHPMailer(true);

			$mail->isSMTP();                                            // Send using SMTP
			$mail->Host = HOST_EMAIL;
			$mail->SMTPAuth   = true;                                   // Enable SMTP authentication
			$mail->Username = EMAIL_CONTACT;                 
			$mail->Password = PASS_CONTACT; 
			$mail->SMTPSecure = "tls";         // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
			$mail->Port       = 587;

			$mail->From = EMAIL_CONTACT; 
			$mail->FromName = CLIENTE;

            

			$mail->isHTML(true);
            

            //Establecemos los destinatarios		
            $mail->addAddress($email, $nombre); 
             
            

			$mail->Subject = "Inscripción - ".EVENTO;
			$mail->CharSet = 'UTF-8';

            

            
			$mail->Body =
			'<!DOCTYPE html>
			<html lang="es">
			<head>
			    <meta charset="UTF-8">
			    <meta http-equiv="X-UA-Compatible" content="IE=edge">
			    <meta name="viewport" content="width=device-width, initial-scale=1.0">
			    <title></title>
			    <style>
					html {
						box-sizing: border-box;
					}
					*, *:before, *:after {
						box-sizing: inherit;
					}
					
					body {
						font-family: Arial, Times, "Times New Roman", "serif";
						font-size: 16px;
						line-height: 20px;
						color: #000000;
						margin: 0px;
					}

					table {
						border-collapse: collapse;
						padding: 0px;
					}

					a,
					a:link,
					a:visited {
						color: #20bbdc;
						text-decoration: none;
					}
				</style>
			</head>
			<body>
			    <table width="100%" align="center" border="0" cellpadding="0" cellspacing="0" align="center">
			        <tbody>
			            <tr>
			                <td valign="top" width="100%" align="center" >
			                    <table width="650" border="0" cellpadding="0" cellspacing="0" align="center">
			                        <tbody>
			                            <!-- header -->
										<tr>
											<td width="650" style="border: 2px solid #CCCCCC;">
												<table>
													<tbody>
														<tr>
															<td width="650">
																<table>
																	<tbody>
																		<tr>
																			<td width="650" >
																				<img src="' . URLSITE . '/img/banner-mobile.jpg" width="650" alt="' . EVENTO . '" border="0" style="display: block;">
																			</td>
																		</tr>
																		<tr>
																			<td width="650" align="center" style="padding-top: 20px; font-size: 18px;">
																				<b>INSCRIPCIÓN <br>' . EVENTO . '</b>
                                                                                <br>
                                                                                Modalidad: Presencial
																			</td>
																		</tr>
																	</tbody>
																</table>
															</td>
														</tr>
														<tr><td height="20"></td></tr>
														<tr>
															<td width="650" style="background-color: #F0F0F0; padding: 20px; text-align:justify; font-size: 16px;" bgcolor="#F0F0F0;">
																SEÑOR(A): <br> <b>' . $nombre . '</b> <br><br>
                                                                Su inscripción se ha realizado correctamente para: ' . EVENTO . ' <br>
															</td>
														</tr>
                                                        <tr>
														
															<td width="650" style="padding: 20px; text-align:center">
																A continuación encontrará el código QR con el cual agilizará su proceso de acreditación en el evento.
															</td>
														</tr>
														<tr>
															<td align="center">
																<img src="' . URLSITE . '/qr_generados/' . $documento . '.png" width="150" alt="qr" border="0" style="display: block;">
															</td>
														</tr>
														<tr>		
													</tr>
													</tbody>
												</table>
											</td>
										</tr>
			                        </tbody>
			                    </table>
			                </td>
			            </tr>
			        </tbody>
			    </table>
			</body>
			</html>
            ';
			$mail->send();
			return $mail;
		}

         function mailVirtual($nombre, $email, $documento, $codigo)
        {
			$mail = new PHPMailer(true);

			$mail->isSMTP();                                            // Send using SMTP
			$mail->Host = HOST_EMAIL;
			$mail->SMTPAuth   = true;                                   // Enable SMTP authentication
			$mail->Username = EMAIL_CONTACT;                 
			$mail->Password = PASS_CONTACT; 
			$mail->SMTPSecure = "tls";         // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
			$mail->Port       = 587;

			$mail->From = EMAIL_CONTACT; 
			$mail->FromName = CLIENTE;

			$mail->isHTML(true);

            //Establecemos los destinatarios		
            $mail->addAddress($email, $nombre);  

			$mail->Subject = "Inscripción - ".EVENTO;
			$mail->CharSet = 'UTF-8';
			$mail->Body =
			'<!DOCTYPE html>
			<html lang="es">
			<head>
			    <meta charset="UTF-8">
			    <meta http-equiv="X-UA-Compatible" content="IE=edge">
			    <meta name="viewport" content="width=device-width, initial-scale=1.0">
			    <title></title>
			    <style>
					html {
						box-sizing: border-box;
					}
					*, *:before, *:after {
						box-sizing: inherit;
					}
					
					body {
						font-family: Arial, Times, "Times New Roman", "serif";
						font-size: 16px;
						line-height: 20px;
						color: #000000;
						margin: 0px;
					}

					table {
						border-collapse: collapse;
						padding: 0px;
					}

					a,
					a:link,
					a:visited {
						color: #20bbdc;
						text-decoration: none;
					}
				</style>
			</head>
			<body>
			    <table width="100%" align="center" border="0" cellpadding="0" cellspacing="0" align="center">
			        <tbody>
			            <tr>
			                <td valign="top" width="100%" align="center" >
			                    <table width="650" border="0" cellpadding="0" cellspacing="0" align="center">
			                        <tbody>
			                            <!-- header -->
										<tr>
											<td width="650" style="border: 2px solid #CCCCCC;">
												<table>
													<tbody>
														<tr>
															<td width="650">
																<table>
																	<tbody>
																		<tr>
																			<td width="650" >
																				<img src="' . URLSITE . '/img/banner-mobile.jpg" width="650" alt="' . EVENTO . '" border="0" style="display: block;">
																			</td>
																		</tr>
																		<tr>
																			<td width="650" align="center" style="padding-top: 20px; font-size: 18px;">
																				<b>INSCRIPCIÓN <br>' . EVENTO . '</b><br>
                                                                                Modalidad: Virtual
																			</td>
																		</tr>
																	</tbody>
																</table>
															</td>
														</tr>
														<tr><td height="20"></td></tr>
														<tr>
															<td width="650" style="background-color: #F0F0F0; padding: 20px; text-align:justify; font-size: 16px;" bgcolor="#F0F0F0;">
																SEÑOR(A): <br> <b>' . $nombre . '</b> <br><br>
                                                                Su inscripción se ha realizado correctamente para: ' . EVENTO . ' <br>
															</td>
														</tr>
                                                        <tr>
														
															<td width="650" style="padding: 20px; text-align:center">
																A continuación encontrará el enlace para ingresar a la platformar virtual
															</td>
														</tr>
                                                        <tr>
															<td align="center">
																<table>
																	<tbody>
																		<tr>
																			<td align="center" width="200" style="font-size: 16px; padding: 10px; border-radius: 10px; background-color: #00b2a0; color: #FFFFFF">
																				<b><a style="color: #FEFEFE" href="' . URLSITE . '/plataforma">Ingresar a la Plataforma</a> </b>
																			</td>
																		</tr>
																	</tbody>
																</table>
															</td>
														</tr>
                                                        <tr>
														
															<td height="20">
																
															</td>
														</tr>
														
														
													</tbody>
												</table>
											</td>
										</tr>
			                        </tbody>
			                    </table>
			                </td>
			            </tr>
			        </tbody>
			    </table>
			</body>
			</html>
            ';
			$mail->send();
			return $mail;
		}
		
    }
