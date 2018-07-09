const express = require('express')
const session = require('express-session')
const genomeLink = require('genomelink-node')
const path = require('path')
const PORT = process.env.PORT || 5000

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'A1MSaLq6fH4dV344DsvSs8tekUNJAW2CptzKu0B7E7OLyeXviYLAE9OuWpqwp1fWjDUaUOuRqIVvqrrlbMhUd8k4xAboZpIx6kpN67Y2zp0zOtnRKaJbNSoAAMWXtecR',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 30 * 60 * 1000
  }
}));

app.get('/', async (req, res) => {
  const scope = 'report:eye-color report:beard-thickness report:morning-person';
  const authorizeUrl = genomeLink.OAuth.authorizeUrl({ 
    clientId: '4Xb2JjlEEJF51g7PLgrN3lseiTpavMXbkpj6kO2l',
    callbackUrl: 'https://babyonboard.herokuapp.com/callback',
    scope: scope 
  });

  // Fetching a protected resource using an OAuth2 token if exists.
  let reports = [];
  if (req.session.oauthToken) {
    const scopes = scope.split(' ');
    reports = await Promise.all(scopes.map( async (name) => {
      return await genomeLink.Report.fetch({
        name: name.replace(/report:/g, ''),
        population: 'european',
        token: req.session.oauthToken
      });
    }));
  }

  res.render('pages/index', {
    authorize_url: authorizeUrl,
    reports: reports,
  });
});

app.get('/callback', async (req, res) => {
  // The user has been redirected back from the provider to your registered
  // callback URL. With this redirection comes an authorization code included
  // in the request URL. We will use that to obtain an access token.
  req.session.oauthToken = await genomeLink.OAuth.token({ requestUrl: req.url });

  // At this point you can fetch protected resources but lets save
  // the token and show how this is done from a persisted token in index page.
  res.redirect('/');
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
