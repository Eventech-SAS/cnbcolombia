function cargar(seccion, pagina, busqueda, action="lista", id=0)
{
    
	document.getElementById('loader').style.display = "flex";

    if(localStorage.getItem(`${prefijo}_filtro_${seccion}`) != undefined)
        if(localStorage.getItem(`${prefijo}_filtro_${seccion}`) != "null") 
            var filtro = localStorage.getItem(`${prefijo}_filtro_${seccion}`);
        else
            var filtro = "";
    else
        var filtro = "";

    if(localStorage.getItem(`${prefijo}_avanzado_${seccion}`) != undefined)
        if(localStorage.getItem(`${prefijo}_avanzado_${seccion}`) != "null") 
            var avanzado = localStorage.getItem(`${prefijo}_avanzado_${seccion}`);
        else
            var avanzado = "";
    else
        var avanzado = "";

    if(localStorage.getItem(`${prefijo}_avanzado2_${seccion}`) != undefined)
        if(localStorage.getItem(`${prefijo}_avanzado2_${seccion}`) != "null") 
            var avanzado2 = localStorage.getItem(`${prefijo}_avanzado2_${seccion}`);
        else
            var avanzado2 = "";
    else
        var avanzado2 = "";
	
   

    const token = localStorage.getItem(`${prefixG}_token`);
    if(token == null || token == "" || token == undefined)
    {   //Mostrar ventana de mensaje con sweetalert
        window.location = '/';
    }

    var xhr     = new XMLHttpRequest();
    var params  = "filtro="+filtro+"&avanzado="+avanzado+"&avanzado2="+avanzado2+"&busqueda="+busqueda+"&pagina="+pagina+"&action="+action+"&sede="+localStorage.getItem(`${prefixG}_sede_activa`);
    xhr.open("POST", `/views/${seccion}/_${seccion}.php`,true);
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(params);
    xhr.onreadystatechange = function()
    {
        if(xhr.readyState == 4)
        {
           console.log(xhr.responseText);
            if(xhr.status == 200)
            {
                var data = JSON.parse(xhr.responseText.trim());		
                rol = data.rol;
                var datos = data.datos;
                complemento1 = data.complemento1;
                configuracion = data.configuracion;

                // Se cargan los registros - Si se requiere recarga del header de la tabla se elimina el if
                if(document.getElementById(seccion+'-container') == null)
                    document.getElementById(seccion).innerHTML = registrosFuncion(seccion);


                var paginas = data.paginas;
                pagina  = parseInt(data.pagina_actual);
                var registros = data.registros;

                if(data.filtros)
                   var filtrosAvanzados = data.filtros;

                if(data.filtros2)
                   var filtrosAvanzados2 = data.filtros2;

                localStorage.setItem(`${prefixG}_token`, data.token);
               
                if(datos == 0)
                {
                    document.getElementById('resultado').innerHTML = "";
                    document.getElementById('paginador').innerHTML = "";
                    document.getElementById('paginadorB').innerHTML = "";
                    var registrosC = document.getElementById('registros');
                    registrosC.innerHTML = 'No hay registros';
                    history.pushState(null, "", "?s="+busqueda+"&p=1");
                    document.getElementById('loader').style.display = "none";
                }
                else
                {
                    // Mostramos los resultados
                    var contenedor = document.getElementById('resultado');
                    contenedor.innerHTML = "";
                    for(var i=0; i<datos.length; i++)
                        contenedor.innerHTML = contenedor.innerHTML + registrosFuncion(seccion+'_lista', datos[i]);

                    // Paginación
                    var paginador  = document.getElementById('paginador');
                    var paginadorB = document.getElementById('paginadorB');
                    // Verificamos qué números de páginas deben mostrarse
                    if(paginas > 5 && pagina > 3)
                    {
                        if((pagina + 2) > paginas)
                            superior = paginas;
                        else
                            superior = pagina + 2;

                        if((superior - 4) < 1)
                            inferior = 1;
                        else
                            inferior = superior - 4;
                    }
                    else
                    if(paginas > 5)
                    {
                        var inferior = 1;
                        var superior = 5;
                    }
                    else
                    {
                        var inferior = 1;
                        var superior = paginas;
                    }
                    // Mostramos las páginas del paginador
                    paginador.innerHTML = "";
                    for(var i=inferior; i<=superior; i++)
                    {
                        if(i == (pagina))
                            paginador.innerHTML = paginador.innerHTML +
                                '<li class="active"><a>'+i+'</a></li>';
                        else
                            paginador.innerHTML = paginador.innerHTML +
                                `<li class="waves-effect"><a onclick="cargar('${seccion}',${i},'${busqueda}')">${i}</a></li>`;
                    }
                    paginadorB.innerHTML = paginador.innerHTML;
                    // Verificamos si el botón atrás está activo

                    //variable de idioma
                    var p1 = 'Primera página';
                    var pU = 'Ultima página';

                    if(pagina == 1)
                    {
                        paginador.innerHTML = `<li title="${p1}" class="disabled"><a><i class="material-icons">first_page</i></a></li>` + paginador.innerHTML;
                        paginadorB.innerHTML = `<li title="${p1}" class="disabled"><a><i class="material-icons">first_page</i></a></li>` + paginadorB.innerHTML;
                    }
                    else
                    {
                        paginador.innerHTML = `<li title="${p1}" class="waves-effect"><a onclick="cargar('${seccion}',1,'${busqueda}','${action}')"><i class="material-icons">first_page</i></a></li>` + paginador.innerHTML;
                        paginadorB.innerHTML = `<li title="${p1}" class="waves-effect"><a onclick="cargar('${seccion}',1,'${busqueda}','${action}')"><i class="material-icons">first_page</i></a></li>` + paginadorB.innerHTML;
                    }
                    // Verificamos si el botón adelante está activo
                    if(pagina == paginas)
                    {
                        paginador.innerHTML = paginador.innerHTML + `<li title="${pU}" class="disabled"><a><i class="material-icons">last_page</i></a></li>`;
                        paginadorB.innerHTML = paginadorB.innerHTML + `<li title="${pU}" class="disabled"><a><i class="material-icons">last_page</i></a></li>`;
                    }
                    else
                    {
                        paginador.innerHTML = paginador.innerHTML + `<li title="${pU}" class="waves-effect"><a onclick="cargar('${seccion}',${paginas},'${busqueda}','${action}')"><i class="material-icons">last_page</i></a></li>`;
                        paginadorB.innerHTML = paginadorB.innerHTML + `<li title="${pU}" class="waves-effect"><a onclick="cargar('${seccion}',${paginas},'${busqueda}','${action}')"><i class="material-icons">last_page</i></a></li>`;
                    }
                    // Cargamos la info de registros
                    var registrosC = document.getElementById('registros');
                    registrosC.innerHTML = `<b>Registros: </b> ${registros} - <b>Páginas: </b>${paginas}`;
                    // Modificamos la URL
                    history.pushState(null, "", "?s="+busqueda+"&p="+pagina);

                    document.getElementById('loader').style.display = "none";
                }

                if(!cargado)
                {
                	var filtros = "<div class='row m-0'>";
					filtros +=
						`</div><div class='row m-0 mt-5'>
						<div onclick="filtrarEstado(1, '${modulo}')" class="filtroC" id="F_1">
							Activo
						</div>
						<div onclick="filtrarEstado(0, '${modulo}')" class="filtroC" id="F_0">
							Inactivo
						</div>
						`;

					document.getElementById('filtros').innerHTML = filtros;
					if(localStorage.getItem(`${prefijo}_filtro_${seccion}`) && localStorage.getItem(`${prefijo}_filtro_${seccion}`) != "")
                        document.getElementById('F_'+localStorage.getItem(`${prefijo}_filtro_${seccion}`)).classList.add('filtroCactivoF');
                    else
                        localStorage.setItem(`${prefijo}_filtro_${seccion}`, "");

                    
                    if(filtrosAvanzados)
                    {
                        var filtroAvanzados = "";
                        filtrosAvanzados.forEach(filtro => {
                            filtroAvanzados +=
                                `<div onclick="filtrarAvanzado('${filtro['est_id']}', '${modulo}')" class="filtroC" id="A_${filtro['est_id']}">
                                    ${filtro['est_nombre']}
                                </div>
                                `;
                        });
                        document.getElementById('avanzados').innerHTML = filtroAvanzados;

                        if(localStorage.getItem(`${prefijo}_avanzado_${seccion}`) && localStorage.getItem(`${prefijo}_avanzado_${seccion}`) != "")
                            document.getElementById('A_'+localStorage.getItem(`${prefijo}_avanzado_${seccion}`)).classList.add('avanzadoCactivoF');
                        else
                            localStorage.setItem(`${prefijo}_avanzado_${seccion}`, "");
                    }

                    if(filtrosAvanzados2)
                    {
                        var filtroAvanzados = "";
                        filtrosAvanzados2.forEach(filtro => {
                            filtroAvanzados +=
                                `<div onclick="filtrarAvanzado2('${filtro['cat_codigo']}', '${modulo}')" class="filtroC" id="A_${filtro['cat_codigo']}">
                                    ${filtro['cat_nombre']}
                                </div>
                                `;
                        });

                        document.getElementById('avanzados2').innerHTML = filtroAvanzados;

                        if(localStorage.getItem(`${prefijo}_avanzado_${seccion}`) && localStorage.getItem(`${prefijo}_avanzado_${seccion}`) != "")
                            document.getElementById('A_'+localStorage.getItem(`${prefijo}_avanzado_${seccion}`)).classList.add('avanzadoCactivoF');
                        else
                            localStorage.setItem(`${prefijo}_avanzado_${seccion}`, "");
                    }
                    
                }
                cargado = true;
                document.getElementById('loader').style.display = "none";

                var elems = document.querySelectorAll('.collapsible');
                var instances = M.Collapsible.init(elems, []);

                var elems = document.querySelectorAll('.tooltipped');
                 var instances = M.Tooltip.init(elems);
            }
            else
            if(xhr.status == 400) //Faltan credenciales
            {
                M.toast({html: JSON.parse(xhr.response).message, classes: 'toasterror'});
                document.getElementById('loader').style.display = "none";
            }
            else
            if(xhr.status == 401) //Token inválido o expirado - Sentencias prohibidas
            {
                document.getElementById('loader').style.display = "none";
                cierreSesionSeguridad(JSON.parse(xhr.response).message);
            }
            else
            {
                console.log(`ID: ${JSON.parse(xhr.response).details} - Error: ${xhr.status} - ${JSON.parse(xhr.response).message}`);
                M.toast({html: "Ha ocurrido un error. Por favor verifique su conexión a Internet.", classes: 'toasterror'});
                document.getElementById('loader').style.display = "none";
            }
        }
        else
            document.getElementById('loader').style.display = "none";


    }
}

