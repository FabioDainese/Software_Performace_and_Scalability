# Project Files Structure
* **client**: Frontend part (React)
* **server**: Backend part (ExpressJS, Node)

# How to Run This Code
Right after cloning the repository place yourself inside all of the following folders and run `yarn install` using the terminal/shell:
* `Software_Performance_2022` (aka the project folder)
* `client`
* `server`

Moreover, create a new *Redis* container in *Docker*, like so:
```
docker run -p 3002:6379 --name redis-waiting-queue -d redis
```

****
You can start the application simply by typing the following command. Before executing it, make sure you have Docker installed and running.
* `docker compose up`

***

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
