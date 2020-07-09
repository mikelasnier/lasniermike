import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

//let output = {data};
//ReactDOM.render(output, document.getElementById('moot'));

let simpleRegression = require('ml-regression').SLR;

const dataA = [1,3,5,7,9];
const dataB = [4,5,6,7,8];
const regress = new simpleRegression(dataA,dataB);

let dataC = [];
for (let i = 0; i < dataA.length; ++i) {
  dataC[i] = regress.coefficients[1] * dataA[i] + regress.coefficients[0];
}


let data2 = [];

for (let i = 0; i < dataA.length; ++i) {
    data2[i] = {};
    data2[i].x = dataA[i];
    data2[i].y = dataB[i];
}

let data3 = [];
for (let i = 0; i < dataA.length; ++i) {
  data3[i] = {};
  data3[i].x = dataA[i];
  data3[i].y = dataC[i];
}

ReactDOM.render(
  <App />,
document.getElementById('root')
);



// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

