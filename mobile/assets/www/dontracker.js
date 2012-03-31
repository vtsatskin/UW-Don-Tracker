function rezselected() {
      		var x = document.getElementById("selectrez").value;
      		if (x=="MKV") {
      			var newdiv = document.createElement("mkvarea");
      			newdiv.innerHTML = "</br><label for="select-area-mkv" class="select">Quad:</label>" +
      				"<select name="select-area-mkv" id="selectareamkv">" + 
					"<option value="N">North</option>" +
					"<option value="S">South</option>" +
					"<option value="E">East</option>" +
					"<option value="W">West</option>" +
					"</select>";
				document.getElementById("locchooser").appendChild(newdiv);
				}
      	}