function cierreSesionSeguridad(mensaje)
{
    //localStorage.clear(); //Modificación
    

    Swal.fire({
        title: `${mensaje}`,
        text:  `Su sesión se ha cerrado por seguridad. En caso de reinicidencia su usuario será bloqueado y reportado.`,
        icon: "error",
        confirmButtonText: "OK",
        allowOutsideClick: false,
        focusConfirm: false
        })
        .then((willDelete) =>{
        if(willDelete.isConfirmed)
           logoutFuncion();
    });
}

function limpiarError(cmp) {
    if (cmp.id == "email" || cmp.id == "email-c")
    {
        document.getElementById("email").style.backgroundColor = 'rgb(184,37,42,0)';
        if(document.getElementById("email-c"))
            document.getElementById("email-c").style.backgroundColor = 'rgb(184,37,42,0)';
    } else
    {
        if(document.getElementById(cmp.id).style.backgroundColor == 'rgba(184, 37, 42, 0.2)')
            document.getElementById(cmp.id).style.backgroundColor = 'rgb(184,37,42,0)';
    }       
}

function validarFormulario(validaciones) {
    var errores = [];
    var enviar = true;

    console.log("AAAA")

    if(debug)
        validaciones = [];

    console.log(validaciones)

    validaciones.forEach(function(validacion, i)
    {
        console.log(validacion)
        //Validamos si es un editor
        if(validacion[2] == 'editor')
            var valor = editoresA[validacion[0]].getText().trim();
        else
        {
            //Validamos si es un campo con confirmación
            var tmp = validacion[0].split("&");
            if (tmp.length == 1)
            {
                var valor = document.getElementById(tmp[0]).value;
                if (document.getElementById(tmp[0] + '-c'))
                    var valorc = document.getElementById(tmp[0] + '-c').value;
            } 
            else
            {
                var valorc = document.getElementById(tmp[0]).value;
                var valor = document.getElementById(tmp[0] + '-c').value;
            }
        }
        
        for (var j = 3; j < validacion.length; j++) {
            var tmp = validacion[j].split("=");
           
            if (tmp[0] == 'required') {

                if (valor == "" || valor == null) {
                    errores.push([validacion[0], validacion[2], "Este campo es obligatorio.", 'El campo ' + validacion[1] + ' es obligatorio']);
                    break;
                }
            } 
            else
            if (tmp[0] == 'documento')
            {
                var tipo_documento = document.getElementById('tipo_documento').value;
                if (tipo_documento == "CC")
                {
                    if (!/^(1|2)\d{9}$/.test(valor) && !/^\d{7,8}$/.test(valor))
                    {
                        errores.push([validacion[0], validacion[2], "El número de documento no es válido. Debe contener entre 7 y 10 digitos. Solo debe contener números", 'El número de documento no es válido. Debe contener entre 7 y 10 digitos. Solo debe contener números']);
                     break;
                    }

                }
                else
                if (tipo_documento == "CE")
                {
                    if (!/^[a-zA-Z0-9]{6,18}$/.test(valor) && /^[a-zA-Z]+$/.test(valor))
                    {
                        errores.push([validacion[0], validacion[2], "El documento no es válido. Debe contener entre 6 y 18 digitos. Entre letras y números", 'El documento no es válido. Debe contener entre 6 y 18 digitos. Entre letras y números']);
                     break;
                    }

                }
                else
                if (tipo_documento == "PP")
                {
                    if (!/^[a-zA-Z0-9]{6,14}$/.test(valor) && /^[a-zA-Z]+$/.test(valor))
                    {
                        errores.push([validacion[0], validacion[2], "El documento no es válido. Debe contener entre 6 y 14 digitos. Entre letras y números", 'El documento no es válido. Debe contener entre 6 y 18 digitos. Entre letras y números']);
                     break;
                    }
                }
            } 
            else
            if (tmp[0] == 'length') {
                var valores = tmp[1].split(",");

                if (valor.length < valores[0] || valores.length > valores[1]) {
                    errores.push([validacion[0], validacion[2], 'El campo debe contener entre ' + valores[0] + ' y ' + valores[1] + ' caracteres.', 'El campo debe contener entre ' + valores[0] + ' y ' + valores[1] + ' caracteres.']);
                    break;
                }
            } 
            else
            if (tmp[0] == 'minmax') {
                var valores = tmp[1].split(",");

                if (parseFloat(valor) < valores[0] || parseFloat(valor) > valores[1]) {
                    errores.push([validacion[0], validacion[2], 'El campo debe estar entre ' + valores[0] + ' y ' + valores[1] + '.', 'El campo debe estar entre ' + valores[0] + ' y ' + valores[1] + '.']);
                    break;
                }
            } 
            else
            if (tmp[0] == 'email') {
                if (!(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(valor))) {
                    errores.push([validacion[0], validacion[2], 'El correo electrónico debe ser válido. Ej: nombre@correo.com', 'El correo electrónico debe ser válido. Ej: nombre@correo.com']);
                }
            } else
            if (tmp[0].toLowerCase() == 'confirmacion') {
                

                var valorT = valor.toLowerCase();
                var valorcT = valorc.toLowerCase();
                if (valorT != valorcT) {
                    errores.push([validacion[0], validacion[2], "Los campos deben coincidir", 'Los campos ' + validacion[1] + ' debe coincidir']);
                }
            }
        }
    });

    if (errores.length > 0) {
        errores.forEach(function(errorT, index) {
            M.toast({ html: errorT[3], classes: 'toastwarning' });

            if(errorT[1] == 'select')
                document.getElementById(errorT[0]).nextSibling.firstElementChild.style.backgroundColor = 'rgb(184,37,42,0.2)';
            else
            if(errorT[1] == 'dropify')
            {
                document.getElementById(errorT[0]).parentNode.style.backgroundColor = 'rgb(184,37,42,0.2)';
            }
            else
                document.getElementById(errorT[0]).style.backgroundColor = 'rgb(184,37,42,0.2)';
        });
        enviar = false;
    }

    return enviar;
}

