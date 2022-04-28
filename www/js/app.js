
var onsenNavigator;


jQuery.fn.exists = function(){return this.length>0;}

dump = function(data) {
	// console.log(data);
}

dump2 = function(data) {
	alert(JSON.stringify(data));	
};

empty = function(data) {
	if (typeof data === "undefined" || data==null || data=="" || data=="null" || data=="undefined" ) {	
		return true;
	}
	return false;
}



isdebug = function(){
	if (krms_config.debug){
		return true;
	}
	return false;
};

ons.platform.select('android');


jQuery(document).ready(function() {	
	onsenNavigator = document.getElementById('onsenNavigator');
});

ons.ready(function() {
	onsenNavigator = document.getElementById('onsenNavigator');	
		
	
	ons.setDefaultDeviceBackButtonListener(function(event) {
		dump("Back event");
		dump(event);
		current_page_id = onsenNavigator.topPage.id;
		dump("Back event current_page_id=>" + current_page_id);		
		switch (current_page_id){
			case "receipt":
			case "graphical_tracking":
			lat_res = getCurrentLocation();
			//jcode replace with tabbar.html
			resetToPage('home.html','none');
			break;			
						
			case "page_startup":			
			case "tabbar":
			case "page_settings":
			case "page_startup2":
			case "operational_close_page":
			  
			  if(current_page_id=="tabbar"){
				  active_index = document.querySelector('ons-tabbar').getActiveTabIndex();
				  dump("active_index=>"+ active_index);
				  if(active_index>0){				  	 
				  	 document.querySelector('ons-tabbar').setActiveTab(0);
				  	 return;
				  } 			  
			  }
			
			  exit_cout++;
			  if(exit_cout<=1){
			  	showToast( t("Press once again to exit!") ,'' );	
				 setTimeout(function(){ 
				 	 exit_cout=0;
				 }, 3000);
			  } else {
			  	 if (navigator.app) {
				   navigator.app.exitApp();
				 } else if (navigator.device) {
				   navigator.device.exitApp();
				 } else {
				   window.close();
				 }
			  }
			break;
			
		}
	}); 
	
	tabbar_loaded = false;
	
	
	$( document ).on( "keyup", ".numeric_only", function() {
       this.value = this.value.replace(/[^0-9\.]/g,'');
    });	 
});


/*CORDOVA DEVICE READY*/
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady(){
	try {				
		navigator.splashscreen.hide();	
		device_uiid = device.uuid;
		device_platform = device.platform;		
		
		if(device.platform=="android" || device.platform=="Android" ){
		   //StatusBar.backgroundColorByHexString("#ef6625");
		}	
	} catch(err) {
       dump(err.message);
    } 
};
/*END CORDOVA DEVICE READY*/

document.addEventListener("offline", function(){
  showNoConnection(true);
  retryNetConnection(true);
}, false);

document.addEventListener("online", function(){
	showNoConnection(false);	
}, false);

document.addEventListener("resume", function(){
	
	try {
		if(cordova.platformId == "ios"){
			window.FirebasePlugin.getBadgeNumber(function(n) {		   	       
		       total_badge = parseInt(n);	       
		       if(total_badge>0){
		       	   window.FirebasePlugin.setBadgeNumber(0);
		       }
		    });
		}
    } catch(err) {
       alert(err.message);
    } 
    
}, false);



/*ONSEN INIT*/
document.addEventListener('show', function(event) {
	dump('show page');
    var page = event.target;
    var page_id = event.target.id;   
    //alert("page_id = "+page_id); 
    switch(page_id)
    {
    	case "home":
    	 tooltip_home = getStorage("tooltip_home");
    	 if(empty(tooltip_home)){
	    	 close_button='<ons-button modifier="bluebutton_small" onclick="hideTooltip('+ "'"+ '.tooltip_home' + "'" +');" >';
	    	 close_button+=t("OK, THANKS");
	    	 close_button+='</ons-button>';
	    	 $('.tooltip_home').webuiPopover({   	     	
		     	content:'<p>'+t('Want to change address')+'?</p><p class="small">'+t('You can change your address here')+'</p><br/>'+ close_button,
		     	backdrop:false,	     	
		     	offsetLeft:90
		   	});
		   	$('.tooltip_home').webuiPopover('show');
    	 }
    	break;
    }
     
	
});

