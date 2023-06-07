var _dataMonitor,
	_eContainer,
	_config,
	_init = function _init() {
		_eContainer = $(".eventFeed");
		_getConfig().then(function(){
			_renderConfig();
			_startMonitor();
			_dateTime();
			if(_config.timeFormat === "ago"){
				_updateAgo();
			}
		});
	},
	_getConfig = function _getConfig() {
		return $.get("config.json", function(data){
			_config = data;
		});
	},
	_renderConfig = function _renderConfig() {
		var check = `<span class="checkmark">
					  <div class="checkmark_stem"></div>
					  <div class="checkmark_kick"></div>
					</span>`;
		$(".locationName").html(check + " <span class='info'>Connected to " + _config.locationName + "</span>");
		$(".loading").hide();
		$(".wrapper").show();
	},
	_startMonitor = function _startMonitor() {
		_dataMonitor = new WebSocket("ws://" + window.location.host + ":" + _config.wsPort);
		_dataMonitor.onmessage = _dataRefresh;
		_dataMonitor.onerror = function(){
			$(".locationName .checkmark").addClass("error");
			$(".locationName .info").text("Error Connecting to " + _config.locationName);
		}
	},
	_dataRefresh = function _dataRefresh(evt) {
		var o = JSON.parse(evt.data),
			fd = moment(o.time).subtract(30, 'seconds').fromNow(),
			verb = (o.value == "on" || o.value == "off") ? "turned" : "was";

		if(_config.timeFormat != "ago"){
			fd = moment(o.time).subtract(30, 'seconds').format(_config.timeFormat);
		}

		if(_config.hasOwnProperty("deviceLabels")){
			if(_config.deviceLabels.hasOwnProperty(o.deviceId)){
				var d = _config.deviceLabels[o.deviceId];
				o.label = d.label;
				if(d.hasOwnProperty("verb") && d.verb === false){
					verb = "";
				}
			}
		}

		html = `<div class="item">
		          <span class="device">${o.label}</span> ${verb} 
		          <span class="val">${o.value}</span> 
		          <span data-dt="${o.time}" class="time">${fd}</span> 
		        </div>`;

		var items = _eContainer.find(".item");
	    if(items.length>(_config.eventLimit-1)){
	    	items.last().remove();
	    }
	    $(html).prependTo(".eventFeed");
	},
	_dateTime = function _dateTime() {
		var dowEl = $(".date .dow"),
			dateEl = $(".date .d"),
			timeEl = $(".time .t"),
			timePEL = $(".time .dp"),
			now,
			timer,
			updateDate = function(){
				window.clearInterval(timer);
	            timer = null;
	            now = moment();
	            dowEl.text(now.format("dddd"));
	            dateEl.text(now.format("MMMM D, YYYY"));
	            timeEl.text(now.format("h:mm"));
	            timePEL.text(now.format("a"));
	            timer = window.setTimeout(updateDate, 30000);
			}
		updateDate();
	},
	_updateAgo = function _updateAgo() {
		var timer,
			updateAgoStamp = function(){
				window.clearInterval(timer);
	            timer = null;
	            $(".item .time").each(function(){
	            	var t = $(this),
	            		d = moment(t.data("dt"));
	            	t.text(d.fromNow());
	            });
	            timer = window.setTimeout(updateAgoStamp, 30000);
			}
		updateAgoStamp();
	};

$(function() {
	_init();
});