function consolelog(linea, mensaje, tipo = "l"){
    if(debug){
        if(tipo == 'e')
            console.error(`[${linea}]`, mensaje);
        else
        if(tipo == 'w')
            console.warn(`[${linea}]`, mensaje);
        else
            console.log(`[${linea}]`, mensaje);
    }
}

function estadoFuncion(valor, texto = false)
{
    if(texto)
    {
        if(valor == 1)
            return `Activo`;
        else
            return `Inactivo`;
    }
    else
    {
        if(valor == 1)
            return `<i class="material-icons verde-cl estados" title="Activo">check</i>`;
        else
            return `<i class="material-icons rojo-cl estados" title="Inactivo">cancel</i>`;
    }
    
}

function estadoPago(valor, texto = false)
{
   
    if(valor == "Aprobado")
        return `<i class="material-icons verde-cl estados" title="Activo">check</i>`;
    else
    if(valor == "Pendiente")
        return `<i class="material-icons amarillo-cl estados" title="Pendiente">pending</i>`;
    else
        return `<i class="material-icons rojo-cl estados" title="Inactivo">cancel</i>`;
    
    
}

function estadoAvanzadoFuncion(valor)
{
    if(valor == 0)
        return `<i class="material-icons amarillo-cl estados" title="Pendiente">pending</i>`;
    else 
    if(valor == 1)
        return `<i class="material-icons verde-cl estados" title="Iniciada">play_circle</i>`;
    else
    if(valor == 2)
        return `<i class="material-icons amarillo-cl estados" title="Pausada">pause_circle</i>`;
    else
    if(valor == 3)
        return `<i class="material-icons azul-cl estados" title="Finalizada">check_circle</i>`;
    else
    if(valor == 4)
        return `<i class="material-icons rojo-cl estados" title="Cancelada">cancel</i>`;
    else
    if(valor == 5)
        return `<i class="material-icons azul-cl estados" title="Programado">check</i>`;
}

function celularFuncion(dato) {if(dato != "") return `<a href='tel:${dato}'>${dato}</a>`; else return ''; }

function telefonoFuncion(dato) {if(dato != "") return `<a href='tel:+57${dato}'>${dato}</a>`; else return ''; }

function emailFuncion(dato) {if(dato != "") return `<a href='mailto:${dato}'>${dato}</a>`; else return ''; }


function horaFuncion(dato) {if(dato != "") return dato.substring(0, 5); else return ''; }
function fechaFuncion(fecha, formato = "ymdh", abreviado = false) {
    // YMDH - Día, mes, año, hora
    // YMD - Día, mes, año
    // MD - Día, mes
    if (fecha == "0000-00-00 00:00:00" || fecha == "0000-00-00" || fecha == null || fecha == "")
        return " Sin establecer";
    else
    {
        console.log(fecha)
        var tmp = fecha.split(" ");
        var tmpF = tmp[0].split("-");
        if (tmp[1] != undefined)
            var tmpH = tmp[1].split(":");
        else
            var tmpH = [null, null, null];

        if (tmpF[1] == "01") {
            if (abreviado)
                var mes = 'Ene';
            else
                var mes = 'Enero';
        } else
        if (tmpF[1] == "02") {
            if (abreviado)
                var mes = 'Feb';
            else
                var mes = 'Febrero';
        } else
        if (tmpF[1] == "03") {
            if (abreviado)
                var mes = 'Mar';
            else
                var mes = 'Marzo';
        } else
        if (tmpF[1] == "04") {
            if (abreviado)
                var mes = 'Abr';
            else
                var mes = 'Abril';
        } else
        if (tmpF[1] == "05") {
            if (abreviado)
                var mes = 'May';
            else
                var mes = 'Mayo';
        } else
        if (tmpF[1] == "06") {
            if (abreviado)
                var mes = 'Jun';
            else
                var mes = 'Junio';
        } else
        if (tmpF[1] == "07") {
            if (abreviado)
                var mes = 'Jul';
            else
                var mes = 'Julio';
        } else
        if (tmpF[1] == "08") {
            if (abreviado)
                var mes = 'Ago';
            else
                var mes = 'Agosto';
        } else
        if (tmpF[1] == "09") {
            if (abreviado)
                var mes = 'Sep';
            else
                var mes = 'Septiembre';
        } else
        if (tmpF[1] == "10") {
            if (abreviado)
                var mes = 'Oct';
            else
                var mes = 'Octubre';
        } else
        if (tmpF[1] == "11") {
            if (abreviado)
                var mes = 'Nov';
            else
                var mes = 'Noviembre';
        } else {
            if (abreviado)
                var mes = 'Dic';
            else
                var mes = 'Diciembre';
        }
        if (formato == "ymdh")
            return mes + " " + tmpF[2] + " de " + tmpF[0] + " - " + tmpH[0] + ":" + tmpH[1];
        else
        if (formato == "ymd")
            return mes + " " + tmpF[2] + " de " + tmpF[0];
        else
        if (formato == "md")
            return mes + " " + tmpF[2];
    }
}

function filtrarEstado(filtro, seccion)
{
	if(parseInt(localStorage.getItem(`${prefijo}_filtro_${seccion}`)) === parseInt(filtro))
	{
		var elementos = document.getElementsByClassName('filtroCactivoF');
		if(elementos.length > 0)
		{
			elementos[0].classList.remove('filtroCactivoF');
		}
		localStorage.setItem(`${prefijo}_filtro_${seccion}`, "");
	}
	else
	{
		localStorage.setItem(`${prefijo}_filtro_${seccion}`, filtro);

		var elementos = document.getElementsByClassName('filtroCactivoF');
		if(elementos.length > 0)
		{
			elementos[0].classList.remove('filtroCactivoF');
		}

		document.getElementById('F_'+filtro).classList.add('filtroCactivoF');
	}

	var variables = obtener_variables();
	cargar(seccion, variables[0],variables[1]);	
}

function filtrarAvanzado(filtro, seccion)
{
	if(localStorage.getItem(`${prefijo}_avanzado_${seccion}`) === filtro)
	{
		var elementos = document.getElementsByClassName('avanzadoCactivoF');
		if(elementos.length > 0)
		{
			elementos[0].classList.remove('avanzadoCactivoF');
		}
		localStorage.setItem(`${prefijo}_avanzado_${seccion}`, "");
	}
	else
	{
		localStorage.setItem(`${prefijo}_avanzado_${seccion}`, filtro);

		var elementos = document.getElementsByClassName('avanzadoCactivoF');
		if(elementos.length > 0)
		{
			elementos[0].classList.remove('avanzadoCactivoF');
		}

		document.getElementById('A_'+filtro).classList.add('avanzadoCactivoF');
	}

	var variables = obtener_variables();
	cargar(seccion, variables[0],variables[1]);	
}

