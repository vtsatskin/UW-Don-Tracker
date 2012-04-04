$(function(){

  $(document).bind("mobileinit", function(){
    $.mobile.ajaxEnabled = false;
    $.mobile.allowCrossDomainPages = true ;
  });

  function Sighting(options) {
    for (index in options) {
      this[index] = options[index];
    };

    this.relativeTime = jQuery.timeago(this.created_at);
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
    string += " Floor ";
    string += floor;
    return string;
  }

  function AppViewModel(){
    var self = this;

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

      $.getJSON(serveraddress + "/sightings", { since: self.last_updated_at }, function(data) {

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

    //////
    // POSTs a sighting to the server, updates UI
    self.postSighting = function(formElement){
      var serialized = $(formElement).serializeArray();
      var params = {};

      serialized.forEach(function(obj){
        params[obj.name] = obj.value;
      });

      $.post(serveraddress + "/sighting", params, function(data){
        self.getSightings();
        $.mobile.changePage('index.html');
      },'json');

    };

    //////
    // Adds a sighting from object
    self.addSighting = function(sighting){
      self.sightings.unshift(new Sighting(sighting));
    }

    ////
    // LOCATIONS
    ////

    self.residences = ko.observableArray(["V1", "MKV", "REV"]);

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
      }

      return _floors;
    };

    // Selected location form data and settings
    self.selected_residence = ko.observable("V1");
    self.selected_building = ko.observable();
    self.selected_area = ko.observable();
    self.selected_floor = ko.observable();

    self.selected_areas = ko.dependentObservable(function(){
      return self.areas_map(self.selected_residence());
    });

    self.selected_buildings = ko.dependentObservable(function(){
      return self.buildings_map(self.selected_residence());
    });

    self.selected_floors = ko.dependentObservable(function(){
      return self.floors_map(self.selected_residence());
    });

    // Current location form data and settings
    self.current_residence = ko.observable("V1");
    self.current_building = ko.observable();
    self.current_area = ko.observable();
    self.current_floor = ko.observable();

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

    ////
    // Utilities
    ////

    self.clearStorage = function(){
      window.localStorage.clear();
      window.location.reload(true);
    };

    ////
    // Observables Extenders
    ////
    
    ko.extenders.save_device_setting_to_server = function(target, option){
      target.subscribe(function(newValue){
        console.log('Should save to server:' + option + '=' + newValue);
        // $.post(serveraddress + '/device')
      });
      return target;
    }
  };

  ko.applyBindings(new AppViewModel());
});