## Concept and Notes ##

See also the following links about our project:
- https://docs.google.com/file/d/0B_pLUe2JQZ_1WUJsbFBvSUJ3cms/edit - presentation slides
- https://piazza.com/class/htqmefxk6cy3pd?cid=27 -- Piazza info thread

**Team Members**
- Kevin Zhang (yingkai.zhang@mail.utoronto.ca)
- Harmen Kahlon (h.kahlon@mail.utoronto.ca)
- Serguei Makarov (serhei.makarov@mail.utoronto.ca)
- Miles Gilchrist (m.gilchrist@mail.utoronto.ca)

**Tagline** (not really)
"The [Synthesia](www.synthesiagame.com) of language learning"

**What is the problem you want to solve?**

We want to build an app that makes it easy and pleasant to manage and study thousands of sample sentence flashcards for people learning foreign languages, using an spaced repetition system (SRS) to schedule study time optimally, to learn the most material in the least amount of time.

**Who has this problem and how big is the problem for them?**
- People use SRS systems such as Anki to study foreign language vocabulary
- To study vocabulary, it is good to make a lot of fill-in-the-blank flashcards out of sample sentences, to learn how they are used in context
- Manually making Anki flashcards out of an online text is a huge pain

**What is the proposed solution?**
- Provide one web app where the user can use a well-designed interface to:
  - Create a list of online webpages in the foreign language they want to learn to read
  - Choose words out of the webpage that they want to learn
  - Add dictionary definitions out of an online dictionary
  - Have the app automatically pick out sample sentences with those words and generate flashcards
  - Study the flashcards using a built-in SRS algorithm
- There is currently no possible way of doing this that does not involve either hours of manual copy-pasting, or buggy, hard-to-use, and hacked-together scripts

**What benefit it brings to those people?**
- Provide motivation to study the language
  - Pleasant and quick interface: pick webpage, pick words, start studying
  - Statistics track your progress learning the words on a webpage
    - If you've ever played an RPG, you'll know this (gamification)
- SRS algorithm optimally schedules when to review cards
- Easily track their progress learning to read a set of favourite texts
- Save hours of tedious copy-pasting into Anki
  - Do the math: 1000's of words x 6-12 sample sentences = a lot of time you could have used actually studying the cards, rather than making them

## Proposed Product Backlog ##

See the guideline here for what should happen in each sprint:
- http://www.cs.toronto.edu/~mashiyat/csc309/Assignments.pdf

TODOXXX NOTES ON THIS The following is based on my earlier sketch of the functionality (https://www.facebook.com/photo.php?fbid=1391249144497024&set=gm.493425254118635&type=1&theater).

STUDYING FUNCTIONALITY
- Maintain a list of words we are studying.
  - Can manually add words to the program.
  - Search (filter) for particular words.
  - Show the words from a particular webpage.
  - Use a progress meter to show how far along we are on studying a word.
  - Jump to a google search for the given word (??).
- Automatically obtain dictionary definitions for a particular word.
- Maintain a list of sample sentences and dictionary definitions based on the words and websites in the database.
  - Can manually add sentences to the program.
  - Search (filter) for sample sentences containing a given search string.
  - Show the sample sentences for a particular word.
  - Show the sample sentences from a particular webpage.
  - Use heatmap functionality (see below) on the text in a sentence.
  - Use a progress meter to show how far along we are on studying a sentence.
  - Allow the user to blacklist a sentence from producing cards. 
- Create cards from the sample sentences using a format such as 10,000 sentences.
- Maintain a list of cards used for studying.
  - Search (filter) for cards containing a given search string.
  - Show the cards for a particular sentence.
- Studying screen: display a card, then the other side. Allow user to score how they did on the card, and schedule the next review accordingly.
  - Uses SuperMemo 2 algorithm (just like Anki, for familiarity).
  - Particular tweak: when studying with overdue cards, alternate between overdue and currently-due cards (to ensure currently-due cards don't go on the end of the backlog).
  - Log study records (timestamp + card + score) to a separate database table.
- Statistics screen: imitate Anki on this -- show the ... .

WEBSITE FUNCTIONALITY
- Maintain a list of webpages we are studying from.
  - Use a progress meter to show how far along we are on studying a webpage (combine the progress values of the sentences we are studying).
- Can add webpages to the program.
- Can add webpages to the program using a bookmarklet. Simple instructions for installing the bookmarklet into your browser.
- Can see a heatmap version of a webpage (see HEATMAP FUNCTIONALITY).
- Automatically generate sample sentences from the webpage text.

HEATMAP FUNCTIONALITY
- Can view texts and webpages using a 'heatmap' view.
- Can see the progress of words on the webpage, by altering the background colour of the text (green for well-known, yellow/red for 'needs study'). Need to adapt this to webpages using strange background colours.
- Can hover over a word in heatmap view to see the dictionary definition (like the http://www.polarcloud.com/rikaichan/ extension), and click to add the word to the dictionary.
- Can preview a web page not yet added to the list.
- Can switch back to an ordinary view (to click on and follow links).

## Proposed Sprint Backlog ##

Phase I -- static site, basic database/API design, (perhaps) web page heatmap/hover UI.
- Detailed wireframes / mockups for the user interface.
  - Explanation of usability issues in readme.html.
- Static site, about page and help text.
- CODING -- Database design: word + sentence database. Add texts to the database from .txt files. (In the next sprint we use a webscraping setup such as http://scotch.io/tutorials/javascript/scraping-the-web-with-node-js or similar to extract relevant text from HTML webpages. Probably more things will be on the server-side.)
- CODING -- REST API for the Database.
- CODING -- Heatmap design. The ability to colorize words, to hover (and provide a dictionary), and click to add to our study list. This does not yet need to be all hooked up to database, but we need to prototype the US.

Phase II -- SRS algorithm/study interface, word/sentence/page management interface
... TODOXXX ...

Phase III -- security (multiple users) and scaling
... TODOXXX ...
- whatever primitive thing we did for multi-user functionality, do it properly
- IDEA: this should be fun: stress test the database by simulating many users
  - since all you do is pick webpages, pick words, look at cards, and then score yourself on them, it is easy to program a robot that issues database commands that produce data that looks similar to a real live user employing the program over a year or so of studying (compressed into a short amount of time)
