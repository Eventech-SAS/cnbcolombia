/* Variables de configuración */
let modulo = 'inscripcion'; //nombre del módulo y carpeta
let seccion_singular = 'inscripcion'; //nombre singular y normalizado[para llamados}
let seccion_legible = 'Inscripción'; //nombre sin normalizar [para títulos y etiquetas]
let prefijo = "pag"; 
let focus = `documento`;
let tratamiento = "El"; //Tratamiento para mensajes (El/La)
let cargado = false; //Indica si el módulo ya fue cargado para gestionar filtros
let selectsA = []; //Variable global para almacenar los selects inicializados
validaciones = [];

var cupos = [];
var registrable = true;
var monedaActual = "COP"; 


document.addEventListener('DOMContentLoaded', function() {
	var xhr = new XMLHttpRequest();
	var params = "action=getPaises";
	xhr.open("POST", `/views/${modulo}/_${modulo}.php`,true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.send(params);
	xhr.onreadystatechange = function()
	{
		if(xhr.readyState == 4)
		{
			if(xhr.status == 200)
			{
				//Si la respuesta es correcta, cargamos las variables
				var data = JSON.parse(xhr.responseText.trim());
				var paises = data['paises'];			

				var optionsPaises = generarSelect(paises, 0, 'crear', 'pai_pais', ['pai_pais']);
				
				//Despliegue del formulario - MODIFICABLE
				document.getElementById(modulo).innerHTML = 
				`<form method="POST" id="${modulo}-form">
					<div class="row">
						<div class="col s12">
							<div class="panel center-align">
								<h1 class="m-0">Inscripción</h1>
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
									<div class="col s12 m4 select">
										<label for="tipo_documento">Tipo de Documento<span class="requerido">*</span></label>
										<select id="tipo_documento" name="tipo_documento" class="informacion_personal_select">
											<option value="" disabled selected>Seleccione una opción</option>
											<option value="CC" ${localStorage.getItem(`${prefixG}_tipo_documento`) === 'CC' ? 'selected' : ''}>Cédula de Ciudadanía</option>
											<option value="CE" ${localStorage.getItem(`${prefixG}_tipo_documento`) === 'CE' ? 'selected' : ''}>Cédula de Extranjería</option>
											<option value="PP" ${localStorage.getItem(`${prefixG}_tipo_documento`) === 'PP' ? 'selected' : ''}>Pasaporte</option>
										</select>
									</div>
									<div class="col s12 m4 input-field">
										<input readonly="readonly" type="text" name="documento" id="documento" placeholder="" value="${localStorage.getItem(`${prefixG}_documento`)}" onchange="limpiarError(this);">
										<label for="documento">Documento<span class="requerido">*</span></label>
									</div>
									
									<div class="col s12 m4 input-field extranjero" style="display: none;">
										<input type="text" name="documento_categoria" id="documento_categoria" placeholder="" value="" onchange="limpiarError(this);">
										<label for="documento_categoria">Categoría de VISA o permiso<span class="requerido">*</span></label>
									</div>

									<div class="col s12 m4 input-field extranjero" style="display: none;">
										<input type="date" name="documento_expedicion" id="documento_expedicion" placeholder="" value="" onchange="limpiarError(this);">
										<label for="documento_expedicion">Expedición de VISA o permiso<span class="requerido">*</span></label>
									</div>

									<div class="col s12 m4 input-field extranjero" style="display: none;">
										<input type="date" name="documento_expiracion" id="documento_expiracion" placeholder="" value="" onchange="limpiarError(this);">
										<label for="documento_expiracion">Expiración de VISA o permiso<span class="requerido">*</span></label>
									</div>

									<div class="col s12 m4 input-field">
										<input type="text" name="nombres" id="nombres" placeholder="" value="" onchange="limpiarError(this)">
										<label for="nombres">Nombres<span class="requerido">*</span></label>
									</div>
									<div class="col s12 m4 input-field">       
										<input type="text" name="apellidos" id="apellidos" placeholder="" value="" onchange="limpiarError(this)">
										<label for="apellidos">Apellidos<span class="requerido">*</span></label>
									</div>

									<div class="col s12 m4 input-field">       
										<input type="text" name="celular" id="celular" placeholder="" value="" onchange="limpiarError(this)">
										<label for="celular">Celular<span class="requerido">*</span></label>
									</div>

									<div class="col s12 m4 input-field">       
										<input type="email" name="email" id="email" placeholder="" value="" onchange="limpiarError(this); validarEmail()">
										<label for="email">Correo Electrónico<span class="requerido">*</span></label>
									</div>

									<div class="col s12 m4 input-field">       
										<input type="email" name="email-c" id="email-c" placeholder="" value="" onchange="limpiarError(this)">
										<label for="email-c">Confirmar Correo Electrónico<span class="requerido">*</span></label>
									</div>

									<div class="col s12 m4 input-field">       
										<input type="text" name="profesion" id="profesion" placeholder="" value="" onchange="limpiarError(this)">
										<label for="profesion">Profesión<span class="requerido">*</span></label>
									</div>

									<div class="col s12 m4 select">
										<label for="ocupacion">Ocupación<span class="requerido">*</span></label>
										<select id="ocupacion" name="ocupacion" class="informacion_personal_select">
											<option value="" disabled selected>Seleccione una opción</option>
											<option value="Independiente">Independiente</option>
											<option value="Empleado">Empleado</option>
											<option value="Pensionado">Pensionado</option>
											<option value="Desempleado">Desempleado</option>
											<option value="Empleado">Empleado</option>
											<option value="Estudiante">Estudiante</option>
											<option value="otro">Otro</option>
										</select>
									</div>    


									<div class="col s12 m4 select">
										<label for="pais">País<span class="requerido">*</span></label>
										<select id="pais" name="pais" class="informacion_personal_select">
											<option value="" disabled selected>Seleccione una opción</option>
											${optionsPaises}
										</select>
									</div>

									<div class="col s12 m4 select">
										<label for="ciudad">Ciudad<span class="requerido">*</span></label>
										<select id="ciudad" name="ciudad">
											<option value="" disabled selected>Seleccione una opción</option>
										</select>
									</div>

									<div class="col s12 m4 input-field">       
										<input type="text" name="direccion" id="direccion" placeholder="" value="" onchange="limpiarError(this)">
										<label for="direccion">Dirección<span class="requerido">*</span></label>
									</div>

									<div class="col s12 m4 select">
										<label for="tipo">Tipo<span class="requerido">*</span></label>
										<select id="tipo" name="tipo" class="informacion_personal_select">
											<option value="" disabled selected>Seleccione una opción</option>
											<option value="Colegiado activo">Colegiado activo</option>
											<option value="Particular">Particular</option>
											<option value="Extranjero">Extranjero</option>
											<option value="Estudiante">Estudiante</option>
											<option value="Funcionario">Funcionario</option>
											<option value="Afiliado Colabiocli">Afiliado Colabiocli</option>
										</select>
									</div>

									<div class="col s12 m4 file-field input-field estudiante" style="display: none;">
										<label for="comprobante" id="label-comprobante"></label>
										<div class="btn">
											<span>Subir</span>
											<input type="file" name="comprobante" placeholder="" onchange="limpiarError(this)" accept=".pdf">
										</div>
										<div class="file-path-wrapper">
											<input type="text" class="file-path validate" id="comprobante"  placeholder="">
										</div>
									</div>

								</div>
							</section>

							
							<section class="tarjeta mt-20">
								<div class="row">
									<div class="col s12">
										<div class="flex">
											<i class="material-icons icono">receipt</i>
											<h2>Información de facturación</h2>
										</div>
									</div>
								</div>
								<div class="row m-0 mt-20">

									<div class="col s12 m4 input-field">       
										<input type="text" name="cortesia" id="cortesia" placeholder="" value="" onchange="limpiarError(this); validar_cortesia(this);">
										<label for="cortesia">Código de cortesía<span class="requerido"></span></label>
									</div>
									

									<div class="col s12 m4 select facturacion facturacion_base">
										<label for="facturar_a">Facturar a*</label>
										<select id="facturar_a" name="facturar_a" class="informacion_personal_select">
											<option value="" disabled selected>Seleccione una opción</option>
											<option value="Persona natural">Persona natural</option>
											<option value="Empresa">Empresa</option>
										</select>
									</div>
									
									<div class="switch facturacion" style="display: none;">
										<label>
										<input type="checkbox" id="persona_datos" name="persona_datos" value="datos_informacion" onchange="datos_informacion()">
										<span class="lever"></span>
											Usar los datos de la información personal
										</label>
									</div>
								
									<div class="col s12 m4 select facturacion facturacion_persona" style="display: none;">
										<label for="tipo_documento_facturacion">Tipo de Documento<span class="requerido">*</span></label>
										<select id="tipo_documento_facturacion" name="tipo_documento_facturacion" class="informacion_personal_select">
											<option value="" disabled selected>Seleccione una opción</option>
											<option value="CC">Cédula de Ciudadanía</option>
											<option value="CE">Cédula de Extranjería</option>
											<option value="PP">Pasaporte</option>
										</select>
									</div>
									<div class="col s12 m4 input-field facturacion facturacion_persona facturacion_empresa" style="display: none;">
										<input type="text" name="documento_facturacion" id="documento_facturacion" placeholder="" value="" onchange="limpiarError(this)" class="facturacion_texto informacion_personal">
										<label for="documento_facturacion" id="label_documento_facturacion"><span class="requerido">*</span></label>
									</div>

									<div class="col s12 m4 input-field  facturacion_extranjero" style="display: none;">
										<input type="text" name="documento_categoria_facturacion" id="documento_categoria_facturacion" placeholder="" value="" onchange="limpiarError(this)" class="facturacion_texto informacion_personal">
										<label for="documento_categoria_facturacion">Categoría de VISA o permiso<span class="requerido">*</span></label>
									</div>

									<div class="col s12 m4 input-field  facturacion_extranjero" style="display: none;">
										<input type="text" name="documento_expedicion_facturacion" id="documento_expedicion_facturacion" placeholder="" value="" onchange="limpiarError(this)" class="facturacion_texto informacion_personal">
										<label for="documento_expedicion_facturacion">Expedición de VISA o permiso<span class="requerido">*</span></label>
									</div>

									<div class="col s12 m4 input-field  facturacion_extranjero" style="display: none;">
										<input type="text" name="documento_expiracion_facturacion" id="documento_expiracion_facturacion" placeholder="" value="" onchange="limpiarError(this)" class="facturacion_texto informacion_personal">
										<label for="documento_expiracion_facturacion">Expiración de VISA o permiso<span class="requerido">*</span></label>
									</div>

							
									<div class="col s12 m4 input-field facturacion facturacion_persona facturacion_empresa" style="display: none;">
										<input type="text" name="nombre_facturacion" id="nombre_facturacion" placeholder="" value="" onchange="limpiarError(this)" class="facturacion_texto informacion_personal">
										<label for="nombre_facturacion" id="label_nombres_facturacion"><span class="requerido">*</span></label>
									</div>

									<div class="col s12 m4 input-field facturacion facturacion_persona facturacion_empresa" style="display: none;">
										<input type="text" name="telefono_facturacion" id="celular_facturacion" placeholder="" value="" onchange="limpiarError(this)" class="facturacion_texto informacion_personal">
										<label for="celular_facturacion">Teléfono<span class="requerido">*</span></label>
									</div>
									
									<div class="col s12 m4 input-field facturacion facturacion_persona facturacion_empresa" style="display: none;"> 
										<input type="email" name="email_facturacion" id="email_facturacion" placeholder="" value="" onchange="limpiarError(this)" class="facturacion_texto informacion_personal">
										<label for="email_facturacion">Correo Electrónico<span class="requerido">*</span></label>
									</div>

									<div class="col s12 m4 select facturacion facturacion_persona facturacion_empresa" style="display: none;">
										<label for="pais_facturacion">País<span class="requerido">*</span></label>
										<select id="pais_facturacion" name="pais_facturacion" class="facturacion_select informacion_personal_select">
											<option value="" disabled selected>Seleccione una opción</option>
											${optionsPaises}
											
										</select>
									</div>
									<div class="col s12 m4 select facturacion facturacion_persona facturacion_empresa" style="display: none;">
										<label for="ciudad_facturacion">Ciudad<span class="requerido">*</span></label>
										<select id="ciudad_facturacion" name="ciudad_facturacion" class="facturacion_select informacion_personal_select">
											<option value="" disabled selected>Seleccione una opción</option>
										</select>
									</div>

									<div class="col s12 m4 input-field facturacion facturacion_persona facturacion_empresa" style="display: none;">
										<input type="text" name="ciudad_facturacion" id="ciudad_facturacion" placeholder="" value="" onchange="limpiarError(this)" class="facturacion_texto informacion_personal">
										<label for="ciudad_facturacion">Dirección<span class="requerido">*</span></label>
									</div>

									<div class="col s12 m4 input-field facturacion facturacion_persona" style="display: none;">
										<input type="date" name="fecha_nacimiento_facturacion" id="fecha_nacimiento_facturacion" placeholder="" value="" onchange="limpiarError(this)" class="facturacion_texto informacion_personal">
										<label for="fecha_nacimiento_facturacion">Fecha de Nacimiento<span class="requerido">*</span></label>
									</div>

									<div class="col s12 m4 file-field input-field facturacion facturacion_base">
										<label for="pago_comprobante">Comprobante de pago (Si paga por transferencia)</label>
										<div class="btn">
											<span>Subir</span>
											<input type="file" name="pago_comprobante"  placeholder="" onchange="limpiarError(this)" accept=".pdf">
										</div>
										<div class="file-path-wrapper">
											<input type="text" class="file-path validate" id="pago_comprobante" placeholder="">
										</div>
									</div>
								</div>
							</section>
							<section class="tarjeta mt-20">
								<div class="row m-0">
									<div class="col s12">
										<div class="flex">
											<i class="material-icons icono">payment</i>
											<h2>Información de pago</h2>
										</div>
									</div>
								</div>
								<div class="row m-0 mt-10">
									<div class="col s12 m5 ">
										<div class="switch myswitch">
											<label>
											<input type="checkbox" onchange="habilitarBoton(this)">
											<span class="lever"></span>
											<span class="texto-privacidad">
											 Autorizo a la Clínica Imbanaco a tratar mis datos personales bajo su política de privacidad, la cual me comprometo a leer en: <a target="_blank" href="https://www.imbanaco.com/es_CO/politica-de-tratamiento-de-datos-personales">tratamiento de datos personales</a>
											</span>
											 </label>
										</div>
									</div>

									<div class="col s12 m3 ">
										<div class="pago">
											Total a pagar:<br>
											<span id="total_pagar" class="total_pagar">$0</span>

										</div>
									</div>

									<div class="col s12 m4 mt-5">
										<input type="hidden" name="action" id="action" value="crear">
										<button disabled="disabled" type="submit" id="action_${modulo}" class="btn waves-effect waves-light btn-ppal">Finalizar</button>
									</div>
								</div>
							</section>
						</div>
					</div>
				</form>
			`;
				//Refrescamos los labels

				M.updateTextFields();

				var telefonos = [{'campo': `celular`}, {'campo': `celular_facturacion`}];
				inicializarTelefonos(telefonos);

				//Cargamos el array de editores para inicialización
				var selects = [
					{'campo': 'tipo_documento', 'guardar': true, 'funcion': function(){
						var tipoDoc = selectsA['tipo_documento'][0].selectize.getValue();
						
						// Si escogen CE, forzar tipo = Extranjero y bloquearlo
						if (tipoDoc == "Cédula de Extranjería" || tipoDoc == "Pasaporte") {
							selectsA['tipo'][0].selectize.setValue('Extranjero');
							selectsA['tipo'][0].selectize.lock();
						} else {
							selectsA['tipo'][0].selectize.enable();
							// Solo limpiar si estaba en Extranjero para no borrar una selección manual
							if (selectsA['tipo'][0].selectize.getValue() == 'Extranjero') {
								selectsA['tipo'][0].selectize.setValue('');
							}
						}
					}},
					{'campo': 'ocupacion', 'guardar': true, 'multiple': false},
					{'campo': 'tipo', 'guardar': true, 'funcion': function(){
							var tipoVal = selectsA['tipo'][0].selectize.getValue();

							// Mostrar/ocultar campo de comprobante (estudiante y afiliado)
							var elemEstudiante = document.getElementsByClassName('estudiante');
							if (tipoVal == "Estudiante" || tipoVal == "Afiliado Colabiocli") {
								for (var i = 0; i < elemEstudiante.length; i++)
									elemEstudiante[i].style.display = "block";

								if (tipoVal == "Estudiante")
									document.getElementById('label-comprobante').innerText = "Certificado de estudiante*";
								else
									document.getElementById('label-comprobante').innerText = "Comprobante de afiliado Colabiocli*";

								calcular_total();
							}
							else if (tipoVal == "Colegiado activo") {
								for (var i = 0; i < elemEstudiante.length; i++)
									elemEstudiante[i].style.display = "none";

								// Validar contra la BD antes de permitir continuar
								var documento = document.getElementById('documento').value;
								if (!documento) {
									M.toast({html: "Debe ingresar su documento antes de seleccionar Colegiado activo.", classes: 'toastwarning'});
									selectsA['tipo'][0].selectize.setValue('');
									return;
								}

								document.getElementById('loader').style.display = "flex";
								var xhr = new XMLHttpRequest();
								xhr.open('POST', `/views/${modulo}/_${modulo}.php`, true);
								xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
								xhr.send("action=validarColegiado&documento=" + encodeURIComponent(documento));
								xhr.onreadystatechange = function() {
									if (xhr.readyState == 4) {
										document.getElementById('loader').style.display = "none";
										if (xhr.status == 200) {
											M.toast({html: "Colegiado activo verificado correctamente.", classes: 'toastdone'});
											calcular_total();
										} else {
											var msg = "No se pudo verificar su estado como Colegiado activo.";
											try { msg = JSON.parse(xhr.response).message; } catch(e){}
											M.toast({html: msg, classes: 'toastwarning'});
											// Revertimos la selección para que no avance
											selectsA['tipo'][0].selectize.setValue('');
											registrable = false;
											document.getElementById('action_' + modulo).setAttribute('disabled', 'disabled');
										}
									}
								}
							}
							else {
								for (var i = 0; i < elemEstudiante.length; i++)
									elemEstudiante[i].style.display = "none";

								calcular_total();
							}
						}},
					{'campo': 'estudiante', 'guardar': true, 'multiple': false},
					{'campo': 'tipo_documento_facturacion', 'guardar': true, 'multiple': false, 'funcion': function(){
						if(selectsA['tipo_documento_facturacion'][0].selectize.getValue() == "CE" || selectsA['tipo_documento_facturacion'][0].selectize.getValue() == "PP")
						{
							var elementos = document.getElementsByClassName('facturacion_extranjero');
							for(var i = 0; i < elementos.length; i++)
								elementos[i].style.display = "block";
						}
						else
						{
							var elementos = document.getElementsByClassName('facturacion_extranjero');
							for(var i = 0; i < elementos.length; i++)
								elementos[i].style.display = "none";
						}
					}},
					
					{'campo': 'facturar_a', 'guardar': true, 'multiple': false, 'funcion': function(){
						validar_campos_pago();
					}},
					{'campo': 'pais', 'guardar': true, 'multiple': false, 'funcion': function()
						{
							var pais = document.getElementById('pais').value;
							if(pais != "")
							{
								document.getElementById('loader').style.display = "flex";
								var xhr = new XMLHttpRequest();
								var params = "pais="+pais+"&action=getCiudades";
								xhr.open("POST", `/views/${modulo}/_${modulo}.php`,true);
								xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
								xhr.send(params);
								xhr.onreadystatechange = function()
								{
									if(xhr.readyState == 4)
									{
										if (xhr.status == 200)
										{         
											var data = JSON.parse(xhr.response);
											var ciudades = data['ciudades'];
											console.log(ciudades);	

											//Limpiamos el select de ciudades
											selectsA['ciudad'][0].selectize.setValue();
											selectsA['ciudad'][0].selectize.clearOptions();
											ciudades.forEach(function(ciudad){
												selectsA['ciudad'][0].selectize.addOption({value: ciudad.ciu_ciudad, text: ciudad.ciu_ciudad});	
											});
											
											selectsA['ciudad'][0].selectize.refreshOptions(false);
											
											document.getElementById('loader').style.display = "none";
										}
										else
										if(xhr.status == 401) //Token inválido o expirado - Sentencias prohibidas
										{
											document.getElementById('loader').style.display = "none";
											cierreSesionSeguridad(JSON.parse(xhr.response).message)
										}
										else
										{
											var data = JSON.parse(xhr.response);

											//Cualquier otro error
											console.log(`ID: ${JSON.parse(xhr.response).details} - Error: ${xhr.status} - ${JSON.parse(xhr.response).message}`);
											M.toast({html: "Ha ocurrido un error. Por favor verifique su conexión a Internet.", classes: 'toasterror'});
											document.getElementById('loader').style.display = "none";
										}
										
									}
								}
							}	
						}
					},
					{'campo': 'ciudad', 'guardar': true, 'multiple': false},
					
					{'campo': 'pais_facturacion', 'guardar': true, 'multiple': false, 'funcion': function(){
						var pais = document.getElementById('pais_facturacion').value;
						if(pais == "")
						{
							document.getElementById('loader').style.display = "flex";
						
						var xhr = new XMLHttpRequest();
						var params = "pais="+pais+"&action=getCiudades";
						xhr.open("POST", `/views/${modulo}/_${modulo}.php`,true);
						xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
						xhr.send(params);
						}
						xhr.onreadystatechange = function()
						{
							if(xhr.readyState == 4)
							{
								if (xhr.status == 200)
								{         
									var data = JSON.parse(xhr.response);
									var ciudades = data['ciudades'];

									//Limpiamos el select de ciudades
									selectsA['ciudad_facturacion'][0].selectize.setValue();
									selectsA['ciudad_facturacion'][0].selectize.clearOptions();
									ciudades.forEach(function(ciudad){
										selectsA['ciudad_facturacion'][0].selectize.addOption({value: ciudad.ciu_ciudad, text: ciudad.ciu_ciudad});	
									});
									
									selectsA['ciudad_facturacion'][0].selectize.refreshOptions(false);
									
									document.getElementById('loader').style.display = "none";
								}
								else
								if(xhr.status == 401) //Token inválido o expirado - Sentencias prohibidas
								{
									document.getElementById('loader').style.display = "none";
									cierreSesionSeguridad(JSON.parse(xhr.response).message)
								}
								else
								{
									var data = JSON.parse(xhr.response);

									//Cualquier otro error
									console.log(`ID: ${JSON.parse(xhr.response).details} - Error: ${xhr.status} - ${JSON.parse(xhr.response).message}`);
									M.toast({html: "Ha ocurrido un error. Por favor verifique su conexión a Internet.", classes: 'toasterror'});
									document.getElementById('loader').style.display = "none";
								}
							}
						}
					}},
					{'campo': 'ciudad_facturacion', 'guardar': true, 'multiple': false},
				];				
				selectsA = inicializarSelects(selects);
				// Pre-llenar tipo si viene de localStorage
				var tipoGuardado = localStorage.getItem(`${prefixG}_tipo`);
				if (tipoGuardado) {
					selectsA['tipo'][0].selectize.setValue(tipoGuardado);
					// En lugar de disable(), solo bloqueamos visualmente
					selectsA['tipo'][0].selectize.lock(); // 
					localStorage.removeItem(`${prefixG}_tipo`);
				}

				//Cargamos los horarios

				
				
				//Inicializamos el control del formulario
				controlFormulario();

				// Hacemos FOCUS y seleccionamos el texto del primer campo
				document.getElementById(focus).focus();
				document.getElementById(focus).select();
				document.getElementById('loader').style.display = "none";


				selectsA['tipo_documento'][0].selectize.lock();
				
				


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
});

function validar_cortesia(cmp)
{
	var cortesia = cmp.value.trim();
	if(cortesia != "")
	{
		document.getElementById('loader').style.display = "flex";
		var xhr = new XMLHttpRequest();
		var params = "cortesia="+cortesia+"&action=validarCortesia";
		xhr.open("POST", `/views/${modulo}/_${modulo}.php`,true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.send(params);
		xhr.onreadystatechange = function()
		{
			if(xhr.readyState == 4)
			{
				if (xhr.status == 200)
				{         
					var data = JSON.parse(xhr.response);
					var datos = data['datos'];
					

					if(datos == 0)
					{	
						M.toast({html: "Código de cortesía inválido. Por favor verifique el código e intente nuevamente.", classes: 'toastwarning'});
						cortesia = false;
						document.getElementById('cortesia').value = "";
						calcular_total();

					}
					else
					if(datos[0]['estado'] == 1)
					{
						M.toast({html: "El código de cortesía ya se ha utilizado.", classes: 'toastwarning'});
						cortesia = false;
						document.getElementById('cortesia').value = "";
						calcular_total();
					}
					else
					{
						M.toast({html: "Código de cortesía válido.", classes: 'toastdone'});
						cortesia = true;
						calcular_total();
					}
					document.getElementById('loader').style.display = "none";
				}
				else
				if(xhr.status == 401) //Token inválido o expirado - Sentencias prohibidas
				{
					document.getElementById('loader').style.display = "none";
					cierreSesionSeguridad(JSON.parse(xhr.response).message)
				}
				else
				{
					var data = JSON.parse(xhr.response);

					//Cualquier otro error
					console.log(`ID: ${JSON.parse(xhr.response).details} - Error: ${xhr.status} - ${JSON.parse(xhr.response).message}`);
					M.toast({html: "Ha ocurrido un error. Por favor verifique su conexión a Internet.", classes: 'toasterror'});
					document.getElementById('loader').style.display = "none";
				}
			}
		}
	}
	else
	{
		cortesia = false;
		M.toast({html: "Código de cortesía eliminado.", classes: 'toastwarning'});
	}
}

function validar_campos_pago()
{
	console.log(total)
	if(total == 0)
	{
		var elementos = document.getElementsByClassName('facturacion');
		for(var i = 0; i < elementos.length; i++)
			elementos[i].style.display = "none";
	}
	else
	{
		var elementos = document.getElementsByClassName('facturacion_base');
		for(var i = 0; i < elementos.length; i++)
			elementos[i].style.display = "block";

		var facturar_a = document.getElementById('facturar_a').value;
		if(facturar_a == "Persona natural")
		{
			document.getElementById('label_nombres_facturacion').innerText = "Nombre completo*";
			document.getElementById('label_documento_facturacion').innerText = "Documento*";
			document.getElementsByClassName('switch')[0].style.display = "block";
			datos_informacion();
		}
		else
		if(facturar_a == "Empresa")
		{
			document.getElementById('label_nombres_facturacion').innerText = "Razón social*";
			document.getElementById('label_documento_facturacion').innerText = "NIT*";	
			document.getElementsByClassName('switch')[0].style.display = "none";
			var elementos = document.getElementsByClassName('facturacion_persona');
			for(var i = 0; i < elementos.length; i++)
				elementos[i].style.display = "block";

			elementos[0].style.display = "none"; //Ocultamos el tipo de documento para empresas
		}
	}
	
}


function datos_informacion()
{
	

	//Validamos si el checkbox de usar datos de información personal está activo
	var persona_datos = document.getElementById('persona_datos');
	if(persona_datos.checked)
	{

		var elementos = document.getElementsByClassName('facturacion_persona');
		for(var i = 0; i < elementos.length; i++)
			elementos[i].style.display = "none";
	}
	else
	{
		var elementos = document.getElementsByClassName('facturacion_persona');
		for(var i = 0; i < elementos.length; i++)
			elementos[i].style.display = "block";
	}
}


function calcular_total() {
    var tipo     = document.getElementById('tipo').value;
    var cortesia = document.getElementById('cortesia').value;

    if (cortesia) {
        total = 0;
        document.getElementById('total_pagar').innerHTML =
            new Intl.NumberFormat('es-CO', {style:'currency', currency:'COP', minimumFractionDigits:0}).format(total);
        validar_campos_pago();
    } else {
        document.getElementById('loader').style.display = "flex";
        var xhr = new XMLHttpRequest();
        xhr.open('POST', `/views/${modulo}/_${modulo}.php`, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send("tipo=" + encodeURIComponent(tipo) + "&cortesia=&action=calcularTotal");
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                document.getElementById('loader').style.display = "none";
                if (xhr.status == 200) {
                    var data = JSON.parse(xhr.response);
                    total        = data['total'];
    				monedaActual = data['moneda'];
					
					var simbolo = monedaActual == "USD" ? "USD " : "";
					document.getElementById('total_pagar').innerHTML = simbolo +
						new Intl.NumberFormat('es-CO', {style:'currency', currency: monedaActual, minimumFractionDigits:0}).format(total);
					validar_campos_pago();
                }
            }
        }
    }
}
function validarEmail() {
    var email  = document.getElementById('email').value;
    var emailC = document.getElementById('email-c').value;

    if (emailC != "" && email !== emailC) {
        marcarError(document.getElementById('email-c'), "Los correos electrónicos no coinciden");
    } else {
        limpiarError(document.getElementById('email-c'));
    }
}






function controlFormulario()
{



		

	

		
		const formulario = document.getElementById(modulo+'-form');

		

		// Evita listeners duplicados al reusar esta inicialización
		if(formulario._submitHandler)
			formulario.removeEventListener('submit', formulario._submitHandler);



		const submitHandler = async function(event){
			event.preventDefault();

			validaciones = [
				['tipo_documento', 'tipo_documento', 'select', 'required'],
				['documento', 'documento', 'text', 'required', 'length=3,50', "documento"],
				['nombres', 'nombres', 'text', 'required', 'length=3,50'],
				['apellidos', 'apellidos', 'text', 'required', 'length=3,50'],
				['celular', 'celular', 'text', 'required', 'length=6,12'],
				['email', 'email', 'text', 'required', 'length=3,50'],
				['email-c', 'email', 'text', 'required', 'length=3,50'],
				['profesion', 'profesión', 'text', 'required', 'length=3,50'],
				['ocupacion', 'ocupación', 'select', 'required'],
				['pais', 'país', 'select', 'required'],
				['ciudad', 'ciudad', 'select', 'required'],
				['direccion', 'dirección', 'text', 'required', 'length=3,100'],
				['tipo', 'tipo', 'select', 'required']
			];

			if(total > 0)
			{
				validaciones.push(['facturar_a', 'Facturar a', 'select', 'required']);
			}

			if(document.getElementById('tipo_documento').value == "PP" || document.getElementById('tipo_documento').value == "CE")
			{
				//validaciones.push(['documento_categoria', 'Categoría de VISA o permiso', 'text', 'required', 'length=3,50']);
				//validaciones.push(['documento_expedicion', 'Expedición de VISA o permiso', 'text', 'required', 'length=3,50']);
				//validaciones.push(['documento_expiracion', 'Expiración de VISA o permiso', 'text', 'required', 'length=3,50']);
			}

			if(document.getElementById('tipo').value == "Estudiante" || document.getElementById('tipo').value == "Otro personal de la salud")
			{
				validaciones.push(['comprobante', 'Comprobante', 'text', 'required', 'length=3,50']);
			}



			if(document.getElementById('facturar_a').value == "Persona natural" && !document.getElementById('persona_datos').checked)
			{
				validaciones.push(['tipo_documento_facturacion', 'Tipo documento facturación', 'select', 'required']);
				validaciones.push(['documento_facturacion', 'Documento facturación', 'text', 'required', 'length=3,50']);
				validaciones.push(['nombre_facturacion', 'Nombre facturación', 'text', 'required', 'length=3,50']);
				validaciones.push(['celular_facturacion', 'Celular facturación', 'text', 'required', 'length=6,12']);
				validaciones.push(['email_facturacion', 'Email facturación', 'text', 'required', 'length=3,50']);
				validaciones.push(['pais_facturacion', 'País facturación', 'select', 'required']);
				validaciones.push(['ciudad_facturacion', 'Ciudad facturación', 'select', 'required']);
				validaciones.push(['direccion_facturacion', 'Dirección facturación', 'text', 'required', 'length=3,100']);
				validaciones.push(['fecha_nacimiento_facturacion', 'Fecha de nacimiento facturación', 'select', 'required']);
			}
			else
			if(document.getElementById('facturar_a').value == "Empresa")
			{
				validaciones.push(['documento_facturacion', 'Documento facturación', 'text', 'required', 'length=3,50']);
				validaciones.push(['nombre_facturacion', 'Nombre facturación', 'text', 'required', 'length=3,50']);
				validaciones.push(['celular_facturacion', 'Celular facturación', 'text', 'required', 'length=6,12']);
				validaciones.push(['email_facturacion', 'Email facturación', 'text', 'required', 'length=3,50']);
				validaciones.push(['pais_facturacion', 'País facturación', 'select', 'required']);
				validaciones.push(['direccion_facturacion', 'Dirección facturación', 'text', 'required', 'length=3,100']);
				validaciones.push(['ciudad_facturacion', 'Ciudad facturación', 'select', 'required']);
				
			}

			if(document.getElementById('tipo_documento_facturacion').value == "PP" || document.getElementById('tipo_documento_facturacion').value == "CE")
			{
				validaciones.push(['documento_categoria_facturacion', 'Categoría de VISA o permiso', 'text', 'required', 'length=3,50']);
				validaciones.push(['documento_expedicion_facturacion', 'Expedición de VISA o permiso', 'text', 'required', 'length=3,50']);
				validaciones.push(['documento_expiracion_facturacion', 'Expiración de VISA o permiso', 'text', 'required', 'length=3,50']);
			}
			console.log("=== VALIDACIONES A EJECUTAR ===");
			validaciones.forEach(function(v) {
				var el = document.getElementById(v[0]);
				console.log(v[0], "→", el ? "OK" : "❌ NULL");
			});
		
			var respuesta = validarFormulario(validaciones);
			if(respuesta)
			{
				document.getElementById('loader').style.display = "flex";
				var params = new FormData(document.getElementById(modulo+'-form'));
				
				// Optimizar imágenes antes de enviar
				await optimizarImagenesFormData(params);            
				var xhr = new XMLHttpRequest();
				xhr.upload.addEventListener("progress", progressHandler, false);
				xhr.addEventListener("load", completeHandler, false);
				xhr.addEventListener("error", errorHandler, false);
				xhr.addEventListener("abort", abortHandler, false);
				xhr.open('POST', `/views/${modulo}/_${modulo}.php`, true);
				console.log("POST params:", params);
				
				xhr.send(params);
				xhr.onreadystatechange = function()
				{
					if (xhr.readyState == 4)
					{
						if (xhr.status == 200)
						{
							document.getElementById('loader').style.display = "none";
							var data = JSON.parse(xhr.response);
							var codigo = data['codigo'];
							

							window.location.href = `/confirmacion/${codigo}`;
						}
						else
						if(xhr.status == 401) //Token inválido o expirado - Sentencias prohibidas
						{
							document.getElementById('loader').style.display = "none";
							cierreSesionSeguridad(JSON.parse(xhr.response).message)
						}else
						
						if (xhr.status == 409) // Conflicto - Valor duplicado
						{
							var data = JSON.parse(xhr.response);

							M.toast({html: JSON.parse(xhr.response).message, classes: 'toastwarning'});
							document.getElementById('loader').style.display = "none";
						}
						else
						if (xhr.status == 410) // Conflicto - Valor duplicado
						{
						
							M.toast({html: "No hay datos para subir", classes: 'toastwarning'});
							document.getElementById('loader').style.display = "none";
						}
						else
						if(xhr.status == 415) //Tipo de archivo no permitido
						{
							M.toast({html: JSON.parse(xhr.response).message, classes: 'toastwarning'});
							document.getElementById('loader').style.display = "none";
						}
						else
						{ 
							console.log(xhr.response)                      
							try {
								var data = JSON.parse(xhr.response);
								localStorage.setItem(`${prefixG}_token`, data.token);    

								//Cualquier otro error
								console.log(`ID: ${JSON.parse(xhr.response).details} - Error: ${xhr.status} - ${JSON.parse(xhr.response).message}`);
								M.toast({html: "Ha ocurrido un error. Por favor verifique su conexión a Internet.", classes: 'toasterror'});
							}
							catch (e) {};
							
							document.getElementById('loader').style.display = "none";
						}
					}
				}
				function progressHandler(event) {
					console.log(xhr.response)
					if (event.lengthComputable)
					{
						const porcentaje = Math.round((event.loaded / event.total) * 100);
						console.log(porcentaje);
						// Actualizamos la barra visualmente
						document.getElementById('progreso-bar').style.width = porcentaje + "%";
					}
				}
				function completeHandler(event) {}
				function errorHandler(event) {
					console.log(xhr.response)
					M.toast({ html: "Ha ocurrido un error. Por favor intente de nuevo. Código: " + data, classes: 'toastwarning' });
					document.getElementById('loader').style.display = "none";
				}
				function abortHandler(event) {
					console.log(xhr.response)
					M.toast({ html: "Ha ocurrido un error. Por favor intente de nuevo. Código: " + data, classes: 'toastwarning' });
					document.getElementById('loader').style.display = "none";
				}	
			}
		};

		formulario._submitHandler = submitHandler;
		formulario.addEventListener('submit', submitHandler);

	/*
			var xhr = new XMLHttpRequest();
			var params = $('#inscripcion-form').serialize();
			xhr.open("POST", `/views/${modulo}/_${modulo}.php`,true);
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhr.send(params);
			xhr.onreadystatechange = function()
			{
				if(xhr.readyState == 4)
				{
					if (xhr.status == 200)
					{       
						console.log(xhr.response);
						document.getElementById('loader').style.display = "none";
						var data = JSON.parse(xhr.response);
						var codigo = data['codigo'];
						

						//window.location.href = `/views/confirmacion/confirmacion/${codigo}`;
					}
					else
					if(xhr.status == 400) //Token inválido o expirado - Sentencias prohibidas
					{
						M.toast({html: "La cortesía ingresada ya ha sido utilizada", classes: 'toastwarning'});
						document.getElementById('loader').style.display = "none";
						cierreSesionSeguridad(JSON.parse(xhr.response).message)
					}
					else
                    if (xhr.status == 409) // Conflicto - Valor duplicado
					{
                        var data = JSON.parse(xhr.response);
                        localStorage.setItem(`${prefixG}_token`, data.token);    

                        M.toast({html: JSON.parse(xhr.response).message, classes: 'toastwarning'});
                        document.getElementById('loader').style.display = "none";
                    }
					else
					if(xhr.status == 402) //Token inválido o expirado - Sentencias prohibidas
					{
						M.toast({html: JSON.parse(xhr.response).message, classes: 'toasterror'});
						document.getElementById('loader').style.display = "none";
					}
					else
					{
						var data = JSON.parse(xhr.response);
						localStorage.setItem(`${prefixG}_token`, data.token);
						//Cualquier otro error
						M.toast({html: "Ha ocurrido un error. Por favor verifique su conexión a Internet.", classes: 'toasterror'});
						document.getElementById('loader').style.display = "none";
					}
				}
			}*/
		
	
}


function habilitarBoton(cmp)
{
	if(registrable)
	{
		if(cmp.checked)
			document.getElementById('action_'+modulo).removeAttribute('disabled');
		else
			document.getElementById('action_'+modulo).setAttribute('disabled', 'disabled');
	}
	else
	{
		document.getElementById('action_'+modulo).setAttribute('disabled', 'disabled');
	}
	
}