function filtrarAvanzado2(filtro, seccion)
{
    //Si no existe la variable en localStorage, la creamos
    if(localStorage.getItem(`${prefijo}_avanzado2_${seccion}`) == null || localStorage.getItem(`${prefijo}_avanzado2_${seccion}`) == undefined)
        localStorage.setItem(`${prefijo}_avanzado2_${seccion}`, "");

    //Obtenemos filtros actuales
    var filtrosAnteriores = localStorage.getItem(`${prefijo}_avanzado2_${seccion}`).split(",");
    
    //Si el filtro ya existe, lo quitamos
    if(filtrosAnteriores.indexOf(filtro) !== -1)
    {
        filtrosAnteriores.splice(filtrosAnteriores.indexOf(filtro), 1);
        localStorage.setItem(`${prefijo}_avanzado2_${seccion}`, filtrosAnteriores.join(","));
        document.getElementById('A_'+filtro).classList.remove('avanzado2CactivoF');
    }
    else
    {
        //Si no existe, lo agregamos
        if(filtrosAnteriores[0] == "")
            filtrosAnteriores[0] = filtro;
        else
            filtrosAnteriores.push(filtro);

        localStorage.setItem(`${prefijo}_avanzado2_${seccion}`, filtrosAnteriores.join(","));
        document.getElementById('A_'+filtro).classList.add('avanzado2CactivoF');
    }

	var variables = obtener_variables();
	cargar(seccion, variables[0],variables[1]);
}

function obtener_variables(){
    var url = window.location.search.split("?");
    url = url[1].split("&");
    var variables = [];
    for(var i=0; i<url.length; i++)
    {
        var temp = url[i].split("=");
        if(temp[0] == 'p')
            variables[0] = temp[1];
        if(temp[0] == 's')
            variables[1] = temp[1];
    }

    return variables;
}


function buscarFuncion(seccion, cmp){
    var variables = obtener_variables();
    var busqueda = document.getElementById(cmp).value;
    var pagina = variables[0];


    if(event.which == 13 || event.which == 9)
    {
        if(localStorage.busqueda == "")
            var action = "lista";
        else
            var action = localStorage.busqueda;

         cargar(seccion, pagina, busqueda, action);
    }
}

/**
 * Genera los options de un select.
 * @param {Array<Object>} elementos     - Las opciones del select.
 * @param {string|number} dato          - El valor seleccionado al editar o 0 al crear.
 * @param {string} accion               - crear o editar.
 * @param {string} optionValue          - slug del valor del option.
 * @param {Array<string>} optionText    - slug(s) de los textos a mostrar en el option.
 * @returns {string}                    - El HTML de todas las etiquetas <option>.
 */
function generarSelect(elementos, dato, accion, optionValue, optionText)
{
    dato = dato+"";
    if(dato != 0)
        var dato = dato.split(",");
   
	var options = "";
	for(var i=0; i<elementos.length; i++)
	{
		var textAA = [];
		optionText.forEach(function(txt){
			textAA.push(elementos[i][txt]);
		});

		if(accion == 'crear')
			options = options + `<option value="${elementos[i][optionValue]}">${textAA.join(" ")}</option>`;
		else
		{
			if(dato.indexOf(elementos[i][optionValue]+"") != -1)
				var selected = 'selected';
			else
			    var selected = '';


			options = options + `<option ${selected} value="${elementos[i][optionValue]}">${textAA.join(" ")}</option>`;
		}
	}
	return options;
}

function inicializarTelefonos(telefonos)
{
    telefonos.forEach(telefono => {
        console.log(intlTelInput(document.querySelector(`#${telefono.campo}`), {
            initialCountry: "co",
            strictMode: true,
            utilsScript: "/js/utils.js?1722010922246",
            hiddenInput: (telInputName) => ({
                phone: telefono.campo,
            }),
        }));
    });
}

function inicializarEditores(editores)
{    
    var quillA = {}; 

    editores.forEach(editor => {
        console.log(editor)
        if(editor.palabras == undefined)
            editor.palabras = false;
        if(editor.caracteres == undefined)
            editor.caracteres = false;
        if(editor.modulo == undefined)
            editor.modulo = "";


        quillA[editor.campo] = new Quill(`#${editor.campo}`, {
            theme: 'snow',
            modules:
            {
                toolbar:
                {
                    container: [
                        ['bold', 'italic', 'underline'], 
                        [{ 'size': ['small', false, 'large', 'huge'] }],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'font': [] }],
                        ['link', 'image'],     
                        [{ 'align': [] }],
                    ],
                    handlers:
                    {
                        image: function() {
                            const quill = this.quill;
                            const input = document.createElement('input');
                            input.setAttribute('type', 'file');
                            input.setAttribute('accept', 'image/*');
                            input.click();

                            input.onchange = async () => {
                                const file = input.files[0];

                                if (/^image\//.test(file.type)) {

                                    try {
                                        const imagen_comprimida = await comprimirImagen(file, 0.9, 1200);

                                        const formData = new FormData();
                                        formData.append('imagen', imagen_comprimida);
                                        formData.append('extension', file.name.split(".").pop());
                                        formData.append('modulo', editor.modulo);
                                        formData.append('action', "subir_imagen_quill");

                                        // 3. Subir al servidor
                                        const response = await fetch('/inc/general.php', {
                                            method: 'POST',
                                            headers: { 'Authorization': `Bearer ${localStorage.getItem(`${prefixG}_token`)}` },
                                            body: formData
                                        });

                                        if (!response.ok) throw new Error('Error al subir');

                                        const data = await response.json();

                                        // 4. Insertar la URL devuelta por el servidor en el editor
                                        const range = quill.getSelection();
                                        quill.insertEmbed(range.index, 'image', data.url);
                                    }
                                    catch (error)
                                    {
                                        console.log(error);
                                        M.toast({html: "Ha ocurrido un error al subir la imagen. Intente de nuevo.", classes: 'toasterror'});
                                    }  
                                }
                            };
                        }                       
                    }
                }
                
            }
        });

        quillA[editor.campo].on('text-change', function(delta, oldDelta, source) {
            //Quitamos color de error si lo tiene
            if(document.getElementById(editor.campo).style.backgroundColor == 'rgba(184, 37, 42, 0.2)')
                document.getElementById(editor.campo).style.backgroundColor = 'rgb(184,37,42,0)';

            //Si el editor está vacío, guardamos cadena vacía
            if(quillA[editor.campo].getText().trim() == '')
                document.getElementById(`${editor.campo}_quill`).value = '';
            else
                document.getElementById(`${editor.campo}_quill`).value = quillA[editor.campo].root.innerHTML;

            console.log("Texto cambiado en editor:", editor.palabras_maximas);
            if(editor.max_palabras)
            {
                console.log("Validando palabras máximas")
                const text = quillA[editor.campo].getText().trim();
                const palabras = text.length > 0 ? text.split(/\s+/).length : 0;

                console.log("Palabras actuales:", palabras);

                if (palabras > editor.max_palabras) {
                    M.toast({html: "La cantidad de palabras excede el límite permitido. Límite: " + editor.max_palabras, classes: 'toastwarning'});
                   

                    quillA[editor.campo].setContents(oldDelta);/*
                    
                    // Borramos desde el final de la última palabra permitida hasta el final del documento
                    quillA[editor.campo].deleteText(longitudPermitida, quill.getLength());*/
                }
            }

            //Validamos si cuenta palabras. Mostramos en el span correspondiente
            if(editor.palabras)
            {
                const text = quillA[editor.campo].getText().trim();
                const palabras = text.length > 0 ? text.split(/\s+/).length : 0;
                document.getElementById(`${editor.campo}_palabras`).innerHTML = `<b>Palabras: </b> ${palabras}`;
            }
            //Validamos si cuenta caracteres. Mostramos en el span correspondiente
            if(editor.caracteres)
            {
                const text = quillA[editor.campo].getText().trim();
                const letras = text.length > 0 ? text.length : 0;
                document.getElementById(`${editor.campo}_caracteres`).innerHTML = `<b>Caracteres: </b> ${letras}`;
            }
            
        });

        if(quillA[editor.campo].getText().trim() == '')
            document.getElementById(`${editor.campo}_quill`).value = '';
        else
            document.getElementById(`${editor.campo}_quill`).value = quillA[editor.campo].root.innerHTML;

        //Validamos si cuenta palabras. Mostramos en el span correspondiente
        if(editor.palabras)
        {
            const text = quillA[editor.campo].getText().trim();
            const palabras = text.length > 0 ? text.split(/\s+/).length : 0;
            document.getElementById(`${editor.campo}_palabras`).innerHTML = `<b>Palabras: </b> ${palabras}`;
        }
        //Validamos si cuenta caracteres. Mostramos en el span correspondiente
        if(editor.caracteres)
        {
            const text = quillA[editor.campo].getText().trim();
            const letras = text.length > 0 ? text.length : 0;
            document.getElementById(`${editor.campo}_caracteres`).innerHTML = `<b>Caracteres: </b> ${letras}`;
        }
    });
    return quillA;
}

