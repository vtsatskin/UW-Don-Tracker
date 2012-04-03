$(function(){

  function Sighting(options) {
    var self = this;

    for (index in options) {
      self[index] = options[index];
    };

    self.relativeTime = jQuery.timeago(this.created_at);
  };

  function SightingsViewModel(){
    var self = this;

    var stored_sightings = window.localStorage.getItem("sightings");
    if (stored_sightings) { // check if null
      stored_sightings = JSON.parse(stored_sightings);
    } else {
      stored_sightings = [];
    }

    self.sightings = ko.observableArray(stored_sightings);

    self.getSightings = function(){
      var last_updated_at = window.localStorage.getItem('last_updated_at');

      $.getJSON(serveraddress + "/sigtings", { since: last_updated_at }, function(data) {

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

        // Record last fetch time
        current_time = (new Date()).toJSON();
        window.localStorage.setItem("last_updated_at", current_time);
      });
    }
  };

  ko.applyBindings(new SightingsViewModel());
});