var dummyData = {};
dummyData.allMerchants = {"all_merchants":[{"id":"1","reward":"Give you $20","name":"AT&T","category":"Popular"},{"id":"1","reward":"Give you $20","name":"AT&T","category":"Popular"},{"id":"1","reward":"Give you $20","name":"AT&T","category":"Popular"},{"id":"1","reward":"Give you $20","name":"AT&T","category":"Popular"},{"id":"1","reward":"Give you $20","name":"AT&T","category":"Popular"},{"id":"1","reward":"Give you $20","name":"AT&T","category":"Popular"},{"id":"1","reward":"Give you $20","name":"AT&T","category":"Popular"},{"id":"4","reward":"Give you nothing","name":"San Ramon","category":"Popular"},{"id":"4","reward":"Give you nothing","name":"San Ramon","category":"Popular"},{"id":"5","reward":"Give you nothing","name":"Dublin","category":"Credit Card"},{"id":"3","reward":"Give you $20","name":"Chase","category":"Credit Card"}]};
dummyData.getRef = {
		status: "success",
		msg: "dummy" + " is sent to your email " + "dummy"
	};
dummyData.findRef = {"id":"3","status":"success","name":"Chase","msg":"Chase-Give you $20"};
// dummyData.findRef = {"id":"-1","status":"error","name":null,"msg":"Sorry, something went wrong."};

dummyData.provideRef = {"status":"success","msg":"xxx from liuyang@gmail.com has not been added to db"};
dummyData.limit = {"limit":1,"name":"Chase"};