document.addEventListener('init', function(event) {
	
   dump('init page');

   var page = event.target;
   var page_id = event.target.id;   
   dump("page_id = "+page_id);  
   switch(page_id)
   {

   	
   	  case "page_settings":   	        	     
   	     $(".app_title").html( krms_config.AppTitle );	        	     
   	  break;
   	     	  
   	  case "page_startup":
   	   	    
   	    AnalyticsTrack("page start up"); 
   	       	    
   	  break;

   	  case "home":
   	  
   	     homeSwitchViewAll()  ;
   	  
   	    /*RTL CODE*/
   	    current_lang_code = getLanguageCode();
   	    if(isRTL(current_lang_code)){
   	       $("ons-button ons-icon").attr("icon","ion-ios-arrow-left");
   	    }
   	       	  
   	    if(isLocation()){
   	    	if ( location_res = getLocationData() ){  
   	    		dump(location_res);   		
   	    	} else {
   	    		$("#" + onsenNavigator.topPage.id + " .formatted_address").html( t("location not set"));
   	    	}   	    	 
   	    } else {   	    	
	   	    current_latlng = getCurrentLocation();
	   	    if(!empty(current_latlng)){
	   	    	if(!empty(current_latlng.address)){ 
	   	    	   $("#" + onsenNavigator.topPage.id + " .formatted_address").html( current_latlng.address );
	   	    	} else {
	   	    		$("#" + onsenNavigator.topPage.id + " .formatted_address").html( t("location not set"));
	   	    	}
	   	    } else {
	   	    	//$(".print_location_address").html( t("location not set") );
	   	    	$("#" + onsenNavigator.topPage.id + " .formatted_address").html( t("location not set"));
	   	    }
   	    }
   	        	    
   	    /*LOAD ALL PAGES IN HOMEPAGE*/  
   	    loadHomePage();
   	    
   	    initPullHook('home', 'home_pull_hook');
   	    
   	    AnalyticsTrack("page home"); 
   	    
   	    ageRestriction();
   	    
   	    home_all_as_list = false;
  	    if(app_settings = getAppSettings()){
  	       home_all_as_list = app_settings.home_all_as_list;
  	    }	 	  
			  	  
  	    if(home_all_as_list==1){
   	       initInfiniteScroll(page, 'home_all_restaurant', 'list_all_restaurant');   	  
  	    }
   	    
   	  break;

   	  case "settings":   	       	    
   	    if(isLogin()){ 
   	    	settingsMenu(true);
   	    } else {
   	    	settingsMenu(false);
   	    }   	     	    
   	    processDynamicAjax('getPushSettings','','pushsetting_loader','GET',1 ); 
   	    
   	    AnalyticsTrack("page settings"); 
   	  break;   	  

   	  default:
   	  break;
   }  
   
});


getLanguageCode = function(){
	lang='';
	if(app_settings = getAppSettings()){
	   lang = app_settings.mobileapp2_language;
	}	
	client_set_lang = getStorage("client_set_lang");
	if(!empty(client_set_lang)){
		lang = client_set_lang;
	}
	
	return lang;
};

setLanguage = function(lang_code){	
	if(!empty(lang_code)){
	   setStorage("client_set_lang", lang_code);
	   setStorage("change_language", 1);
	   InitRTL(lang_code);
	   //jcode replace with tabbar.thml
	   resetToPage('selectionPlaces.html','none');
	}
};

placeholder = function(field, value){
	$(field).attr("placeholder", t(value) );
};

