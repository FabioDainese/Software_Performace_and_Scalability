# Introduction
The goal of the project was to implement a web application that allows users to upload a C++ program and get in return the output of the compilation and, if this last one succeeds, then also the output of the execution run in a sandbox environment - for obvious security reasons - and carry out a performance analysis by utilizing different tools to identify the possible problems and/or bottlenecks of the real system and to eventually propose further improvements to the design of the application.

The full ***documentation*** and ***benchmarks*** results are available in the [*report.pdf*](https://github.com/FabioDainese/Software_Performace_and_Scalability/tree/master/report.pdf) file.

# Project Files Structure
* **client**: Frontend part (React)
* **server**: Backend part (ExpressJS, Node)

# How to Run This Code
You can start the application by simply typing the following command. Before executing it though, make sure you have *Docker* installed and running.

```
docker compose up
```

Then, you can reach the web app on `http://localhost:3000`

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
* Bull

# Considerations About Performance
In order to increase the performance of the project here's a possible improvement:

* Consider using more performant web framework (e.g. ***Actix Web*** (Rust), ***Lithium*** (C++17), ***Drogon*** (C++14))
