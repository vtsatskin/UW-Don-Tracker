var development = false;
var serveraddress = development ? "http://10.0.0.78:4567" : "http://uwdt.vtsatskin.com:4567";
var version = "ALPHADEV";
var version_check_delay = 3600000; // 1 hour in milliseconds
var version_last_checked = Date.parse(window.localStorage.getItem("version_last_checked"));
var device_token = window.localStorage.getItem("device_token");

var ERROR_CODES = {
  L2ENGLISH:      "Communication error (feedback)",
  STRANGERDANGER: "No device found",
  WHYYOULIE: "Error creating sighting",
  TALKTOTHEHAND: "Error creating feedback",
}

$(document).bind("mobileinit", function(){
  $.mobile.ajaxEnabled = false;
  $.mobile.allowCrossDomainPages = true;
  $.support.cors = true;
  $.mobile.fixedToolbars.show(true);
  // $.mobile.defaultPageTransition = 'none';
});

$(function(){

  function Sighting(options) {
    for (index in options) {
      this[index] = options[index];
    };

    this.locationString = location_string(
      this.residence,
      this.area,
      this.building,
      this.floor
    );
  };

  function location_string(residence, area, building, floor){
    var string = residence + " ";
    string += area;
    string += building;
    if (residence != "Renison") {
      string += " Floor ";
    }
    string += floor;
    return string;
  }

  function register_device(){
    if (window.device) {
      var params = {
        uuid: window.device.uuid,
        phonegap: window.device.phonegap,
        platform: window.device.platform,
        name: window.device.name,
        version: version,
      };
    } else {
      var params = {
        uuid: "NO-DEVICE-INFO",
        version: version,
      };
    }
    $.post(serveraddress + "/device", params, function(data){
      window.localStorage.setItem("device_token", data.token);
      device_token = data.token;
    });
  }

  ////
  // Observables Extenders
  ////

  //////
  // Saves settings to localStorage and server
  ko.extenders.save_setting = function(target, option){
    target.subscribe(function(newValue){
      // Save to server
      if(device_token) {
        console.log('Should save to server:' + option + '=' + newValue);
        var params = {}
        params[option] = newValue;
        $.post(serveraddress + '/device/' + device_token + '/update', params, function(data){
          console.log("Worked! " + data);
        });
      }

      // Save to localStorage
      window.localStorage.setItem(option, newValue);
    });
    return target;
  }

  function AppViewModel(){
    var self = this;

    self.development = development;

    ////
    // Device Registration
    ////
    
    // TODO: Have this work on desktop
    // Wait until phonegap loaded to register device
    document.addEventListener("deviceready", onDeviceReady, false);
    
    function onDeviceReady(){
      if (device_token) {
        // Ensure the device is registered properly
        $.getJSON(serveraddress + "/device/" + device_token).error(function(){
          window.localStorage.removeItem("device_token");
          register_device();
        });
      } else {
        register_device();
      }
    }

    ////
    // Updates
    ////

    self.show_update_text = ko.observable(false);

    self.check_for_update = function(dont_throttle){
      $.getJSON(serveraddress + "/check_version/" + version, function(data){
        if(!data.latest) {
          self.show_update_text(true);
          $("#update_text").html(data.message); // Using jQuery due to ko's inability to render html
        }
      });
    }

    self.check_for_update();

    $(document).everyTime(version_check_delay, function() {
      self.check_for_update();
    });

    ////
    // SIGHTINGS
    ////

    // Get stored sightings
    var stored_sightings = window.localStorage.getItem("sightings");
    stored_sightings = stored_sightings ? JSON.parse(stored_sightings) : [];
    self.sightings = ko.observableArray(stored_sightings);

    // Get last updated at info
    self.last_updated_at = ko.observable(window.localStorage.getItem("last_updated_at"));
    self.last_updated_at_relative = ko.computed(function() {
      if (self.last_updated_at()) {
        return jQuery.timeago(self.last_updated_at());
      } else {
        return "never";
      }
    }, self);

    //////
    // Queries server for sightings, saves and displays them
    self.getSightings = function(){

      $.getJSON(serveraddress + "/sightings", { since: self.last_updated_at, limit: 50 }, function(data) {

        // Insert new sightings
        data.forEach(function(sighting){
          self.sightings.unshift(new Sighting(sighting));
        });

        // Sort sightings by created_at
        self.sightings.sort(function(prev, next){
          if (prev.created_at == next.created_at) {
            return 0;
          } else {
            return prev.created_at < next.created_at ? 1 : -1
          }
        });

        // Save all sightings for future loads
        json_sightings = ko.toJSON(self.sightings());
        window.localStorage.setItem("sightings", json_sightings);

        // Record last fetch time in LocalStorage and ModelView
        current_time = (new Date()).toJSON();
        window.localStorage.setItem("last_updated_at", current_time);
        self.last_updated_at(current_time);
      });
    };

    self.getSightings();

    //////
    // POSTs a sighting to the server, updates UI
    self.postSighting = function(params){
      $.mobile.showPageLoadingMsg("b", "Posting...", true);

      // Old code for parasing a DOM form
      // var serialized = $(formElement).serializeArray();
      // var params = {};
      // 
      // serialized.forEach(function(obj){
      //   params[obj.name] = obj.value;
      // });

      if(typeof(params) == "undefined" || params instanceof HTMLElement) {
        params = {
          residence:    self.selected_residence(),
          area:         self.selected_area(),
          building:     self.selected_building(),
          floor:        self.selected_floor(),
          danger_level: self.selected_danger_level(),
        };
      }

      // Insert device token into POST data
      params["device_token"] = device_token;

      $.post(serveraddress + "/sighting", params, function(data){
        self.getSightings();
        $.mobile.changePage('index.html');
        $.mobile.hidePageLoadingMsg();
      },'json')
        .error(function(data){
          alert("There was an error adding your sighting: " + data.responseText)
          $.mobile.hidePageLoadingMsg();
        });

    };

    //////
    // Adds a sighting from object
    self.addSighting = function(sighting){
      self.sightings.unshift(new Sighting(sighting));
    }

    ////
    // LOCATIONS
    ////

    self.residences = ko.observable(["V1", "MKV", "REV", "Renison"]);
    self.danger_levels = ko.observable(["High", "Medium", "Low"]);

    //////
    // Returns areas for specified residence
    self.areas_map = function(residence){
      var _areas = [];

      switch(residence) {
        case "V1":
          _areas = [
            { id: "N", name: "North" },
            { id: "S", name: "South" },
            { id: "E", name: "East" },
            { id: "W", name: "West" },
          ]
          break;
        case "MKV":
          _areas = [{ id: "", name: "None"}]; // Hack to get blank values
          break;  
        case "REV":
          _areas = [{ id: "", name: "None"}]; // Hack to get blank values
          break;
        case "Renison":
          _areas = [{ id: "", name: "None"}]; // Hack to get blank values
          break;
      }

      return _areas;
    };

    //////
    // Returns buildings for specified residence
    self.buildings_map = function(residence){
      var _buildings = [];

      switch(residence) {
        case "V1":
          _buildings = [
            { id: "1", name: "1" },
            { id: "2", name: "2" },
            { id: "3", name: "3" },
            { id: "4", name: "4" },
            { id: "5", name: "5" },
            { id: "6", name: "6" },
            { id: "7", name: "7" },
            { id: "8", name: "8" },
          ]
          break;
        case "MKV":
          _buildings = [
            { id: "E", name: "East" },
            { id: "W", name: "West" },
          ];
          break;
        case "REV":
          _buildings = [
            { id: "E", name: "East" },
            { id: "W", name: "West" },
            { id: "N", name: "North" },
            { id: "S", name: "South" },
          ];
          break;
        case "Renison":
          _buildings = [{ id: "", name: "None"}]; // Hack to get blank values
          break;
      }

      return _buildings;
    };

    //////
    // Returns floors for specified residence
    self.floors_map = function(residence){
      var _floors = [];

      switch(residence) {
        case "V1":
          _floors = [
            { id: "B", name: "Basement" },
            { id: "1", name: "1" },
            { id: "2", name: "2" },
            { id: "3", name: "3" },
          ]
          break;
        case "MKV":
          _floors = [
            { id: "1", name: "1" },
            { id: "2", name: "2" },
            { id: "3", name: "3" },
            { id: "4", name: "4" },
          ];
          break;
        case "REV":
          _floors = [
            { id: "1", name: "1" },
            { id: "2", name: "2" },
            { id: "3", name: "3" },
            { id: "4", name: "4" },
            { id: "5", name: "5" },
          ];
          break;
        case "Renison":
          _floors = [
            { id: "Fubar", name: "Fubar" },
            { id: "Animal", name: "Animal" },
            { id: "Loft", name: "Loft" },
            { id: "Midway", name: "Midway" },
            { id: "Oasis", name: "Oasis" },
            { id: "Moose Crossing", name: "Moose Crossing" },
            { id: "Euphoria", name: "Euphoria" },
            { id: "Timbuktu", name: "Timbuktu" },
            { id: "Treetop", name: "Treetop" },
            { id: "Down Under", name: "Down Under" },
          ];
          break;
      }

      return _floors;
    };

    // Selected location form data and settings
    self.selected_residence = ko.observable("V1");
    self.selected_building = ko.observable();
    self.selected_area = ko.observable();
    self.selected_floor = ko.observable();
    self.selected_danger_level = ko.observable("Medium");

    self.selected_areas = ko.dependentObservable(function(){
      return self.areas_map(self.selected_residence());
    });

    self.selected_buildings = ko.dependentObservable(function(){
      return self.buildings_map(self.selected_residence());
    });

    self.selected_floors = ko.dependentObservable(function(){
      return self.floors_map(self.selected_residence());
    });

    // Stored current location information retrieval
    var stored_current_residence = window.localStorage.getItem("current_residence")
    stored_current_residence = stored_current_residence ? stored_current_residence : "V1";

    var stored_current_building = window.localStorage.getItem("current_building")
    stored_current_building = stored_current_building ? stored_current_building : "";

    var stored_current_area = window.localStorage.getItem("current_area")
    stored_current_area = stored_current_area ? stored_current_area : "";

    var stored_current_floor = window.localStorage.getItem("current_floor")
    stored_current_floor = stored_current_floor ? stored_current_floor : "";
    
    // Current location form data and settings
    self.current_residence = ko.observable(stored_current_residence).extend({save_setting: "current_residence"});;
    self.current_building = ko.observable(stored_current_building).extend({save_setting: "current_building"});
    self.current_area = ko.observable(stored_current_area).extend({save_setting: "current_area"});
    self.current_floor = ko.observable(stored_current_floor).extend({save_setting: "current_floor"});

    self.current_areas = ko.dependentObservable(function(){
      return self.areas_map(self.current_residence());
    });

    self.current_buildings = ko.dependentObservable(function(){
      return self.buildings_map(self.current_residence());
    });

    self.current_floors = ko.dependentObservable(function(){
      return self.floors_map(self.current_residence());
    });
    
    self.current_location_text = ko.dependentObservable(function(){
      return location_string(
        self.current_residence(),
        self.current_area(),
        self.current_building(),
        self.current_floor()
      );
    });

    //////
    // Sets selected location values to those of current location
    self.useCurrentLocation = function(){
      self.selected_residence(self.current_residence());
      self.selected_building(self.current_building());
      self.selected_area(self.current_area());
      self.selected_floor(self.current_floor());
    };

    //////
    // Uses current location for posting
    self.postCurrentLocationSighting = function(){
      self.postSighting({
          residence:    self.current_residence(),
          area:         self.current_area(),
          building:     self.current_building(),
          floor:        self.current_floor(),
          danger_level: self.selected_danger_level(),
      });
    };

    //////
	// Submit Feedback
	////
    self.feedbacktext = ko.observable();
	self.submitFeedback = function() {
		params = {
		          message:    self.feedbacktext(),
		          
		          device_token:  device_token,
		        };
				
			  
		$.post(serveraddress + "/feedback", params, function(data){
		$.mobile.changePage('index.html');
		$.mobile.hidePageLoadingMsg();
	},'json')
		.error(function(data){
		    alert("There was an error adding your sighting: " + data.responseText)
		    $.mobile.hidePageLoadingMsg();
		 		});
		
	};
	
    ////
    // Utilities
    ////
    self.clearStorage = function(){
      window.localStorage.clear();
      window.location.reload(true);
    };

    //////
    // Parses given ISO-8601 timestamp to a relative time
    // Inserts this time into the DOM element
    // Relative time is auto-updating
    ko.bindingHandlers.timeago = {
      update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        // This will be called once when the binding is first applied to an element,
        // and again whenever the associated observable changes value.
        // Update the DOM element based on the supplied values here.
        var ele = $(element);
        var timestamp = ko.utils.unwrapObservable(valueAccessor());

        if (timestamp) {
          ele.attr("title", timestamp);
          ele.timeago();
          ele.text(jQuery.timeago(timestamp));
        } else {
          ele.text("never");
        }
      }
    };
  };

  ko.applyBindings(new AppViewModel());
});

	
