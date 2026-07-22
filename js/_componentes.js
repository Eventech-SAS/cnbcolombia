function cargar_componentes()
{
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) | navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) 
   		navegador = 'mobile';
   	else
   		navegador = 'desktop';

   	console.log(navegador);

	$('.dropdown-trigger').dropdown();
	
	$('.modal').modal();
	
	$("#slide-out").sidenav({
		edge: "left" // Choose the horizontal origin
	});

																											// Eventos Header
																											// Muestra / Oculta la barra de búsqueda en Móvil
	if(document.getElementById('search-btn') != null){
		var search = false;
		document.getElementById('search-btn').addEventListener('click', function(event){
			if(search)
			{
				document.getElementById('search-ctn').style.display = 'none';
				search = false;	
			}
			else
			{
				document.getElementById('search-ctn').style.display = 'block';
				search = true;
			}
		});
		document.getElementById('search-close').addEventListener('click', function(event){
			if(search)
			{
				document.getElementById('search-ctn').style.display = 'none';
				search = false;
			}
			else
			{
				document.getElementById('search-ctn').style.display = 'block';
				search = true;
			}
		});
	}

																											// Botón Pantalla Completa
	document.getElementById('fullscreen').addEventListener('click', function(event){
		if((document.fullScreenElement && document.fullScreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen))
		{
			if(document.documentElement.requestFullScreen)
				document.documentElement.requestFullScreen();
			else
			if(document.documentElement.mozRequestFullScreen)
				document.documentElement.mozRequestFullScreen();
			else
			if(document.documentElement.webkitRequestFullScreen)
				document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
			else
			if(document.documentElement.msRequestFullscreen)
				if(document.msFullscreenElement)
					document.msExitFullscreen();
				else
					document.documentElement.msRequestFullscreen();
		}
		else
		{
			if(document.cancelFullScreen)
				document.cancelFullScreen();
			else
			if(document.mozCancelFullScreen)
				document.mozCancelFullScreen();
			else
			if(document.webkitCancelFullScreen)
				document.webkitCancelFullScreen();
		}
	});
																											// Gestión del Sidenav
	sidenavMain = $(".sidenav-main");
	var navCollapsible = $(".navbar .nav-collapsible");
	$(function () {
		"use strict";
		var collapsibleSubCollapsible = $("li.active .collapsible-sub .collapsible");
		var sidemainCollapse = document.querySelectorAll(".sidenav-main .collapsible");

		M.Collapsible.init(sidemainCollapse,{
			accordion: true,
			onOpenStart: function () {
				$(".collapsible > li.open").removeClass("open");
				setTimeout(function () {$("#slide-out > li.active > a").parent().addClass("open");}, 10);
			}
		});
		if ($("body").hasClass("menu-collapse"))
		{
			var sidenavCollapse = $(".sidenav-main .collapsible");
			if ($("#slide-out > li.active").children().length > 1)
				$("#slide-out > li.active > a").parent().addClass("close");

			M.Collapsible.getInstance(sidenavCollapse).close($(".collapsible .close").index())
		}
		else
			if ($("#slide-out > li.active").children().length > 1)
				$("#slide-out > li.active > a").parent().addClass("open");
		// Abre los menú activos
		if (collapsibleSubCollapsible.find("a.active").length > 0)
		{
			collapsibleSubCollapsible.find("a.active").closest("div.collapsible-body").show();
			collapsibleSubCollapsible.find("a.active").closest("div.collapsible-body").closest("li").addClass("active");
		}
		// Colapsa el menú al presional el botón
		$(".nav-collapsible .navbar-toggler").click(function () {
			toogleMenuCollapse();
			if($(this).children().text() == "radio_button_unchecked")
			{
				$(this).children().text("radio_button_checked");
				sidenavMain.addClass("nav-lock");
				navCollapsible.addClass("sideNav-lock");
				localStorage.canvas_sidebar = true;
			} 
			else
			{
				$(this).children().text("radio_button_unchecked");
				sidenavMain.removeClass("nav-lock");
				navCollapsible.removeClass("sideNav-lock");
				localStorage.canvas_sidebar = false;
			}
		});
		// Expande el Sidenav al pasar el Mouse por encima
		$(".sidenav-main.nav-collapsible, .navbar .brand-sidebar").mouseenter(function(){
			if (!$(".sidenav-main.nav-collapsible").hasClass("nav-lock"))
			{
				$(".sidenav-main.nav-collapsible, .navbar .nav-collapsible").addClass("nav-expanded").removeClass("nav-collapsed");
				$("#slide-out > li.close > a").parent().addClass("open").removeClass("close");
				setTimeout(function(){
					if ($(".collapsible .open").children().length > 1)
					{
						var collapseEl = $(".sidenav-main .collapsible");
						var collapseInstance = M.Collapsible.getInstance(collapseEl);
						collapseInstance.open($(".collapsible .open").index());
					}
				}, 100);
			}
		});
		// Colapsa el menú cuando MouseLeave
		$(".sidenav-main.nav-collapsible, .navbar .brand-sidebar").mouseleave(function(){navigationCollapse();});
	});


}

function defaultMenuCollapse() {
	if ($("body").hasClass("menu-collapse") && $(window).width() > 993)
	{
		sidenavMain.removeClass("nav-lock");
		$(".nav-collapsible .navbar-toggler i").text("radio_button_unchecked");
		navCollapsible.removeClass("sideNav-lock");
		toogleMenuCollapse();
		navigationCollapse();
	}
}
// Cambio de estado del menú 
function toogleMenuCollapse()
{
	if (sidenavMain.hasClass("nav-expanded") && !sidenavMain.hasClass("nav-lock"))
	{
		sidenavMain.toggleClass("nav-expanded");
		$("#main").toggleClass("main-full");
	}
	else
		$("#main").toggleClass("main-full");
}
// Verifica si el nav está bloqueado
function navigationCollapse(){
	if (!$(".sidenav-main.nav-collapsible").hasClass("nav-lock"))
	{
		var openLength = $(".collapsible .open").children().length;
		$(".sidenav-main.nav-collapsible, .navbar .nav-collapsible").addClass("nav-collapsed").removeClass("nav-expanded");
		$("#slide-out > li.open > a").parent().addClass("close").removeClass("open");
		setTimeout(function ()
		{
			if (openLength > 1)
			{
				var collapseEl = $(".sidenav-main .collapsible");
				var collapseInstance = M.Collapsible.getInstance(collapseEl);
				collapseInstance.close($(".collapsible .close").index());
			}
		},100);
	}
}

