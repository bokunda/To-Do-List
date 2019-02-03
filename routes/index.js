var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('baza.db');

var app = express();

var bodyParser = require('body-parser');
urlencodedParser = bodyParser.urlencoded({extended:false});

var session = require('express-session');
var sess = {
    secret: "leteca_veverica",
    cookie: {},
    saveUninitialized: false,
    resave: false
}


app.use(session(sess));

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Bojan Piskulic 93-2015' });
});

router.get('/todo', function(req, res, next) {
    res.render('todo', { title: 'Bojan Piskulic 93-2015', korisnickoime: 'Ununumius' });
});

router.post('/prijavi', function(req, res, next){

    var korisnickoIme = req.body.korisnickoime;
    var password = req.body.lozinka;
    var flag = 0;
    var nizzaslanje;


    db.serialize(function ()
    {
        db.all("SELECT * FROM korisnici WHERE usr = '" + korisnickoIme + "' AND pwd = '" + password + "'", function (err, rows) {
            rezultat = JSON.stringify(rows);
            pom = JSON.parse(rezultat);
        });

        db.all("SELECT task FROM todolist t JOIN korisnici k ON t.idkorisnika = k.id WHERE k.usr = '" + korisnickoIme + "'", function (err, rows) {
            str = JSON.stringify(rows);
            nizz = JSON.parse(str);
        });



        setTimeout(function(){

            var nizzaslanje = [];
            for(var x in nizz)
            {
                nizzaslanje.push(nizz[x]);
            }
            console.log(nizzaslanje);

            if(korisnickoIme != '' && password != '' && rezultat[1] == '{')
            {
                if(korisnickoIme == pom[0]['usr'] && password == pom[0]['pwd'])
                {
                    flag = 1;
                }
            }

            if(flag == 1)
            {
                req.session.korim = korisnickoIme;
                req.session.nniizz = nizzaslanje;
                res.render('todo', { title: 'Bojan Piskulic 93-2015', verifikator: '1', korisnickoime: req.session.korim, nekiniz: req.session.nniizz });
            }
            else
            {
                res.send("<h1>Neispravni podaci!</h1><a href='/'>Prijava</a>");
            }

        }, 600);

    });
});

function azurirajNiz()
{
    var nizzzaslanje = [];

    db.serialize(function ()
    {
        db.all("SELECT task FROM todolist t JOIN korisnici k ON t.idkorisnika = k.id WHERE k.usr = '" + req.session.korim + "'", function (err, rows) {
            str = JSON.stringify(rows);
            nizzz = JSON.parse(str);
        });

        setTimeout(function(){

            nizzzaslanje = [];
            for(var x in nizzz)
            {
                nizzzaslanje.push(nizzz[x]);
            }
            console.log(nizzzaslanje + " o5Upit");

        }, 600);

        return nizzzaslanje;

    });

    return nizzzaslanje;
}

router.post('/registruj', function(req, res, next) {

    var ime = req.body.ime;
    var prezime = req.body.prezime;
    var korisnickoIme = req.body.korisnickoime;
    var password = req.body.lozinka;
    var passwordo5 = req.body.lozinkao5;
    var email = req.body.email;
    var flag = 0;

    db.serialize(function ()
    {
        db.all("SELECT * FROM korisnici WHERE usr = '" + korisnickoIme + "'", function (err, rows) {
            rezultat = JSON.stringify(rows);
            pom = JSON.parse(rezultat);

            setTimeout( function () {
                if(korisnickoIme != '') {
                    if (rezultat[1] == '{')
                        flag = 1;
                }

                if(flag == 1)
                {
                    res.send("<h1>Registracija nije uspela! Korisničko ime već postoji!</h1><a href='/'>Pokušajte ponovo</a>");
                }
                else if(password == passwordo5 && ime != '' && prezime != '' && korisnickoIme != '' && password != '')
                {
                    db.run("INSERT INTO korisnici (ime, prezime, usr, pwd) VALUES (?, ?, ?, ?)", ime, prezime, korisnickoIme, password);
                    res.send("<h1>Uspesno ste se registrovali!</h1><a href='/'>Prijava</a>");
                }
                else
                {
                    res.send("<h1>Registracija nije uspela! Neispravno uneti podaci!</h1><a href='/'>Pokušajte ponovo</a>");
                }

                rezultat = "";
                pom = "";
            }, 300);
        });
    });

});

router.post('/brisanjetaska', function(req, res, next){

    console.log(req.body.usern + " " + req.body.taskovi);
    db.run("DELETE FROM todolist WHERE task = '" + req.body.taskovi + "'");
    setTimeout( function () {
        res.send("<h1>Task uspešno obrisan!</h1><a href='/'> Odjava</a>");
    }, 300);
});

router.post('/novitask', function(req, res, next){
    console.log(req.body.usern + " " + req.body.tekst);
    db.run("INSERT INTO todolist (idkorisnika, task) VALUES ( (SELECT id FROM korisnici WHERE usr = '" + req.body.usern + "'), '" + req.body.tekst + "')");
    setTimeout( function () {
        res.send("<h1>Task uspešno postavljen!</h1><a href='/'> Odjava</a>");
    }, 300);
});

router.post('/odjavise', function(req, res, next){
    req.session.destroy();
    res.render('index', { title: 'Bojan Piskulic 93-2015' });
});

module.exports = router;
