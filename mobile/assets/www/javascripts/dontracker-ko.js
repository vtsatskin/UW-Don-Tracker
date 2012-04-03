$(function(){;

  function Sighting(options) {
    var self = this;

    for (index in options) {
      self[index] = options[index];
    };

    self.relativeTime = jQuery.timeago(this.created_at);
  };

  function SightingsViewModel(){
    var self = this;

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

    self.getSightings = function(){

      $.getJSON(serveraddress + "/sightings", { since: self.last_updated_at }, function(data) {

        // Insert new sightings
        data.forEach(function(sighting){
          self.sightings.push(new Sighting(sighting));
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
        json_sightings = ko.toJSON(self.sightings);
        window.localStorage.setItem("sightings", json_sightings);

        // Record last fetch time in LocalStorage and ModelView
        current_time = (new Date()).toJSON();
        window.localStorage.setItem("last_updated_at", current_time);
        self.last_updated_at(current_time);
      });
    };
    
    self.clearStorage = function(){
      window.localStorage.clear();
      window.location.reload(true);
    };
  };

  ko.applyBindings(new SightingsViewModel());

  function LocationSelectViewModel(){
    var self = this;

    self.residences = ko.observableArray(['V1', 'MKV', 'REV']);
  };
});