/* Variables de configuración */
let modulo = 'validacion'; //nombre del módulo y carpeta
let seccion_singular = 'validacion'; //nombre singular y normalizado[para llamados}
let seccion_legible = 'Validación'; //nombre sin normalizar [para títulos y etiquetas]
let focus = `documento`;
let selectsA = []; //Variable global para almacenar los selects inicializados
validaciones = [];

document.addEventListener('DOMContentLoaded', function() {	
	//Despliegue del formulario - MODIFICABLE
	document.getElementById(modulo).innerHTML = 
	`<form method="POST" id="${modulo}-form">
		<div class="row">
			<div class="col s12">
				<section class="tarjeta">
					<div class="row">
						<div class="col s12">
							<div class="center-align">
								<h2>INICIAR INSCRIPCIÓN</h2>
								<p>Por favor digite su número de documento sin espacios o guiones.<br>
									Sólo debe contener números y letras.</p>
								<div class="comentario center-align">
									Recuerde que deberá suministrar este mismo número de documento el día del registro.
								</div>
							</div>
						</div>
					</div>
					<div class="row m-0 mt-20">
						<div class="col s12 m4 offset-m4 select mb-20">
							<label for="tipo_documento">Tipo de Documento<span class="requerido">*</span></label>
							<select id="tipo_documento" name="tipo_documento" class="informacion_personal_select">
								<option value="" disabled selected>Seleccione una opción</option>
								<option value="CC">Cédula de Ciudadanía</option>
								<option value="CE">Cédula de Extranjería</option>
								<option value="PP">Pasaporte</option>
							</select>
						</div>
						<div class="col s12 m4 offset-m4 input-field mb-20">
							<input type="text" name="documento" id="documento" placeholder="" value="" onchange="limpiarError(this); validarDocumento(this);">
							<label for="documento">Documento<span class="requerido">*</span></label>
						</div>
						<div class="col s12 m4 mt-5 offset-m4">
							<input type="hidden" name="action" id="action" value="validar">
							<button type="submit" id="action_${modulo}" class="btn waves-effect waves-light btn-ppal">CONTINUAR</button>
						</div>
					</div>
				</section>
			</div>
		</div>
	</form>
	`;
	//Refrescamos los labels
	M.updateTextFields();

	//Cargamos el array de editores para inicialización
	var selects = [
		{'campo': 'tipo_documento', 'guardar': true},
	];				
	selectsA = inicializarSelects(selects);
	
	//Inicializamos el control del formulario
	controlFormulario();

	// Hacemos FOCUS y seleccionamos el texto del primer campo
	document.getElementById(focus).focus();
	document.getElementById(focus).select();
	document.getElementById('loader').style.display = "none";
});


function controlFormulario()
{
	document.getElementById(`${modulo}-form`).addEventListener('submit', function(event){
		event.preventDefault();

		validaciones = [
			['tipo_documento', 'tipo_documento', 'select', 'required'],	
			['documento', 'documento', 'text', 'required', 'length=3,50', "documento"],
		];

		var respuesta = validarFormulario(validaciones);
		if(respuesta)
		{
			var xhr = new XMLHttpRequest();
			var params = $(`#${modulo}-form`).serialize();
			xhr.open("POST", `/views/${modulo}/_${modulo}.php`,true);
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhr.send(params);
			xhr.onreadystatechange = function()
			{
				if(xhr.readyState == 4)
				{
					if (xhr.status == 200)
					{       
						console.log(xhr.responseText);  
						var data = JSON.parse(xhr.response);
						var datos = data.datos;

						if(datos  == 0)
						{
							localStorage.setItem(`${prefixG}_tipo_documento`, document.getElementById('tipo_documento').value);
							localStorage.setItem(`${prefixG}_documento`, document.getElementById('documento').value);
							var tipoDoc = document.getElementById('tipo_documento').value;
							if (tipoDoc == "CE" || tipoDoc == "PP") {
								localStorage.setItem(`${prefixG}_tipo`, 'Extranjero');
							} else {
								localStorage.removeItem(`${prefixG}_tipo`);
							}
							
							window.location.href = `/inscripcion`;
							return;
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
					if(xhr.status == 402) //Token inválido o expirado - Sentencias prohibidas
					{
						M.toast({html: JSON.parse(xhr.response).message, classes: 'toasterror'});
						document.getElementById('loader').style.display = "none";
					}
					else
                    if (xhr.status == 409) // Conflicto - Valor duplicado
					{
                        var data = JSON.parse(xhr.response);
                        localStorage.setItem(`${prefixG}_token`, data.token);    

                        M.toast({html: JSON.parse(xhr.response).message, classes: 'toastwarning'});
                        document.getElementById(elemento).style.display = "none";
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
			}
		}	
	});
}