var RF = function () {
		this.init();
	};

	RF.prototype = {

	    constructor: RF
	    
	  , init: function () {
		// $("#merchantName").val()
			this.dummy = false;
			this.columnNum = 5;
			this.rowNum = 2;
			this.rowWidth = 1150;
//			var tileColors = ["#f2c230", "#e74c2e", "#3078c0", "#182045", "#2ecc71"];
//			var tileColors = ["rgb(48, 120, 192)", "rgb(231, 76, 46)", "rgb(24, 32, 69)", "rgb(242, 194, 48)"];

			this.tileColors = ["rgb(255, 212, 100)", "rgb(255, 102, 102)", "rgb(154, 205, 50)"];
			this.currentRef = {};
			
			// get request params
			var requestParams = function () {
				  // This function is anonymous, is executed immediately and 
				  // the return value is assigned to QueryString!
				  var query_string = {};
				  var query = window.location.search.substring(1);
				  var vars = query.split("&");
				  for (var i=0;i<vars.length;i++) {
				    var pair = vars[i].split("=");
				    	// If first entry with this name
				    if (typeof query_string[pair[0]] === "undefined") {
				      query_string[pair[0]] = pair[1];
				    	// If second entry with this name
				    } else if (typeof query_string[pair[0]] === "string") {
				      var arr = [ query_string[pair[0]], pair[1] ];
				      query_string[pair[0]] = arr;
				    	// If third or later entry with this name
				    } else {
				      query_string[pair[0]].push(pair[1]);
				    }
				  } 
				    return query_string;
			} ();
			this.columnNum = requestParams.cn || this.columnNum;
			this.rowNum = requestParams.rn || this.rowNum;
			this.dummy = requestParams.dummy || this.dummy;
			
			
			// load data
			var that = this;
			if(this.dummy){
				that._saveAllMerchants(dummyData.allMerchants.all_merchants);
				that._createTiles(dummyData.allMerchants);
			}else{
				$.ajax({
					url: "AllMerchantsProc",
					type: "GET",
					dataType: "json",
					success: function(data) {
			//			$(".dropDownArrow").data("allMerchants", data.all_merchants);
						that._saveAllMerchants(data.all_merchants);
						that._createTiles(data);
					}
				});	
			}
			
			$("body").on("click", ".tile",function(evt){
				var merchantName = $(this).find(".tile-label").text();
				if(merchantName != ""){
					that._setRequestData(merchantName);
					getReferal();
				}
			});
			
			$("#submitButton").on("click", function(evt){
				if($("#merchantName").val() != ""){
					that._setRequestData($("#merchantName").val());
					getReferal();
				}
			});
			
			$("#provideButton").on("click", function(){
					$("#olyBack").show();
					$("#oly").empty();
					$("#oly").append(getCanProvideRefTemp());
					$("#oly").show();	
					
					$("#category").autocomplete({
				      source: that.allMerchants.categoryOptions,
				      minLength: 0,
				      open: function(){
        				$(this).autocomplete('widget').addClass('olyIndex');
        				$("#category").attr("readonly", true);
        				return false;
    				  }
					});
				
					$("#category").click(function(){
						$("#category").autocomplete( "search", "" );
					});			
				}
			);
			
			$("#olyBack").on("click", function(evt){
				that._closeLyr();
			});
			
						
			$("body").on("click", "input#mName", function(){
				$("input#mName").autocomplete({
						  source: that.origAllMerchants,
						  minLength: 0,
						  open: function(){
							$(this).autocomplete('widget').addClass('olyIndex');
							$(this).autocomplete('widget').css('position', 'fixed');
							return false;
						  }
				});
				
				$("input#mName").autocomplete( "search", "" );
			});
				
				
			
			$("body").on("click", "#getRefBtn", function(evt){
				var emailAddress = that._checkEmail($("#email"));
				if(emailAddress != ""){
					if(that.dummy){
						$("#oly").empty();
						$("#oly").append(sentRefTemp(dummyData.getRef));
						console.log("OutRefProc?id="+that.currentRef.id+"&mName="+that.currentRef.mName+"&email="+emailAddress);
					}else{		
						$("#oly").empty();
						$.ajax({
							url: "OutRefProc?id="+that.currentRef.id+"&mName="+that.currentRef.mName+"&email="+emailAddress,
							type: "GET",
							dataType: "json",
							success: function(data) {
								$("#oly").append(sentRefTemp(data));
							}
						});	
					}
				}
			});

			$("body").on("click", "#getUFBtn", function(evt){
				var emailAddress = that._checkEmail($("#email"));
				var mName = that._checkMName($("#uFmName"));
				if(emailAddress != "" && mName != ""){
					that.currentRef.mName = mName;
					that.currentRef.id = -1;
					if(that.dummy){
						$("#oly").empty();
						$("#oly").append(sentUnRefTemp());
						console.log("OutRefProc?id="+that.currentRef.id+"&mName="+that.currentRef.mName+"&email="+emailAddress);
					}else{		
						$("#oly").empty();
						$.ajax({
							url: "OutRefProc?id="+that.currentRef.id+"&mName="+that.currentRef.mName+"&email="+emailAddress,
							type: "GET",
							dataType: "json",
							success: function(data) {
								$("#oly").append(sentUnRefTemp());
							}
						});	
					}
				}
			});

			$("body").on("click", "#okBtn, #closeBtn", function(evt){
				that._closeLyr();
			});

			$("body").on("click", "#saBtn", function(evt){
				getReferal();
			});
			
			$("body").on("click", "#categories", function(evt){
				if(evt.target && evt.target.nodeName == "LI") {
					var allCategories = $("#categories").find("li");
					allCategories.css("font-weight", "normal");
					$(evt.target).css("font-weight", "bold");
					for(var i = 0; i < allCategories.length; i++){
						$("#"+$(allCategories[i]).data("id")).hide();
					}
					$("#"+$(evt.target).data("id")).show();
					$("#upArrow").css("left", $(evt.target).offset().left + $(evt.target).width()/2 - 6);
				}
			});
			
			$("body").on("click", "#provideRefBtn", function(evt){
				var name = that._checkMName($("#name"))
					,emailAddress = that._checkEmail($("#email"))
					,mName = that._checkMName($("#mName"))
					,refLink = that._checkMName($("#referDetial"))
					,benefit = that._checkMName($("#benefit"))
					,category = that._checkMName($("#category"))
					;
				
				if(name != "" && emailAddress != "" && mName != "" && refLink != "" && benefit != "" && category != ""){
					that.currentRef.name = name;
					that.currentRef.emailAddress = emailAddress;
					that.currentRef.mName = mName;
					that.currentRef.refLink = refLink;
					that.currentRef.benefit = benefit;
					that.currentRef.category = category;
					
					provideReferal();
				}
			});

			
			var getReferal = function(){
				$("#olyBack").show();
				$("#oly").empty();

				// load data
				if(that.dummy){
					if(dummyData.findRef.status == "success"){
						that.currentRef.id = dummyData.findRef.id;
						that.currentRef.mName = dummyData.findRef.name;
						$("#oly").append(getFoundRefTemp(dummyData.findRef.msg));
						$("#oly").show();
						console.log("success");
					}else{
						$("#oly").append(getUnFoundRefTemp(""));
						$("#oly").show();
					}
				}else{
					$.ajax({
						url: "FindReferralProc?mName=" + that.currentRef.mName,
						type: "GET",
						dataType: "json",
						success: function(data) {							
							if(data.status == "success"){
								that.currentRef.id = data.id;
								that.currentRef.mName = data.name;
								$("#oly").append(getFoundRefTemp(data.msg));
								$("#oly").show();
							}else{
								$("#oly").append(getUnFoundRefTemp(that.currentRef.mName));
								$("#oly").show();
							}
						}
					});	
				}
				
			};
			
			var provideReferal = function(){				
				$("#oly").empty();

				// load data
				if(that.dummy){
					if(dummyData.limit.limit > 0){
						sendApplication();
					}else{
						$("#oly").append(getCannotProvideTemp(dummyData.limit.name));
						$("#oly").show();
					}
				}else{
					$.ajax({
						url: "LimitofRefProc?mName=" + that.currentRef.mName +"&email="+ that.currentRef.emailAddress,
						type: "GET",
						dataType: "json",
						success: function(data) {							
							if(data.limit > 0){
								sendApplication();
							}else{
								$("#oly").append(getCannotProvideTemp(data.name));
								$("#oly").show();
							}
						}
					});	
				}
						
			};
			
			var sendApplication = function(){
				$("#oly").empty();

				// load data
				if(that.dummy){
					if(dummyData.provideRef.status == "success"){
						$("#oly").append(getApplicationSentTemp());
					}else{
						$("#oly").append(getErrorTemp(dummyData.provideRef.msg));
					}
					$("#oly").show();
				}else{	
					$.ajax({
						url: "InRefProc?mName=" + that.currentRef.mName + "&name=" + that.currentRef.name + "&email=" + that.currentRef.emailAddress + "&link=" + that.currentRef.refLink + "&benefit=" + that.currentRef.benefit + "&category=" + that.currentRef.category,
						type: "GET",
						dataType: "json",
						success: function(data) {							
							if(data.status == "success"){
								$("#oly").append(getApplicationSentTemp());
							}else{
								$("#oly").append(getErrorTemp(data.msg));
							}
							$("#oly").show();
						}
					});	
				}
						
			};
			
			var getUnFoundRefTemp = function(mName){
				return	'<div id="olyTitle">We\'d like to help you find a referral</div>'+
						'<div id="olyMain">'+
							'<input id="uFmName" type="email" placeholder="What are you looking for?" value="'+ mName +'"/>'+
							'<input id="email" type="email" placeholder="Your email address"/>'+
							'<button id="getUFBtn">Notify me later</button>'+
						'</div>';
			};

			var getFoundRefTemp = function(msg){
				return	'<div id="olyTitle">We have found you a referral!</div>'+
						'<div id="olySubTitle">'+ msg +'</div>'+	
						'<div id="olyMain">'+
							'<input id="email" type="email" placeholder="Your email address"/>'+
							'<button id="getRefBtn">Get the deal</button>'+
						'</div>';
			};
			
			var sentUnRefTemp = function(){
				return '<div id="olyTitle">We have received your request</div>'+
						'<div id="olySubTitle">We will email you once we find you a referral</div>'+	
						'<div id="olyMain">'+
							'<button id="closeBtn">OK</button>'+
						'</div>';
			};

			var sentRefTemp = function(data){
				return '<div id="olyTitle">Referral details have been sent</div>'+
				//				'<div id="olySubTitle">Please check your email '+ 'xxx' +'</div>'+	
						'<div id="olySubTitle">'+ data.msg +'</div>'+	
						'<div id="olyMain">'+
							'<button id="okBtn">OK</button>'+
							'<button id="saBtn">Send again</button>'+
						'</div>';
			};
			
			var getCanProvideRefTemp = function(){
				return	'<div id="olyTitle">Becoming a referral provider</div>'+
						'<div id="olyProvideSubTitle">All our agents are carefully selected so we can offer quality referrals</div>'+	
						'<div id="olyMain">'+
							'<div class="center">' + 
								'<input id="name" placeholder="Your name"/>'+
								'<input id="email" type="email" placeholder="Your email address"/>'+
							'</div>' +
							'<div class="center">' + 
								'<input id="mName" placeholder="Merchant name"/>'+
								'<input id="referDetial" placeholder="Referral link"/>'+
							'</div>' +
							'<div class="center">' + 
								'<input id="benefit" placeholder="What are the benefits?"/>'+
								'<input id="category" placeholder="What is the category?"/>'+
							'</div>' +
							'<div class="center">' + 
								'<button id="provideRefBtn">Send application</button>'+
							'</div>' +
						'</div>';
			};
			
			var getCannotProvideTemp = function(name){
				return	'<div id="olyTitle" class="leftAlign">Sorry</div>'+
						'<div id="olySubTitle" class="leftAlign">We currently don\'t accept referral for '+ name +', please try another merchant.</div>'+	
						'<div id="olyMain">'+
							'<button id="closeBtn" class="leftAlign">OK</button>'+
						'</div>';
			};
			
			var getApplicationSentTemp = function(){
				return	'<div id="olyTitle" class="leftAlign">Thank you!</div>'+
						'<div id="olySubTitle" class="leftAlign">We have received your application. We will contact you in 1-2 days when we make a decision.</div>'+	
						'<div id="olyMain">'+
							'<button id="closeBtn" class="leftAlign">OK</button>'+
						'</div>';
			};
			
			var getErrorTemp = function(msg){
				return	'<div id="olyTitle">Sorry, something went wrong</div>'+
						'<div id="olySubTitle">'+ msg +'</div>'+
						'<div id="olyMain">'+
							'<button id="closeBtn">OK</button>'+
						'</div>';
			};
	  },
		
	  _closeLyr : function(){
		  $("#oly").hide();
		  $("#olyBack").hide();	
		  $("#oly").empty();
		  this.currentRef = {};
	  },
	  
	  _saveAllMerchants : function(data){
	  	  this.origAllMerchants = data;
		  this.allMerchants = {};
		  this.allMerchants.categoryList = [];
		  this.allMerchants.categoryOptions = [];
		  /*
		  for(var i = 0; i < data.length; i++){
			  this.allMerchants[data[i].name] = data[i].reward;
		  }
		  */
		  for (var i=0;i<data.length;i++) {
			    var category = data[i].category;
			    	// If first entry with this name
// 			 	if (typeof this.allMerchants[category] === "undefined") {
// 			      this.allMerchants[category] = data[i];
// 			      this.allMerchants.categoryList.push(category);
// 			    	// If second entry with this name
// 			    } else 
				if (typeof this.allMerchants[category] === "undefined") {
			      var arr = [data[i]];
				  this.allMerchants[category] = arr;
				  this.allMerchants.categoryList.push(category);
				  
			      this.allMerchants.categoryOptions.push({"name": category, "value": category});
			    	// If third or later entry with this name
			    } else {
			      this.allMerchants[category].push(data[i]);
			    }
			}
	  },
	  
	  _createTiles : function(data){
	  			// create tiles
				var paddingValue = ($("body").width() - this.rowWidth)/(this.columnNum+1)/(this.columnNum+1);
				var eachRowTile = '<div class="tileWrapper" style="width:'+this.rowWidth/(this.columnNum+1)+'px;padding-right:'+paddingValue+'px;padding-bottom:'+paddingValue+'px;"><div class="tile"><span class="tile-label"></span><span class="tile-detail"></span></div></div>';
				for(var cati = 0; cati < this.allMerchants.categoryList.length; cati++){
					var rowTiles ="";
					for(var i = 0; i < this.columnNum; i++){
						rowTiles = rowTiles.concat(eachRowTile);
					}
					
					var category=  this.allMerchants.categoryList[cati];
					var eachRowTiles = "";
					for(var i = 0; i < Math.ceil(this.allMerchants[category].length / this.columnNum); i++){
						eachRowTiles = eachRowTiles.concat("<div class='strip'>"+rowTiles+"</div>");
					}
	
	  				$("#referrals").append("<div id='category"+ cati +"' class='cateContainer'>"+eachRowTiles+"</div>");
					
					var referralTiles = $("#referrals").find("#category"+cati).find(".tile");
					for(var i = 0; i < Math.min(this.allMerchants[category].length, referralTiles.length); i++){
						this.allMerchants[category][i].value = this.allMerchants[category][i].name;
						$(referralTiles[i]).find(".tile-label").text(this.allMerchants[category][i].name);
						$(referralTiles[i]).find(".tile-detail").text(this.allMerchants[category][i].reward);
						$(referralTiles[i]).css("visibility","visible");
					}
					
					// create category buttons
					$("#categories").append("<li class='catButton' data-id='category"+cati+"' style='width:"+this.rowWidth/(this.columnNum+1)+"px;margin-right:"+paddingValue+"px;'>"+category+"</li>");
				}
				$("#categories .catButton").eq(0).css("font-weight", "bold");
				$("#referrals").find("#category0").show();
				$("#upArrow").css("left", $("#categories li").eq(0).offset().left + $("#categories li").eq(0).width()/2 - 6);

				/*		
				var preRandomNum = -1;
				for(var i = 0; i < referralTiles.length; i++){
					var randomNum = Math.floor(Math.random()*this.tileColors.length);
					while(randomNum == preRandomNum 
							|| this.tileColors[randomNum] == $(referralTiles[(i-this.columnNum)%(this.rowNum*this.columnNum)]).css("background-color")){
						randomNum = Math.floor(Math.random()*this.tileColors.length);
					}
					preRandomNum = randomNum;
					$(referralTiles[i]).css("background-color", this.tileColors[randomNum]);
				}
		*/	
				var that = this;
				$( "#merchantName" ).autocomplete({
				      source: data.all_merchants,
				      minLength: 0,
				      select: function( event, ui ) {
				    	  that._setRequestData(ui.item.name);			      
				      }
				});
				
				$("#searchBar").click(function(){
					$("#merchantName").autocomplete( "search", "" );
					$("#merchantName").focus();
				});
	  },
	  
	  _checkEmail : function(node){
		  var emailAddress = node.val().trim();
			var patt = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if(patt.test(emailAddress)){
				return emailAddress;
			}else{
				node.css("border", "1px solid red");
				node.addClass("miss");
				return "";
			}
	  },

	  _checkMName : function(node){
		  var mName = node.val().trim();
		  if(mName != ""){
			  return mName;
		  }else{
			  node.css("border", "1px solid red");
			  node.addClass("miss");
			  return "";
		  }
	  }, 
	  
	 _setRequestData : function(name){
			$("#merchantName").data("sName", name);	
			this.currentRef.mName = name;
	}
};

$( document ).ready(function() {

	var rf = new RF();
	/*$(".dropDownArrow").on("click", function(evt){
		$("#dropDownOly").empty();
		var allMerchants = $(".dropDownArrow").data("allMerchants");
		for(var i = 0; i < allMerchants.length; i++){
			$("#dropDownOly").append("<li><a tabindex='0' data=" + allMerchants[i].id + ">" + allMerchants[i].name + "</a></li>");
		}
		console.log($("#dropDownOly").outerWidth());
		$("#dropDownOly").css("top", $(evt.target.parentNode).offset().top + $(evt.target.parentNode).outerHeight() + "px");
		$("#dropDownOly").css("left", $(evt.target.parentNode).offset().left + $(evt.target.parentNode).outerWidth() - $("#dropDownOly").outerWidth() + "px");

	});*/
	    
});