/**
 * Inicializa los selects con Selectize.js - Retorna un array con los selects generados.
 * @param {Array<Object>} selects   - Las opciones del select.
 * @returns {Array<Object>}         - Un array con los selects generados.
 */
function inicializarSelects(selects)
{
    
    var resultA = {};
   
    selects.forEach(select => {
        if(select.funcion == undefined)
            select.funcion = function(){};
        
        if(select.multiple)
        {
            var selectizeConfig = {
                plugins: ["remove_button"],
  				delimiter: ";",
                placeholder: 'Seleccione una opción',
                onChange: function(value)
                {
                    select.funcion();
                    $(this.$wrapper).find('.selectize-input').css('background-color', 'rgb(184,37,42,0)');	
                    document.getElementById(`${select.campo}_selectize`).value = resultA[select.campo][0].selectize.getValue().join(";");
                }
            };
        }
        else
        {
            var selectizeConfig = {
                placeholder: 'Seleccione una opción',
                onChange: function(value)
                {
                    console.log(select.funcion)
                    select.funcion();

                    $(this.$wrapper).find('.selectize-input').css('background-color', 'rgb(184,37,42,0)');								
                }
            };
        }

        const selectElement = $(`#${select.campo}`);
        const selectizeInstance = selectElement.selectize(selectizeConfig);

        if (select.guardar || select.multiple)
        {
            resultA[select.campo] = selectizeInstance;
        }
    });
    return resultA;
}

function inicializarCleaves(cleaves)
{
    var resultA = {};
    
    cleaves.forEach(cleave => {

        document.getElementById(cleave.campo).addEventListener('change', function(){
            let cleaveF = cleavesA[cleave.campo];
            let rawValue = cleaveF.getRawValue();
    
        // Si tiene prefijo (como '$ '), removerlo
        if (cleaveF.properties.prefix)
            rawValue = rawValue.replace(cleaveF.properties.prefix, '').trim();
            //Si existe un campo oculto para el valor sin formato, actualizarlo
            if(document.getElementById(`${cleave.campo}_cleave`))
                document.getElementById(`${cleave.campo}_cleave`).value = rawValue;
        });
        
        if(cleave.tipo == "moneda")
        {
            resultA[cleave.campo] = 
                new Cleave(`.${cleave.campo}`, {
                numeral: true,             // Activa el modo numérico
                numeralThousandsGroupStyle: 'thousand', // Estilo de agrupación de miles (1,000,000)
                prefix: '$',              // Agrega el símbolo de moneda (ejemplo para dólar o peso)
                numeralDecimalMark: ',',   // Usa punto como separador decimal
                delimiter: '.',            // Usa coma como separador de miles
                
            });
        }
        else
        if(cleave.tipo == "number")
        {
            resultA[cleave.campo] = 
                new Cleave(`.${cleave.campo}`, {
                numeral: true,             // Activa el modo numérico
                numeralThousandsGroupStyle: 'thousand', // Estilo de agrupación de miles (1,000,000)
                numeralDecimalMark: ',',   // Usa punto como separador decimal
                delimiter: '.',            // Usa coma como separador de miles
                
            });
        }
        else
        if(cleave.tipo == "porcentaje")
        {
            resultA[cleave.campo] = 
                new Cleave(`.${cleave.campo}`, {
                numeral: true,             // Activa el modo numérico
                numeralThousandsGroupStyle: 'thousand', // Estilo de agrupación de miles (1,000,000)
                numeralDecimalMark: ',',   // Usa punto como separador decimal
                delimiter: '.',            // Usa coma como separador de miles
                prefix: '%',  
            });
        }
    });
    return resultA;
}

function inicializarDropifys(dropifys)
{
    var resultA = {};
   
    dropifys.forEach(dropif => {
        if(dropif.funcion == undefined)
            dropif.funcion = function(){};

        var dropifyInstance = $(`#${dropif.campo}`).dropify({
            allowedFileExtensions: dropif.tipo,
            messages: {
                'default': 'Arrastre y suelte un archivo aquí o haga clic',
                'replace': 'Arrastra y suelta o haz clic para reemplazar',
                'remove':  'Eliminar',
                'error':   'Ooops, ha ocurrido un error',
                'imageFormat': 'El formato de imagen no es válido. Solo se aceptan JPG, PNG y JPEG'
            },
            error: {
            'fileExtension': 'Solo se permiten archivos en formato ({{ value }}).',
            'imageFormat': 'El formato de imagen no es válido. Solo se acepta un formato '+posters_orientacion
            }
        });

        dropifyInstance.on('dropify.beforeClear', function(event, element){
            document.getElementById(`${dropif.campo}_control`).value = "";
        });
    });
    return resultA;
}

