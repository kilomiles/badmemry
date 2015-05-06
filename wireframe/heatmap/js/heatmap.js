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

    for (var e in data.examples) {
        sentences.push(data.examples[e].first + "<br>");
        sentences.push("(<i>" + data.examples[e].second + "</i>)<br><br>");
    }

    // Remove duplicate meanings
    var unique_meanings = [];
    $.each(meanings, function(i, el){
        if($.inArray(el, unique_meanings) === -1) unique_meanings.push(el);
    });

    var numbered_meanings = [];
    $.each(unique_meanings, function(i, el) {
        if (i==0) {
            numbered_meanings.push("1. <strong>" + el.replace(/,+$/, "") + "</strong><br>");
        } else {
            numbered_meanings.push(i+1 + ". " + el.replace(/,+$/, "") + "<br>");
        }
    })

    word_list[word] = numbered_meanings.join("");
    word_list[word.hashCode()] = sentences.join("");

}

// Wrap the translatable content's words in spans (required to detect hovers)
$(".translate").each(function () {
    $(this).html($(this).text().replace(/\b(\S+)\b/g, "<span id=word_span>$1</span>"));
});

// Bind each translatable word to appear highlighted on hover
$(".translate span").hover(
    function () {
        $(this).css("background-color", "yellow");
    },
    function () {
        $(this).css("background-color", "");
    }
);

// Hover events for translatable words
$(".translate span").bind("mouseenter", function (event) {
    var selected, word_data;

    // Get the word that is currently being hovered over
    if ((selected = $(this).html().toLowerCase())) {

        var api = $(this).qtip();
        api.show();
        api.set("content.text", "Translating..."); // Rewrite the loading message
        api.show(event);

        // Get the translated word
        if (word_list[selected]) {
            // Word has already been looked up -- get info from word_list
            api.set("content.text", word_list[selected]);
        } else {
            var translation = $.getJSON("http://glosbe.com/gapi/translate?from=fr&dest=eng&tm=true&format=json&phrase=" + encodeURIComponent(selected) + "&pretty=true&callback=?", function (json) {
                if (json !== null) {
                    // Parse Glosbe's response as a JavaScript object
                    word_data = JSON.parse(JSON.stringify(json));
                    add_to_defns(selected, word_data); // Add the word to word_list
                    api.set("content.text", word_list[selected]); // Set the tooltip to the word's meanings
                }

                console.log(word_list);
            });
        }
    }
});

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

$(document).on("click", ".show-info", function() {
    var word_id = $(this).attr("id");
    var word = $("#studyword_" + word_id).text().slice(0, -2);
    $("#word-info").html("<strong>Definitions:</strong><br>" + word_list[word] + "<br><br><strong>Examples:</strong><br>" + word_list[word.hashCode()]);
    $(".current-word").html("Word Information: <strong>" + word + "</strong>");
});


// Add the clicked word to the Study List
$(".translate span").click(function () {
    var clicked_word = $(this).html().toLowerCase();
    var word_id = clicked_word.hashCode();
    if ($("#" + word_id).length) {
        //alert("Word already in Study list");
    } else {
        var new_studyword = "<li class='list-group-item' id='studyword_" + word_id + "'>" + clicked_word + "<span class='show-info' id='" + word_id + "'> &rarr;</span></li>"
        $(new_studyword).appendTo("#study_word");

    }
    $(this).css("background-color", ""); // Click effect
    $(this).css("background-color", "lawngreen");
});

// Check if each translatable word is on the study list; highlight accordingly
$("#enable_highlight").click(function () {
    $(".translate span").each(function () {
        if ($("#studyword_" + $(this).text().toLowerCase().hashCode()).length) {
            $(this).text($(this).css("background-color", "red").text());
        }
    });
});

function disable_highlight() {
    $(".translate span").each(function () {
        $(this).text($(this).css("background-color", "").text());
    });
}

$("#disable_highlight").click(disable_highlight);

$("#clear_studywords").click(function () {
    $(".list-group-item").each(function () {
        $(this).remove();
    });
    disable_highlight();
});

$(document).ready(function() {
    var scraped_content = $(".translate").html().replace(/ /g, "+");
    // $.getJSON('http://whateverorigin.org/get?url=' + encodeURIComponent("http://ws.detectlanguage.com/0.2/detect?q=" + scraped_content + "&key=e5f269de90c1a389d4ee614a7f55cf44") + '&callback=?', function(data){
    //     alert(data.contents.data[0]);
    //});
    
    // $.get("http://corsproxy.com/ws.detectlanguage.com/0.2/detect?q=" + encodeURIComponent(scraped_content) + "&key=e5f269de90c1a389d4ee614a7f55cf44", function(response) {
    //     alert(response);
    // });
    // $.ajax({
    //     type: "POST",
    //     url: "http://ws.detectlanguage.com/0.2/detect?q=" + scraped_content + "&key=e5f269de90c1a389d4ee614a7f55cf44",
    //     dataType: "jsonp",
    //     success: function(data) {
    //         alert(data);
    //     },
    //     error: function(data) {
    //         alert(data.toString());
    //     }
    // });
    // $.getJSON("http://ws.detectlanguage.com/0.2/detect?q=" + scraped_content + "&key=e5f269de90c1a389d4ee614a7f55cf44", function(json) {
    //     alert(data.content);
    // }); 
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
        }
    },
    solo: true,
    show: false,
    hide: {
        event: "mouseleave",
        effect: true
    },
    style: "ui-tooltip-translate"
})