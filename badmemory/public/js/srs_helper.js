$(document).ready(function() {
	var all_info = "";
	var flipped = false;
	$("#side_b").hide();
  $.get("/get_next_cards?username=" + username, function(data) {
 		var objectArray = data;
		var sentences = [];
		var i = 0;
		function a() {
			$(".progress-bar").attr('style', 'width:' + (((i + 1) / (data.length - 1)) * 100.0) + '%;');
			if (i >= data.length) { //Kill function if all sentences seen.
				console.log("No sentences left to be studied.");
				$('#study_card').empty();
				$('#status_bar').hide();
				$('#flip_card').hide();
				$('#study_card').append("<p><strong>Congrats! No sentences left to be studied!</strong></p>");
				return false;
			}
			
			$('#card_content').empty();
			$('#card_content').append("<p>"+data[i].text+"</p>");
			
			var sentence = $("#card_content").text();
			var words = sentence.split(" ");

			// Collect definitions and sample sentneces for study words in the current sentence
			$.get("/get_words?username=" + username, function(resp) {
				for (var i=0; i < resp.length; i++) {
					if (jQuery.inArray(resp[i].text, words)!==-1) {
						var word = resp[i].text;
						all_info += "<strong>Definition: "+ word + "</strong><br>" + resp[i].definition + "<br>";
						all_info += "<strong>Example sentences:</strong><br>" + resp[i].examples + "<hr>";
					}
				}
			});

			$('.score').unbind('click').bind('click', function(res) {
				if (i >= data.length) { // Kill function if all sentences seen.
					console.log("No sentences left to be studied.");
					$('#study_card').empty();
					$('#status_bar').hide();
					$('#flip_card').hide();
					$('#study_card').append("<p><strong>Congrats! No sentences left to be studied!</strong></p>");
					confirm("You've finished studying!");

					return false;
				}
				var qualityGrade = parseInt($(this).text());
				var numReviews = data[i].numReviews;
				//newEf >= 1.3
				var newEF = Math.max(1.3, data[i].eFactor-0.8+0.28*qualityGrade-0.02*qualityGrade*qualityGrade);
				
				var newInterval = 0;
				if (numReviews < 1) {
					newInterval = 1;
					numReviews++;
				} else if (numReviews === 1) {
					newInterval = 6;
					numReviews++;
				} else { 
					newInterval = Math.ceil(data[i].interval*newEF);
					numReviews++;
				}
				
				console.log("qualityGrade: " + qualityGrade, "newInterval: " + newInterval, "newEF: " + newEF);
				//confirm("qualityGrade: " + qualityGrade + "  newInterval: " + newInterval + "  newEF: " + newEF);
        $.post("/update_card?username=" + username + "&interval=" + newInterval + "&id=" + data[i].id + "&efactor=" + newEF + "&pageid=" + data[i].pageId + "&numreviews=" + numReviews);
				i++;
				all_info = "";
				a();
			});
			
			//Confirm that user wants to delete sentence.
			$('#delete_sentence').unbind('click').bind('click', function() {
				if (confirm('Click OK to delete this sentence from your repository.')) {
          $.post("/delete_sentence?username=" + username + "&id=" + data[i].id + "&pageid=" + data[i].pageId);
					i++;
					all_info = "";
					a();
				}
			});

			function toggle_flip() {
				if (flipped) {
					flipped = false;
					location.reload();
				} else {
				  	flipped = true;

				  	if (all_info) {
				  		$("#side_b").html("<div class='side-b'>" + all_info + "</style>");
				  	} else {
				  		$("#side_b").html('<p style="text-align:center; margin-top:2%; margin-bottom:2%;"> No study words were found in this sentence. </style>');
				  	}
				  	
					$("#study_card").flip({
						direction:'rl',
						content: $("#side_b").html(),
					})
				}
			}

			$(".toggle").unbind('click').bind('click', function() {
				toggle_flip();
			});
		}
		a();
	});
});