loadHomePage = function(){	
    app_settings = getAppSettings();	
            
    if(app_settings.home.mobile2_home_offer==1){
       params = 'search_type=special_Offers';       
       processDynamicAjax('searchMerchant', params, 'special_offers_wrapper');
    } else {
    	$("#special_offers_wrapper").hide();
    }
    
    if(app_settings.home.mobile2_home_featured==1){
       params = 'search_type=featuredMerchant';       
       processDynamicAjax('searchMerchant', params , 'featured_list_wrapper');
    } else {
    	$("#featured_list_wrapper").hide();
    }
    if(app_settings.home.mobile2_home_all_restaurant==1){
       $("#home .home_infinite_done").val(0);
       processDynamicAjax('searchMerchant', 'search_type=allMerchant', 'all_restaurant_wrapper');
    } else {
    	$("#all_restaurant_wrapper").hide();
    }
    if(app_settings.home.mobile2_home_cuisine==1){
       processDynamicAjax('cuisineList', 'carousel=1&', 'cuisine_list_wrapper');
    } else {
    	$("#cuisine_list_wrapper").hide();
    }
    
    if(isLogin()){
	    if(app_settings.home.mobile2_home_favorite_restaurant==1){
	       processDynamicAjax('searchMerchant', 'search_type=favorites', 'favorite_restaurant_wrapper');
	    } else {
	    	$("#favorite_restaurant_wrapper").hide();
	    }
    } else {
    	$("#favorite_restaurant_wrapper").hide();
    }
    
    $change_language = getStorage("change_language") ;  
    
    /*HOME BANNER*/
    if(app_settings.home.mobile2_home_banner==1){
    	home_banner_count = app_settings.home_banner.length ;    	
    	if(home_banner_count>0){    		  	
    		
    		if($change_language==1){    			
    			processDynamicAjax('getHomebanner','');
    		} else {
    		   fillHomeBanner( app_settings.home_banner , '.home_banner_wrapper');
    		}
    		
    		if(app_settings.home.mobile2_home_banner_auto_scroll==1){
	    		auto_carousel_name[0] ='banner_carousel';
	    		initAutoCarousel();
    		}
    		    		
    		
    	} else $("#home_banner_wrapper").hide();    	
    } else {
    	$("#home_banner_wrapper").hide();
    }
    
    /*HOME CATEGORIES*/    
    $show_categories = false;
    if ((typeof  app_settings.home.mobile2_home_categories !== "undefined") && ( app_settings.home.mobile2_home_categories !== null)) {
	    if(app_settings.home.mobile2_home_categories==1){    	
	    	if ((typeof  app_settings.home_categories !== "undefined") && ( app_settings.home_categories !== null)) {
	    		$show_categories = true;	    		
	    		
	    		if($change_language==1){    			
    			   processDynamicAjax('getHomeCategories','');
     		    } else {
     		    	fillCategories( app_settings.home_categories , '#category_list_wrapper');
     		    }  
	    		
	    	}
	    }
    } 
    
    
    if($change_language==1){   
       removeStorage("change_language");
    }
    
    if(!$show_categories){
       $("#category_list_wrapper").hide();
    }
    
    /*FOOD PROMO*/
    if(app_settings.home.mobile2_home_food_discount==1){
    	$("#food_list_wrapper").show();
    	processDynamicAjax('foodPromo', '', 'food_list_wrapper');    
    } else {
    	$("#food_list_wrapper").hide();
    }    
}




document.addEventListener('postshow', function(event) {
	dump("postshow");
	var page = event.target;
	var page_id = event.target.id;   
	dump("postshow : "+ page_id);
	switch (page_id)
	{	
		//
	}	
});

document.addEventListener('prehide', function(event) {
	dump("prehide");
	var page = event.target;
	var page_id = event.target.id;   
	dump("prehide : "+ page_id);
	switch (page_id)
	{		
		case "modal_notification":
		  current_page_id = onsenNavigator.topPage.id;
		  dump("current_page_id=>"+current_page_id);		  
		  modal_action = $(".modal_action").val();		  
		  if(current_page_id=="track_driver"){
		  	dump("modal_action=>"+modal_action);
		  	if(modal_action=="close_page"){
		  		popPage();
		  	} else {
		  	   runTrack(); 
		  	}
		  }
		break;

		default:
		ons.platform.select('android');
		break;
				
				
	}
	
});

/*END ONSEN INIT*/

showLoader = function(show, loader_id) {	
		
	dump("loader_id=>"+ loader_id);
	if(!empty(loader_id)){
		var modal = document.querySelector('#'+ loader_id);
	} else {
		var modal = document.querySelector('#default_loader');	
	}
	
	if(empty(modal)){
		return ;
	}
		
	if(show){
	  modal.show();
	} else {	  
	  modal.hide();
	}		  
};



showToast = function(data, modifier) {

  if (empty(data)){
  	  data=' ';
  }	  
  if (empty(modifier)){
  	  modifier='danger';
  }	  
  is_animation = '';
  
  if(modifier=="danger"){
  	is_animation='fall';
  }
  
  toast_handler  = ons.notification.toast(data, {
     timeout: 2500, //
     animation: is_animation ,
     modifier: modifier+ ' thick',
  });
   
};


