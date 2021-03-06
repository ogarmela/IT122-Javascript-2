'use strict'

const express = require("express");
const bodyParser = require("body-parser");

const books = require("./data");

const Book = require("./models/books");

const app = express();
const exphbs = require('express-handlebars');

app.engine('handlebars', exphbs({
    defaultLayout: false
}));

app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

// Location for static files
app.use(express.static(__dirname + '/public' ));

// Parser for form submissions
app.use(bodyParser.urlencoded({extended: true}));

app.use('/api', require('cors')());
// Create variable to get data from data.js
let showBooks = books.getAll();


app.get('/api/books', (req, res) => {
    return Book.find({}).lean()
      .then((books) => {
          res.render('home', { books });
      })
      .catch(err => next(err));
  });

app.get('/detail', (req, res) => {
    const booktitle = req.query.title
    Book.findOne({"title": booktitle }).lean()
  .then((book) => {
      console.log(book);
      res.render('detail', {title: booktitle, stats: book});
  })
  .catch(err => next(err));
});



app.get('/delete', (req, res) => {
    const booktitle = req.query.title;
    books.findByIDAndDelete({title: booktitle}, (err, book) => {
        
        if (err) {
            console.log(err);
        } else if (!book) {
            console.log(booktitle + "Book not found");
            res.send(`${booktitle} not found`);
        } else if (book) {
            console.log(booktitle + "Removed");
            res.send(`${booktitle} Removed`);
        }
    });
});


app.delete('/api/books/:title', (req, res) => {
    const booktitle = req.params.title; 
    books.findOneAndDelete({title: booktitle})
    .then(book => {
        if(book === null) {
            return res.status(400).send(`Error: "${booktitle}" not found`)   
        } else {
            res.json(book)}
    })

    .catch(err => {
        res.status(500).send('Dabatase error', err)
    })
})

app.post('/api/books/:title', (req, res) => {
    const booktitle = req.params.title;
    books.findOneAndUpdate({title: booktitle}, req.body, {upsert: true, new: true})
    .then(book => {
        res.json(book)
    })
    .catch((err) => console.log(err))

})


// Text response
app.get('/about', (req, res) => {
    res.type('text/plain');
    res.send('About page \n This is Ameer Kiani, \n I\'am pursuing my programming degree. This is my third quarter at SCC and I love it so far');
});

      

// Error message


app.use('/api', require('cors')()); // set Access-Control-Allow-Origin header for api route

app.get('/api/books', (req, res) => {
    return Book.find({}).lean()
      .then((books) => {
          // res.json sets appropriate status code and response header
          res.json(books);
      })
      .catch(err => res.status(500).send('Error occurred: database error.'));

});


app.use( (req, res) => {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});

app.listen(app.get('port'), () => {console.log('Express started');})
