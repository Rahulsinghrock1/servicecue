(function($) {
	
	"use strict";
	
	/* Default Variables */
	var ServiceCueOptions = {
		loader:true,
		zoomControlDiv:null,
		rtl:false
	};
	

	$.ServiceCueTheme = {
		
		//Initialize
		init:function() {
			//RTL
			if ($('html').attr('dir')!=undefined && $('html').attr('dir')==='rtl') {
				ServiceCueOptions.rtl = true;
			}
			
			this.loader();

		},
		
		//Page Loader
		loader:function() {
			if (ServiceCueOptions.loader) {
				$(window).on("load", function() {
					$(".page-loader").fadeOut();
				});
			}
		},
		
	
		
	};
	
	//Initialize
	$.ServiceCueTheme.init();

})(jQuery);