function validarFormularioGestor(modulo, accion, subida = false)
{
    
   
    var elemento = "loader";

    if(subida)
        var elemento = "progreso";
 
    const formulario = document.getElementById(modulo+'-form');

    // Evita listeners duplicados al reusar esta inicialización
    if(formulario._submitHandler)
        formulario.removeEventListener('submit', formulario._submitHandler);

    const submitHandler = async function(event){
		event.preventDefault();
        

        controlFormulario(modulo, accion);
        
        console.log(validaciones)
	
		var respuesta = validarFormulario(validaciones);
		if(respuesta)
		{
			document.getElementById(elemento).style.display = "flex";
			var params = new FormData(document.getElementById(modulo+'-form'));
            
            // Optimizar imágenes antes de enviar
            await optimizarImagenesFormData(params);            
			var xhr = new XMLHttpRequest();
			xhr.upload.addEventListener("progress", progressHandler, false);
			xhr.addEventListener("load", completeHandler, false);
			xhr.addEventListener("error", errorHandler, false);
			xhr.addEventListener("abort", abortHandler, false);
			xhr.open('POST', `/views/${modulo}/_${modulo}.php`, true);
            xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(`${prefixG}_token`));
            
			xhr.send(params);
			xhr.onreadystatechange = function()
			{
				if (xhr.readyState == 4)
				{
					if (xhr.status == 200)
					{
                        console.log(xhr.response)
                        var data = JSON.parse(xhr.response);
                        localStorage.setItem(`${prefixG}_token`, data.token);
                        
                        if(data.sin_cambios)
                        {
                            M.toast({html: `No se detectaron cambios.`, classes: 'toastwarning'});
                            $('#modal-'+modulo).modal('close');
                            document.getElementById('modal-'+modulo).innerHTML = "";
                        }
                        else
                        {
                            console.log(accion)
                            if(accion == "crear")
                                M.toast({html: `${tratamiento} ${seccion_legible} se ha creado correctamente.`, classes: 'toastdone'});
                            else
                            if(accion == "editar")
                                M.toast({html: `${tratamiento} ${seccion_legible} se ha editado correctamente.`, classes: 'toastdone'});
                            else
                            if(accion == "horarios")
                                M.toast({html: `Los horarios se han asignado correctamente.`, classes: 'toastdone'});
                            else
                                M.toast({html: `El registro se ha gestionado correctamente.`, classes: 'toastdone'});

                            //Obtenemos la URL actual para detectar si estamos en el módulo correspondiente, de ser así recargamos la lista
                            let urlActual = window.location.pathname.split("/")[1];
                            if(modulo == "trabajo")
                            {
                                var correos = data.correos_enviados;
                                if(correos.length > 0)
                                {
                                    correos.forEach(correo => {
                                        if(!correo)
                                        {
                                            M.toast({html: `Error al enviar el correo ${correo}.`, classes: 'toasterror'});
                                        }
                                    });
                                }

                                cargarTrabajo(data.codigo);
                            }
                            else
                            {
                                if(data.correos_enviados != undefined)
                                {
                                    console.log(data.correos_enviados)
                                    var correos = data.correos_enviados;
                                    if(correos.length > 0)
                                    {
                                        correos.forEach(correo => {
                                            if(!correo)
                                            {
                                                M.toast({html: `Error al enviar el correo ${correo}.`, classes: 'toasterror'});
                                            }
                                        });
                                    }
                                }
                                
                                if(!debug)
                                {
                                    //Cerramos el modal
                                    $('#modal-'+modulo).modal('close');
                                   
                                    var variables = obtener_variables();
                                    document.getElementById('modal-'+modulo).innerHTML = "";
                                    cargar(modulo, variables[0],variables[1]);
                                }
                            }                           
                        }                
                        document.getElementById(elemento).style.display = "none";
					}
                    else
                    if(xhr.status == 401) //Token inválido o expirado - Sentencias prohibidas
                    {
                        console.log(xhr.response)
                        document.getElementById(elemento).style.display = "none";
                        cierreSesionSeguridad(JSON.parse(xhr.response).message)
                    }
                    else
                    if (xhr.status == 403) // Conflicto - Valor duplicado
					{
                       
                        M.toast({html: "No hay cupos disponibles para crear una nueva inscripción.", classes: 'toastwarning'});
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
                    if (xhr.status == 410) // Conflicto - Valor duplicado
					{
                       
                        M.toast({html: "No hay datos para subir", classes: 'toastwarning'});
                        document.getElementById(elemento).style.display = "none";
                    }
                    else
                    if(xhr.status == 415) //Tipo de archivo no permitido
                    {
                        M.toast({html: JSON.parse(xhr.response).message, classes: 'toastwarning'});
                        document.getElementById(elemento).style.display = "none";
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
                        
                        document.getElementById(elemento).style.display = "none";
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
				document.getElementById(elemento).style.display = "none";
			}
			function abortHandler(event) {
                console.log(xhr.response)
				M.toast({ html: "Ha ocurrido un error. Por favor intente de nuevo. Código: " + data, classes: 'toastwarning' });
				document.getElementById(elemento).style.display = "none";
			}	
		}
    };

    formulario._submitHandler = submitHandler;
    formulario.addEventListener('submit', submitHandler);
}

function desactivarFuncion(id, seccion_legible, modulo){
    Swal.fire({
        title: `¿Estás seguro de desactivar ${tratamiento} ${seccion_legible}?`,
        icon: "warning",

        showCancelButton: true,
        confirmButtonText: "Desactivar",
        cancelButtonText: "Cancelar",
        allowOutsideClick: false,
        reverseButtons: true,
        focusConfirm: false
        })

        .then((willDelete) =>{
        if(willDelete.isConfirmed)
        {
        	document.getElementById('loader').style.display = "flex";
        	console.log(modulo);
            var xhr = new XMLHttpRequest();
            var params = "id="+id+"&action=desactivar";
            xhr.open('POST', `/views/${modulo}/_${modulo}.php`, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(`${prefixG}_token`));
            xhr.send(params);
            xhr.onreadystatechange = function()
            {
                if(xhr.readyState == 4)
                {
                    if (xhr.status == 200)
					{      
                        var data = JSON.parse(xhr.response);
                        localStorage.setItem(`${prefixG}_token`, data.token);                
                       
                        M.toast({html: `${tratamiento} ${seccion_legible} se ha desactivado correctamente.`, classes: 'toastdone'});

                        if(!debug)
                        {
                            $('#modal-'+modulo).modal('close');
                            
                            document.getElementById('modal-'+modulo).innerHTML = "";
                            
                        }
                        var variables = obtener_variables();
                        cargar(modulo, variables[0],variables[1]);	
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
                        //Cualquier otro error
                        var data = JSON.parse(xhr.response);
                        localStorage.setItem(`${prefixG}_token`, data.token);    

                        console.log(`ID: ${JSON.parse(xhr.response).details} - Error: ${xhr.status} - ${JSON.parse(xhr.response).message}`);
                        M.toast({html: "Ha ocurrido un error. Por favor verifique su conexión a Internet.", classes: 'toasterror'});
                        document.getElementById('loader').style.display = "none";
                    }
                    
                }
            }
        } 
    });
}

function activarFuncion(id, seccion_legible, modulo){
    Swal.fire({
        title: `¿Estás seguro de activar ${tratamiento} ${seccion_legible}?`,
        icon: "warning",

        showCancelButton: true,
        confirmButtonText: "Activar",
        cancelButtonText: "Cancelar",
        allowOutsideClick: false,
        reverseButtons: true,
        focusConfirm: false
        })

        .then((willDelete) =>{
        if(willDelete.isConfirmed)
        {
        	document.getElementById('loader').style.display = "flex";
        	console.log(modulo);
            var xhr = new XMLHttpRequest();
            var params = "id="+id+"&action=activar";
            xhr.open('POST', `/views/${modulo}/_${modulo}.php`, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(`${prefixG}_token`));
            xhr.send(params);
            xhr.onreadystatechange = function()
            {
                if(xhr.readyState == 4)
                {
                    if (xhr.status == 200)
					{       
                        var data = JSON.parse(xhr.response);
                        localStorage.setItem(`${prefixG}_token`, data.token);    

                        M.toast({html: `${tratamiento} ${seccion_legible} se ha activado correctamente.`, classes: 'toastdone'});

                        if(!debug)
                        {
                            $('#modal-'+modulo).modal('close');
                            
                            document.getElementById('modal-'+modulo).innerHTML = "";
                            
                        }
                        var variables = obtener_variables();
                        cargar(modulo, variables[0],variables[1]);	
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
                        localStorage.setItem(`${prefixG}_token`, data.token);    

                        //Cualquier otro error
                        console.log(`ID: ${JSON.parse(xhr.response).details} - Error: ${xhr.status} - ${JSON.parse(xhr.response).message}`);
                        M.toast({html: "Ha ocurrido un error. Por favor verifique su conexión a Internet.", classes: 'toasterror'});
                        document.getElementById('loader').style.display = "none";
                    }
                    
                }
            }
        } 
    });
}

function eliminarFuncion(id, seccion_legible, modulo){
    Swal.fire({
        title: `¿Estás seguro de eliminar ${tratamiento} ${seccion_legible}?`,
        text: "Esta acción no se puede deshacer.",
        icon: "error",

        showCancelButton: true,
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar",
        allowOutsideClick: false,
        reverseButtons: true,
        focusConfirm: false
        })

        .then((willDelete) =>{
        if(willDelete.isConfirmed)
        {
        	document.getElementById('loader').style.display = "flex";
        	console.log(modulo);
            var xhr = new XMLHttpRequest();
            var params = "id="+id+"&action=eliminar";
            xhr.open('POST', `/views/${modulo}/_${modulo}.php`, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem(`${prefixG}_token`));
            xhr.send(params);
            xhr.onreadystatechange = function()
            {
                if(xhr.readyState == 4)
                {
                    if (xhr.status == 200)
					{         
                        var data = JSON.parse(xhr.response);
                        localStorage.setItem(`${prefixG}_token`, data.token);    
                                     
                        M.toast({html: `${tratamiento} ${seccion_legible} se ha eliminado correctamente.`, classes: 'toastdone'});

                        if(!debug)
                        {
                            $('#modal-'+modulo).modal('close');
                            document.getElementById('modal-'+modulo).innerHTML = "";
                        }
                        var variables = obtener_variables();
                        cargar(modulo, variables[0],variables[1]);	
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
                        localStorage.setItem(`${prefixG}_token`, data.token);    

                        //Cualquier otro error
                        console.log(`ID: ${JSON.parse(xhr.response).details} - Error: ${xhr.status} - ${JSON.parse(xhr.response).message}`);
                        M.toast({html: "Ha ocurrido un error. Por favor verifique su conexión a Internet.", classes: 'toasterror'});
                        document.getElementById('loader').style.display = "none";
                    }
                    
                }
            }
        } 
    });
}

function copiarContenido(cmp){
    var seleccion = document.createRange();
    seleccion.selectNodeContents(cmp);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(seleccion);
    var res = document.execCommand('copy');
    window.getSelection().removeRange(seleccion);
    if(res)
        M.toast({html: "El contenido se ha copiado correctamente", classes: 'toastdone'});
}

function mostrar_detalle(cmp)
{
    document.getElementById('modal-auxiliar1').innerHTML = 
    `
        <div class="modal-content">
            <span class="modal-action modal-close"><i class="material-icons">cancel</i></span>
            <div id="breadcrumbs-wrapper" class="breadcrumbs-bg-image">
                <div class="container mt-0">
                    <div class="row mb-0">
                        <div class="col s12 m11 l11">
                            <h5 class="breadcrumbs-title mt-0 mb-0"><span>Detalles del registro</span></h5>
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel">
                <div class="row">
                    
                    <div class="col m12 s12">

                        ${cmp}
                    </div>
                </div>
            </div>
        </div>;
    `;;
    $('#modal-auxiliar1').modal({dismissible: false});
    var instance = M.Modal.getInstance(document.getElementById('modal-auxiliar1'));
    instance.open();
}

function logoutFuncion(mensaje)
{
    console.log(prefixG)
    
    localStorage.removeItem(`${prefixG}_token`);
    localStorage.removeItem(`${prefixG}_sede_activa`);

    if(prefixG == "afeA")
    {
        window.location = '/login_asistente';
    }
    else
    {
        
        window.location = '/admin';
    }
    //localStorage.clear(); //Modificación
    
}

function precioFuncion(valor, moneda)
{
    consolelog (valor,moneda);
    return new Intl.NumberFormat('es-CO', {
		style: 'currency',
		currency: 'COP',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(valor);
}

function tipoFuncion(valor, tipo)
{
    console.log(valor, tipo);
    if(tipo == 'moneda')
        return precioFuncion(valor);
    else
    if(tipo == 'number')
        return new Intl.NumberFormat("es-CO").format(valor);
    else
        return valor;
}

function valorFuncion(valor, tipo){
    console.log(valor, tipo);
    if(tipo == "Egreso")
        return valor * -1;
    else
        return valor;
}

function calcularFechaConDias(fechaInicial, diasASumar, habiles = false) {
	// Convertir la fecha inicial a objeto Date
	let fecha = new Date(fechaInicial);
	
    if(habiles)
        var diasPermitidos = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];
    else
    {    
		fecha.setDate(fecha.getDate() + diasASumar);
		return fecha.toISOString().split('T')[0];
	}
	
	// Mapeo de nombres de días a números (0 = Domingo, 1 = Lunes, etc.)
	const mapaDias = {
		'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3,
		'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6
	};
	
	// Convertir nombres de días a números
	const diasValidosNumeros = diasPermitidos.map(dia => 
		mapaDias[dia.toLowerCase()]
	).filter(num => num !== undefined);
	
	// Determinar si vamos hacia adelante o hacia atrás
	const direccion = diasASumar >= 0 ? 1 : -1;
	const diasPorContar = Math.abs(diasASumar);
	let diasContados = 0;
	
	// Contar días válidos hasta alcanzar la cantidad deseada
	while (diasContados < diasPorContar) {
		fecha.setDate(fecha.getDate() + direccion);
		
		// Verificar si el día actual está en los días permitidos
		if (diasValidosNumeros.includes(fecha.getDay())) {
			diasContados++;
		}
	}
	return fecha.toISOString().split('T')[0];
}

function historialFuncion(texto)
{
    var textoA = texto.split("\n");
    return textoA.join("<br>");
}

// Función para detectar si es dispositivo móvil o desktop
function isMobile() {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

function isDesktop() {
	return !isMobile();
}

function contarCaracteres(cmp)
{
    var texto = cmp.value;
    console.log(cmp.id)
    document.getElementById(`${cmp.id}_caracteres`).innerHTML = `<b>Caracteres: </b> ${texto.length}`;
}

function manejarImagenesEditor(quillInstance) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
        const file = input.files[0];
        console.log("Archivo seleccionado:", file.name);
        
        // Aquí podrías subir el archivo a tu servidor y luego:
        // const range = quillInstance.getSelection();
        // quillInstance.insertEmbed(range.index, 'image', 'URL_DE_LA_IMAGEN_SUBIDA');
    };
}

// Función para comprimir una imagen antes de enviar
async function comprimirImagen(file, quality, maxWidth) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // 1. Usamos file.type para mantener el formato original (image/png, image/webp, etc.)
                // 2. Usamos toBlob para que PHP lo reciba en $_FILES
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Error al generar el Blob"));
                    }
                }, file.type, quality); 
            };
        };
        reader.onerror = (err) => reject(err);
    });
}

