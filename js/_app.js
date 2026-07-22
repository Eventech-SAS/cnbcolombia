document.addEventListener('DOMContentLoaded', function() {
	cargar_componentes();

	//Obtenemos la variables necesarias
	var alcance = JSON.parse(localStorage.getItem(`${prefixG}_alcance`));
	var secciones = JSON.parse(document.getElementById('secciones').value);
	var seccion_actual = window.location.pathname.split('/').pop();

	//Mostramos el dashboard siempre
	var contenedor_menu = '';
	var padres = [];
	var hijos = [];
	
	//Recorrer secciones
	for (const [key, seccion] of Object.entries(secciones)) {
		//Si existe en el alcance y además tiene padre
		if(alcance[key] && seccion['padre'] != '')
		{
			let index = padres.indexOf(seccion['padre']);
			if(index == -1)
			{
				padres.push(seccion['padre']);
				hijos.push([]);
				index = padres.length - 1;
			}
			hijos[index] += 
			`<li class="bold ${seccion_actual == key ? 'active' : ''}">
				<a class="waves-effect waves-cyan ${seccion_actual == key ? 'active' : ''}" href="${key}">
					<i class="material-icons material-symbols-outlined">fiber_manual_record</i>
					<span class="menu-title">${seccion['nombre']}</span>
				</a>
			</li>`
		}
	}

	var padres_insertados = [];
	
	//Recorrer secciones
	for (const [key, seccion] of Object.entries(secciones)) {
		//Si existe en el alcance
		if(alcance[key])
		{
			if(seccion['padre'] != '')
			{
				if(!padres_insertados.includes(seccion['padre']))
				{
					padres_insertados.push(seccion['padre']);
					let index = padres.indexOf(seccion['padre']);
					contenedor_menu += 
					`<li class="bold ${seccion['padre'] == secciones[seccion_actual]['padre'] ? 'active' : ''} <?php if($cms_seccion[$index]['padre'] == 'usuarios') echo 'active open' ?>">
						<a class="collapsible-header waves-effect waves-cyan" href="JavaScript:void(0)">
							<i class="material-icons">${seccion['icono']}</i>
							<span class="menu-title">${seccion['padre']}</span>
						</a>
						<div class="collapsible-body">
							<ul class="collapsible collapsible-sub" data-collapsible="accordion">
								${hijos[index]}
							</ul>
						</div>
					</li>`;
				}
			}
			else
				contenedor_menu += 
				`<li class="bold ${seccion_actual == key ? 'active' : ''}">
					<a class="waves-effect waves-cyan ${seccion_actual == key ? 'active' : ''}" href="${key}">
						<i class="material-icons material-symbols-outlined">${seccion['icono']}</i>
						<span class="menu-title">${seccion['nombre']}</span>
					</a>
				</li>`;
		}
	}
	document.getElementById('slide-out').innerHTML = contenedor_menu;
	$('.dropdown-trigger').dropdown();

	

	
});

