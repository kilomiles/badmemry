$(document).ready(function() {
	var word_list = {};

	// Add word to word_list, including all of word's unique meanings
	function add_to_defns(word, data) {
		var meanings = [];
		var sentences = [];
		// Traverse Glosbe's JSON return value; extract meanings
		for (var t in data.tuc) {
			for (var m in data.tuc[t].meanings) {
				var defn = data.tuc[t].meanings[m];
				if (defn.language == "eng") {
					meanings.push(defn.text.toLowerCase());
				}
			}
		}

		// Extract sample sentences
		for (var e in data.examples) {
			sentences.push(data.examples[e].first + "<br>");
			sentences.push("(<i>" + data.examples[e].second + "</i>)<br><br>");
		}

		// Remove duplicate meanings (quite common in Glosbe's database)
		var unique_meanings = [];
		$.each(meanings, function(i, el){
			if($.inArray(el, unique_meanings) === -1) unique_meanings.push(el);
		});

		// Extract word meanings/definitions
		var numbered_meanings = [];
		$.each(unique_meanings, function(i, el) {
			if (i==0) {
				numbered_meanings.push("1. <strong>" + el.replace(/,+$/, "") + "</strong><br>");
			} else {
				numbered_meanings.push(i+1 + ". " + el.replace(/,+$/, "") + "<br>");
			}
		});

		// For pretty output
		word_list[word] = numbered_meanings.join("");
		word_list[word.hashCode()] = sentences.join("");

	}

	// Use for encoding study words; prevents foreign characters from interfering with the DOM
	String.prototype.hashCode = function() {
		var hash = 0, i, chr, len;
		if (this.length == 0) return hash;
		for (i = 0, len = this.length; i < len; i++) {
		chr   = this.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
		}
		return hash;
	};

	// On click, load a study word's info in to the Word Information panel
	$(document).on("click", ".studyword", function() {
		var word_id = $(this).attr("id");
		var word = $("#" + word_id).text();
		$("#wordInfo").html("<strong>Definitions:</strong><br>" + word_list[word] + "<br><br><strong>Examples:</strong><br>" + word_list[word.hashCode()]);
		$(".current-word").html("Word Information: <strong>" + word + "</strong>");
		$(".studyword").css("background-color", "white");
		$(this).css("background-color", "lightgreen");
	});

	// Check if each translatable word is on the study list; highlight accordingly
	$("#enable_highlight").click(function () {
		$(".translate span").each(function () {
			if ($("#" + $(this).text().toLowerCase().hashCode()).length) {
				$(this).text($(this).css("background-color", "red").text());
			}
		});
	});

	function disable_highlight() {
		$(".translate span").each(function () {
			$(this).text($(this).css("background-color", "").text());
		});
		$("#wordInfo").html("To see definitions and sample sentences, click a word on the Study List.");
		$(".current-word").html("Word Information");
		$(".studyword").css("background-color", "white");
	}

	$("#disable_highlight").click(disable_highlight);

	$("#clear_studywords").click(function () {
		$(".list-group-item").each(function () {
			$(this).remove();
		});
		disable_highlight();
		$("#study-word").empty();
	});


	function getScrapedHTML() {
			var url = $('#textbox_url').val();
			if (url.length == 0) {return;}
			if (url.substring(0,4) !== "http") {url = "http://" + url;} 
			// Call our node app to scrape the webpage's content
      $.post("/scrape_data?web_url=" + url + "&username=" + username,
      function(data) {
				$('#siteWell').empty();
				$('#siteWell').append(data);

				// Get the scraped content's language (returned from scrape.js)
				var detected;
				try {
					detected = $.parseJSON($(".detected_language").text()).data.detections[0].language;
				} catch(err) {
					detected = "en";
				}

				// Wrap the translatable content's words in spans (required to detect hovers)
				$(".translate").each(function () {
					$(this).html($(this).text().replace(/\b(\S+)\b/g, "<span id=word_span>$1</span>"));
				});

				// Configure qTip2 behaviour and appearance
				$(".translate span").qtip({
					content: "Translating...", // Set an initial loading message...
					position: {
						my: "top left",
						at: "bottom right",
						viewport: $(window),
						target: "mouse",
						adjust: {
							mouse: false
						},
						container: $(this).parent()
					},
					solo: true,
					show: false,
					hide: {
						event: "mouseleave",
						effect: true
					},
					style: "ui-tooltip-translate"
				});

				// Bind each translatable word to appear highlighted on hover
				$(".translate span").hover(function() {
					$(this).css("background-color", "yellow");
					var selected, word_data;

					// Get the word that is currently being hovered over
					if ((selected = $(this).html().toLowerCase())) {
						var api = $(this).qtip();

						api.show();
						api.set("content.text", "Translating..."); // Rewrite the loading message
						api.show();

						// Get the translated word
						if (word_list[selected]) {
							// Word has already been looked up -- get info from word_list
							api.set("content.text", word_list[selected]);
						} else {
							var translation = $.getJSON("http://glosbe.com/gapi/translate?from=" + detected + "&dest=eng&tm=true&format=json&phrase=" + encodeURIComponent(selected) + "&pretty=true&callback=?", function (json) {
								if (json !== null) {
									word_data = JSON.parse(JSON.stringify(json)); // Parse Glosbe's response as a JavaScript object
									add_to_defns(selected, word_data); // Add the word to word_list
									api.set("content.text", word_list[selected]); // Set the tooltip to the word's meanings
								}
								console.log(word_list);
							});
						}
					}
				});

				$(".translate span").mouseleave(function() {
					$(this).css("background-color", "white");
				});

				// Add the clicked word to the Study List
				$(".translate span").click(function () {
					var clicked_word = $(this).html().toLowerCase();
					var word_id = clicked_word.hashCode();
					if ($("#" + word_id).length) {
						//alert("Word already in Study list");
					} else {
						var new_studyword = "<li class='list-group-item studyword' id=" + word_id + ">" + clicked_word + "</li>";
						$(new_studyword).appendTo("#study-word");




						$.post('/add_word_data?username=' + username + "&clicked_word=" + 
							encodeURIComponent(clicked_word).replace(/[!'()*]/g, escape) + "&clicked_defn=" + encodeURIComponent(word_list[clicked_word]).replace(/[!'()*]/g, escape) + "&clicked_examples=" + encodeURIComponent(word_list[word_id]).replace(/[!'()*]/g, escape), function(data) {
								console.log(data);
						})

					}
					// Click effect
					$(this).css("background-color", "");
					$(this).css("background-color", "lawngreen");
				});
			});
		}

		// Placeholder while the external site's content is being scraped
		$("#btn_submit_url").click(function() {
			$("#siteWell").html("<p style='text-align:center;'>Loading...</p>");
			disable_highlight();
			$("#study-word").empty();
			$("#pageActions").show();
			getScrapedHTML();
		});

		$("#textbox_url").keypress(function(key) {
			if (key.which == 13) {
				key.preventDefault();
				$("#siteWell").html("<p style='text-align:center;'>Loading...</p>");
				disable_highlight();
				$("#study-word").empty();
				$("#pageActions").show();
				getScrapedHTML();
			}
		});

});