// Función para optimizar todas las imágenes de un FormData
async function optimizarImagenesFormData(formData) {
    const imagenesAOptimizar = [];
    const nombresImagenes = [];
    
    // Identificar todas las imágenes en el FormData
    for (let [key, value] of formData.entries()) {
        if (value instanceof File && value.type.startsWith('image/')) {
            imagenesAOptimizar.push(value);
            nombresImagenes.push(key);
        }
    }
    
    // Si no hay imágenes, retornar
    if (imagenesAOptimizar.length === 0) {
        return;
    }
    
    // Comprimir todas las imágenes
    try {
        for (let i = 0; i < imagenesAOptimizar.length; i++) {
            const imagenOriginal = imagenesAOptimizar[i];
            const nombreCampo = nombresImagenes[i];
            
            // Comprimir con calidad 0.9 y ancho máximo de 1920px
            const imagenComprimida = await comprimirImagen(imagenOriginal, 0.9, 1920);
            
            // Crear un nuevo archivo con el nombre original
            const archivoComprimido = new File([imagenComprimida], imagenOriginal.name, {
                type: imagenOriginal.type,
                lastModified: Date.now()
            });
                        
            // Reemplazar la imagen original en el FormData
            formData.set(nombreCampo, archivoComprimido);
        }
    } catch (error) {
        console.error('Error al comprimir imágenes:', error);
        M.toast({html: "Error al optimizar las imágenes. Se enviarán sin optimizar.", classes: 'toastwarning'});
    }
}


