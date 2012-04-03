 $("#refresh_btn").click = refreshlist()
  updateuserloc()
  $("#residence").change ->
    $("#buildingselectorv1").css "display", "none"
    $("#floorselectormkv, #floorselectorrev, #floorselectorv1").css "display", "none"
    if $("#residence").val() is "V1"
      $("#buildingselectorv1").css "display", "block"
      $("#floorselectorv1").css "display", "block"
    else if $("#residence").val() is "MKV"
      $("#floorselectormkv").css "display", "block"
    else $("#floorselectorrev").css "display", "block"  if $("#residence").val() is "REV"

  $("#floorselectormkv, #floorselectorrev, #floorselectorv1").change ->
    $("#savediv").css "display", "block"

  $("#save").click ->
    window.localStorage.setItem "currentres", $("#residence").val()
    window.localStorage.setItem "currentarea", $("#area").val()
    if $("#residence").val() is "V1"
      window.localStorage.setItem "currentbuilding", $("#buildingv1").val()
      window.localStorage.setItem "currentfloor", $("#floorv1").val()
    else if $("#residence").val() is "MKV"
      window.localStorage.setItem "currentbuilding", null
      window.localStorage.setItem "currentfloor", $("#floormkv").val()
    else if $("#residence").val() is "REV"
      window.localStorage.setItem "currentbuilding", null
      window.localStorage.setItem "currentfloor", $("#floorrev").val()
    updateuserloc()
    window.location = "#main"

  $("#residence_s").change ->
    $("#buildingselectorv1_s").css "display", "none"
    $("#floorselectormkv_s, #floorselectorrev_s, #floorselectorv1_s").css "display", "none"
    if $("#residence_s").val() is "V1"
      $("#buildingselectorv1_s").css "display", "block"
      $("#floorselectorv1_s").css "display", "block"
    else if $("#residence_s").val() is "MKV"
      $("#floorselectormkv_s").css "display", "block"
    else $("#floorselectorrev_s").css "display", "block"  if $("#residence_s").val() is "REV"

  $("#dangerlevel").change ->
    $("#submitdiv").css "display", "block"

  $("#submit").click ->
    residence = $("#residence_s").val()
    building = null
    floor = null
    area = $("#area").val()
    danger_level = $("#dangerlevel").val()
    if residence is "V1"
      building = $("#buildingv1_s").val()
      floor = $("#floorv1_s").val()
    else if residence is "MKV"
      floor = $("#floormkv_s").val()
    else floor = $("#floorrev_s").val()  if residence is "REV"
    debugger
    $.post(serveraddress + "/sighting",
      residence: residence
      area: area
      building: building
      floor: floor
      danger_level: danger_level
    , "json").success((data) ->
      alert "worked"
      console.log data
    ).error (data) ->
      alert "did not work: " + data.responseText
      console.log data.responseText

    debugger

  $("a[href=#refresh]").click ->
    $.get serveraddress + "/sightings", (sightings) ->
      sightingslist = $("#sightingslist")
      sightingslist_html = ""
      sightings.forEach (sighting) ->
        html = "<li class=\"ui-li ui-li-static ui-body-c ui-corner-top\">"
        html += "<p class=\"ui-li-aside ui-li-desc\"><strong>" + sighting.created_at + "</strong></p>"
        html += "<h3 class=\"ui-li-heading\">Danger Level: " + sighting.danger_level + "</h3>"
        html += "<p class=\"ui-li-desc\">"
        html += "Residence <strong>" + sighting.residence + "</strong> | "
        html += "Building: <strong>" + sighting.building + "</strong> | "
        html += "Area: <strong>" + sighting.area + "</strong> | "
        html += "Floor: <strong>" + sighting.floor + "</strong>"
        html += "</p>"
        html += "</li>"
        sightingslist_html += html

      sightingslist.html sightingslist_html