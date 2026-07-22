/* Variables de configuración */
let modulo = 'confirmacion'; //nombre del módulo y carpeta
let seccion_singular = 'confirmacion'; //nombre singular y normalizado[para llamados}
let seccion_legible = 'Confirmación'; //nombre sin normalizar [para títulos y etiquetas]
let prefijo = "pag"; 
let focus = `documento`;
let tratamiento = "El"; //Tratamiento para mensajes (El/La)
let cargado = false; //Indica si el módulo ya fue cargado para gestionar filtros
let selectsA = []; //Variable global para almacenar los selects inicializados
validaciones = [];

var cupos = [];
var registrable = true;


document.addEventListener('DOMContentLoaded', function() {
	var xhr = new XMLHttpRequest();
	var params = "codigo=" + document.getElementById('id').value + "&action=getDatos";
	xhr.open("POST", `/views/${modulo}/_${modulo}.php`,true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.send(params);
	xhr.onreadystatechange = function()
	{
		if(xhr.readyState == 4)
		{
			if(xhr.status == 200)
			{
				console.log(xhr.responseText);
				//Si la respuesta es correcta, cargamos las variables
				var data = JSON.parse(xhr.responseText.trim());
				var datos = data['datos'];	
				console.log(datos);		
				
				//Despliegue del formulario - MODIFICABLE
				document.getElementById(modulo).innerHTML = 
				`
				<div class="row">
					<div class="col s12">
						<div class="panel center-align">
							<h1 class="m-0">Resumen de su inscripción</h1>
						</div>
						<section class="tarjeta">
							<div class="row">
								<div class="col s12">
									<div class="flex">
										<i class="material-icons icono">person</i>
										<h2>Información Personal</h2>
									</div>
								</div>
							</div>
							<div class="row m-0 mt-20">
								<div class="col s12 m4 center-align">
									<div class="mi-label">Documento</div>
									<div class="mi-valor">${datos[0]['tipo_documento']} ${datos[0]['documento']}</div>
								</div>
								<div class="col s12 m4 center-align">
									<div class="mi-label">Nombre completo</div>
									<div class="mi-valor">${datos[0]['nombres']} ${datos[0]['apellidos']}</div>
								</div>
								<div class="col s12 m4 center-align">
									<div class="mi-label">Correo electrónico</div>
									<div class="mi-valor">${datos[0]['email']}</div>
								</div>
								

							</div>
						</section>

					
						</section>
						<!--<section class="tarjeta mt-20">
							<div class="row m-0">
								<div class="col s12 mb-20">
									<div class="flex">
										<i class="material-icons icono">shopping_cart</i>
										<h2>Participación en cursos</h2>
									</div>
								</div>

								<div class="col s12 m4 center-align">
									<div class="mi-label">¿Curso ECMO - Sep 9 de 2pm a 5pm?</div>
									<div class="mi-valor">${datos[0]['curso1'] != "No" ? "Sí" : "No"}</div>
								</div>

								<div class="col s12 m4 center-align">
									<div class="mi-label">¿Curso Ventilación Mecánica - Sep 10 de 2pm a 5pm?</div>
									<div class="mi-valor">${datos[0]['curso2'] != "No" ? "Sí" : "No"}</div>
								</div>

								
								<div class="col s12 m4 center-align">
									<div class="mi-label">¿Curso Ecocardiografía - Sep 11 de 2pm a 5pm?</div>
									<div class="mi-valor">${datos[0]['curso3'] != "No" ? "Sí" : "No"}</div>
								</div>
							</div>
						</section>-->
						<section class="tarjeta mt-20">
							<div class="row m-0">
								<div class="col s12 mb-20">
									<div class="flex">
										<i class="material-icons icono">payment</i>
										<h2>Estado de su inscripción</h2>
									</div>
								</div>

								<div class="col s12 m12 center-align" ${datos[0]['pago'] == "Sí" && datos[0]['pago_valor'] == 0 ? "" : "style='display:none;'"}>
									Su inscripción ha sido confirmada exitosamente.<br>
									Se ha enviado un correo de confirmación con los detalles de su inscripción. Por favor revise su bandeja de entrada y la carpeta de correo no deseado.
								</div>

								<div class="col s12 m12 center-align" ${datos[0]['pago'] == "Sí" && datos[0]['pago_valor'] != 0 ? "" : "style='display:none;'"}>
									Su pago ha sido validado y su inscripción ha sido confirmada exitosamente.<br>
									Se ha enviado un correo de confirmación con los detalles de su inscripción. Por favor revise su bandeja de entrada y la carpeta de correo no deseado.
								</div>

								<div class="col s12 m4 center-align" ${datos[0]['pago'] == "No" ? "" : "style='display:none;'"}>
									<b style="font-size: 20px">Pendiente de pago</b>
								</div>

								<div class="col s12 m4" ${datos[0]['pago'] == "No" ? "" : "style='display:none;'"}>
									<div class="pago">
										Total a pagar:<br>
										<span id="total_pagar" class="total_pagar">${precioFuncion(datos[0]['pago_valor'])}</span>

									</div>
								</div>

								<!--<div class="col s12 m4 mt-5" ${datos[0]['pago'] == "No" ? "" : "style='display:none;'"}>
									<form action="https://gateway2.tucompra.com.co/tc/app/inputs/compra.jsp" method="POST">
										<input type="hidden" name="usuario" value="td39xf4465t81q31">
										<input type="hidden" name="factura" value="${datos[0]['documento']}-${generarCodigoAleatorio(5)}">
										<input type="hidden" name="valor" value="${datos[0]['pago_valor']}">
										<input type="hidden" name="descripcionFactura" value="3er. Congreso I-CONICC">
										<input type="hidden" name="tipoDocumento" value="${datos[0]['tipo_documento']}">
										<input type="hidden" name="documentoComprador" value="${datos[0]['documento']}">
										<input type="hidden" name="nombreComprador" value="${datos[0]['nombres']}">
										<input type="hidden" name="apellidoComprador" value="${datos[0]['apellidos']}">
										<input type="hidden" name="paisComprador" value="${datos[0]['pais']}">
										<input type="hidden" name="ciudadComprador" value="${datos[0]['ciudad']}">
										<input type="hidden" name="celularComprador" value="${datos[0]['celular']}">
										<input type="hidden" name="correoComprador" value="${datos[0]['email']}">
										<input type="hidden" name="direccionComprador" value="${datos[0]['direccion']}">
										<input type="hidden" name="campoExtra1" value="evento26020">
										<input type="hidden" name="tipoMoneda" value="COP">
										<input type="hidden" name="campoExtra2" value="${datos[0]['nombres']} ${datos[0]['apellidos']}">
										<input type="hidden" name="campoExtra3" value="${datos[0]['email']}">
										<input type="hidden" name="campoExtra4" value="${datos[0]['tipo_documento']} ${datos[0]['documento']}">
										<input type="hidden" name="campoExtra5" value="${datos[0]['telefono']}">
										<input type="hidden" name="campoExtra6" value="${datos[0]['direccion']}">
										<button type="submit" class="btn waves-effect waves-light btn-ppal">IR A PAGAR</button>
									</form>
								</div>-->
								<div class="col s12 m4 mt-5" ${datos[0]['pago'] == "No" ? "" : "style='display:none;'"}>
									<form action="https://checkout.payulatam.com/ppp-web-gateway-payu/" method="POST">
										<input type="hidden" name="merchantId"      value="764001">
										<input type="hidden" name="accountId"       value="770591">
										<input type="hidden" name="description"     value="24 CONGRESO INTERNACIONAL DEL COLEGIO NACIONAL DE BACTERIOLOGÍA 2026">
										<input type="hidden" name="referenceCode" 	value="${data['referenceCode']}">
										<input type="hidden" name="amount"        	value="${parseInt(data['amount']) + (parseInt(data['amount']) * parseInt(data['iva']) / 100)}">
										<input type="hidden" name="tax"        		value="${parseInt(data['amount']) * parseInt(data['iva']) / 100}">
										<input type="hidden" name="taxReturnBase"	value="${parseInt(data['amount'])}">
										<input type="hidden" name="currency" 		value="${data['currency']}">
										<input type="hidden" name="signature"     value="${data['firma']}">
										<input type="hidden" name="test"            value="0">
										<input type="hidden" name="buyerFullName"   value="${datos[0]['nombres']} ${datos[0]['apellidos']}">
										<input type="hidden" name="buyerEmail"      value="${datos[0]['email']}">
										<input type="hidden" name="buyerDocumentType" value="${datos[0]['tipo_documento']}">
										<input type="hidden" name="buyerDocument"   value="${datos[0]['documento']}">
										<input type="hidden" name="telephone"       value="${datos[0]['celular']}">
										<input type="hidden" name="payerFullName"   value="${datos[0]['nombres']} ${datos[0]['apellidos']}">
										<input type="hidden" name="payerEmail"      value="${datos[0]['email']}">
										<input type="hidden" name="payerPhone"      value="${datos[0]['celular']}">
										<input type="hidden" name="payerDocumentType" value="${datos[0]['tipo_documento']}">
										<input type="hidden" name="payerDocument"   value="${datos[0]['documento']}">
										<input type="hidden" name="billingAddress"  value="${datos[0]['direccion']}">
										<input type="hidden" name="billingCity"     value="${datos[0]['ciudad']}">
										<input type="hidden" name="billingCountry"  value="CO">
										<input type="hidden" name="responseUrl"     value="https://cnbcolombia-congreso.eventos26.eventechvirtual.com/confirmacion/${datos[0]['codigo']}">
										<input type="hidden" name="confirmationUrl" value="https://cnbcolombia-congreso.eventos26.eventechvirtual.com/views/confirmacion/_confirmacion_pago.php">
										<input type="hidden" name="lng"             value="es">
										<button type="submit" class="btn waves-effect waves-light btn-ppal">IR A PAGAR</button>
									</form>
								</div>
							</div>
						</section>
						
					</div>
				</div>
			`;
				//Refrescamos los labels

				M.updateTextFields();
				document.getElementById('loader').style.display = "none";
			}
			else
			if(xhr.status == 401) 
			{	//Token inválido o expirado - Sentencias prohibidas. Cerramos sesión
				document.getElementById('loader').style.display = "none";
				cierreSesionSeguridad(JSON.parse(xhr.response).message)
			}
			else
			{	//Cualquier otro error
				console.log(`ID: ${JSON.parse(xhr.response).details} - Error: ${xhr.status} - ${JSON.parse(xhr.response).message}`);
				M.toast({html: "Ha ocurrido un error. Por favor verifique su conexión a Internet.", classes: 'toasterror'});
				document.getElementById('loader').style.display = "none";
			}
		}
	}
})




function generarCodigoAleatorio(longitud = 10) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let resultado = '';
    
    for (let i = 0; i < longitud; i++) {
        const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
        resultado += caracteres.charAt(indiceAleatorio);
    }
    
    return resultado;
}