function imagenFuncion(imagen, directorio)
{
    return `<img src="${directorio}/${imagen}" class="imagen-lista" onclick="verImagenModal('${directorio}/${imagen}')">`;
}

function verImagenModal(ruta)
{
    document.getElementById('modal-imagen').innerHTML =
    `
        <div class="modal-imagen-content">
            <span class="modal-action modal-close"><i class="material-icons">cancel</i></span>
            <div class="imagen-modal-container">
                <img src="${ruta}" class="imagen-modal">
            </div>
        </div>
    `;

    $('#modal-imagen').modal({dismissible: true});
    var instance = M.Modal.getInstance(document.getElementById('modal-imagen'));
    instance.open();
}

function tooltipFuncion(cmp)
{
    //Validamos si no tiene ID y le asignamos uno aleatorio
    if(cmp.id == "")
        cmp.id = `${"tooltip_"}${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;
   
    //Creamos el tooltip
    const instancia = tippy(`#${cmp.id}`, {
        content: cmp.innerHTML,
        trigger: 'manual', 
    })[0];

    //Asignamos el evento click para mostrar/ocultar el tooltip
    const texto = document.getElementById(cmp.id);
    texto.addEventListener('click', () => {
    if (instancia.state.isVisible) 
        instancia.hide();
    else 
        instancia.show();
    });

}

function generarPines(elementos)
{
    var contenedor = "";
    elementos.forEach(elemento => {
        contenedor += `<div class="pin">${elemento}</div>`;
    });
    return contenedor;
}


function formatYMD(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseYMD(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addDaysUTC(date, days) {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

// Pascua (algoritmo de Meeus/Jones/Butcher, calendario gregoriano)
function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=marzo, 4=abril
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function calcularLunesSiguiente(fecha) {
  const d = parseYMD(fecha);
  const day = d.getUTCDay(); // 0=Dom,1=Lun,...6=Sáb
  const isoDay = day === 0 ? 7 : day; // 1=Lun,...7=Dom

  if (isoDay !== 1) {
    const daysToAdd = 8 - isoDay; // lleva al próximo lunes
    d.setUTCDate(d.getUTCDate() + daysToAdd);
  }

  return formatYMD(d);
}

function getFestivosColombia(anio) {
  // Días con fecha fija
  const festivos = [
    `${anio}-01-01`, // Año Nuevo
    `${anio}-05-01`, // Día del Trabajo
    `${anio}-07-20`, // Independencia
    `${anio}-08-07`, // Batalla de Boyacá
    `${anio}-12-08`, // Inmaculada Concepción
    `${anio}-12-25`, // Navidad
  ];

  // Días que se mueven al siguiente lunes (Ley Emiliani)
  const festivosEmiliani = [
    `${anio}-01-06`, // Reyes Magos
    `${anio}-03-19`, // San José
    `${anio}-06-29`, // San Pedro y San Pablo
    `${anio}-08-15`, // Asunción de la Virgen
    `${anio}-10-12`, // Día de la Raza
    `${anio}-11-01`, // Todos los Santos
    `${anio}-11-11`, // Independencia de Cartagena
  ];

  for (const fecha of festivosEmiliani) {
    festivos.push(calcularLunesSiguiente(fecha));
  }

  // Pascua
  const fechaPascua = getEasterDate(anio);

  // Festivos religiosos de fecha variable
  festivos.push(formatYMD(addDaysUTC(fechaPascua, -3))); // Jueves Santo
  festivos.push(formatYMD(addDaysUTC(fechaPascua, -2))); // Viernes Santo

  // Festivos movidos al lunes después de Pascua
  festivos.push(calcularLunesSiguiente(formatYMD(addDaysUTC(fechaPascua, 39)))); // Ascensión
  festivos.push(calcularLunesSiguiente(formatYMD(addDaysUTC(fechaPascua, 60)))); // Corpus Christi
  festivos.push(calcularLunesSiguiente(formatYMD(addDaysUTC(fechaPascua, 68)))); // Sagrado Corazón

  // Ordenar y quitar duplicados
  return [...new Set(festivos)].sort();
}


// ...existing code...

/**
 * Valida si una fecha es festivo en Colombia.
 * @param {string|Date} fecha - Fecha en formato 'YYYY-MM-DD' o Date.
 * @returns {boolean}
 */
function esFestivoColombia(fecha) {
    let fechaYmd = "";

    if (fecha instanceof Date) {
        fechaYmd = formatYMD(new Date(Date.UTC(
            fecha.getFullYear(),
            fecha.getMonth(),
            fecha.getDate()
        )));
    } else if (typeof fecha === "string") {
        fechaYmd = fecha.trim().slice(0, 10); // Soporta 'YYYY-MM-DD HH:mm:ss'
    } else {
        return false;
    }

    const anio = Number(fechaYmd.slice(0, 4));
    if (!anio || fechaYmd.length !== 10) return false;

    const festivos = getFestivosColombia(anio);
    return festivos.includes(fechaYmd);
}

// ...existing code...


function restarHoras(inicio, fin)
{
    // Convertir las horas al formato HH:MM:SS a milisegundos
    const [horaInicio, minInicio, segInicio] = inicio.split(':').map(Number);
    const [horaFin, minFin, segFin] = fin.split(':').map(Number);
    
    const milisegundosInicio = (horaInicio * 3600 + minInicio * 60 + segInicio) * 1000;
    const milisegundosFin = (horaFin * 3600 + minFin * 60 + segFin) * 1000;
    
    // Restar
    const diferencia = Math.abs(milisegundosFin - milisegundosInicio);
    
    // Convertir de vuelta a HH:MM:SS
    const segundosTotales = Math.floor(diferencia / 1000);
    const horas = Math.floor(segundosTotales / 3600);
    const minutos = Math.floor((segundosTotales % 3600) / 60);
    const segundos = segundosTotales % 60;
    
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}


function esLaborable(fecha, hora){
    const diaSemana = fecha.getDay(); // 0=Dom,1=Lun,...6=Sáb
    const laboralInicioAM = 8; // 8:00 AM
    const laboralFinAM = 12; // 12:00 PM
    const laboralInicioPM = 14; // 2:00 PM
    const laboralFinPM = 18; // 6:00 PM
    const horaActual = fecha.getHours();


    // Verificar si es domingo
    if (diaSemana === 0) 
        return false;
    else
    // Verificar si es sábado
    if (diaSemana == 6 && (horaActual < laboralInicioAM || horaActual > laboralFinPM))
        return false;
    else
    if (diaSemana > 0 && diaSemana < 6 && ((horaActual < laboralInicioAM && horaActual > laboralFinAM) || (horaActual < laboralInicioPM && horaActual > laboralFinPM)))
        return false;
    else    
        return true;
}


function test(formulario)
{

    const miFormulario = document.querySelector(`#${formulario}`);
    const inputs = miFormulario.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        if(input.type == "select-one" || input.type == "select-multiple")
        {
            console.log(input)
            var valores = $(`#${input.id}`)[0].selectize.options;
            if(typeof valores === 'object')
            {
                valores = Object.values(valores);
                var index = valores[0].value;
            }
            else
                var index = 0;

            $(`#${input.id}`)[0].selectize.setValue(index)
        }
        else
        if(input.type == "date")
        {
            const today = new Date().toISOString().split('T')[0];
            input.value = today;
        }
        else
        if(input.type == "email")
        {
            input.value = "test@example.com";
        }
         else
        if(input.type == "tel")
        {
            input.value = "1234567890";
        }
        else
        if(input.type != "hidden" && input.type != "file")
            input.value = "Test";
    });
}