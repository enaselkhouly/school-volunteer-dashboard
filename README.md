# MEN Full stack using Node.js, Express, MongoDB

<img src="https://coligo.io/images/express.svg" height="50"> <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/45/MongoDB-Logo.svg/527px-MongoDB-Logo.svg.png" height="50"> <img src="https://worldvectorlogo.com/logos/nodejs-icon.svg" height="50">

This is a MEN Stack application aims to manage and automate the volunteer activities at schools; through per user dashboard, organized project tasks, manageable task work flow, and a responsive mobile-first layout.

The project is build with Node.js, Express, and Mongodb, Bootstrap 4, JavaScript, JQuery, SCSS and HTML. The project is under test and is subject to enhancements. 

### [Live Demo](https://sch-volunteer-dashboard.herokuapp.com/projects)

Credentials:

**Teacher account:**
username: testteacher,
password: Testteacher1

**Family account:**
username: testfamily,
password: Testfamily1


## Development

* [x] **[Node.JS](https://nodejs.org)** 
* [x] **[Express](https://github.com/expressjs/express)**
* [x] **[MongoDB](https://www.mongodb.com/) with [Mongoose](https://github.com/Automattic/mongoose)**
* [x] [SCSS](http://sass-lang.com/)
* [x] [EJS](https://www.npmjs.com/package/ejs)
* [x] [Passport.JS](http://passportjs.org/)
* [x] [Helmet](https://github.com/helmetjs/helmet)
* [x] [Eslint](http://eslint.org)
* [x] [EditorConfig](http://editorconfig.org)

## Usage

Install dependencies
```bash
npm install
```
Run using development environment  
```bash
npm run dev
```

## Other available commands

Bundle the code
```bash
npm run build
```
Run using deployment environment  
```bash
npm start
```
Run using deployment environment through the bundled code  
```bash
npm run start:bundle
```
Run the test cases
```bash
npm run test
```

## Screenshots

### Login screen

![Login screen](../assets/login.png?raw=true)

### Teacher account main page after login

![Index page](../assets/teacher.png?raw=true)

### Family account main page after login

![Devices module](../assets/family.png?raw=true)

## Directory structure
```txt
+---configs
+---dist
+---libs
+---src
|   +---controllers
|   |   +---project.js
|   |   +---task.js
|   |   +---user.js
|   +---helpers
|   |   +---auth
|   |   +---index.js
|   +---models
|   |   +---Project.js
|   |   +---Task.js
|   |   +---User.js
|   +---public
|   |   +---css
|   |   +---fonts
|   |   +---images
|   |   +---js
|   |   +---scss
|   +---routes
|   |   +---index.js
|   |   +---project.js
|   |   +---task.js
|   |   +---user.js
|   +---services
|   +---views
|   +---index.js
+---test
+---package.json

```
## License

The school-volunteer-dashboard is available under the [MIT license](https://tldrlegal.com/license/mit-license) | Copyright (c) 2018 Enas Elkhouly.