showAlert = function(data) {  
  if (empty(data)){
  	  data='';
  }
  ons.platform.select('ios'); 
  ons.notification.alert({
  	  message: t(data) ,
      title: krms_config.AppTitle,
      buttonLabels : [ t("OK") ]
  });
};

t = function(data){
	return translator.get(data);
};




getAppSettings = function(){
	 app_settings = getStorage("app_settings");
	 if(!empty(app_settings)){
	    app_settings = JSON.parse( app_settings );	 
	    return app_settings;
	 }
	 return false;
};



showPage = function(page_id, animation, data){
	
   if(empty(page_id)){
   	  return;
   }
   	
   if(empty(animation)){
   	  animation='slide';
   }
   if(empty(data)){
   	  data={};
   }
   if(data == 'Pickup location' || data == 'Where To'){
    data = {title: data};
   }
   onsenNavigator.pushPage(page_id,{
  	   animation : animation , 
  	   data : data 	
   });  
};

resetToPage = function(page_id, animation , data ){
   if(empty(animation)){
   	  animation='slide';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.resetToPage(page_id,{
  	   animation : animation ,  	
  	   data : data
   });  
};

replacePage = function(page_id, animation, data){
   if(empty(animation)){
   	  animation='slide';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.replacePage(page_id,{
  	   animation : animation ,  
  	   data : data	
   });  
};

bringPageTop = function(page_id, animation, data){
   if(empty(animation)){
   	  animation='slide';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.bringPageTop(page_id,{
  	   animation : animation ,  
  	   data : data	
   });  
};

insertPage = function(page_id, animation, data){
   if(empty(animation)){
   	  animation='slide';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.insertPage(page_id,{
  	   animation : animation ,  
  	   data : data	
   });  
};

document.addEventListener('init', function(event) {

  var page = event.target;

  if (page.id == "home-page") {
    var stories = page.querySelector('#stories');

    generateStoryBubbles(stories);
  }

});

//The show event listener does the same thing as the one above but on the search page when it's shown.

document.addEventListener('show', function(event) {
  var page = event.target;

  if (page.id == "search-page") {
    var channels = page.querySelector('#channels');

    generateStoryBubbles(channels);
  }
});

/*
* This function is used to toggle the grid/list display of the posts in the profile page as well as
* change the color of the buttons to show which is the current view.
*/

function display(id) {
  document.getElementById("list").style.color="#1f1f21";
  document.getElementById("grid").style.color="#1f1f21";
  document.getElementById(id).style.color="#5fb4f4";

  document.getElementById("list_view").style.display="none";
  document.getElementById("grid_view").style.display="none";
  document.getElementById(id+"_view").style.display="block";
}

//The generateStoryBubbles function is used to create the carousel items be used as stories by the upper two events.

function generateStoryBubbles(element) {
  for(var i=0; i<9; i++) {
    element.appendChild(ons.createElement(
      '<ons-carousel-item>' +
        '<div class="story">' +
        '<div class="story-thumbnail-wraper unread"><img class="story-thumbnail" src="images/profile-image-0' + (i+1) + '.png" onclick="readStory(this)"></div>' +
        '<p>david_graham</p>' +
        '</div>' +
      '</ons-carousel-item>'
    ));
  }
}

//The Like function is used to make the white heart appear in front of the picture as well as make the like button into a red heart and vice versa.

var like = function(num) {
  if (document.getElementById("button-post-like-"+num).classList.contains("like")) {
    document.getElementById("button-post-like-"+num).classList.remove("ion-ios-heart","like");
    document.getElementById("button-post-like-"+num).classList.add("ion-ios-heart-outline");
  } else {
    document.getElementById("button-post-like-"+num).classList.remove("ion-ios-heart-outline");
    document.getElementById("button-post-like-"+num).classList.add("ion-ios-heart","like");
    document.getElementById("post-like-"+num).style.opacity = 1;

    setTimeout(function(){
      document.getElementById("post-like-"+num).style.opacity = 0;
    }, 600);
  }
}

//The readStory function is used to change the red circle around a new story into grey after tapping on the new storry (thus reading it)

var readStory = function(event) {
  event.parentNode.classList.remove("unread");
  event.parentNode.classList.add("read");
}
