# Design of the Application

Description of the data:
... target vocabulary ...
... sentence collection ...
... cards and intervals ...
... disabling cards ...

## Overall Layout, Static Website, Signup Screen

(Screenshot: Welcome Page.)

The welcome page for the site (when a user is not signed in) explains the website for ... . Additional links along the top allow the user to access pages with additional explanation, as well as an "About Our Team" page.

(Screenshot: Layout for Signed-In Users.)

For signed-in users, the application is divided into sections. "About" information is moved underneath the profile/account link at the very top right

- "Study" to review cards already in the system.
- "Words" to view and manage the target vocabulary.
- "Sentences" to view and manage individual sentences.
- "Pages" to view and manage websites used as sources for individual sentences.

(TODOXXX Screenshot: Mobile Interface.)

For the mobile version of the interface, the top bar collapses to just a logo along with the profile/account link. Tapping on the logo will cause a menu to slide out containing whatever links are along the top in the desktop version.

## The Heatmap UI Element

(Screenshots/Sketches: The Heatmap UI Element.)

The heatmap view is used to visualize the progress learning a page or sample text. It can be applied either to an entire web page, or to a sample sentence fragment (in one of the table views); words which are in the user's target vocabulary are highlighted in a colour representing the learning progress (aggregated from the length of the current intervals of the corresponding cards, with >1 year intervals considered as "completely learned"), ranging from red for completely unknown words, to green for completely known words.

When applying a heatmap to webpages which render text with a different foreground or background colour, it may be necessary to adjust the heatmap colours accordingly.

Hovering over a word in the heatmap view displays a pop-out box (similar to the one displayed by the [Rikaichan](https://addons.mozilla.org/en-US/firefox/addon/rikaichan/) Firefox extension) which shows a dictionary definition for the word, pulled from an online dictionary API.

Clicking on a word in the heatmap view adds it to the target vocabulary; clicking on a word already in the target vocabulary indicates that the user is no longer interested in the word, so it and corresponding cards are removed (while retaining the associated data and learing progress, in case the user wants to resume studying the word).

For viewing sample sentence text, the heatmap view is automatically enabled. For viewing the contents of an entire webpage, the heatmap can be toggled on and off (to allow the user to click on links in the page).

## Pages Screen

(Screenshot: Pages view.)

All of the table views, including the Pages screen, have a prominent search box at the top, which filters the contents according to a specified search string. Table rows each have a checkbox allowing the user to select multiple rows for deletion (or other operations), in which case the search box is squeezed aside to make room for a banner saying "selected (number of pages) pages" and a "Delete" button.

The Pages screen shows the full list of webpages a person has put into their system for studying. The columns in the table include:

- Checkbox for selecting a row.
- Progress: Displaying how far the user is to completely knowing the webpage. This should be displayed both as a pie chart (coloured red/yellow/green depending on the progress) and a percentage, average from the study progress percentages of the distinct words or sentences on the page.
- Title/URL: The title and URL of the website; the title could be scraped from the page, or manually added by the user.
- Date Added.
- Date Studied (based on the last time the user saw a card from this webpage).
- Perhaps an individual "Delete" icon for each row.

The table has column headers that can be clicked on to sort according to each of the columns.

In addition, there is an option to add a page, either by putting in the URL manually, or using a bookmarklet (thus there should be a link to a page with installation instructions).

We may also want to add a feature to 'star' pages, in order to distinguish favourite pages the user has set a goal to learn 100%, versus pages which are just included as an additional source of sample sentences.

## Words Screen

... same as Pages screen: progress (# done / # sentences), word, definition, date added, date last studied, checkbox/delete

## Sentences Screen

... same as Words screen: progress (# done / # sentences), word, definition, date added, date last studies, checkbox/delete

## Study Screen

... basic SRS study interface: front/back of card, "See Back", "Score" (showing interval), info regarding study session

## Individual Sentence and Word Views

... individual Sentence view, links to original webpage, shows table of associated words
... individual Word view, shows table of associated sentences

## Individual Website View

... top-bar with title+URL, modes (reading / highlighting); use hover view on the webpage; deal with existing colours

## Profile Screen, Account History, Statistics

... TODOXXX ...
