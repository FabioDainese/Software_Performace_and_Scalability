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
* Axios

Meanwhile, for the backend part:
* Express
* Nodemon
* Cors
* Multer

# Tsung - Benchmarking
### Installation
In order to properly install *Tsung* in your *macOS* system, run the following commands in a terminal:

* `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
* `brew install erlang`
* `brew install tsung`
* `sudo cpan Template` (needed in order to generate the html reports)

### Running a Benchmark and Generating its Relative Report
To run a benchmark test simply execute:
```
tsung -f [benchmark xml file] start
```
Meanwhile, to generate the html report, run:
```
cd [folder of the test - e.g. /Users/Fabio/.tsung/log/20220330-0945]
perl tsung_stats.pl
open report.html
```
Moreove, if you want to compare multiple *Tsung* tests and get a graphical output use ***tsplot*** (aka *Tsung plotter*), like so:
```
tsplot "First test" [firsttest/tsung.log] "Second test" [secondtest/tsung.log] -d [outputdir]
```

### Recording a Session
If you want to automatically generate a valid *Tsung* session configuration file, you can do it by running:
* `tsung-recorder start`: to start the recording of the session;
* `tsung-recorder stop`: to end the recording session;

# Consideration About Performance
In order to increase the performance of the project here's a couples of possible improvements:

* Introduce some caching techniques (e.g. if the uploaded file is the same it's useless to recompile it once again);
* Consider using more performant web framework (e.g. ***Actix Web*** (Rust), ***Lithium*** (C++17), ***Drogon*** (C++14))
