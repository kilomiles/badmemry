var express = require('express');
var router = express.Router();
var user_account_func = require('../helper/user_account_func.js');
var password_compare = require('../helper/security_func.js');

var request = require('request');
var cheerio = require('cheerio');
var qs = require('querystring');

function render(path) {
  return function(req, res) {
      console.log("path is " + path);
      res.render(path);
      // this is the same as res.render(path, {'user': false});
  };
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on 
  if (req.isAuthenticated())
    return next();
  // if they aren't redirect them to the home page
  res.redirect('/');
}

function re_route(ret_val, req, res) {
  if (ret_val == "password_check_failed")
  {
    res.render('app/profile', {updateStatus: "Fail",
                              updateMessage: "Wrong password!",
                              user: req.user, 
                              csrf: req.csrfToken()});
  }
  else if (ret_val == "update_success")
  {
    res.render('app/profile', {updateStatus: "Success",
                              updateMessage: "Update has succeeded", 
                              user: req.user,
                              csrf: req.csrfToken()});
  }
  else if (ret_val == "delete_success")
  {
    res.redirect('/logout');
  }        
  else if (ret_val == "user_exists")
  {
    res.render("app/profile", {updateStatus: "Fail",
                              updateMessage: "Failed: User Exists!",
                              user: req.user,
                              csrf: req.csrfToken()});
  }
  else if (ret_val == "update_length")
  {
    res.render("app/profile", {updateStatus: "Fail",
                              updateMessage: "Note: Username must be 30 characters or less. Password must be 60 characters or less. Email must be 50 characters or less!",
                              user: req.user,
                              csrf: req.csrfToken()});
  }
}

