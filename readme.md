CSC309 Project 2 README
=======================

Team Members (see also [About](static/about_us.html) page):

-   Kevin Zhang - yingkai.zhang@mail.utoronto.ca - c4zhangl
-   Miles Gilchrist - m.gilchrist@mail.utoronto.ca - g2miles
-   Serguei Makarov - serhei.makarov@mail.utoronto.ca - g0serhei
-   Hardarshan (Harmen) Kahlon - h.kahlon@mail.utoronto.ca - g3h

This is the repository for our CSC309 Project 2.
------------------------------------------------

### Each member has completed the following parts:

-   **Hardarshan Kahlon:**Designing sentences interface to allow user to
    input a webpage to retrieve and then display the retrieved data to
    user. + Getting data from webpages by scraping and then
    filtering/cleaning it. + Putting page & sentence data into the
    database. + SRS stuff with Miles.
-   **Miles Gilchrist:**HeatMap (language detection, collecting
    definitions and sample sentences and database integration with words
    table) + work on static Jade files + helping with SRS
-   **Kevin Zhang:**Account signup and authentication. Profile
    information updates and profile deletion. Setup of user\_info table.
    Routing and serverside programming. local postgres database setup.
    polishing jade templates. basic SRS algorithm
-   **Serhei Makarov:**Setting up database, locally and through Heroku.
    + Completed tables views. Set up much of the structure of the app
    like the routing and design principles.

### Our gameplan and how it turned out

Most of the peripheral functions of the app (like getting data from
other websites to analyze, managing database, user authentication,
translations/definitions of sentences and words, and more) have been
completed.

The SRS algorithm itself is implemented in the design. The only function
missing is that once a user has reviewed a sentence and graded it
accordingly, the insertion back into the database has not been
completed. At the present moment, we simply display a pop-up which
demonstrates that the algorithm works by displaying the new eFactor,
interval number and qualityGrade after running the algorithm.

In the third phase of the project, we will add the functionality to
update the sentence attributes in the Sentences table in the database.
Additionally, we will handle any other small touchups and security
issues, if they arise.
