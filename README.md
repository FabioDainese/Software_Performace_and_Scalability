# Project Files Structure
* **client**: Frontend part (React)
* **server**: Backend part (ExpressJS, Node)

# How to Run This Code
Right after cloning the repository place yourself inside all of the following folders and run `yarn install` using the terminal/shell.
* `Software_Performance_2022` (aka the project folder)
* `client`
* `server`

****

Then, to run the application, place yourself in the *project folder* and execute:
* `yarn start`: it will run both the *frontend* and *backend* part in the same terminal;

Or alternatively, in two separate terminals, execute:
* `yarn client`: it will run only the *frontend* part;
* `yarn server`: it will run only the *backend* part;

Either way this will run the app in *development mode* and it will be reachable by visiting [http://localhost:3000](http://localhost:3000) using a browser.

***

**NB**: the only prerequisites in order to run smoothly the project is to have installed locally: 
* [*Node* and *npm*](https://nodejs.org/en/) (by installing *node* you'll also get *npm*);
* [*Yarn*](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) (after you've installed *node*, run `npm install --global yarn`)

# Packages Used
For the frontend part:
* React
* Ant Design
* Sass
* Fontawesome

Meanwhile, for the backend part:
* Express
* Nodemon
* Cors
* Multer

# Consideration About Performance
In order to increase the performance of the project here's a couples of possible improvements:

* Introduce some caching techniques (e.g. if the uploaded file is the same it's useless to recompile it once again);
* Consider using more performant web framework (e.g. ***Actix Web*** (Rust), ***Lithium*** (C++17), ***Drogon*** (C++14))