module.exports = function(passport, models, sequelize) {
  var user = models.user;

  // render 'study' for logged-in users
  router.get('/', function(req, res) {
    if (req.isAuthenticated())
      res.redirect('/study'); 
    else
      res.render('static/index', { message: req.flash('signupMessage'),
                                  csrf: req.csrfToken()
                                 });
  });

  // ==============================
  // static pages

  router.get('/report', function(req, res) {
    res.render('static/report', { csrf: req.csrfToken() })
  });

  // temporary wireframe pages - TODOXXX need to be integrated elsewhere
  // Do i need to be logged in to access?
  router.get('/bookmarklet', render('static/bookmarklet'));
  router.get('/heatmap', isLoggedIn, function(req, res) {
    res.render('app/heatmap', { user: req.user });
  });

  // logout 
  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  // signup and login operations
  router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/study',
    failureRedirect: '/', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));
  router.post('/login', passport.authenticate('local-login', {
    successRedirect : '/study', // redirect to the secure study screen
    failureRedirect : '/', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  // ==============================
  // pages for logged-in users

  router.get('/study', isLoggedIn, function(req, res) {
    res.render('app/study', { user : req.user , sequelize: sequelize });
  });

  router.get('/pages', isLoggedIn, function(req, res) {
    models.page.findAll ({
      where: { userId: req.user.username }
    }).success(function(pages) {
      /* Average the progress on the sentences in page */
      sequelize.query("select page.id as \"pageId\", avg(CASE WHEN sentence.interval / 365.0 > 1.0 THEN 1.0 ELSE sentence.interval / 365.0 END) from pages as page, sentences as sentence where sentence.\"pageId\" = page.id group by page.id").success(function(rows) {
        var mapping = {};
        for (var i = 0; i < rows.length; i++) mapping[rows[i].pageId] = rows[i].avg;
        for (var i = 0; i < pages.length; i++) { pages[i].progress = Math.round(mapping[pages[i].id] * 100); 
          if (pages[i].progress > 100) pages[i].progress = 100; }
        res.render('app/pages', { user: req.user, pages: pages });  
      });
    });
  });

  router.get('/words', isLoggedIn, function(req, res) {
    models.word.findAll({
      where: { userId: req.user.username }
    }).success(function(words) {
      var n = 0;
      for (var i=0; i < words.length; i++) {
        /* Average score and total number of sentences containing each word */
        sequelize.query("SELECT avg(CASE WHEN sentence.interval / 365.0 > 1.0 THEN 1.0 ELSE sentence.interval / 365.0 END) FROM sentences AS sentence WHERE LOWER(sentence.text) LIKE \'%" + words[i].text + "%\'").success(function(rows) {
          words[n].progress = Math.round(rows[0].avg * 100);
          n++;
          if (i === words.length && n == words.length) {
              res.render('app/words', { user: req.user, words: words });
          }
        });
      }
    })
  });

  router.get('/sentences', isLoggedIn, function(req, res) {
    models.sentence.findAll({
      // include: [ models.page ],
      where: { userId: req.user.username }
    }).success(function(sentences) {
  	  res.render('app/sentences', { user: req.user, sentences: sentences });
    });
  });

  router.get('/profile', isLoggedIn, function(req, res) {
    res.render('app/profile', { user: req.user,
                                csrf: req.csrfToken()
                              });
  });

  router.post('/profile_update', isLoggedIn, function(req, res) {
    password_compare.user_update_check_password
      (req, res, req.user, req.body, sequelize, 
       user_account_func.execute_update, //updates user profile
       re_route //after task is completed go to the correct place 
      );
  });

  // ==============================
  // API operations (these replace the separate helpers)

  // Web scraper interface
  router.post('/scrape_data', isLoggedIn, function(req, res) {
    var toSend = ""; // String to be sent to sentences.html
    var query = qs.parse(req.url.split('scrape_data?')[1]);
    var username = query.username;
    
    // Only allow doing things with the currently logged in user:
    console.log("Username: " + username);
    console.log("Should be: " + req.user.username);
    if (username !== req.user.username)
      return next();

    console.log("Requested addition of url " + query.web_url);

    var url = query.web_url;

    request({"uri": url}, function(err, resp, body) {
      if (err) return;
      var $ = cheerio.load(body);
      var title = $('title').text().trim();

      console.log("Title: " + title);
      console.log("URL: " + url);
      console.log("Username: " + username);

      sequelize.query('SELECT * FROM pages WHERE "userId"=? AND (url=? OR title=?)', null, {raw: true}, [username, url, title]).success(function(duplicate) {
        // Insert page into Pages table if it doesn't exist
        if (duplicate.length === 0) {
          sequelize.query('INSERT INTO pages VALUES(' + 'DEFAULT' + ', ?, ?, LOCALTIMESTAMP, LOCALTIMESTAMP, ?)', null, {raw:true}, [title, url, username]);
        }

        sequelize.query('SELECT max(id) AS id FROM pages WHERE "userId"=? AND "url"=?', null, { raw: true }, [username, url]).success(function(results) {
          $('form').remove(); // Remove forms since they contain no useful content
          $(':header, span, p').each(function() { // Examine text inside headers and paragraphs only
            var each = $(this).text().trim(); //Remove non-alphanumerics
            each = each.replace(/ +(?= )/g,''); //Remove extra spaces
            var sentencesArray = each.match( /[^\.!\?]+[\.!\?]+/g ); //Split sentences by periods, exclamations and question marks.
            if (sentencesArray) {
              for (var i=0; i < sentencesArray.length; i++) {
                if (sentencesArray[i] !== "" && (sentencesArray[i].split(' ').length > 5)) { // Only keep non-tiny sentences.
                  sentencesArray[i] = sentencesArray[i].replace(/ +(?= )/g,'');
                  toSend += "<p class='translate'>" + sentencesArray[i] + "</p>";
                  if (duplicate.length === 0) {
                    sequelize.query('INSERT INTO sentences VALUES(' + 'DEFAULT' + ',:sentence, NULL, NULL, 0, 0, 2.5, LOCALTIMESTAMP, LOCALTIMESTAMP, \'' + username + '\',' + results[0].id + ')', null, {raw:true}, {sentence: sentencesArray[i]});
                  }
                };
              }
            }
          });

          request({"uri": 'http://ws.detectlanguage.com/0.2/detect?q=' + toSend.replace(/ /g, "+") + '&key=e5f269de90c1a389d4ee614a7f55cf44'}, function(error, response, html) {
            if (!error && response.statusCode == 200) {
              res.send(toSend + "<p class='detected_language' style='visibility: hidden;'>" + html + "</p>");
            } else {
              res.send(toSend + "<p class='detected_language'>NOTICE: Language not found</p>");
            }
          });
        });
      });
    });
  });

  router.post('/delete_page', isLoggedIn, function(req, res) {
    var query = qs.parse(req.url.split('delete_page?')[1]);
    var username = query.username;
    
    // Only allow doing things with the currently logged in user:
    console.log("Username: " + username);
    console.log("Should be: " + req.user.username);
    if (username !== req.user.username)
      return next();

    console.log("Requested deletion of page: " + query.id);
    sequelize.query("DELETE FROM pages WHERE \"userId\"=? AND id=?", null, {raw: true}, [username, query.id]).success(function() {
      sequelize.query("DELETE FROM sentences WHERE \"userId\"=? AND \"pageId\"=?", null, {raw: true}, [username, query.id]);
    });
  });
  
  router.post('/delete_sentence', isLoggedIn, function(req, res) {
    var query = qs.parse(req.url.split('delete_sentence?')[1]);
    var username = query.username;
    
    // Only allow doing things with the currently logged in user:
    console.log("Username: " + username);
    console.log("Should be: " + req.user.username);
    if (username !== req.user.username)
      return next();

    sequelize.query('DELETE FROM sentences WHERE id=?', null, {raw: true}, [query.id]).success(function() {
      sequelize.query('UPDATE pages SET "updatedAt"=LOCALTIMESTAMP WHERE id=?', null, {raw:true}, [query.pageid]);
    });
  })

  router.post('/delete_word', isLoggedIn, function(req, res) {
    var query = qs.parse(req.url.split('delete_word?')[1]);
    var username = query.username;
    
    // Only allow doing things with the currently logged in user:
    console.log("Username: " + username);
    console.log("Should be: " + req.user.username);
    if (username !== req.user.username)
      return next();

    sequelize.query('DELETE FROM words WHERE id=?', null, {raw: true}, [query.id]);
  })
  
  router.get("/get_next_cards", isLoggedIn, function(req, res) {
    var query = qs.parse(req.url.split('get_next_cards?')[1]);
    var username = query.username;
    
    // Only allow doing things with the currently logged in user:
    console.log("Username: " + username);
    console.log("Should be: " + req.user.username);
    if (username !== req.user.username)
      return next();

      sequelize.query('SELECT * FROM sentences WHERE \"userId\"=? and ("nextStudied" is null or "nextStudied" <= LOCALTIMESTAMP)', null, {raw: true}, [username]).success(function(data) {
        res.send(data);
      });
  });
  
  router.get("/get_words", isLoggedIn, function(req, res) {
    var query = qs.parse(req.url.split('get_words?')[1]);
    var username = query.username;
    
    // Only allow doing things with the currently logged in user:
    console.log("Username: " + username);
    console.log("Should be: " + req.user.username);
    if (username !== req.user.username)
      return next();

    sequelize.query('SELECT * FROM words WHERE "userId"=?', null, {raw: true}, [username]).success(function(data) {
      res.send(data);
    });
  });
  
  router.get("/get_sentences", isLoggedIn, function(req, res) {
    var query = qs.parse(req.url.split('get_sentences?')[1]);
    var username = query.username;
    
    // Only allow doing things with the currently logged in user:
    console.log("Username: " + username);
    console.log("Should be: " + req.user.username);
    if (username !== req.user.username)
      return next();

    sequelize.query('SELECT s.*, p.title, p.url FROM pages p JOIN sentences s ON p.id = s."pageId" WHERE p."userId"=? AND p."url"=?', null, {raw: true}, [username, query.url]).success(function(data) {
      res.send(data);
    })
  });
  
  router.post('/update_card', isLoggedIn, function(req, res) {
    var query = qs.parse(req.url.split('update_card?')[1]);
    var username = query.username;
    
    // Only allow doing things with the currently logged in user:
    console.log("Username: " + username);
    console.log("Should be: " + req.user.username);
    if (username !== req.user.username)
      return next();

    sequelize.query('UPDATE sentences SET "lastStudied"=LOCALTIMESTAMP, "nextStudied"=(LOCALTIMESTAMP+ INTERVAL ?), "numReviews"=?, interval=?, "eFactor"=? WHERE "userId"=? and id=?', null, {raw: true}, [query.interval + " day", query.numreviews, query.interval, query.efactor, query.username, query.id]).success(function() {
      sequelize.query('UPDATE pages SET "updatedAt"=LOCALTIMESTAMP WHERE id=?', null, {raw: true}, [query.pageid]);
    });
  })

  router.post('/add_word_data', isLoggedIn, function(req, res) {
    var query = qs.parse(req.url.split('?')[1]);
    var username = query.username;
    var clicked_word = query.clicked_word;
    var clicked_defn = query.clicked_defn;
    var clicked_examples = query.clicked_examples;

    // Only allow doing things with the currently logged in user:
    console.log("Username: " + username);
    console.log("Should be: " + req.user.username);
    if (username !== req.user.username)
      return next();

    if (username.slice(-1) === "\/") { username = username.substring(0, username.length-1) } // Strip end forwardslashes

    console.log("Query: " + query);
    console.log("Username: " + username );
    console.log("Clicked word: " + clicked_word);
    console.log("Definition: " + clicked_defn);
    console.log("Examples: " + clicked_examples + "\n\n");

    sequelize.query('SELECT * FROM words WHERE "userId"=? AND "text"=?', null, {raw:true}, [username, encodeURIComponent(clicked_word)]).success(function(duplicate) {
      if (duplicate.length === 0) {
        // Insert page into Words table
        sequelize.query('INSERT INTO words VALUES(' + 'DEFAULT' + ',\'' + clicked_word.replace(/'/g, "''") + '\',\'' + clicked_defn.replace(/'/g, "''") + '\', LOCALTIMESTAMP, LOCALTIMESTAMP,\'' + username + '\', \'' + clicked_examples.replace(/'/g, "''") + '\')').success(function() {
          res.send("Successfully added '" + clicked_word.replace(/'/g, "''") + "' to " + username +"'s database.");
        });

      } else {
        console.log("This page has already been added to the user's repository.");
      }
    });
  });
  
  router.get('/user_progress', isLoggedIn, function(req, res) {
    var username = req.user.username;

    // Only allow doing things with the currently logged in user:
    console.log("Should be: " + req.user.username);
      
    var sentencesUnlearned = 0;
    var sentencesProgressing = 0;
    var sentencesCompleted = 0;
    var sentencesTotal = 0;
    // TODOXXX SQL query, return some json
    sequelize.query('SELECT * FROM SENTENCES WHERE "userId"=?', null, {raw:true}, [username]).success(function(result) {
    	sentencesTotal = result.length;
    	for (i=0; i < result.length; i++) {
    		if (result[i].interval >= 365) {sentencesCompleted ++;}
    		else if (result[i].interval <= 0) {sentencesUnlearned ++;}
    		else {sentencesProgressing ++;}
    	}
    	console.log("Sentences-->", "unlearned:" + sentencesUnlearned, "progressing:" + sentencesProgressing, "completed:" + sentencesCompleted, "total:" + sentencesTotal);
  	var pagesUnlearned = 0;
  	var pagesProgressing = 0;
  	var pagesCompleted = 0;
  	var pagesTotal = 0;
    	sequelize.query('select page.id as "pageId", avg(CASE WHEN sentence.interval / 365.0 > 1.0 THEN 1.0 ELSE sentence.interval / 365.0 END) as avg from pages as page, sentences as sentence where sentence."pageId" = page.id AND page."userId"=? group by page.id', null, {raw:true}, [username]).success(function(result) {
    	var pagesTotal = result.length;
    	for (i=0; i < result.length; i++) {
    		if (result[i].avg >= 1) {pagesCompleted ++;}
    		else if (result[i].avg <=0) {pagesUnlearned ++;}
    		else {pagesProgressing ++;}
    	}
    	console.log("Pages-->", "unlearned:" + pagesUnlearned, "progressing:" + pagesProgressing, "completed:" + pagesCompleted, "total:" + pagesTotal);
 	res.render('app/progress_overview', {
        data: {
        pagesUnlearned: pagesUnlearned, 
        pagesProgressing: pagesProgressing, 
        pagesCompleted: pagesCompleted, 
        pagesTotal: pagesTotal, 
        sentencesUnlearned: sentencesUnlearned, 
        sentencesProgressing: sentencesProgressing, 
        sentencesCompleted: sentencesCompleted, 
        sentencesTotal: sentencesTotal},
        user: req.user});
    	});
    });
  });
  
    
    
  return router;
}
              
